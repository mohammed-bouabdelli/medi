import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export const GuestRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Si l'utilisateur est déjà connecté, on le redirige vers son tableau de bord
  // Cela empêche l'accès aux pages publiques comme "/", "/login" ou "/register"
  if (user) {
    if (user.role === "patient") return <Navigate to="/dashboard/patient" replace />;
    if (user.role === "medecin") return <Navigate to="/dashboard/medecin" replace />;
    if (user.role === "admin") return <Navigate to="/dashboard/admin" replace />;
    return <Navigate to="/404" replace />;
  }

  return children;
};
