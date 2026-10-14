import getAssignedCourses from "@/app/api/teachers/getAssignedCourses";
import getUser from "@/app/api/users/getUser";
import Header from "@/components/dashboard/Header";
import UserWorkSpace from "@/components/dashboard/UserWorkSpace";
import AttentionCard from "@/components/teacher/AttentionCard";
import DashboardFilters from "@/components/teacher/DashboardFilters";
import DashboardMatricSection from "@/components/teacher/DashboardMatricSection";
import DistributionCard from "@/components/teacher/DistributionCard";
import MetricCards from "@/components/teacher/MetricCards";
import MonitoringCard from "@/components/teacher/MonitoringCard";
import ProgressionCard from "@/components/teacher/ProgressionCard";
import QuickActionsCard from "@/components/teacher/QuickActionsCard";
import RecentActivityCard from "@/components/teacher/RecentActivityCard";
import StudentPageStudentTableSection from "@/components/teacher/StudentPageTableSection";
import StudentsTable from "@/components/teacher/StudentsTable";
import TeacherStoreInitializer from "@/components/teacher/TeacherStoreInitializer";

const page = async () => {

  const teacher = await getUser("prashant.agarwal@kiet.edu");

  if (!teacher) {
    return <p>User not found.</p>
  }

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
      <TeacherStoreInitializer teacher={teacher} />
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

        <DashboardFilters />

        {/* Metrics */}
        <div className="mt-3">
          <DashboardMatricSection />
        </div>

        {/* Charts */}
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <DistributionCard
            subtitle="Current aggregate · MSE-1 & checkpoint"
            note=""
          />

          <ProgressionCard/>
        </div>

        {/* Students */}
        <div className="mt-3">
          <StudentPageStudentTableSection />
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
