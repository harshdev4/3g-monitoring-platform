"use client";

import Header from "@/components/dashboard/Header";
import UserWorkSpace from "@/components/dashboard/UserWorkSpace";
import DashboardFilters from "@/components/teacher/DashboardFilters";
import DistributionCard from "@/components/teacher/DistributionCard";
import ProgressionCard from "@/components/teacher/ProgressionCard";
import PerformanceMatricSection from "@/components/teacher/PerformanceMatricSection";
import CheckpointComparison from "./CheckpointComparison";
import useTeacherStore from "@/store/useTeacherStore";
import exportStudents from "@/utils/exportStudents";
import useTeacherStudents from "@/hooks/useTeacherStudents";

export default function TeacherPerformancePage() {
  const filters = useTeacherStore((state) => state.filters);
  const assignedCourses = useTeacherStore((state) => state.assignedCourses);
  const studentData = useTeacherStudents();
  const { students } = studentData;

  const academicYear = assignedCourses.find(
    (course) =>
      course.course_code === filters.courses &&
      String(course.semester) === String(filters.semester) &&
      course.className === filters.className
  )?.academicYear;

  const handleExport = () => {
    const labels = {
      "pre-mse": "Pre-MSE",
      "mse-1": "MSE-1",
      "mse-2": "MSE-2",
      ese: "ESE",
    };
    return exportStudents(
      students,
      labels[filters.assessment] ?? filters.assessment,
      filters.courseName
    );
  };

  const cohortDescription = [
    filters.className,
    academicYear ? `Academic Year ${academicYear}` : "",
  ].filter(Boolean).join(" · ");

  return (
    <div>
      <Header />
      <main className="p-5">
        <UserWorkSpace
          user="Teacher"
          pageTitle="Performance"
          description={cohortDescription || "Assessment analytics for your assigned classes"}
          showAction
          actionLabel="Export Performance"
          onAction={handleExport}
          showWelcome={false}
        />
        <DashboardFilters />
        <div className="mt-3">
          <PerformanceMatricSection {...studentData} />
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <DistributionCard
            subtitle={`${filters.className || "Selected class"} · ${filters.assessment || "Selected assessment"}`}
          />
          <ProgressionCard />
        </div>
        <div className="py-5">
          <CheckpointComparison apiEndpoint="/api/teachers/checkpoint-comparison" />
        </div>
      </main>
    </div>
  );
}
