"use client"
import Header from "@/components/dashboard/Header";
import UserWorkSpace from "@/components/dashboard/UserWorkSpace";
import DashboardFilters from "@/components/teacher/DashboardFilters";
import StudentMatricSection from "@/components/teacher/StudentMatricSection";
import StudentPageStudentTableSection from "@/components/teacher/StudentPageTableSection";
import { useCallback } from "react";
import useFilterStudentsStore from "@/store/useFilterStudentsStore";
import exportStudents from "@/utils/exportStudents";
import useTeacherStore from "@/store/useTeacherStore";

const Page = () => {
  const students = useFilterStudentsStore(
    (state) => state.students
  );

  const handleExportStudents = () => {
    const assessmentLabels = {
      "pre-mse": "Pre-MSE",
      "mse-1": "MSE-1",
      "mse-2": "MSE-2",
      ese: "ESE",
    };

    const assessmentType =
      assessmentLabels[filters.assessment] || filters.assessment;

    exportStudents(
      students,
      assessmentType,
      filters.courseName
    );
  };
  const filters = useTeacherStore((state) => state.filters);

  return (
    <div>
      <Header />

      <div className="p-5">
        <UserWorkSpace
          user="Teacher"
          pageTitle="Students"
          description="Assigned classes · MCA · Semester I · Academic Year 2026–27"
          showAction
          actionLabel="Export student list"
          onAction={handleExportStudents}
          showWelcome={false}
        />

        <DashboardFilters />

        <div className="mt-3">
          <StudentMatricSection />
        </div>

        <div className="mt-3">
          <StudentPageStudentTableSection />
        </div>
      </div>
    </div>
  );
};

export default Page;
