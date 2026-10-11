"use client"
import Header from "@/components/dashboard/Header";
import UserWorkSpace from "@/components/dashboard/UserWorkSpace";
import StudentsTable from "@/components/teacher/StudentsTable";
import DashboardFilters from "@/components/teacher/DashboardFilters";
import useFilterStudentsStore from "@/store/useFilterStudentsStore";
import MetricCards from "@/components/teacher/MetricCards";

const page = () => {
  const metrics = [
    {
      type: "students",
      label: "Total students",
      value: 120,
      description: "MCA-1A, MSE-1",
      iconClassName: "text-[#2563EB]",
    },
    {
      type: "gradual",
      label: "Gradual",
      value: 30,
      description: "25% need support",
      iconClassName: "text-[#EF4444]",
    },
    {
      type: "growing",
      label: "Growing",
      value: 54,
      description: "45% showing progress",
      iconClassName: "text-[#F59E0B]",
    },
    {
      type: "gallent",
      label: "Gallent",
      value: 36,
      description: "30% high performing",
      iconClassName: "text-[#10B981]",
    },
  ];
  const students = useFilterStudentsStore((state) => students);
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
          <MetricCards metrics={metrics} />
        </div>
        <div className="mt-3">
          <StudentsTable title={"My Students"} />
        </div>
        <div className="mt-3"></div>
      </div>
    </div>
  )
}

export default page