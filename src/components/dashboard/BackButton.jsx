
"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const BackButton = () => {
  const pathname = usePathname();

  const isTeacherPage = pathname.startsWith("/dashboard/teacher");

  const showBackButton =
    isTeacherPage && pathname !== "/dashboard/teacher";

  const backTarget = pathname.startsWith("/dashboard/teacher/actions/")
    ? "/dashboard/teacher/actions"
    : pathname.startsWith("/dashboard/teacher/students/") &&
        pathname !== "/dashboard/teacher/students"
      ? "/dashboard/teacher/students"
      : "/dashboard/teacher";

  if (!showBackButton) return <h1>fdsfsdfs</h1>;

  return (
    <Link
      href={backTarget}
      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-700"
    >
      <ArrowLeft size={14} />
      Back
    </Link>
  );
};

export default BackButton;
