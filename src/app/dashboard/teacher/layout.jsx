import getAssignedCourses from "@/app/api/teachers/getAssignedCourses";
import getUser from "@/app/api/users/getUser";
import InitializeAssignedCourses from "@/components/mapper/InitializeAssignedCourses";
import Sidebar from "@/components/teacher/Sidebar";
import TeacherStoreInitializer from "@/components/mapper/TeacherStoreInitializer";

const TeacherDashboardLayout = async ({ children }) => {
    const teacher = await getUser("annu.yadav@kiet.edu");
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