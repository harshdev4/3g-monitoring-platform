
"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  FileText,
  ExternalLink,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  History,
} from "lucide-react";

import useTeacherStore from "@/store/useTeacherStore";

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  return Number.isNaN(parsed.getTime())
    ? "—"
    : parsed.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

const formatSize = (bytes) => {
  if (bytes == null) return "—";

  const size = Number(bytes);

  if (!Number.isFinite(size)) return "—";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

export default function TeacherSubmissions({ filters }) {
  const empId = useTeacherStore((state) => state.empId);

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadSubmissions = useCallback(async () => {
    if (!empId) {
      setSubmissions([]);
      setError("Teacher information is unavailable. Please sign in again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        "/api/teachers/actions/submissions",
        {
          params: {
            empId,
            program: filters?.program || "",
            semester: filters?.semester || "",
            course_code: filters?.courses || "",
            assessment: filters?.assessment || "",
            category: filters?.category3G || "",
          },
        }
      );

      setSubmissions(response.data?.submissions ?? []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load your submissions."
      );
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [
    empId,
    filters?.program,
    filters?.semester,
    filters?.courses,
    filters?.assessment,
    filters?.category3G,
  ]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between md:p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-green-50 p-2 text-green-700">
            <History size={21} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              My Submissions
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Teacher submissions for your selected filters.
            </p>
          </div>
        </div>

        {!loading && !error && (
          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
            {submissions.length}{" "}
            {submissions.length === 1 ? "submission" : "submissions"}
          </span>
        )}
      </div>

      <div className="p-4 md:p-5">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
            <LoaderCircle size={18} className="animate-spin" />
            Loading your submissions...
          </div>
        ) : error ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>

            <button
              type="button"
              onClick={loadSubmissions}
              className="ml-auto shrink-0 font-medium underline"
            >
              Retry
            </button>
          </div>
        ) : submissions.length === 0 ? (
          <div className="py-10 text-center">
            <FileText size={30} className="mx-auto text-slate-300" />
            <h3 className="mt-3 font-medium text-slate-800">
              No submissions found
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              No teacher submissions match your current filters.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((submission) => (
              <article
                key={submission.submission_id}
                className="flex flex-col gap-4 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <FileText size={22} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900">
                    {submission.title}
                  </h3>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {submission.target_category && (
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                        {submission.target_category}
                      </span>
                    )}

                    {submission.assessment_type && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                        {submission.assessment_type}
                      </span>
                    )}

                    {submission.course_code && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                        {submission.course_code}
                      </span>
                    )}

                    {submission.semester != null && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                        Semester {submission.semester}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 break-all text-sm text-slate-600">
                    {submission.original_filename}
                  </p>

                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>Submitted: {formatDate(submission.submitted_at)}</span>
                    <span>{formatSize(submission.file_size)}</span>
                    {submission.file_format && (
                      <span>
                        {String(submission.file_format).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {submission.cloudinary_url && (
                  <a
                    href={submission.cloudinary_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                  >
                    View file
                    <ExternalLink size={15} />
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
