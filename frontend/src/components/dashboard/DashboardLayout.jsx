import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";

const DashboardLayout = ({ children, role, userName }) => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar role={role} userName={userName} />

      <div className="xl:ml-64 transition-all duration-300">
        <main className="p-4 xl:p-8 pt-16 xl:pt-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
