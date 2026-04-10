import { Calendar, Users, Clock, FileText, ArrowUp, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

const MedecinDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["medecinDashboard"],
    queryFn: () => apiFetch("/medecin/dashboard"),
  });

  const statsObj = data?.stats || { today_appointments: 0, total_patients: 0, pending_appointments: 0, total_prescriptions: 0 };
  const todayAppointments = data?.today_appointments || [];

  const stats = [
    {
      title: "Total Rendez-vous",
      value: statsObj.total_appointments ?? 0,
      icon: Calendar,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Mes patients",
      value: statsObj.total_patients,
      icon: Users,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "En attente",
      value: statsObj.pending_count ?? 0,
      icon: Clock,
      color: "bg-warning/10 text-warning",
    },
    {
      title: "Ordonnances",
      value: statsObj.monthly_prescriptions ?? 0,
      icon: FileText,
      color: "bg-accent/10 text-accent",
    },
  ];

  return (
    <DashboardLayout role="medecin" userName={`Dr. ${user?.last_name || "Médecin"}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Bonjour, Dr. {user?.last_name}
            </h1>
            <p className="text-muted-foreground">
              Vous avez {statsObj.today_appointments} rendez-vous prévus aujourd'hui
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate("/dashboard/medecin/appointments")}
              className="bg-primary hover:bg-primary-hover text-white rounded-xl"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Voir mon planning
            </Button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <ArrowUp className="w-4 h-4 text-primary" />
                    </div>
                    <div className="mt-4">
                      <p className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {stat.title}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Today appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Planning du jour
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
               <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : todayAppointments.length === 0 ? (
               <div className="p-8 text-center bg-secondary/50 rounded-xl text-muted-foreground">Aucun rendez-vous prévu pour aujourd'hui</div>
            ) : (
            todayAppointments.map((apt, index) => {
              // Handle statuses safely based on string values
              const isConfirmed = apt.status === "confirmed";
              const isPending = apt.status === "pending";
              const isCompleted = apt.status === "completed";
              const isCancelled = apt.status === "cancelled";

              return (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                  isConfirmed
                    ? "border-primary bg-primary/5"
                    : isCompleted
                      ? "border-border bg-muted/30"
                      : "border-border hover:bg-secondary/50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`text-lg font-bold ${isConfirmed ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {apt.time.substring(0, 5)}
                  </div>
                  <div>
                    <p
                      className={`font-medium ${isCompleted ? "text-muted-foreground" : "text-foreground"}`}
                    >
                      {apt.patient?.first_name} {apt.patient?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{apt.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isCompleted
                        ? "bg-success/10 text-success"
                        : isConfirmed
                          ? "bg-primary text-primary-foreground"
                          : isPending ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {isCompleted
                      ? "Terminé"
                      : isConfirmed
                        ? "Aujourd'hui"
                        : isPending ? "En attente" : "Annulé"}
                  </span>
                  {(isConfirmed || isPending) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        navigate("/dashboard/medecin/appointments")
                      }
                    >
                      Détails
                    </Button>
                  )}
                </div>
              </div>
              )
            })
            )}
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default MedecinDashboard;
