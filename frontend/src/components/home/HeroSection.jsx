import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

const HeroSection = () => {
  const { data: stats } = useQuery({
    queryKey: ["publicStats"],
    queryFn: () => apiFetch("/stats"),
  });

  return (
    <section className="relative min-h-[80vh] flex items-center gradient-hero">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Activity className="w-4 h-4" />
              Plateforme santé 2026
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight mb-6"
          >
            Votre santé, <span className="text-gradient">simplifiée au Maroc</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed"
          >
            Prenez rendez-vous avec les meilleurs médecins au Maroc en quelques clics.
            Simple, rapide, sécurisé.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Link to="/register">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary-hover text-white rounded-xl px-8"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Prendre rendez-vous
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/medecins">
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl border-border hover:bg-secondary px-8"
              >
                Voir les médecins
              </Button>
            </Link>
          </motion.div>

          {/* Simple Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-center gap-12"
          >
            <div>
              <p className="text-3xl font-semibold text-foreground">
                {stats ? stats.doctors_count : "..."}
              </p>
              <p className="text-sm text-muted-foreground">Médecins</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-foreground">
                {stats ? stats.patients_count : "..."}
              </p>
              <p className="text-sm text-muted-foreground">Patients</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-foreground">
                {stats ? Number(stats.average_rating).toFixed(1) : "..."}
              </p>
              <p className="text-sm text-muted-foreground">Note moyenne</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
