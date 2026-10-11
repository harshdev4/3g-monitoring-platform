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
import useFilterStudentsStore from "@/store/useFilterStudentsStore";
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

export default function StudentDetailsPage() {
  const { rollNo } = useParams();
  const router = useRouter();
  const students = useFilterStudentsStore((state) => state.students);
  const student = students.find((item) => item.university_roll_no == String(rollNo));

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
            attendance={student.attendance}
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
