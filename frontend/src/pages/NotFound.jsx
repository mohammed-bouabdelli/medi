import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error(empty) attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="text-xl text-muted-foreground">Oops  Page introuvable</p>
        <p className="text-sm text-muted-foreground">La page que vous recherchez n'existe pas ou a été déplacée.</p>
        <Link to="/">
          <Button variant="hero" size="lg"><Home className="w-4 h-4" />Retour à l'accueil</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
