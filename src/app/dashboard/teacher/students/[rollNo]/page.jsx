
import {
  getStudentProgressionHistory,
} from "@/app/api/teachers/getProgressionData";
import getDashboardStudents from "@/app/api/teachers/getDashboardStudents";
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


export default async function StudentDetailsPage({
  params,
  searchParams,
}) {
  const { rollNo } = await params;
  const filters = await searchParams;

  const semester = filters.semester;
  const className = filters.className;
  const courses = filters.courses;
  const assessment = filters.assessment;

  let student = null;
  let history = [];

  let errorMessage = null;

  try {
    if (!semester || !className || !courses || !assessment) {
      errorMessage =
        "Required dashboard filters are missing. Return to the dashboard and select a semester, class, course, and assessment.";
    } else {
      const students = await getDashboardStudents({
        semester,
        className,
        courses,
        assessment,
      });

      student =
        students.find(
          (item) =>
            String(item.university_roll_no) === String(rollNo)
        ) ?? null;

      if (student) {
        history = await getStudentProgressionHistory({
          semester,
          className,
          courses,
          rollNo,
        });
      }
    }
  } catch (error) {
    console.error("Error loading student details:", error);

    errorMessage =
      "Unable to load student details. Please check the selected filters and try again.";
  }

  if (errorMessage || !student) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Header />

        <main className="p-5">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-base font-semibold text-[#102746]">
              {errorMessage
                ? "Unable to load student"
                : "Student not found"}
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              {errorMessage ??
                `No student with roll number ${rollNo} was found for the selected filters.`}
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Validate marks before calculating the percentage.
  
  // Attendance is already stored as a percentage.
  const attendanceAvailable =
    student.attendance_pct !== null &&
    student.attendance_pct !== undefined &&
    student.attendance_pct !== "" &&
    Number.isFinite(Number(student.attendance_pct));

  const attendancePercentage = attendanceAvailable
    ? Number(student.attendance_pct)
    : null;

  const subjectName =
    filters.courseName || courses || "Selected subject";

 

 

  const assessmentConfig = [
    { label: "Baseline", type: "pre-mse" },
    { label: "MSE 1", type: "mse-1" },
    { label: "MSE 2", type: "mse-2" },
    { label: "ESE", type: "ese" },
  ];

  const orderedHistory = assessmentConfig.map((checkpoint) => {
    const record = history.find(
      (item) => item.checkpoint === checkpoint.label
    );

    return {
      ...checkpoint,
      marks: record?.marks ?? null,
      max_mark: record?.max_mark ?? null,
    };
  });

  
const latestAssessment = [...orderedHistory]
  .reverse()
  .find((item) => {
    if (
      item.marks == null ||
      item.max_mark == null ||
      item.marks === "" ||
      item.max_mark === ""
    ) {
      return false;
    }

    const marks = Number(item.marks);
    const maxMarks = Number(item.max_mark);

    return (
      Number.isFinite(marks) &&
      Number.isFinite(maxMarks) &&
      maxMarks > 0
    );
  });

const marksAvailable = Boolean(latestAssessment);

const obtainedMarks = marksAvailable
  ? Number(latestAssessment.marks)
  : null;

const maximumMarks = marksAvailable
  ? Number(latestAssessment.max_mark)
  : null;

const marksPercentage = marksAvailable
  ? (obtainedMarks / maximumMarks) * 100
  : null;

const assessmentName = latestAssessment?.label ?? "Assessment";
   
   const metrics = [
    {
      label: subjectName,
      value: marksAvailable
        ? `${obtainedMarks}/${maximumMarks}`
        : "N/A",
      description:
        marksPercentage !== null
          ? `${marksPercentage.toFixed(1)}% in ${assessmentName}`
          : "Marks unavailable for this assessment",
    },
    {
      label: "Attendance",
      value:
        attendancePercentage !== null
          ? `${attendancePercentage.toFixed(1)}%`
          : "N/A",
      description: "",
    },
    {
      label: "Assigned actions",
      value: "N/A",
      description: "Backend data not available",
    },
    {
      label: "Evidence submitted",
      value: "N/A",
      description: "Backend data not available",
    },
  ];

  const progressionLabels = orderedHistory.map(
    (item) => item.label
  );

  const progressionSeries = [
    {
      label: "Student marks (%)",
      color: "#2563EB",
      data: orderedHistory.map((item) => {
        if (
          item.marks == null ||
          item.max_mark == null ||
          item.marks === "" ||
          item.max_mark === ""
        ) {
          return null;
        }

        const marks = Number(item.marks);
        const maxMarks = Number(item.max_mark);

        if (
          !Number.isFinite(marks) ||
          !Number.isFinite(maxMarks) ||
          maxMarks <= 0
        ) {
          return null;
        }

        return Number(((marks / maxMarks) * 100).toFixed(2));
      }),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      <main className="p-5">
        <UserWorkSpace
          user="Teacher"
          pageTitle={student.name}
          description={`Roll ${student.university_roll_no} · MCA-${student.section} · Semester ${student.semester} · Academic Year 2026–27`}
          showAction
          actionLabel="Assign action"
          showWelcome={false}
        />

        <div className="mt-4">
          <StudentCard student={student} />
        </div>

        <div className="mt-4">
          <StudentStatusCard
            subject={subjectName}
            marks={obtainedMarks}
            maxMarks={maximumMarks}
            exam={assessmentName}
            attendance={attendancePercentage}
          />
        </div>

        <div className="mt-4">
          <MetricCards metrics={metrics} />
        </div>

        <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
          <CategoryProgression
            history={history}
            subject={subjectName}
          />

          <ProgressionCard
            individualMode
            subtitle={`${subjectName} · ${student.name} (${student.university_roll_no})`}
            labels={progressionLabels}
            series={progressionSeries}
            footer="Student marks percentage across assessment."
          />
        </div>

        <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
          <AssignedActions actions={student.actions ?? []} />

          <EvidenceSubmissions
            submissions={student.submissions ?? []}
          />

          <AttendanceSummary
            subject={subjectName}
            attendance={attendancePercentage}
          />

          <TeacherObservations />
        </div>
      </main>
    </div>
  );
}
