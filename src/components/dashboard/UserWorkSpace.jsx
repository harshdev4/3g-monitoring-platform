import { Info } from "lucide-react";

const UserWorkSpace = ({ user, name }) => {
  return (
    <section className="font-inter">
      {/* Workspace */}
      <p className="my-1 text-[9px] font-medium text-[#71809A]">
        {user} workspace
      </p>

      {/* Page title */}
      <h1 className="text-[23px] lg:text-[27px] font-semibold leading-tight text-navy">
        {user} Dashboard
      </h1>

      {/* Page description */}
      <p className="mt-1 text-[12px] text-[#71809A]">
        Department of Computer Applications {user == "Teacher" && "· Assigned classes" }· Academic Year
        2026–27
      </p>

      {/* Welcome Banner */}
      <div className="mt-3 flex items-start gap-2 rounded-md border-l-2 border-[#2563EB] bg-[#EEF5FF] p-4">
        <Info
          size={13}
          strokeWidth={1.8}
          className="mt-0.5 shrink-0 text-[#2563EB]"
        />

        <div>
          <p className="text-[14px] font-medium leading-none text-[#0755C9]">
            Welcome back, {name}
          </p>
          {
            (user == "Teacher" || user == "Dean") &&
            <p className="mt-1 text-[12px] leading-none text-[#6B7C96]">
              Track your students, support their progress and review today&apos;s
              priorities.
            </p>
          }
        </div>
      </div>
    </section>
  );
};

export default UserWorkSpace;