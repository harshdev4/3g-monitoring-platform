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

  const students = [
    {
      id: 1,
      name: "Arman Kumar",
      rollNo: "1027",
      className: "MCA-1A",
      attendance: 65,
      assessment: "Gradual",
      statusClass: "bg-red-50 text-red-500",
    },
    {
      id: 2,
      name: "Rahul Sharma",
      rollNo: "1029",
      className: "MCA-1A",
      attendance: 58,
      assessment: "Gradual",
      statusClass: "bg-red-50 text-red-500",
    },
    {
      id: 3,
      name: "Karan Mehta",
      rollNo: "1030",
      className: "MCA-1A",
      attendance: 68,
      assessment: "Gradual",
      statusClass: "bg-red-50 text-red-500",
    },
    {
      id: 4,
      name: "Priya Singh",
      rollNo: "1031",
      className: "MCA-1A",
      attendance: 62,
      assessment: "Gradual",
      statusClass: "bg-red-50 text-red-500",
    },
    {
      id: 5,
      name: "Amit Verma",
      rollNo: "1032",
      className: "MCA-1A",
      attendance: 55,
      assessment: "Gradual",
      statusClass: "bg-red-50 text-red-500",
    },
    {
      id: 6,
      name: "Sneha Gupta",
      rollNo: "1033",
      className: "MCA-1A",
      attendance: 64,
      assessment: "Gradual",
      statusClass: "bg-red-50 text-red-500",
    },
    {
      id: 7,
      name: "Rohit Yadav",
      rollNo: "1034",
      className: "MCA-1A",
      attendance: 49,
      assessment: "Gradual",
      statusClass: "bg-red-50 text-red-500",
    },
    {
      id: 8,
      name: "Anjali Mishra",
      rollNo: "1035",
      className: "MCA-1A",
      attendance: 67,
      assessment: "Gradual",
      statusClass: "bg-red-50 text-red-500",
    },
    {
      id: 9,
      name: "Vikas Tiwari",
      rollNo: "1036",
      className: "MCA-1A",
      attendance: 60,
      assessment: "Gradual",
      statusClass: "bg-red-50 text-red-500",
    },
    {
      id: 10,
      name: "Pooja Patel",
      rollNo: "1037",
      className: "MCA-1A",
      attendance: 52,
      assessment: "Gradual",
      statusClass: "bg-red-50 text-red-500",
    },
    {
      id: 11,
      name: "Ankit Srivastava",
      rollNo: "1038",
      className: "MCA-1A",
      attendance: 63,
      assessment: "Gradual",
      statusClass: "bg-red-50 text-red-500",
    },
    {
      id: 12,
      name: "Kavya Joshi",
      rollNo: "1039",
      className: "MCA-1A",
      attendance: 45,
      assessment: "Gradual",
      statusClass: "bg-red-50 text-red-500",
    },
    {
      id: 13,
      name: "Saurabh Pandey",
      rollNo: "1040",
      className: "MCA-1A",
      attendance: 66,
      assessment: "Gradual",
      statusClass: "bg-red-50 text-red-500",
    },
    {
      id: 14,
      name: "Riya Agarwal",
      rollNo: "1041",
      className: "MCA-1A",
      attendance: 57,
      assessment: "Gradual",
      statusClass: "bg-red-50 text-red-500",
    },
    {
      id: 15,
      name: "Deepak Chauhan",
      rollNo: "1042",
      className: "MCA-1A",
      attendance: 61,
      assessment: "Gradual",
      statusClass: "bg-red-50 text-red-500",
    },
    {
      id: 16,
      name: "Simran Kaur",
      rollNo: "1043",
      className: "MCA-1A",
      attendance: 54,
      assessment: "Gradual",
      statusClass: "bg-red-50 text-red-500",
    },
    {
      id: 17,
      name: "Manish Kumar",
      rollNo: "1044",
      className: "MCA-1A",
      attendance: 69,
      assessment: "Gradual",
      statusClass: "bg-red-50 text-red-500",
    },
    {
      id: 18,
      name: "Divya Saxena",
      rollNo: "1045",
      className: "MCA-1A",
      attendance: 48,
      assessment: "Gradual",
      statusClass: "bg-red-50 text-red-500",
    },
    {
      id: 19,
      name: "Nikhil Jain",
      rollNo: "1046",
      className: "MCA-1A",
      attendance: 59,
      assessment: "Gradual",
      statusClass: "bg-red-50 text-red-500",
    },
    {
      id: 20,
      name: "Shivani Verma",
      rollNo: "1047",
      className: "MCA-1A",
      attendance: 64,
      assessment: "Gradual",
      statusClass: "bg-red-50 text-red-500",
    },
    {
      id: 21,
      name: "Abhishek Gupta",
      rollNo: "1048",
      className: "MCA-1A",
      attendance: 51,
      assessment: "Gradual",
      statusClass: "bg-red-50 text-red-500",
    },
    {
      id: 22,
      name: "Megha Singh",
      rollNo: "1049",
      className: "MCA-1A",
      attendance: 62,
      assessment: "Gradual",
      statusClass: "bg-red-50 text-red-500",
    },
    {
      id: 23,
      name: "Aditya Mishra",
      rollNo: "1050",
      className: "MCA-1A",
      attendance: 56,
      assessment: "Gradual",
      statusClass: "bg-red-50 text-red-500",
    },
    {
      id: 24,
      name: "Nisha Kumari",
      rollNo: "1051",
      className: "MCA-1A",
      attendance: 47,
      assessment: "Gradual",
      statusClass: "bg-red-50 text-red-500",
    },
    {
      id: 25,
      name: "Varun Saxena",
      rollNo: "1052",
      className: "MCA-1A",
      attendance: 65,
      assessment: "Gradual",
      statusClass: "bg-red-50 text-red-500",
    },
    {
      id: 26,
      name: "Tanya Sharma",
      rollNo: "1053",
      className: "MCA-1A",
      attendance: 53,
      assessment: "Gradual",
      statusClass: "bg-red-50 text-red-500",
    },
    {
      id: 27,
      name: "Mohit Raj",
      rollNo: "1054",
      className: "MCA-1A",
      attendance: 60,
      assessment: "Gradual",
      statusClass: "bg-red-50 text-red-500",
    },
    {
      id: 28,
      name: "Ayesha Khan",
      rollNo: "1055",
      className: "MCA-1A",
      attendance: 44,
      assessment: "Gradual",
      statusClass: "bg-red-50 text-red-500",
    },
    {
      id: 29,
      name: "Harsh Vardhan",
      rollNo: "1056",
      className: "MCA-1A",
      attendance: 58,
      assessment: "Gradual",
      statusClass: "bg-red-50 text-red-500",
    },
    {
      id: 30,
      name: "Sakshi Patel",
      rollNo: "1057",
      className: "MCA-1A",
      attendance: 66,
      assessment: "Gradual",
      statusClass: "bg-red-50 text-red-500",
    },
  ];
  const [selectedStudent, setSelectedStudent] = useState(students[0]);

  return (
    <div>
      <Header />

      <div className="p-5">
        <UserWorkSpace
          user="Teacher"
          pageTitle="At-Risk Students"
          description="Early support priorities · DBMS · MSE-II · Academic Year 2026–27"
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
          <StudentsTable students={students} subtitle="MCA-1A · 30 students" />
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
