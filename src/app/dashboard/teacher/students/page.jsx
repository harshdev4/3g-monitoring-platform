"use client"
import Header from "@/components/dashboard/Header";
import UserWorkSpace from "@/components/dashboard/UserWorkSpace";
import AttentionCard from "@/components/teacher/AttentionCard";
import DashboardFilters from "@/components/teacher/DashboardFilters";
import StudentsTable from "@/components/teacher/StudentsTable";
import useFilterStudentsStore from "@/store/useFilterStudentsStore";

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
          onAction={() =>  console.log("Assign support action clicked")}
          showWelcome={false}
        />
         <DashboardFilters />
         <div className="mt-3"></div>
         <StudentsTable title={"My Students"} />
        </div>
    </div>
  )
}

export default page