"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  LoaderCircle,
  Upload,
  X,
} from "lucide-react";

const STATUS_LABELS = {
  submitted: "Submitted",
  under_review: "Under review",
  approved: "Approved",
  rejected: "Changes requested",
  resubmission_required: "Resubmission required",
  draft: "Draft",
};

async function fetchStudentAssignments() {
  const response = await fetch("/api/students/actions", { cache: "no-store" });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Unable to load assignments.");
  return result.assignments || [];
}

function formatDueDate(value) {
  if (!value) return "No due date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No due date";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatOverdueDuration(milliseconds) {
  let remainingMinutes = Math.max(1, Math.ceil(milliseconds / 60_000));
  const units = [
    ["month", 30 * 24 * 60],
    ["day", 24 * 60],
    ["hour", 60],
    ["minute", 1],
  ];
  const parts = [];

  for (const [unit, unitMinutes] of units) {
    const count = Math.floor(remainingMinutes / unitMinutes);
    if (count > 0) {
      parts.push(`${count} ${unit}${count === 1 ? "" : "s"}`);
      remainingMinutes %= unitMinutes;
    }
    if (parts.length === 2) break;
  }

  return parts.join(" ");
}

function AssignmentCard({ assignment, onSubmit }) {
  const [now, setNow] = useState(() => Date.now());
  const status = assignment.submission_status;
  const isApproved = status === "approved";
  const statusLabel = STATUS_LABELS[status] || "Pending";
  const statusTone = isApproved
    ? "bg-emerald-50 text-emerald-700"
    : status === "submitted" || status === "under_review"
      ? "bg-blue-50 text-blue-700"
      : status === "rejected" || status === "resubmission_required"
        ? "bg-rose-50 text-rose-700"
        : "bg-amber-50 text-amber-700";
  const dueTimestamp = assignment.due_date
    ? new Date(assignment.due_date).getTime()
    : Number.NaN;
  const submittedTimestamp = assignment.submitted_at
    ? new Date(assignment.submitted_at).getTime()
    : Number.NaN;
  const latenessEnd = Number.isFinite(submittedTimestamp) ? submittedTimestamp : now;
  const overdueBy =
    Number.isFinite(dueTimestamp) && latenessEnd > dueTimestamp
      ? formatOverdueDuration(latenessEnd - dueTimestamp)
      : "";

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <article className="rounded-lg border border-[#E5EAF1] bg-white p-4 transition hover:border-blue-200 hover:shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wide text-blue-700">
            {assignment.course_code || "Course"}
          </p>
          <h3 className="mt-1 text-[13px] font-semibold text-[#102746]">{assignment.title}</h3>
          <p className="mt-1 text-[12px] text-[#71809A]">
            {assignment.course_name || "Course name unavailable"}
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${statusTone}`}>
          {statusLabel}
        </span>
      </div>

      {assignment.description && (
        <p className="mt-3 line-clamp-2 text-[12px] leading-5 text-[#60708A]">{assignment.description}</p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoChip label="Your category" value={assignment.student_category || "Not categorized"} />
        <InfoChip label="Assessment" value={assignment.assessment_type || "Not specified"} />
        <InfoChip label="Semester" value={assignment.semester ? `Semester ${assignment.semester}` : "—"} />
        <InfoChip label="Due date" value={formatDueDate(assignment.due_date)} icon={CalendarDays} />
      </div>

      {overdueBy && (
        <p className="mt-3 rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-[12px] font-medium text-rose-700">
          {Number.isFinite(submittedTimestamp)
            ? `Submitted late by ${overdueBy}.`
            : `You are late by ${overdueBy}.`}
        </p>
      )}

      {assignment.review_feedback && (
        <div className="mt-3 rounded-md border border-rose-100 bg-rose-50 p-3 text-[12px] text-rose-800">
          <span className="font-semibold">Teacher feedback:</span> {assignment.review_feedback}
        </div>
      )}

      {(!isApproved || assignment.original_filename) && (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          {!isApproved && (
            <button
              type="button"
              onClick={() => onSubmit(assignment)}
              className="inline-flex items-center gap-2 rounded-md bg-[#142844] px-4 py-2 text-[12px] font-medium text-white transition hover:bg-blue-900"
            >
              <Upload size={16} />
              {status === "rejected" || status === "resubmission_required" ? "Resubmit evidence" : status ? "Update submission" : "Submit evidence"}
            </button>
          )}
          {assignment.original_filename && (
            <a
              href={assignment.cloudinary_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-w-0 items-center gap-2 text-[12px] font-medium text-blue-700 hover:underline"
            >
              <FileText size={16} className="shrink-0" />
              <span className="break-all">{assignment.original_filename}</span>
            </a>
          )}
        </div>
      )}
    </article>
  );
}

function InfoChip({ label, value, icon: Icon }) {
  return (
    <div className="min-w-0 rounded-md bg-slate-50 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 flex items-center gap-1 truncate text-[12px] font-medium text-[#253B59]">
        {Icon && <Icon size={13} className="shrink-0 text-slate-400" />}
        <span className="truncate">{value}</span>
      </p>
    </div>
  );
}

function SubmissionModal({ assignment, onClose, onSubmitted }) {
  const [file, setFile] = useState(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, submitting]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!file) {
      setError("Choose a file before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("submissionText", note);
    setSubmitting(true);

    try {
      const response = await fetch(
        `/api/students/actions/${encodeURIComponent(assignment.assignment_id)}/submit`,
        { method: "POST", body: formData }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to submit evidence.");
      onSubmitted(result.warning);
    } catch (submissionError) {
      setError(submissionError.message || "Unable to submit evidence.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="submission-title"
        className="w-full max-w-lg rounded-lg bg-white p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-blue-700">Assignment evidence</p>
            <h2 id="submission-title" className="mt-1 text-[16px] font-semibold text-[#102746]">{assignment.title}</h2>
            <p className="mt-1 text-[12px] text-[#71809A]">
              {assignment.course_name} · {assignment.course_code}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close submission dialog"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label
            htmlFor="student-evidence-file"
            className="flex cursor-pointer flex-col items-center rounded-md border-2 border-dashed border-slate-300 px-4 py-7 text-center transition hover:border-blue-400 hover:bg-blue-50/40"
          >
            <Upload size={26} className="mb-2 text-blue-700" />
            <span className="max-w-full break-all text-[13px] font-medium text-slate-800">
              {file ? file.name : "Choose evidence file"}
            </span>
            <span className="mt-1 text-[11px] text-slate-500">
              PDF files only · Max 10 MB
            </span>
            <input
              id="student-evidence-file"
              type="file"
              accept=".pdf,application/pdf"
              className="sr-only"
              disabled={submitting}
              onChange={(event) => {
                const nextFile = event.target.files?.[0] ?? null;
                setError("");
                if (
                  nextFile &&
                  !/\.pdf$/i.test(nextFile.name)
                ) {
                  setFile(null);
                  event.target.value = "";
                  setError("Only PDF files can be submitted.");
                  return;
                }
                if (nextFile?.size > 10 * 1024 * 1024) {
                  setFile(null);
                  event.target.value = "";
                  setError("Files must be 10 MB or smaller.");
                  return;
                }
                setFile(nextFile);
              }}
            />
          </label>

          <label htmlFor="submission-note" className="block">
            <span className="text-[12px] font-medium text-slate-700">Note for your teacher <span className="font-normal text-slate-400">(optional)</span></span>
            <textarea
              id="submission-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              maxLength={2000}
              disabled={submitting}
              placeholder="Add context about your submission"
              className="mt-2 w-full resize-y rounded-md border border-slate-200 px-3 py-2.5 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          {error && (
            <p role="alert" className="flex items-start gap-2 rounded-md bg-rose-50 p-3 text-[12px] text-rose-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} disabled={submitting} className="rounded-md border border-slate-200 px-4 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={submitting || !file} className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50">
              {submitting ? <><LoaderCircle size={16} className="animate-spin" /> Submitting…</> : <><Upload size={16} /> Submit assignment</>}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function StudentAssignments({ view = "dashboard" }) {
  const [assignments, setAssignments] = useState([]);
  const [courseFilter, setCourseFilter] = useState("all");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionNotice, setSubmissionNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setAssignments(await fetchStudentAssignments());
    } catch (loadError) {
      setError(loadError.message || "Unable to load assignments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetchStudentAssignments()
      .then((items) => {
        if (active) setAssignments(items);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || "Unable to load assignments.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const courses = useMemo(() => {
    const distinct = new Map();
    assignments.forEach((assignment) => {
      if (assignment.course_code) {
        distinct.set(assignment.course_code, assignment.course_name || assignment.course_code);
      }
    });
    return [...distinct.entries()].sort((first, second) => first[1].localeCompare(second[1]));
  }, [assignments]);

  const filtered = useMemo(
    () => assignments.filter((assignment) => courseFilter === "all" || assignment.course_code === courseFilter),
    [assignments, courseFilter]
  );
  const pending = assignments.filter((assignment) => assignment.submission_status !== "approved");
  const submittedCount = assignments.filter((assignment) => (
    assignment.submission_status === "submitted" || assignment.submission_status === "under_review"
  )).length;
  const completedCount = assignments.length - pending.length;
  const displayed = view === "dashboard" ? pending.slice(0, 3) : filtered;

  return (
    <>
      <div className="font-inter">
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="my-1 text-[9px] font-medium text-[#71809A]">
            {view === "dashboard" ? "Student workspace" : "Your coursework"}
          </p>
          <h1 className="text-[23px] font-semibold leading-tight text-navy lg:text-[27px]">
            {view === "dashboard" ? "Your dashboard" : "Assignments"}
          </h1>
          <p className="mt-1 max-w-2xl text-[12px] text-[#71809A]">
            {view === "dashboard"
              ? "Keep up with your assigned actions and share evidence when you are ready."
              : "Browse your assigned actions by subject, check the details, and submit your evidence."}
          </p>
        </div>
        {view === "dashboard" && (
          <Link href="/dashboard/student/actions" className="inline-flex items-center gap-2 self-start rounded-md border border-[#DCE3EC] bg-white px-4 py-2 text-[12px] font-medium text-[#52627A] hover:border-blue-300 hover:text-blue-700 sm:self-auto">
            All assignments <ArrowRight size={16} />
          </Link>
        )}
      </div>

      {view === "dashboard" && (
        <section aria-label="Assignment summary" className="mb-5 grid gap-3 sm:grid-cols-3">
          <SummaryCard icon={Clock3} label="Pending assignments" value={pending.length} tone="amber" />
          <SummaryCard icon={FileText} label="Submitted for review" value={submittedCount} tone="blue" />
          <SummaryCard icon={CheckCircle2} label="Approved" value={completedCount} tone="green" />
        </section>
      )}

      {submissionNotice && (
        <p
          role="status"
          className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-800"
        >
          {submissionNotice}
        </p>
      )}

      <section>
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[13px] font-semibold text-[#102746]">
              {view === "dashboard" ? "Pending assignments" : "All assignments"}
            </h2>
            {view === "dashboard" && <p className="mt-1 text-[12px] text-[#71809A]">Actions that still need your attention.</p>}
          </div>
          {view !== "dashboard" && (
            <label className="flex items-center gap-2 text-[12px] text-slate-500">
              <BookOpen size={16} />
              <span className="sr-only">Filter by subject</span>
              <select
                value={courseFilter}
                onChange={(event) => setCourseFilter(event.target.value)}
                className="min-w-48 rounded-md border border-[#DCE3EC] bg-white px-3 py-2 text-[12px] text-[#253B59] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">All subjects</option>
                {courses.map(([code, name]) => <option key={code} value={code}>{name} · {code}</option>)}
              </select>
            </label>
          )}
        </div>

        {loading ? (
          <div role="status" className="flex items-center justify-center gap-2 rounded-lg border border-[#E5EAF1] bg-white py-12 text-[12px] text-slate-500">
            <LoaderCircle size={18} className="animate-spin" /> Loading assignments…
          </div>
        ) : error ? (
          <div role="alert" className="flex items-start gap-3 rounded-lg border border-rose-100 bg-rose-50 p-4 text-[12px] text-rose-800">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div className="flex-1">{error}</div>
            <button type="button" onClick={loadAssignments} className="font-semibold underline">Try again</button>
          </div>
        ) : displayed.length ? (
          <div className="grid gap-4">
            {displayed.map((assignment) => (
              <AssignmentCard
                key={assignment.assignment_id}
                assignment={assignment}
                onSubmit={setSelectedAssignment}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              {view === "dashboard" ? <CheckCircle2 size={22} /> : <BookOpen size={22} />}
            </span>
            <h3 className="mt-3 text-[13px] font-semibold text-[#102746]">
              {assignments.length === 0 ? "No assignments yet" : "You’re all caught up"}
            </h3>
            <p className="mt-1 text-[12px] text-[#71809A]">
              {assignments.length === 0
                ? "New assignments from your teachers will appear here."
                : view === "dashboard"
                  ? "There are no pending assignments right now."
                  : "No assignments match the selected subject."}
            </p>
          </div>
        )}
      </section>

      {selectedAssignment && (
        <SubmissionModal
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          onSubmitted={async (warning) => {
            setSelectedAssignment(null);
            setSubmissionNotice(warning || "");
            await loadAssignments();
          }}
        />
      )}
      </div>
    </>
  );
}

function SummaryCard({ icon: Icon, label, value, tone }) {
  const tones = {
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
  };
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#E5EAF1] bg-white p-4">
      <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}>
        <Icon size={20} />
      </span>
      <div>
        <p className="text-2xl font-semibold leading-none text-[#102746]">{value}</p>
        <p className="mt-1 text-[12px] text-[#71809A]">{label}</p>
      </div>
    </div>
  );
}
