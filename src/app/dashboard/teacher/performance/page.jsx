import React from "react";
import Header from "@/components/dashboard/Header";
import UserWorkSpace from "@/components/dashboard/UserWorkSpace";
import DashboardFilters from "@/components/teacher/DashboardFilters";
import MetricCards from "@/components/teacher/MetricCards";
import DistributionCard from "@/components/teacher/DistributionCard";
import ProgressionCard from '@/components/teacher/ProgressionCard';
import getUser from "@/app/api/users/getUser";
import TeacherStoreInitializer from "@/components/mapper/TeacherStoreInitializer";

const page = async () => {
  const teacher = await getUser("annu.yadav@kiet.edu");
  
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
  return (
    <div>
      <TeacherStoreInitializer teacher={teacher}/>
      <Header />
      <div className="p-5">
        <UserWorkSpace
          user="Teacher"
          pageTitle="Performance"
          description="Assessment analytics · MCA–1A & MCA–1B · Academic Year 2026–27"
          showAction
          actionLabel="Export Performance"
          showWelcome={false}
        />
        <DashboardFilters />
        <div className="mt-3">
          <MetricCards />
        </div>
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
      </div>
    </div>
  );
};

export default page;
