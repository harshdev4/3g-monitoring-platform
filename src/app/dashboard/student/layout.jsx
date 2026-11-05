import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionFromToken, SESSION_COOKIE } from "@/lib/auth";
import { getStudentProfileByEmail } from "@/lib/student";
import StudentSidebar from "@/components/student/StudentSidebar";

export default async function StudentDashboardLayout({ children }) {
  const cookieStore = await cookies();
  const session = getSessionFromToken(cookieStore.get(SESSION_COOKIE)?.value);

  if (session?.role !== "student") {
    if (session?.role === "teacher") redirect("/dashboard/teacher");
    if (session?.role === "dean") redirect("/dashboard/dean");
    redirect("/login");
  }

  const student = await getStudentProfileByEmail(session.email);
  if (!student) redirect("/login");

  return (
    <div className="min-h-screen bg-[#f5f8fc] font-inter text-slate-900">
      <StudentSidebar student={student} />
      <main className="min-h-screen pb-24 font-inter lg:ml-64 lg:pb-8">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-7 lg:px-10 lg:py-9">
          {children}
        </div>
      </main>
    </div>
  );
}
