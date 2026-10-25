"use client";

import useTeacherStore from "@/store/useTeacherStore";
import MetricCards from "./MetricCards";

const PerformanceMatricSection = ({ students, loading, error, retry }) => {
  const filters = useTeacherStore((state) => state.filters);
  const hasRequiredFilters = Boolean(
    filters.semester &&
      filters.className &&
      filters.courses &&
      filters.assessment
  );

  const isPreMse = filters.assessment === "pre-mse";
  const validMarks = students.filter((student) => {
    if (isPreMse) {
      return student.sgpa != null && Number.isFinite(Number(student.sgpa));
    }
    return Number.isFinite(Number(student.obtained_mark)) &&
      Number.isFinite(Number(student.max_mark)) &&
      Number(student.max_mark) > 0;
  });

  const averageMarks = validMarks.length > 0
    ? validMarks.reduce((sum, student) => sum + (
        isPreMse
          ? Number(student.sgpa)
          : (Number(student.obtained_mark) / Number(student.max_mark)) * 100
      ), 0) / validMarks.length
    : 0;

  // Assumes 40% is the passing threshold.
  const passedStudents = validMarks.filter(
    (student) =>
      isPreMse
        ? Number(student.sgpa) >= 4
        : Number(student.obtained_mark) / Number(student.max_mark) >= 0.4
  ).length;

  const passPercentage =
    validMarks.length > 0
      ? (passedStudents / validMarks.length) * 100
      : 0;

  const validAttendance = students.filter(
    (student) =>
      !isPreMse &&
      student.attendance_pct != null &&
      student.attendance_pct !== "" &&
      Number.isFinite(Number(student.attendance_pct))
  );

  const averageAttendance =
    validAttendance.length > 0
      ? validAttendance.reduce(
          (sum, student) =>
            sum + Number(student.attendance_pct),
          0
        ) / validAttendance.length
      : 0;

  const metrics = [
    {
      label: isPreMse ? "Average previous SGPA" : "Average marks",
      value: isPreMse
        ? `${averageMarks.toFixed(2)} / 10`
        : `${averageMarks.toFixed(1)}%`,
      description: `Across ${validMarks.length} students with records`,
      type: "",
      iconClassName: "text-[#2563EB]",
    },
    {
      label: "Pass percentage",
      value: `${passPercentage.toFixed(1)}%`,
      description: isPreMse
        ? `${passedStudents} of ${validMarks.length} students · SGPA ≥4`
        : `${passedStudents} of ${validMarks.length} students · ≥40%`,
      type: "",
      iconClassName: "text-[#10B981]",
    },
    {
      label: "Average attendance",
      value: isPreMse || validAttendance.length === 0
        ? "N/A"
        : `${averageAttendance.toFixed(0)}%`,
      description: isPreMse
        ? "Not reported for Pre-MSE"
        : `Across ${validAttendance.length} attendance records`,
      type: "",
      iconClassName: "text-[#2563EB]",
    },
  ];

  if (loading) {
    return (
      <p className="text-sm text-slate-500">
        Loading performance metrics...
      </p>
    );
  }

  if (error) {
    return (
      <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
        <p>{error}</p>
        <button
          type="button"
          onClick={retry}
          className="mt-2 font-semibold underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!hasRequiredFilters) {
    return (
      <p className="text-sm text-slate-500">
        Select a semester, class, course, and assessment to view performance metrics.
      </p>
    );
  }

  return <MetricCards metrics={metrics} />;
};

export default PerformanceMatricSection;