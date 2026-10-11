"use client";

import { useState } from "react";

import Header from "@/components/dashboard/Header";
import UserWorkSpace from "@/components/dashboard/UserWorkSpace";
import DashboardFilters from "@/components/teacher/DashboardFilters";
import MetricCards from "@/components/teacher/MetricCards";
import StudentsTable from "@/components/teacher/StudentsTable";

import AttentionContext from "./fragments/AttentionContext";
import RecommendedFacultyFollowUp from "./fragments/RecommendedFacultyFollowUp";

const Page = () => {
  const metrics = [
    {
      type: "students",
      label: "Gradual students",
      value: 30,
      description: "DBMS",
      iconClassName: "text-[#2563EB]",
    },
    {
      type: "marks",
      label: "Low marks",
      value: 24,
      description: "Latest marks below 40%",
      iconClassName: "text-[#EF4444]",
    },
    {
      type: "attendance",
      label: "Low attendance",
      value: 18,
      description: "Attendance below 75%",
      iconClassName: "text-[#F59E0B]",
    },
    {
      type: "performance",
      label: "Declining performance",
      value: 12,
      description: "Drop of 5+ points since MSE-I",
      iconClassName: "text-[#10B981]",
    },
  ];

  const [selectedStudent, setSelectedStudent] = useState();

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
          onAction={() =>  console.log("Assign support action clicked")}
          showWelcome={true}
        />

        <DashboardFilters />

        <div className="mt-3">
          <MetricCards metrics={metrics} />
        </div>

        <div className="mt-3">
          <StudentsTable title={"Students requiring attention"} subtitle={"High severity first"}/>
        </div>

        <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
          <AttentionContext
            student={selectedStudent}
            onViewDetails={(student) => {
              console.log("View student:", student);
            }}
          />

          <RecommendedFacultyFollowUp
            student={selectedStudent}
            onCreateAction={(student) => {
              console.log("Create action for:", student?.name);
            }}
          />
        </div>

        <p className="mt-7 text-[9px] text-[#7183A3]">
          3G · Academic insights updated 05 Oct 2026, 09:30 IST
        </p>
      </div>
    </div>
  );
};

export default Page;
