"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import ProfileIcon from "../ProfileIcon";

const Header = () => {
  const pathname = usePathname();
  const isTeacherPage = pathname.startsWith("/dashboard/teacher");
  const backTarget = pathname.startsWith("/dashboard/teacher/actions/")
    ? "/dashboard/teacher/actions"
    : pathname.startsWith("/dashboard/teacher/students/") &&
        pathname !== "/dashboard/teacher/students"
      ? "/dashboard/teacher/students"
      : "/dashboard/teacher";
  const showBackButton =
    isTeacherPage && pathname !== "/dashboard/teacher";

  return (
    <div className="flex justify-between bg-white p-5">
      <div className="flex items-center gap-4">
        <h2 className="font-semibold text-[22px] lg:text-[15px] text-navy font-inter">
          {" "}
          3G{" "}
          <span className="hidden lg:inline">
            {" "}
            — Student Success & Talent Tracking
          </span>{" "}
        </h2>
        {showBackButton && (
          <Link
            href={backTarget}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-700"
          >
            <ArrowLeft size={14} />
            Back
          </Link>
        )}
      </div>
      {/* profile & notification div */}
      <div className="flex gap-2.5">
        {/* <NotificationButton count={notificationCount}></NotificationButton> */}
        <ProfileIcon />
      </div>
    </div>
  );
};

export default Header;
