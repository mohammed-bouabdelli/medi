import { Link } from "react-router-dom";
import { Stethoscope } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg">Medi</span>
          </Link>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            {currentYear} Medi. Votre santé, simplifiée.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
