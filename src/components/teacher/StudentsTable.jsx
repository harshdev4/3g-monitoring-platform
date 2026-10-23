
"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Users,
} from "lucide-react";

import useTeacherStore from "@/store/useTeacherStore";
import Link from "next/link";

const PAGE_SIZE = 10;

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
      className={`inline-flex items-center whitespace-nowrap rounded-md px-2 py-1 text-[12px] font-medium ${CATEGORY_STYLES[category] ??
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
    student.obtained_mark !== "" &&
    student.max_mark != null &&
    student.max_mark !== "" &&
    Number.isFinite(obtained) &&
    Number.isFinite(maximum) &&
    maximum > 0;

  if (!valid) {
    return (
      <span className="text-[12px] text-slate-400">
        —
      </span>
    );
  }

  const percentage = (obtained / maximum) * 100;
  const isLow = percentage < 40;

  return (
    <div className="flex flex-col items-start gap-0.5">
      <span
        className={`whitespace-nowrap text-[12px] font-medium ${isLow ? "text-rose-700" : "text-slate-700"
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
    return (
      <span className="text-[12px] text-slate-400">
        —
      </span>
    );
  }

  const attendance = Number(value);

  if (!Number.isFinite(attendance)) {
    return (
      <span className="text-[12px] text-slate-400">
        —
      </span>
    );
  }

  return (
    <span
      className={`text-[12px] ${attendance < 75
        ? "font-semibold text-rose-700"
        : "text-slate-600"
        }`}
    >
      {formatNumber(attendance)}%
    </span>
  );
}

