
"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Users,
  CalendarDays,
  ArrowRight,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import useTeacherStore from "@/store/useTeacherStore";

const getApiError = (error) =>
  error.response?.data?.message ||
  error.message ||
  "Unable to load assigned actions.";

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

export default function AssignedActions({ filters }) {
  const router = useRouter();
  const empId = useTeacherStore((state) => state.empId);

  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadActions = useCallback(async () => {
    if (!empId) {
      setActions([]);
      setError(
        "Teacher information is unavailable. Please sign in again."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        "/api/teachers/actions/assigned",
        {
          params: {
            empId,
            program: filters.program || "",
            semester: filters.semester || "",
            course_code: filters.courses || "",
            assessment: filters.assessment || "",
            category: filters.category3G || "",
          },
        }
      );

      setActions(response.data.actions ?? []);
    } catch (err) {
      setError(getApiError(err));
      setActions([]);
    } finally {
      setLoading(false);
    }
  }, [
    empId,
    filters.program,
    filters.semester,
    filters.courses,
    filters.assessment,
    filters.category3G,
  ]);

  useEffect(() => {
    loadActions();
  }, [loadActions]);

  // Navigate to the selected action while preserving filters.
  const openAction = (actionId) => {
    const query = new URLSearchParams();

    if (filters.program) {
      query.set("program", filters.program);
    }

    if (filters.semester) {
      query.set("semester", filters.semester);
    }

    if (filters.courses) {
      query.set("course_code", filters.courses);
    }

    if (filters.assessment) {
      query.set("assessment", filters.assessment);
    }

    if (filters.category3G) {
      query.set("category", filters.category3G);
    }

    const queryString = query.toString();

    const url =
      `/dashboard/teacher/actions/${encodeURIComponent(actionId)}` +
      (queryString ? `?${queryString}` : "");

    router.push(url);
  };

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Section heading */}
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between md:p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <ClipboardList size={21} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Assigned Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Open an action to view its assigned students and
              submission status.
            </p>
          </div>
        </div>

        {!loading && !error && (
          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
            {actions.length}{" "}
            {actions.length === 1 ? "action" : "actions"}
          </span>
        )}
      </div>

      <div className="p-4 md:p-5">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
            <LoaderCircle
              className="animate-spin"
              size={18}
            />
            Loading assigned actions...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertCircle
              className="text-red-500"
              size={26}
            />

            <p className="text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={loadActions}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && actions.length === 0 && (
          <div className="py-12 text-center">
            <ClipboardList
              size={30}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-3 font-medium text-slate-800">
              No assigned actions found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Actions assigned by you will appear here for the
              selected filters.
            </p>
          </div>
        )}

        {/* Action cards */}
        {!loading && !error && actions.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {actions.map((action) => {
              const studentCount = Number(action.student_count) || 0;

              return (
                <button
                  key={action.action_id}
                  type="button"
                  onClick={() => openAction(action.action_id)}
                  className="group rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {/* Action title */}
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold leading-6 text-slate-900 group-hover:text-blue-700">
                      {action.title}
                    </h3>

                    <ArrowRight
                      size={18}
                      className="mt-1 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
                    />
                  </div>

                  {/* Category and assessment */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                      {action.target_category}
                    </span>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {action.assessment_type}
                    </span>
                  </div>

                  {/* Assignment information */}
                  <div className="mt-5 space-y-2 border-t border-slate-100 pt-3 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={15} />

                      <span>
                        Assigned on{" "}
                        {formatDate(action.assigned_on)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users size={15} />

                      <span>
                        {studentCount}{" "}
                        {studentCount === 1
                          ? "student"
                          : "students"}
                      </span>
                    </div>
                  </div>

                  {/* Navigation label */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm font-medium text-blue-600">
                    <span>View students</span>
                    <ArrowRight size={16} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
