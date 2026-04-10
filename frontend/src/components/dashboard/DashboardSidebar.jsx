import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Users,
  LogOut,
  Stethoscope,
  User,
  Clock,
  Search,
  Menu,
  X,
  FileText,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

// Simplified navigation - only essential items per role
const menuItems = {
  admin: [
    {
      icon: LayoutDashboard,
      label: "Tableau de bord",
      href: "/dashboard/admin",
    },
    { icon: Users, label: "Utilisateurs", href: "/dashboard/admin/users" },
    {
      icon: Calendar,
      label: "Rendez-vous",
      href: "/dashboard/admin/appointments",
    },
  ],
  medecin: [
    { icon: LayoutDashboard, label: "Accueil", href: "/dashboard/medecin" },
    { icon: Clock, label: "Planning", href: "/dashboard/medecin/schedule" },
    { icon: Users, label: "Patients", href: "/dashboard/medecin/patients" },
    {
      icon: Calendar,
      label: "Rendez-vous",
      href: "/dashboard/medecin/appointments",
    },
    { icon: User, label: "Mon profil", href: "/dashboard/medecin/profile" },
  ],
  patient: [
    { icon: LayoutDashboard, label: "Accueil", href: "/dashboard/patient" },
    { icon: Search, label: "Médecins", href: "/dashboard/patient/doctors" },
    {
      icon: Calendar,
      label: "Mes rendez-vous",
      href: "/dashboard/patient/appointments",
    },
    { icon: User, label: "Mon profil", href: "/dashboard/patient/profile" },
  ],
};

const DashboardSidebar = ({ role }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const items = menuItems[role] || [];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const userName = role === 'medecin' 
    ? `Dr. ${user?.first_name || ""} ${user?.last_name || ""}` 
    : `${user?.first_name || ""} ${user?.last_name || ""}`;

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) { // Changed from 1024
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Mobile Menu Button - Fixed at top right */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 right-4 z-50 xl:hidden w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center shadow-md"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-5 h-5 text-foreground" />
        ) : (
          <Menu className="w-5 h-5 text-foreground" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 xl:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-40 transition-transform duration-300 ease-in-out",
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full xl:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center xl:justify-start xl:px-6 border-b border-border">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-xl tracking-tight">
              Medi
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
                title={item.label}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        {user && (
          <div className="p-3 border-t border-border mt-auto">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {userName}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {role}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
              onClick={logout}
            >
              <LogOut className="w-5 h-5" />
              <span>Déconnexion</span>
            </Button>
          </div>
        )}
      </aside>
    </>
  );
};

export default DashboardSidebar;
