import getAssignedCourses from "@/app/api/teachers/getAssignedCourses";
import getUser from "@/app/api/users/getUser";
import InitializeAssignedCourses from "@/components/mapper/InitializeAssignedCourses";
import Sidebar from "@/components/teacher/Sidebar";
import TeacherStoreInitializer from "@/components/mapper/TeacherStoreInitializer";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTeacherEmailFromSession, SESSION_COOKIE } from "@/lib/auth";

const TeacherDashboardLayout = async ({ children }) => {
    const cookieStore = await cookies();
    const teacherEmail = getTeacherEmailFromSession(cookieStore.get(SESSION_COOKIE)?.value);
    const teacher = teacherEmail ? await getUser(teacherEmail) : null;
    if (!teacher) redirect("/login");
    const assignedCourses = await getAssignedCourses(teacher.empId);
    return (
        <>
            <TeacherStoreInitializer teacher={teacher} />
            <InitializeAssignedCourses assignedCourses={assignedCourses} />
            <div className="min-h-screen">
                <Sidebar />

                <main className="min-h-screen lg:ml-64">
                    {children}
                </main>
            </div>
        </>
    );
};

export default TeacherDashboardLayout;
