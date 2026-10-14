"use client"
import Header from "@/components/dashboard/Header";
import UserWorkSpace from "@/components/dashboard/UserWorkSpace";
import StudentsTable from "@/components/teacher/StudentsTable";
import DashboardFilters from "@/components/teacher/DashboardFilters";
import MetricCards from "@/components/teacher/MetricCards";
import StudentMatricSection from "@/components/teacher/StudentMatricSection";
import StudentPageStudentTableSection from "@/components/teacher/StudentPageTableSection";

const page = () => {
  return (
    <div>
      <Header></Header>
      <div className="p-5">
        <UserWorkSpace
          user="Teacher"
          pageTitle="Students"
          description=" Assigned classes · MCA · Semester I · Academic Year 2026–27"
          showAction
          actionLabel="Export student list"
          onAction={() => console.log("Assign support action clicked")}
          showWelcome={false}
        />
        <DashboardFilters />
        <div className="mt-3">
          <StudentMatricSection/>
        </div>
        <div className="mt-3">
          <StudentPageStudentTableSection />
        </div>
        <div className="mt-3"></div>
      </div>
    </div>
  )
}

export default page