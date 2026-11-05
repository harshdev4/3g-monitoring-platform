"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BookOpenCheck,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

const navigation = [
  { label: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard },
  { label: "Assignments", href: "/dashboard/student/actions", icon: BookOpenCheck },
  { label: "Profile", href: "/dashboard/student/profile", icon: UserRound },
];

export default function StudentSidebar({ student }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const initials = student.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const active = (href) => href === "/dashboard/student"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  const signOut = async () => {
    if (signingOut) return;
    setSigningOut(true);

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Unable to sign out. Please try again.");
      router.replace("/login");
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Unable to sign out. Please try again.");
      setSigningOut(false);
    }
  };

  return (
    <>
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col bg-[#142844] px-4 py-6 font-inter text-white lg:flex">
        <div className="mb-5">
          <Link
            href="/dashboard/student"
            className="text-3xl font-semibold text-white no-underline"
          >
            3G
          </Link>
          <p className="mt-1 text-[10px] text-[#B8C7DD]">
            Student Success &amp; Talent Tracking
          </p>
        </div>

        <nav aria-label="Student navigation">
          <ul>
            {navigation.map(({ label, href, icon: Icon }) => {
              const isCurrent = active(href);
              return (
                <li className="pb-0.5" key={href}>
                  <Link
                    href={href}
                    title={label}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`flex items-center gap-2.5 rounded-md px-2.5 py-2.5 text-xs transition-colors ${
                      isCurrent
                        ? "bg-[#294568] font-medium text-white"
                        : "text-[#B8C7DD] hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.8} className="shrink-0" />
                    <span>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto border-t border-white/10 pt-4">
          <div className="mb-3 flex min-w-0 items-center gap-2.5 px-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold text-white">
              {initials || "S"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium">{student.name}</p>
              <p className="truncate text-[10px] text-[#B8C7DD]">
                {student.university_roll_no}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2.5 text-xs text-[#B8C7DD] transition-colors hover:bg-white/10 hover:text-white disabled:cursor-wait disabled:opacity-60"
          >
            <LogOut size={18} strokeWidth={1.8} />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-40 flex h-[74px] items-center justify-between border-t-4 border-[#142844] border-b border-[#E5EAF1] bg-white px-4 font-inter sm:px-5 lg:ml-64">
        <Link
          href="/dashboard/student"
          className="truncate text-[13px] font-semibold text-[#102746] sm:text-[15px]"
        >
          3G — Student Success &amp; Talent Tracking
        </Link>
        <div className="ml-3 flex shrink-0 items-center gap-2">
          <Link
            href="/dashboard/student/profile"
            title={student.name}
            className="flex min-w-0 items-center gap-2"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#142844] text-[11px] font-semibold text-white">
              {initials || "S"}
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className="block max-w-48 truncate text-[12px] font-semibold text-[#102746]">
                {student.name}
              </span>
              <span className="block max-w-48 truncate text-[10px] text-[#66758D]">
                Student · {student.program_name || student.dept_name || "3G"}
              </span>
            </span>
            <ChevronDown size={15} className="hidden shrink-0 text-[#66758D] sm:block" />
          </Link>
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            aria-label={signingOut ? "Signing out" : "Sign out"}
            title="Sign out"
            className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-medium text-[#60708A] hover:bg-slate-100 disabled:opacity-60 sm:hidden"
          >
            <LogOut size={15} />
            {signingOut ? "…" : "Sign out"}
          </button>
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="hidden shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-medium text-[#60708A] hover:bg-slate-100 disabled:opacity-60 sm:flex lg:hidden"
          >
            <LogOut size={15} />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </header>

      <nav aria-label="Student navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E5EAF1] bg-white font-inter lg:hidden">
        <div className="grid h-16 grid-cols-3">
          {navigation.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={active(href) ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium ${
                active(href) ? "text-[#2563EB]" : "text-[#60708A]"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
