"use client";

import { useRouter } from "next/navigation";
import Header from "@/components/dashboard/Header";
import UserWorkSpace from "@/components/dashboard/UserWorkSpace";
import DashboardFilters from "@/components/teacher/DashboardFilters";
import RecommendedFacultyFollowUp from "./fragments/RecommendedFacultyFollowUp";
import AtRiskPageStudentTableSection from "@/components/teacher/AtRiskPageStudentTableSection";
import AtRiskMetricSection from "@/components/teacher/AtRiskMetricSection";
import useTeacherStore from "@/store/useTeacherStore";

const Page = () => {
  const router = useRouter();
  const filters = useTeacherStore((state) => state.filters);
  return (
    <div>
      <Header />

      <div className="p-5">
        <UserWorkSpace
          user="Teacher"
          pageTitle="At-Risk Students"
          description={`Early support priorities · ${filters.academicYear ? `Academic Year ${filters.academicYear}` : "Assigned academic year"}`}
          welcomeMessage="At-Risk Student Monitoring"
          welcomeDescription="Identify students who need attention and plan timely interventions."
          showAction
          actionLabel="Assign support action"
          onAction={() => router.push("/dashboard/teacher/actions")}
          showWelcome={true}
        />

        <DashboardFilters />

        <div className="mt-3">
          <AtRiskMetricSection/>
        </div>

        <div className="mt-3">
          <AtRiskPageStudentTableSection/>
        </div>
        <div className="mt-3">
          <RecommendedFacultyFollowUp
            onCreateAction={() => router.push("/dashboard/teacher/actions")}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
