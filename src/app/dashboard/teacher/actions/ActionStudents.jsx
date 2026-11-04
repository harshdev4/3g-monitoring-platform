
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Check,
  ClipboardList,
  Download,
  FileText,
  LoaderCircle,
  AlertCircle,
  RotateCcw,
  X,
  Users,
} from "lucide-react";

const getApiError = (error) =>
  error.response?.data?.error ||
  error.response?.data?.message ||
  error.message ||
  "Unable to load students.";

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusClass = (status) => {
  switch ((status || "").toLowerCase()) {
    case "completed":
    case "approved":
      return "bg-green-50 text-green-700";

    case "submitted":
    case "pending review":
    case "under_review":
      return "bg-amber-50 text-amber-700";

    case "rejected":
    case "resubmission_required":
      return "bg-red-50 text-red-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
};

const normalizeStatus = (status) =>
  (status || "Assigned").trim().replace(/_/g, " ").toLowerCase();

const getStatusGroup = (status) => {
  const normalized = normalizeStatus(status);
  if (["approved", "completed", "complete", "done"].includes(normalized)) {
    return "approved";
  }
  if (["rejected", "resubmission required", "reupload"].includes(normalized)) {
    return "reupload";
  }
  if (normalized === "assigned") return "assigned";
  return "other";
};

const getSafeFileName = (value) =>
  String(value || "action-students")
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .replace(/\s+/g, "-");

function EvidencePreview({ student, assignmentTitle, onClose }) {
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl;

    async function loadPdf() {
      try {
        const response = await fetch(
          `/api/teachers/assignments/${encodeURIComponent(
            student.assignment_id
          )}/evidence`,
          { cache: "no-store", signal: controller.signal }
        );
        if (!response.ok) {
          const result = await response.json().catch(() => ({}));
          throw new Error(result.error || "Unable to load this PDF.");
        }

        const pdf = await response.blob();
        objectUrl = URL.createObjectURL(pdf);
        setPreviewUrl(objectUrl);
      } catch (previewError) {
        if (!controller.signal.aborted) {
          setError(previewError.message || "Unable to load this PDF.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadPdf();
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [student.assignment_id]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="evidence-preview-title"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-3 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="flex h-[min(90vh,900px)] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2
              id="evidence-preview-title"
              className="truncate text-sm font-semibold text-slate-900"
            >
              {student.student_name || "Student"} · {assignmentTitle}
            </h2>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {student.original_filename || "Submitted PDF"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close PDF preview"
            className="shrink-0 rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <X size={18} />
          </button>
        </header>

        <div className="relative min-h-0 flex-1 bg-slate-100">
          {previewUrl && (
            <iframe
              title={`PDF evidence from ${student.student_name || "student"}`}
              src={previewUrl}
              className="h-full w-full border-0"
            />
          )}
          {(loading || error) && (
            <div
              role={error ? "alert" : "status"}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center"
            >
              {loading ? (
                <>
                  <LoaderCircle size={24} className="animate-spin text-blue-700" />
                  <p className="text-sm text-slate-600">Loading PDF…</p>
                </>
              ) : (
                <>
                  <AlertCircle size={28} className="text-red-500" />
                  <p className="max-w-lg text-sm text-red-700">{error}</p>
                  {error.includes("Cloudinary denied") && (
                    <p className="max-w-lg text-xs text-slate-600">
                      Enable PDF delivery in the Cloudinary product environment’s
                      Security settings, then retry the preview.
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function ActionStudents({ actionId, filters = {} }) {
  const [action, setAction] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewingStudent, setReviewingStudent] = useState(null);
  const [reviewStatus, setReviewStatus] = useState("approved");
  const [feedback, setFeedback] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [savingReview, setSavingReview] = useState(false);
  const [previewingStudent, setPreviewingStudent] = useState(null);
  const [statusSort, setStatusSort] = useState("all");
  const [reportError, setReportError] = useState("");

  const visibleStudents = useMemo(() => {
    const filtered = students.filter(
      (student) =>
        statusSort === "all" ||
        getStatusGroup(student.status) === statusSort
    );

    return filtered;
  }, [students, statusSort]);

  const fetchStudents = useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.program) params.set("program", filters.program);
    if (filters.semester) params.set("semester", filters.semester);
    if (filters.courses) params.set("course_code", filters.courses);
    if (filters.section) {
      params.set("section", filters.section.replace(/^MCA-/, ""));
    }
    if (filters.assessment) params.set("assessment", filters.assessment);
    if (filters.category3G) params.set("category", filters.category3G);

    const response = await axios.get(
      `/api/teachers/actions/${encodeURIComponent(actionId)}/students?${params.toString()}`
    );
    return response.data;
  }, [
    actionId,
    filters.program,
    filters.semester,
    filters.courses,
    filters.section,
    filters.assessment,
    filters.category3G,
  ]);

  const loadStudents = useCallback(async () => {
    try {
      const data = await fetchStudents();
      setError("");
      setAction(data.action ?? null);
      setStudents(data.students ?? []);
    } catch (err) {
      setError(getApiError(err));
      setAction(null);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [fetchStudents]);

  useEffect(() => {
    let active = true;
    fetchStudents()
      .then((data) => {
        if (!active) return;
        setError("");
        setAction(data.action ?? null);
        setStudents(data.students ?? []);
      })
      .catch((err) => {
        if (!active) return;
        setError(getApiError(err));
        setAction(null);
        setStudents([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchStudents]);

  const openReview = (student, status) => {
    setReviewingStudent(student);
    setReviewStatus(status);
    setFeedback("");
    setReviewError("");
  };

  const submitReview = async (event) => {
    event.preventDefault();
    if (!reviewingStudent) return;

    setSavingReview(true);
    setReviewError("");
    try {
      await axios.patch(
        `/api/teachers/assignments/${encodeURIComponent(
          reviewingStudent.assignment_id
        )}/review`,
        { status: reviewStatus, feedback }
      );
      setReviewingStudent(null);
      await loadStudents();
    } catch (err) {
      setReviewError(getApiError(err));
    } finally {
      setSavingReview(false);
    }
  };

  const downloadStudentReport = async () => {
    setReportError("");
    try {
      const [
        { createWorkbook, addWorksheet },
        { workbookToBytes },
        {
          appendRow,
          mergeCells,
          setCell,
          setColumnWidths,
          setFreezePanes,
          setRowHeight,
        },
        {
          makeAlignment,
          makeBorder,
          makeColor,
          makeFont,
          makePatternFill,
          makeSide,
          registerCellStyle,
        },
      ] = await Promise.all([
        import("@office-kit/xlsx/workbook"),
        import("@office-kit/xlsx/io"),
        import("@office-kit/xlsx/worksheet"),
        import("@office-kit/xlsx/styles"),
      ]);

      const headers = [
        "S. No.",
        "Roll Number",
        "Name",
        "Category",
        "Assessment Type",
        "Semester",
        "Course Code",
        "Course Name",
        "Assigned On",
        "Status",
        "Submitted At",
        "Feedback",
      ];
      const workbook = createWorkbook();
      const worksheet = addWorksheet(workbook, "Action Report");
      const border = makeBorder({
        top: makeSide({ style: "thin", color: makeColor({ rgb: "FFD8E1EC" }) }),
        bottom: makeSide({ style: "thin", color: makeColor({ rgb: "FFD8E1EC" }) }),
        left: makeSide({ style: "thin", color: makeColor({ rgb: "FFD8E1EC" }) }),
        right: makeSide({ style: "thin", color: makeColor({ rgb: "FFD8E1EC" }) }),
      });
      const titleStyle = registerCellStyle(workbook, {
        font: makeFont({ name: "Calibri", size: 16, bold: true, color: makeColor({ rgb: "FF17365D" }) }),
        alignment: makeAlignment({ horizontal: "center", vertical: "center" }),
      });
      const headerStyle = registerCellStyle(workbook, {
        font: makeFont({ name: "Calibri", size: 11, bold: true, color: makeColor({ rgb: "FFFFFFFF" }) }),
        fill: makePatternFill({
          patternType: "solid",
          fgColor: makeColor({ rgb: "FF1F4E78" }),
        }),
        alignment: makeAlignment({ horizontal: "center", vertical: "center", wrapText: true }),
        border,
      });
      const bodyStyle = registerCellStyle(workbook, {
        font: makeFont({ name: "Calibri", size: 10 }),
        alignment: makeAlignment({ vertical: "center", wrapText: true }),
        border,
      });
      const dateTimeValue = (value) => {
        if (!value) return "";
        const date = new Date(value);
        return Number.isNaN(date.getTime())
          ? ""
          : date.toLocaleString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
      };
      setCell(
        worksheet,
        1,
        1,
        `${action.title} — ${action.target_category} | ${action.assessment_type} Student Report`,
        titleStyle
      );
      mergeCells(worksheet, "A1:L1");
      setRowHeight(worksheet, 1, 32);
      appendRow(worksheet, headers, { styleIds: headers.map(() => headerStyle) });

      visibleStudents.forEach((student, index) => {
        appendRow(
          worksheet,
          [
            index + 1,
            String(student.student_id ?? "").trim(),
            student.student_name || "Unknown student",
            action.target_category || "",
            action.assessment_type || "",
            Number(student.semester) || student.semester || "",
            student.course_id || "",
            student.course_name || "",
            dateTimeValue(student.assigned_on),
            (student.status || "Assigned").replace(/_/g, " "),
            dateTimeValue(student.submitted_at),
            student.review_feedback || "",
          ],
          { styleIds: headers.map(() => bodyStyle) }
        );
        setRowHeight(worksheet, index + 3, 30);
      });

      setColumnWidths(worksheet, [8, 18, 26, 16, 20, 12, 16, 30, 22, 20, 22, 36]);
      setFreezePanes(worksheet, "A3");

      const bytes = await workbookToBytes(workbook);
      const buffer = bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength
      );
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${getSafeFileName(action.title)}-student-report.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (downloadError) {
      console.error("Student report download failed:", downloadError);
      setReportError("Unable to generate the student report. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-slate-500">
        <LoaderCircle size={20} className="animate-spin" />
        Loading students...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
        <AlertCircle className="mx-auto text-red-500" size={28} />
        <p className="mt-3 text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            loadStudents();
          }}
          className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!action) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">Action not found.</p>
      </div>
    );
  }

  return (
    <>
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-5 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <ClipboardList size={17} />
              Action details
            </div>

            <h1 className="mt-2 text-xl font-bold text-slate-900 md:text-2xl">
              {action.title}
            </h1>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {action.target_category}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {action.assessment_type}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
            <Users size={17} />
            {students.length}{" "}
            {students.length === 1 ? "student" : "students"}
          </div>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <Users size={30} className="mx-auto text-slate-300" />
          <h2 className="mt-3 font-medium text-slate-800">
            No students found
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            No student assignments are available for this action.
          </p>
        </div>
      ) : (
        <>
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label
              htmlFor="student-status-sort"
              className="text-xs font-medium text-slate-600"
            >
              Sort by
              <select
                id="student-status-sort"
                value={statusSort}
                onChange={(event) => setStatusSort(event.target.value)}
                className="mt-1 block h-9 min-w-44 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">All status</option>
                <option value="approved">Approved</option>
                <option value="assigned">Assigned</option>
                <option value="reupload">Reupload</option>
              </select>
            </label>
            <p className="pb-2 text-xs text-slate-500">
              Showing {visibleStudents.length} of {students.length} students
            </p>
          </div>
          <button
            type="button"
            onClick={downloadStudentReport}
            disabled={visibleStudents.length === 0}
            className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 sm:self-auto"
          >
            <Download size={16} />
            Download student report (Excel)
          </button>
        </div>
        {reportError && (
          <p role="alert" className="border-b border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">
            {reportError}
          </p>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[17%]" />
              <col className="w-[16%]" />
              <col className="w-[11%]" />
              <col className="w-[9%]" />
              <col className="w-[18%]" />
              <col className="w-[11%]" />
              <col className="w-[18%]" />
            </colgroup>
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Course</th>
                <th className="px-4 py-3 font-medium">Assigned on</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Evidence</th>
                <th className="px-4 py-3 font-medium">Feedback</th>
                <th className="px-4 py-3 font-medium">Review</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {visibleStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                    No students match this status.
                  </td>
                </tr>
              ) : visibleStudents.map((student) => (
                <tr
                  key={student.assignment_id}
                  className="hover:bg-slate-50"
                >
                  <td className="px-4 py-4">
                    <p className="break-words font-medium text-slate-900">
                      {student.student_name || "Unknown student"}
                    </p>
                    <p className="mt-1 break-all text-xs text-slate-500">
                      {student.student_id}
                    </p>
                  </td>

                  <td className="break-words px-4 py-4 text-slate-600">
                    <p className="font-medium text-slate-800">
                      {student.course_name || student.course_id}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Semester {student.semester}
                    </p>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                    {formatDate(student.assigned_on)}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex max-w-full rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusClass(
                        student.status
                      )}`}
                    >
                      <span className="truncate">
                        {(student.status || "Assigned").replaceAll("_", " ")}
                      </span>
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    {student.evidence_url ? (
                      <button
                        type="button"
                        onClick={() => setPreviewingStudent(student)}
                        className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 font-medium text-blue-700 hover:bg-blue-50 hover:underline"
                        aria-label={`View PDF evidence from ${
                          student.student_name || "student"
                        } for ${action.title}`}
                      >
                        <FileText size={15} className="shrink-0" />
                        View PDF
                      </button>
                    ) : (
                      <span className="text-slate-400">Not submitted</span>
                    )}
                  </td>

                  <td className="break-words px-4 py-4 text-slate-600">
                    {student.review_feedback || "—"}
                  </td>

                  <td className="px-4 py-4">
                    {student.submission_id &&
                    !["approved", "completed", "complete", "done"].includes(
                      (student.status || "").toLowerCase()
                    ) ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openReview(student, "approved")}
                          className="inline-flex items-center gap-1 rounded-md bg-green-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                        >
                          <Check size={14} />
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            openReview(student, "resubmission_required")
                          }
                          className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <RotateCcw size={14} />
                          Request changes
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400">
                        {student.submission_id ? "Reviewed" : "—"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </section>
    {reviewingStudent && (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="submission-review-title"
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      >
        <form
          onSubmit={submitReview}
          className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
        >
          <h2
            id="submission-review-title"
            className="text-lg font-semibold text-slate-900"
          >
            {reviewStatus === "approved" ? "Approve submission" : "Request changes"}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {reviewingStudent.student_name || "Student"} · {action.title}
          </p>
          <label
            htmlFor="review-feedback"
            className="mt-5 block text-sm font-medium text-slate-700"
          >
            Feedback
            {reviewStatus === "resubmission_required" && (
              <span className="text-red-600"> *</span>
            )}
          </label>
          <textarea
            id="review-feedback"
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
            maxLength={2000}
            required={reviewStatus === "resubmission_required"}
            rows={4}
            placeholder={
              reviewStatus === "approved"
                ? "Optional feedback for the student"
                : "Explain what the student should update"
            }
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          {reviewError && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {reviewError}
            </p>
          )}
          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setReviewingStudent(null)}
              disabled={savingReview}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                savingReview ||
                (reviewStatus === "resubmission_required" && !feedback.trim())
              }
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingReview && <LoaderCircle size={16} className="animate-spin" />}
              {reviewStatus === "approved" ? "Confirm approval" : "Send feedback"}
            </button>
          </div>
        </form>
      </div>
    )}
    {previewingStudent && (
      <EvidencePreview
        student={previewingStudent}
        assignmentTitle={action.title}
        onClose={() => setPreviewingStudent(null)}
      />
    )}
    </>
  );
}
