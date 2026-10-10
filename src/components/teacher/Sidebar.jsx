"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Upload,
  UserRoundX,
  ClipboardList,
  FileCheck2,
  FileBarChart2,
  UserCircle,
  MoreHorizontal,
  ChartNoAxesCombined,
  TriangleAlert,
  GraduationCap,
  CircleHelp,
} from "lucide-react";

const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard/teacher",
    },
    {
      label: "Students",
      icon: Users,
      href: "/dashboard/teacher/students",
    },
    {
      label: "Upload Marks",
      icon: Upload,
      href: "/dashboard/teacher/marks",
    },
    {
      label: "Performance",
      icon: ChartNoAxesCombined,
      href: "/dashboard/teacher/performance",
    },
    {
      label: "At-Risk Students",
      icon: TriangleAlert,
      href: "/dashboard/teacher/at-risk",
    },
    {
      label: "Activities / Actions",
      icon: ClipboardList,
      href: "/dashboard/teacher/actions",
    },
    {
      label: "Evidence / Submissions",
      icon: FileCheck2,
      href: "/dashboard/teacher/evidence",
    },
    {
      label: "Reports",
      icon: FileBarChart2,
      href: "/dashboard/teacher/reports",
    },
    {
      label: "Profile",
      icon: UserCircle,
      href: "/dashboard/teacher/profile",
    },
  ];

  const mobileItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard/teacher",
    },
    {
      label: "Students",
      icon: Users,
      href: "/dashboard/teacher/students",
    },
    {
      label: "Evidence",
      icon: FileCheck2,
      href: "/dashboard/teacher/evidence",
    },
  ];

  const isActive = (href) => pathname === href;

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-21 bg-[#142844] px-4 py-6 text-white lg:block lg:w-64">
        {/* Logo */}
        <div className="mb-8">
          <Link
            href="/"
            className="font-inter text-3xl font-semibold text-white no-underline"
          >
            3G
          </Link>

          <p className="mt-1 hidden font-inter text-[10px] text-[#B8C7DD] lg:block">
            Student Success & Talent Tracking
          </p>
        </div>

        {/* Navigation */}
        <nav>
          <ul className="space-y-1">
            {menuItems.map((navItem) => {
              const Icon = navItem.icon;
              const active = isActive(navItem.href);

              return (
                <li key={navItem.href}>
                  <Link
                    href={navItem.href}
                    title={navItem.label}
                    className={`flex items-center gap-2.5 rounded-md px-2.5 py-2.5 text-xs transition-colors ${
                      active
                        ? "bg-[#294568] font-medium text-white"
                        : "text-[#B8C7DD] hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon
                      size={18}
                      strokeWidth={1.8}
                      className="shrink-0"
                    />

                    <span className="hidden lg:block">
                      {navItem.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="absolute inset-x-4 bottom-6 space-y-7 text-[11px] text-[#B8C7DD]">
          <div className="space-y-1.5">
            <p>Department of Computer<br />Applications</p>
            <p>MCA · Academic Year 2026–27</p>
            <GraduationCap size={20} className="mt-2" />
          </div>
          <Link href="/dashboard/teacher/help" className="flex items-center gap-2.5 rounded-md py-2 hover:text-white"><CircleHelp size={17} />Help &amp; Support</Link>
        </div>
      </aside>

      {/* ================= MOBILE BOTTOM BAR ================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E5EAF1] bg-white lg:hidden">
        <div className="grid h-16 grid-cols-4">
          {mobileItems.map((navItem) => {
            const Icon = navItem.icon;
            const active = isActive(navItem.href);

            return (
              <Link
                key={navItem.href}
                href={navItem.href}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  active
                    ? "text-[#2563EB]"
                    : "text-[#60708A] hover:text-[#2563EB]"
                }`}
              >
                <Icon
                  size={17}
                  strokeWidth={active ? 2 : 1.7}
                />

                <span className="text-[8px] font-medium">
                  {navItem.label}
                </span>
              </Link>
            );
          })}

          {/* More */}
          <button
            type="button"
            className="flex flex-col items-center justify-center gap-1 text-[#60708A] transition-colors hover:text-[#2563EB]"
          >
            <MoreHorizontal
              size={18}
              strokeWidth={1.8}
            />

            <span className="text-[8px] font-medium">
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;