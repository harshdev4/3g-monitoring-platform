
import Header from "@/components/dashboard/Header";
import UserWorkSpace from "@/components/dashboard/UserWorkSpace";
import DashboardFilters from "@/components/teacher/DashboardFilters";
import AtRiskPageStudentTableSection from "@/components/teacher/AtRiskPageStudentTableSection";
import AtRiskMetricSection from "@/components/teacher/AtRiskMetricSection";
import AtRiskInsightsSection from "./fragments/AtRiskInsightsSection";

const Page = () => {
  return (
    <div>
      <Header />

      <div className="p-5">
        <UserWorkSpace
          user="Teacher"
          pageTitle="At-Risk Students"
          description="Early support priorities · Academic Year 2026–27"
          welcomeMessage="At-Risk Student Monitoring"
          welcomeDescription="Identify students who need attention and plan timely interventions."
          showAction
          actionLabel="Assign support action"
          onAction={() => {
            console.log("Assign support action clicked");
          }}
          showWelcome={true}
        />

        <DashboardFilters />

        <div className="mt-3">
          <AtRiskMetricSection />
        </div>

        <div className="mt-3">
          <AtRiskPageStudentTableSection />
        </div>

        <AtRiskInsightsSection />

        <p className="mt-7 text-[9px] text-[#7183A3]">
          3G · Academic insights updated 05 Oct 2026, 09:30 IST
        </p>
      </div>
    </div>
  );
};

export default Page;
