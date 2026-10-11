import getUser from "@/app/api/users/getUser";
import Sidebar from "@/components/teacher/Sidebar";
import TeacherStoreInitializer from "@/components/teacher/TeacherStoreInitializer";

const TeacherDashboardLayout = async ({ children }) => {
    const teacher = await getUser("annu.yadav@kiet.edu");
    return (
        <>
            <TeacherStoreInitializer teacher={teacher} />
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