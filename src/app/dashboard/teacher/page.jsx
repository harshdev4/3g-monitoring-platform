import getAssignedCourses from "@/app/api/teachers/getAssignedCourses";
import getUser from "@/app/api/users/getUser";
import Header from "@/components/dashboard/Header";
import UserWorkSpace from "@/components/dashboard/UserWorkSpace";
import AttentionCard from "@/components/teacher/AttentionCard";
import DashboardFilters from "@/components/teacher/DashboardFilters";
import DistributionCard from "@/components/teacher/DistributionCard";
import MetricCards from "@/components/teacher/MetricCards";
import MonitoringCard from "@/components/teacher/MonitoringCard";
import ProgressionCard from "@/components/teacher/ProgressionCard";
import QuickActionsCard from "@/components/teacher/QuickActionsCard";
import RecentActivityCard from "@/components/teacher/RecentActivityCard";
import StudentsTable from "@/components/teacher/StudentsTable";
import TeacherStoreInitializer from "@/components/teacher/TeacherStoreInitializer";

const page = async () => {

  const teacher = await getUser("prashant.agarwal@kiet.edu");
  
  if(!teacher){
    return <p>User not found.</p>
  }

  const progressionSeries = [
    {
      label: "Gradual",
      color: "#EF4444",
      data: [42, 50, 60, 70],
    },
    {
      label: "Growing",
      color: "#F59E0B",
      data: [42, 57, 68, 82],
    },
    {
      label: "Gallant",
      color: "#10B981",
      data: [42, 52, 64, 78],
    },
  ];

  const quickActions = [
    {
      label: "Upload Marks",
      type: "upload",
      href: "/dashboard/teacher/upload-marks/",
    },
    {
      label: "Create Action",
      type: "create",
      href: "/dashboard/teacher/actions",
    },
  ];

  const attentionStudents = [
    {
      id: 1,
      name: "Arman Kumar",
      rollNo: "MCA-101",
      reason: "32% MSE-1 · Attendance below 75%",
    },
    {
      id: 2,
      name: "Karan Mehta",
      rollNo: "MCA-104",
      reason: "Low assessment score · Needs follow-up",
    },
  ];

  const monitoringItems = [
    {
      value: 84,
      label: "actions assigned",
      description: "52 approved · 32 in progress",
      status: "70%",
    },
    {
      value: 60,
      label: "evidence submitted",
      description: "Awaiting review",
      status: "50%",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      title: "04 Oct · Arman submitted MSE-1 practice",
      description: "DBMS · Marks updated",
    },
    {
      id: 2,
      title: "04 Oct · MSE-1 marks uploaded",
      description: "MCA-1A · 120 students",
    },
    {
      id: 3,
      title: "29 Sep · Seminar evidence approved",
      description: "Activity completed",
    },
  ];

  return ( 
    <div>
      <TeacherStoreInitializer teacher={teacher}/>
      <Header></Header>
      <div className="p-5">
        <UserWorkSpace
          user={`${teacher.role == 'teacher' && 'Teacher' || teacher.role == 'student' && 'Student' || teacher.role == 'dean' || 'Dean'}`}
          name={teacher.name}
          designation={teacher.designation}
          pageTitle="Dashboard"
          description={`${teacher.dept} · Academic Year 2026–27`}
          welcomeDescription="Track your students, support their progress and review today's priorities."
        />

        <DashboardFilters/>
        {/* Metrics */}

        <div className="mt-3">
          <MetricCards/>
        </div>

        {/* Charts */}
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <DistributionCard
            subtitle="Current aggregate · MSE-1 & checkpoint"
            note=""
          />

          <ProgressionCard
            subtitle="MCA-1A · Average from assessment"
            labels={["Pre-MSE", "MSE-1", "MSE-2", "ESE"]}
            series={progressionSeries}
            footer="Cohort: 120 · Growing up · Grade bands over assessment period"
          />
        </div>

        {/* Attention + Actions */}
        {/* <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <AttentionCard
            subtitle="Students needing support"
            students={attentionStudents}
          />

          <QuickActionsCard
            actions={quickActions}
            evidenceCount={8}
            evidenceText="Answer sheets, projects and completion proofs"
          />
        </div> */}

        {/* Students */}
        <div className="mt-3">
          <StudentsTable title={"My Students"}/>
        </div>

        {/* Bottom cards */}
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <MonitoringCard
            title="Action & Evidence Monitoring"
            items={monitoringItems}
            actionLabel="View Actions / Actions"
          />

          <RecentActivityCard activities={recentActivities} />
        </div>
      </div>
      <div className="lg:hidden w-screen h-16"></div>
    </div>
  );
};

export default page;
