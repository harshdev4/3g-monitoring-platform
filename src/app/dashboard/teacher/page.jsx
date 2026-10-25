import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTeacherEmailFromSession, SESSION_COOKIE } from "@/lib/auth";
import getUser from "@/app/api/users/getUser";
import Header from "@/components/dashboard/Header";
import UserWorkSpace from "@/components/dashboard/UserWorkSpace";
import AttentionCard from "@/components/teacher/AttentionCard";
import DashboardFilters from "@/components/teacher/DashboardFilters";
import DashboardMatricSection from "@/components/teacher/DashboardMatricSection";
import DistributionCard from "@/components/teacher/DistributionCard";
import MetricCards from "@/components/teacher/MetricCards";
import ProgressionCard from "@/components/teacher/ProgressionCard";
import ActionEvidenceMonitoring from "@/components/teacher/ActionEvidenceMonitoring";
import StudentPageStudentTableSection from "@/components/teacher/StudentPageTableSection";
import TeacherStoreInitializer from "@/components/mapper/TeacherStoreInitializer";

const page = async () => {

  const cookieStore = await cookies();
  const teacherEmail = getTeacherEmailFromSession(cookieStore.get(SESSION_COOKIE)?.value);
  const teacher = teacherEmail ? await getUser(teacherEmail) : null;

  if (!teacher) {
    redirect("/login");
  }

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
          description={`${teacher.dept} · Assigned academic year`}
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
        <div className="mt-3">
          <ActionEvidenceMonitoring />
        </div>
      </div>
      <div className="lg:hidden w-screen h-16"></div>
    </div>
  );
};

export default page;
