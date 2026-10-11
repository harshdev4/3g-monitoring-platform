"use client"
import Header from "@/components/dashboard/Header";
import UserWorkSpace from "@/components/dashboard/UserWorkSpace";
import StudentsTable from "@/components/teacher/StudentsTable";
import DashboardFilters from "@/components/teacher/DashboardFilters";
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
      assessment: "Growing",
      statusClass: "bg-red-50 text-red-500",
    },
    {
      id: 3,
      name: "Karan Mehta",
      rollNo: "1030",
      className: "MCA-1A",
      attendance: 68,
      assessment: "Gallent",
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
         <div className="mt-3">
          <MetricCards metrics={metrics} />
        </div>
         <div className="mt-3">
          <StudentsTable students={students} subtitle="MCA-1A · 30 students" />
        </div>
        </div>
    </div>
  )
}

export default page