import Sidebar from "@/components/teacher/Sidebar";

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen">
      <Sidebar />

      <main className="min-h-screen lg:ml-64">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;