function SkeletonRows({ columnCount = 7 }) {
  return Array.from({ length: PAGE_SIZE }, (_, rowIndex) => (
    <tr key={rowIndex} className="h-[48px] animate-pulse">
      {Array.from({ length: columnCount }, (_, columnIndex) => (
        <td key={columnIndex} className="px-3 py-3">
          <div
            className={`h-3 rounded bg-slate-100 ${columnIndex === 0 ? "w-28" : "w-16"
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
    pageSize,
    total,
    totalPages,
    hasPreviousPage,
    hasNextPage,
  } = pagination;

  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-slate-500">
        Showing{" "}
        <span className="font-medium text-slate-700">
          {first}–{last}
        </span>{" "}
        of{" "}
        <span className="font-medium text-slate-700">
          {total}
        </span>{" "}
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

export default function StudentsTable({
  title,
  subtitle,
  categoryPage = "All",
  students = [],
  loading,
  error,
  setRetryCount,
}) {
  const filters = useTeacherStore((state) => state.filters);

  const isPreMse = filters.assessment === "pre-mse";

  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("All");

  const CATEGORY_OPTIONS =
    categoryPage === "At Risk"
      ? [
        { value: "All", label: "All categories" },
        { value: "Gradual", label: "Gradual" },
        { value: "Attendance", label: "Low Attendance" },
      ]
      : [
        { value: "All", label: "All categories" },
        { value: "Gallant", label: "Gallant" },
        { value: "Growing", label: "Growing" },
        { value: "Gradual", label: "Gradual" },
      ];

  const hasRequiredFilters = Boolean(
    filters.semester &&
    filters.className &&
    filters.courses &&
    filters.assessment
  );

  const columnCount = isPreMse ? 6 : 7;

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

  // Filter the students already received from the parent.
  let filteredStudents = students;

  if (categoryPage === "At Risk") {
    if (categoryFilter === "Gradual") {
      filteredStudents = students.filter(
        (student) =>
          student.three_g_category === "Gradual"
      );
    } else if (categoryFilter === "Attendance") {
      filteredStudents = isPreMse
        ? []
        : students.filter(
          (student) =>
            student.attendance_pct != null &&
            student.attendance_pct !== "" &&
            Number(student.attendance_pct) < 75
        ).sort(
          (a, b) =>
            Number(a.attendance_pct) - Number(b.attendance_pct)
        );
    }
  } else if (categoryFilter !== "All") {
    filteredStudents = students.filter(
      (student) =>
        student.three_g_category === categoryFilter
    );
  }

  const total = filteredStudents.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const safePage = Math.min(
    currentPage,
    Math.max(totalPages, 1)
  );

  const paginatedStudents = filteredStudents.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const pagination = {
    ...EMPTY_PAGINATION,
    page: safePage,
    total,
    totalPages,
    hasPreviousPage: safePage > 1,
    hasNextPage: safePage < totalPages,
  };

  function goToPage(page) {
    if (loading || page < 1 || page > totalPages) {
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
            {title}
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {subtitle ||
              (isPreMse
                ? "Student academic performance and SGPA"
                : "Student attendance and assessment performance")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Users size={14} />
            <span>
              Total:{" "}
              <span className="font-semibold text-slate-700">
                {filteredStudents.length}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />

            <label
              htmlFor="student-category-filter"
              className="sr-only"
            >
              Filter by 3G category
            </label>

            <select
              id="student-category-filter"
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
              className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none transition focus:border-blue-400"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={
                    isPreMse &&
                    option.value === "Attendance"
                  }
                >
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
              Choose a semester, class, course, and assessment to view
              students.
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
                onClick={() =>
                  setRetryCount((count) => count + 1)
                }
                className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-rose-700 hover:text-rose-900"
              >
                <RefreshCw size={12} />
                Retry
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table
              className={`w-full table-fixed ${isPreMse
                ? "min-w-[650px]"
                : "min-w-[760px]"
                }`}
            >
              <colgroup>
                <col className="w-[24%]" />
                <col className="w-[20%]" />
                <col className="w-[12%]" />

                {isPreMse ? (
                  <col className="w-[14%]" />
                ) : (
                  <>
                    <col className="w-[12%]" />
                    <col className="w-[12%]" />
                  </>
                )}

                <col className="w-[15%]" />
                <col className="w-[15%]" />
              </colgroup>

              <thead className="bg-slate-50">
                <tr className="border-b border-slate-100">
                  {[
                    "Student name",
                    "Roll no.",
                    "Class",
                    ...(isPreMse
                      ? ["SGPA"]
                      : ["Attendance", "Marks"]),
                    "3G category",
                    "Action",
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
                  <SkeletonRows columnCount={columnCount} />
                ) : error ? (
                  <tr>
                    <td
                      colSpan={columnCount}
                      className="h-48 text-center text-xs text-slate-500"
                    >
                      Unable to display student records.
                    </td>
                  </tr>
                ) : paginatedStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columnCount}
                      className="h-48 text-center"
                    >
                      <p className="text-sm font-medium text-slate-700">
                        No students found
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Try changing the selected category or filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((student) => (
                    <tr
                      key={student.university_roll_no}
                      className={`h-[48px] transition-colors hover:bg-slate-50 ${student.three_g_category === "Gradual"
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

                      {isPreMse ? (
                        <td className="px-3 py-2 text-[12px] font-medium text-slate-700">
                          {formatNumber(student.sgpa)}
                        </td>
                      ) : (
                        <>
                          <td className="px-3 py-2">
                            <AttendanceValue
                              value={student.attendance_pct}
                            />
                          </td>

                          <td className="px-3 py-2">
                            <AssessmentBadge student={student} />
                          </td>
                        </>
                      )}

                      <td className="px-3 py-2">
                        <CategoryBadge
                          category={student.three_g_category}
                        />
                      </td>

                      <td className="px-3 py-2">

                        <Link
                          href={{
                            pathname: `/dashboard/teacher/students/${student.university_roll_no}`,
                            query: {
                              semester: filters.semester,
                              className: filters.className,
                              courses: filters.courses,
                              assessment: filters.assessment,
                            },
                          }}
                          className="text-[11px] font-medium text-[#1670FF] hover:underline"
                        >
                          View Student
                        </Link>

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

      {/* Category legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 bg-slate-50/50 px-4 py-2">
        <span className="text-[10px] text-slate-400">
          Categories
        </span>

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
