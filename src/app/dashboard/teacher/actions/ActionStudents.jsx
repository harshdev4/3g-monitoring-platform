
"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowUpRight,
  ClipboardList,
  LoaderCircle,
  AlertCircle,
  Users,
} from "lucide-react";

import useTeacherStore from "@/store/useTeacherStore";

const getApiError = (error) =>
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
      return "bg-amber-50 text-amber-700";

    case "rejected":
      return "bg-red-50 text-red-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
};

export default function ActionStudents({ actionId }) {
  const empId = useTeacherStore((state) => state.empId);

  const [action, setAction] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStudents = useCallback(async () => {
    if (!empId || !actionId) {
      setError("Action or teacher information is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `/api/teachers/actions/${encodeURIComponent(actionId)}/students`,
        { params: { empId } }
      );

      setAction(response.data.action ?? null);
      setStudents(response.data.students ?? []);
    } catch (err) {
      setError(getApiError(err));
      setAction(null);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [actionId, empId]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

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
          onClick={loadStudents}
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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3 font-medium">Student</th>
                <th className="px-5 py-3 font-medium">Course</th>
                <th className="px-5 py-3 font-medium">Assigned on</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Evidence</th>
                <th className="px-5 py-3 font-medium">Feedback</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {students.map((student) => (
                <tr
                  key={student.assignment_id}
                  className="hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">
                      {student.student_name || "Unknown student"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {student.student_id}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    <p>{student.course_name || student.course_id}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Semester {student.semester}
                    </p>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {formatDate(student.assigned_on)}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                        student.status
                      )}`}
                    >
                      {student.status || "Assigned"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    {student.evidence_url ? (
                      <a
                        href={student.evidence_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        View evidence
                        <ArrowUpRight size={14} />
                      </a>
                    ) : (
                      <span className="text-slate-400">Not submitted</span>
                    )}
                  </td>

                  <td className="max-w-56 px-5 py-4 text-slate-600">
                    {student.review_feedback || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
