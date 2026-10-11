import Sidebar from "@/components/teacher/Sidebar";

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen">
        {children}
    </div>
  );
};

export default DashboardLayout;