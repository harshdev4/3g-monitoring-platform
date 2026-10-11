"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/dashboard/Header";
import UserWorkSpace from "@/components/dashboard/UserWorkSpace";
import StudentCard from "./fragments/StudentCard";
import StudentStatusCard from "./fragments/StudentStatusCard";
import MetricCards from "@/components/teacher/MetricCards";
import CategoryProgression from "./fragments/CategoryProgression";
import ProgressionCard from "@/components/teacher/ProgressionCard";
import AssignedActions from "./fragments/AssignedActions";
import EvidenceSubmissions from "./fragments/EvidenceSubmissions";
import AttendanceSummary from "./fragments/AttendanceSummary";
import TeacherObservations from "./fragments/TeacherObservations";
// Temporary mock data
const history = [
  { checkpoint: "Baseline · 12 Aug", category: "Gradual", marks: 34 },
  { checkpoint: "MSE-I · 10 Sep", category: "Gradual", marks: 38 },
  { checkpoint: "MSE-II · 04 Oct", category: "Gradual", marks: 32 },
];
const metrics = [
  {
    label: "DBMS",
    value: "32%",
    description: "MSE-II · 04 oct 2026 ",
  },
  {
    label: "Attendance",
    value: "62%",
    description: "31 of 50 sessions",
  },
  {
    label: "Assigned actions",
    value: 4,
    description: "1 approved · 2 pending · 1 under review",
  },
  {
    label: "Evidence submitted",
    value: 3,
    description: "1 approved · 1 under review · 1 rejected",
  },
];
const students = [
  {
    rollNo: "1027",
    name: "Arman Kumar",
    department: "Department of Computer Applications",
    className: "MCA-1A",
    semester: "I",
    previousAssessment: "MSE-I",
    attendance: 65,
    subject: "DBMS",
    marks: "33",
    exam: "MSE-II",
    trend: "-5",
    assessment: "Gradual",
    email: "arman@example.com",
    faculty: "Himanshu",

    actions: [
      {
        id: 1,
        title: "Mini-Q practice sheet",
        status: "Under Review",
        subject: "DBMS",
        category: "Gradual",
        dueDate: "10 Oct",
        description: "Answer sheet required",
      },
      {
        id: 2,
        title: "Attend remedial DBMS classes",
        status: "In Progress",
        subject: "DBMS",
        dueDate: "12 Oct",
        description: "Attendance / completion proof",
      },
      {
        id: 3,
        title: "Complete DBMS assignments",
        status: "Approved",
        subject: "DBMS",
        dueDate: "15 Oct",
        description: "Assignment completion required",
      },
      {
        id: 4,
        title: "Revise database concepts",
        status: "In Progress",
        subject: "DBMS",
        dueDate: "18 Oct",
        description: "Revision progress required",
      },
    ],
    submissions: [
      {
        id: 1,
        title: "dbms_practice_aman_v2.pdf",
        status: "Under Review",
        date: "04 Oct",
        description: "Answer sheet",
        version: "Version 2 · 1.8 MB",
      },
      {
        id: 2,
        title: "Seminar participation proof",
        status: "Approved",
        date: "29 Sep",
        description: "Participation proof",
        version: "Verified by Prof. Harsh Sharma",
      },
      {
        id: 3,
        title: "DBMS assignment submission",
        status: "Under Review",
        date: "27 Sep",
        description: "Assignment document",
        version: "Version 1 · 1.2 MB",
      },
    ],
   
  },
  {
    rollNo: "1029",
    name: "Rahul Sharma",
    department: "Department of Computer Applications",
    className: "MCA-1A",
    semester: "I",
    attendance: 78,
    previousAssessment: "MSE-I",
    exam: "MSE-II",
    trend: "5",
    subject: "DBMS",
    marks: "73",
    assessment: "Growing",
    email: "rahul@example.com",
    faculty: "Himanshu",
  },
  {
    rollNo: "1031",
    name: "Priya Singh",
    department: "Department of Computer Applications",
    className: "MCA-1A",
    semester: "I",
    attendance: 92,
    previousAssessment: "MSE-I",
    exam: "MSE-II",
    trend: "8",
    subject: "DBMS",
    marks: "93",
    assessment: "Gallant",
    email: "priya@example.com",
    faculty: "Himanshu",
  },
];

export default function StudentDetailsPage() {
  const { rollNo } = useParams();
  const router = useRouter();

  const student = students.find((item) => item.rollNo === String(rollNo));

  if (!student) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Header />
        <main className="p-5">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-sm text-blue-600"
          >
            <ArrowLeft size={16} />
            Go back
          </button>

          <p className="rounded-lg border bg-white p-6 text-sm text-gray-600">
            No student found with roll number {rollNo}.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      <main className="p-5">
        {/* <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-[10px] text-[#2563EB]"
        >
          <ArrowLeft size={12} />
          Back to Students
        </button> */}

        <UserWorkSpace
          user="Teacher"
          pageTitle={`${student.name}`}
          description={`Roll ${student.rollNo} · ${student.className} · Semester ${student.semester} · Academic Year 2026–27`}
          showAction
          actionLabel="Assign action"
          onAction={() => console.log("Assign support action clicked")}
          showWelcome={false}
        />
        <div className="mt-4">
          <StudentCard student={student} />
        </div>
        <div className="mt-4">
          <StudentStatusCard
            subject={student.subject}
            marks={student.marks}
            exam={student.exam}
            trend={student.trend}
            attendance={student.attendance}
            previousAssessment={student.previousAssessment}
          />
        </div>
        <div className="mt-4">
          <MetricCards metrics={metrics} />
        </div>
        <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
          <CategoryProgression history={history} />

          <ProgressionCard
            subtitle="DBMS marks (%) · Actual assessments and next target"
            labels={["Baseline", "MSE-I", "MSE-II", "Target"]}
            series={[
              {
                label: "DBMS",
                data: [34, 38, 32, 40],
                color: "#2563EB",
              },
            ]}
            footer="Baseline 34% → MSE-I 38% → MSE-II 32% · Target 40%"
          />
        </div>
        <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
          <AssignedActions
            actions={student.actions}
            onViewAll={() => console.log("View all assigned actions")}
          />

          <EvidenceSubmissions
            submissions={student.submissions}
            onViewAll={() => console.log("View evidence and review history")}
          />

          <AttendanceSummary
            subject="DBMS"
            attended={31}
            total={50}
            minimumRequired={75}
            recentAttended={3}
            recentTotal={5}
            followUpDate="06 Oct"
            onViewRecord={() => console.log("View attendance record")}
          />

          <TeacherObservations
            onAddObservation={() => console.log("Add observation")}
            onScheduleFollowUp={() => console.log("Schedule follow-up")}
          />
        </div>
      </main>
    </div>
  );
}
