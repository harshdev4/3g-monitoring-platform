
import { Info } from "lucide-react";

const UserWorkSpace = ({
  user,
  name,
  pageTitle = "Dashboard",
  description,
  welcomeMessage,
  welcomeDescription,
  showWelcome = true,
  showAction = false,
  actionLabel = "Take action",
  onAction,
}) => {
  return (
    <section className="font-inter">
      {/* Workspace label */}
      <p className="my-1 text-[9px] font-medium text-[#71809A]">
        {user} workspace
      </p>

      {/* Page title and optional action button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[23px] font-semibold leading-tight text-navy lg:text-[27px]">
          {pageTitle}
        </h1>

        {showAction && (
          <button
            type="button"
            onClick={onAction}
            className="w-fit shrink-0 rounded-md bg-[#2563EB] px-4 py-2 text-xs font-medium text-white hover:bg-[#1D4ED8]"
          >
            {actionLabel}
          </button>
        )}
      </div>

      {/* Page description */}
      <p className="mt-1 text-[12px] text-[#71809A]">
        {description ??
          "Department of Computer Applications · Academic Year 2026–27"}
      </p>

      {/* Optional welcome banner */}
      {showWelcome && (
        <div className="mt-3 flex items-start gap-2 rounded-md border-l-2 border-[#2563EB] bg-[#EEF5FF] p-4">
          <Info
            size={13}
            strokeWidth={1.8}
            className="mt-0.5 shrink-0 text-[#2563EB]"
          />

          <div>
            <p className="text-[14px] font-medium leading-tight text-[#0755C9]">
              {welcomeMessage ?? `Welcome back, ${name}`}
            </p>

            {welcomeDescription && (
              <p className="mt-1 text-[12px] leading-normal text-[#6B7C96]">
                {welcomeDescription}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default UserWorkSpace;
