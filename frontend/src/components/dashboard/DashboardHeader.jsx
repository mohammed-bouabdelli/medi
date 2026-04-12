import NotificationBell from "./NotificationBell";

const DashboardHeader = () => {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-end px-4 lg:px-8 gap-4">
      <NotificationBell />
    </header>
  );
};

export default DashboardHeader;
