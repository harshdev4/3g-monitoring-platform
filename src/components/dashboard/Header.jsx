"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import ProfileIcon from "../ProfileIcon";

const Header = () => {
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
