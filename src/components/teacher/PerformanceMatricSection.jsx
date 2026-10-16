"use client";

import useFilterStudentsStore from "@/store/useFilterStudentsStore";
import useTeacherStore from "@/store/useTeacherStore";
import MetricCards from "./MetricCards";

const PerformanceMatricSection = () => {
  const students = useFilterStudentsStore(
    (state) => state.students
  );

  const loading = useFilterStudentsStore(
    (state) => state.loading
  );

  const filters = useTeacherStore((state) => state.filters);

  const validMarks = students.filter(
    (student) =>
      Number.isFinite(Number(student.obtained_mark)) &&
      Number.isFinite(Number(student.max_mark)) &&
      Number(student.max_mark) > 0
  );

  const averageMarks =
    validMarks.length > 0
      ? validMarks.reduce(
          (sum, student) =>
            sum +
            (Number(student.obtained_mark) /
              Number(student.max_mark)) *
              100,
          0
        ) / validMarks.length
      : 0;

  // Assumes 40% is the passing threshold.
  const passedStudents = validMarks.filter(
    (student) =>
      Number(student.obtained_mark) /
        Number(student.max_mark) >= 0.4
  ).length;

  const passPercentage =
    validMarks.length > 0
      ? (passedStudents / validMarks.length) * 100
      : 0;

  const validAttendance = students.filter(
    (student) =>
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

  const improvingStudents = students.filter(
    (student) => student.three_g_category === "Growing"
  ).length;

  const total = students.length;

  const metrics = [
    {
      label: "Average marks",
      value: `${averageMarks.toFixed(1)}%`,
      description: `Across ${validMarks.length} assessed students`,
      type: "",
      iconClassName: "text-[#2563EB]",
    },
    {
      label: "Pass percentage",
      value: `${passPercentage.toFixed(1)}%`,
      description: `${passedStudents} of ${validMarks.length} students · ≥40%`,
      type: "",
      iconClassName: "text-[#10B981]",
    },
    {
      label: "Average attendance",
      value: `${averageAttendance.toFixed(0)}%`,
      description: `Across ${validAttendance.length} attendance records`,
      type: "",
      iconClassName: "text-[#2563EB]",
    },
    {
      label: "Improving students",
      value: String(improvingStudents),
      description: `${
        total > 0
          ? ((improvingStudents / total) * 100).toFixed(0)
          : 0
      }% show positive progress`,
      type: "",
      iconClassName: "text-[#F59E0B]",
    },
  ];

  if (loading) {
    return (
      <p className="text-sm text-slate-500">
        Loading performance metrics...
      </p>
    );
  }

  return <MetricCards metrics={metrics} />;
};

export default PerformanceMatricSection;