"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/dashboard/Header";
import UserWorkSpace from "@/components/dashboard/UserWorkSpace";
import DashboardFilters from "@/components/teacher/DashboardFilters";
import AttentionContext from "./fragments/AttentionContext";
import RecommendedFacultyFollowUp from "./fragments/RecommendedFacultyFollowUp";
import AtRiskPageStudentTableSection from "@/components/teacher/AtRiskPageStudentTableSection";
import AtRiskMetricSection from "@/components/teacher/AtRiskMetricSection";

const Page = () => {
  const [selectedStudent, setSelectedStudent] = useState();
   const router = useRouter();
  return (
    <div>
      <Header />

      <div className="p-5">
        <UserWorkSpace
          user="Teacher"
          pageTitle="At-Risk Students"
          description="Early support priorities · Academic Year 2026–27"
          welcomeMessage="At-Risk Student Monitoring"
          welcomeDescription="Identify students who need attention and plan timely interventions."
          showAction
          actionLabel="Assign support action"
          onAction={() => {
    router.push("/dashboard/teacher/actions");
  }}
          showWelcome={true}
        />

        <DashboardFilters />

        <div className="mt-3">
          <AtRiskMetricSection/>
        </div>

        <div className="mt-3">
          <AtRiskPageStudentTableSection/>
        </div>
      </div>
    </div>
  );
};

export default Page;
