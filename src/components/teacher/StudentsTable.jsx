
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Users,
} from "lucide-react";

import useTeacherStore from "@/store/useTeacherStore";

const PAGE_SIZE = 10;

const CATEGORY_OPTIONS = [
  { value: "all", label: "All categories" },
  { value: "Gallant", label: "Gallant" },
  { value: "Growing", label: "Growing" },
  { value: "Gradual", label: "Gradual" },
];

const CATEGORY_STYLES = {
  Gallant: "bg-emerald-50 text-emerald-700",
  Growing: "bg-amber-50 text-amber-700",
  Gradual: "bg-rose-50 text-rose-700",
};

const EMPTY_PAGINATION = {
  page: 1,
  pageSize: PAGE_SIZE,
  total: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

function formatNumber(value) {
  if (value == null || value === "") return "—";

  const number = Number(value);

  return Number.isFinite(number)
    ? String(Number(number.toFixed(1)))
    : "—";
}

function CategoryBadge({ category }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-md px-2 py-1 text-[12px] font-medium ${
        CATEGORY_STYLES[category] ??
        "bg-slate-100 text-slate-600"
      }`}
    >
      {category ?? "Unclassified"}
    </span>
  );
}

function AssessmentBadge({ student }) {
  const obtained = Number(student.obtained_mark);
  const maximum = Number(student.max_mark);

  const valid =
    student.obtained_mark != null &&
    student.max_mark != null &&
    Number.isFinite(obtained) &&
    Number.isFinite(maximum) &&
    maximum > 0;

  if (!valid) {
    return <span className="text-[12px] text-slate-400">—</span>;
  }

  const percentage = (obtained / maximum) * 100;
  const isLow = percentage < 40;

  return (
    <div className="flex flex-col items-start gap-0.5">
      <span
        className={`whitespace-nowrap text-[12px] font-medium ${
          isLow ? "text-rose-700" : "text-slate-700"
        }`}
      >
        {formatNumber(obtained)} / {formatNumber(maximum)}
      </span>
      <span className="text-[12px] text-slate-400">
        {formatNumber(percentage)}%
      </span>
    </div>
  );
}

function AttendanceValue({ value }) {
  if (value == null || value === "") {
    return <span className="text-[12px] text-slate-400">—</span>;
  }

  const attendance = Number(value);

  if (!Number.isFinite(attendance)) {
    return <span className="text-[12px] text-slate-400">—</span>;
  }

  return (
    <span
      className={`text-[12px] ${
        attendance < 75
          ? "font-semibold text-rose-700"
          : "text-slate-600"
      }`}
    >
      {formatNumber(attendance)}%
    </span>
  );
}

function SkeletonRows() {
  return Array.from({ length: PAGE_SIZE }, (_, rowIndex) => (
    <tr key={rowIndex} className="h-[48px] animate-pulse">
      {Array.from({ length: 6 }, (_, columnIndex) => (
        <td key={columnIndex} className="px-3 py-3">
          <div
            className={`h-3 rounded bg-slate-100 ${
              columnIndex === 0 ? "w-28" : "w-16"
            }`}
          />
        </td>
      ))}
    </tr>
  ));
}

function Pagination({ pagination, loading, onPageChange }) {
  const {
    page,
    total,
    totalPages,
    hasPreviousPage,
    hasNextPage,
  } = pagination;

  const first = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const last = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-slate-500">
        Showing{" "}
        <span className="font-medium text-slate-700">
          {first}–{last}
        </span>{" "}
        of{" "}
        <span className="font-medium text-slate-700">{total}</span>{" "}
        students
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPreviousPage || loading}
          className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={14} />
          Previous
        </button>

        <span className="min-w-[78px] text-center text-xs text-slate-500">
          Page {totalPages === 0 ? 0 : page} of {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage || loading}
          className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

export default function StudentsTable({ subtitle }) {
  const filters = useTeacherStore((state) => state.filters);

  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const hasRequiredFilters = Boolean(
    filters.semester &&
      filters.className &&
      filters.courses &&
      filters.assessment
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    filters.program,
    filters.semester,
    filters.className,
    filters.courses,
    filters.assessment,
    categoryFilter,
  ]);

  const fetchStudents = useCallback(
    async (signal) => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/teachers/students", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filters: {
              ...filters,
              subject: filters.courses,
            },
            category: categoryFilter,
            page: currentPage,
            pageSize: PAGE_SIZE,
          }),
          signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load students.");
        }

        const result = await response.json();

        setStudents(result.students ?? []);
        setPagination(result.pagination ?? EMPTY_PAGINATION);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Unable to load student records. Please try again.");
          setStudents([]);
          setPagination(EMPTY_PAGINATION);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    },
    [
      filters.program,
      filters.semester,
      filters.className,
      filters.courses,
      filters.assessment,
      categoryFilter,
      currentPage,
      retryCount,
    ]
  );

  useEffect(() => {
    if (!hasRequiredFilters) {
      setStudents([]);
      setPagination(EMPTY_PAGINATION);
      setError("");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    fetchStudents(controller.signal);

    return () => controller.abort();
  }, [hasRequiredFilters, fetchStudents]);

  function goToPage(page) {
    if (
      loading ||
      page < 1 ||
      page > pagination.totalPages
    ) {
      return;
    }

    setCurrentPage(page);
  }

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      {/* Table heading and filters */}
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#102746]">
            My Students
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {subtitle || "Student attendance and assessment performance"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Users size={14} />
            <span>
              Total:{" "}
              <span className="font-semibold text-slate-700">
                {pagination.total}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />

            <label htmlFor="student-category-filter" className="sr-only">
              Filter by 3G category
            </label>

            <select
              id="student-category-filter"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none transition focus:border-blue-400"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!hasRequiredFilters ? (
        <div className="flex min-h-[260px] items-center justify-center px-4 text-center">
          <div>
            <p className="text-sm font-medium text-slate-700">
              Select dashboard filters
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Choose a semester, class, course, and assessment to view students.
            </p>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <div
              role="alert"
              className="flex items-center justify-between gap-3 border-b border-rose-100 bg-rose-50 px-4 py-2"
            >
              <p className="text-xs text-rose-700">{error}</p>
              <button
                type="button"
                onClick={() => setRetryCount((count) => count + 1)}
                className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-rose-700 hover:text-rose-900"
              >
                <RefreshCw size={12} />
                Retry
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] table-fixed">
              <colgroup>
                <col className="w-[23%]" />
                <col className="w-[18%]" />
                <col className="w-[12%]" />
                <col className="w-[13%]" />
                <col className="w-[18%]" />
                <col className="w-[16%]" />
              </colgroup>

              <thead className="bg-slate-50">
                <tr className="border-b border-slate-100">
                  {[
                    "Student name",
                    "Roll no.",
                    "Class",
                    "Attendance",
                    "Assessment",
                    "3G category",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-slate-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <SkeletonRows />
                ) : error ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="h-48 text-center text-xs text-slate-500"
                    >
                      Unable to display student records.
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="h-48 text-center">
                      <p className="text-sm font-medium text-slate-700">
                        No students found
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Try changing the selected category or filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr
                      key={student.university_roll_no}
                      className={`h-[48px] transition-colors hover:bg-slate-50 ${
                        student.three_g_category === "Gradual"
                          ? "bg-rose-50/30"
                          : ""
                      }`}
                    >
                      <td className="truncate px-3 py-2 text-[12px] font-medium text-[#263B59]">
                        {student.name || "—"}
                      </td>

                      <td className="truncate px-3 py-2 text-[12px] text-slate-600">
                        {student.university_roll_no ?? "—"}
                      </td>

                      <td className="px-3 py-2 text-[12px] text-slate-600">
                        {student.section
                          ? `MCA-${student.section}`
                          : "—"}
                      </td>

                      <td className="px-3 py-2">
                        <AttendanceValue value={student.attendance_pct} />
                      </td>

                      <td className="px-3 py-2">
                        <AssessmentBadge student={student} />
                      </td>

                      <td className="px-3 py-2">
                        <CategoryBadge
                          category={student.three_g_category}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            pagination={pagination}
            loading={loading}
            onPageChange={goToPage}
          />
        </>
      )}

      {/* Minimal category legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 bg-slate-50/50 px-4 py-2">
        <span className="text-[10px] text-slate-400">Categories</span>

        {[
          ["Gallant", "bg-emerald-500"],
          ["Growing", "bg-amber-500"],
          ["Gradual", "bg-rose-500"],
        ].map(([label, dot]) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 text-[10px] text-slate-500"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}
