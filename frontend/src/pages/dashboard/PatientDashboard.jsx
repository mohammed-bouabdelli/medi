import { Calendar, Clock, FileText, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Simplified stats - only what's needed
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["patientDashboard"],
    queryFn: () => apiFetch("/patient/dashboard"),
  });

  const statsObj = data?.stats || { total_appointments: 0, requested_appointments: 0, upcoming_appointments: 0, documents_count: 0 };
  const nextAppointments = data?.next_appointments || [];

  const stats = [
    {
      title: "Rendez-vous à venir",
      value: statsObj.upcoming_appointments?.toString() || "0",
      label: "A venir",
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Historique",
      value: statsObj.completed_appointments?.toString() || "0",
      label: "Terminés",
      icon: Clock,
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  return (
    <DashboardLayout role="patient" userName={user?.first_name || "Patient"}>
      <div className="w-full space-y-8">

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Bonjour, {user?.first_name || "Patient"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Votre santé, simplifiée
            </p>
          </div>
          <Button
            onClick={() => navigate("/dashboard/patient/appointments")}
            className="bg-primary hover:bg-primary-hover text-white rounded-xl"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Prendre rendez-vous
          </Button>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4"
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="hover-lift">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl ${stat.bgColor} flex items-center justify-center`}
                    >
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">
                        {stat.title}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        {/* Upcoming Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Prochains rendez-vous</h2>
            <Link to="/dashboard/patient/appointments">
              <Button variant="ghost" size="sm" className="text-primary">
                Voir tout
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : nextAppointments.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground bg-secondary/50 rounded-xl">Aucun rendez-vous à venir</p>
            ) : (
              nextAppointments.map((apt) => (
                <Card key={apt.id} className="hover-lift group">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Time block */}
                      <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-secondary">
                        <span className="text-xs text-muted-foreground uppercase text-center w-full">
                          {format(parseISO(apt.date), "dd MMM", { locale: fr })}
                        </span>
                        <span className="text-sm font-semibold">{apt.time.substring(0, 5)}</span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">Dr. {apt.doctor.first_name} {apt.doctor.last_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {apt.doctor.doctor_profile?.specialty?.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </p>
                      </div>

                      {/* Status */}
                      <Badge
                        variant={apt.status === "confirmed" ? "default" : "secondary"}
                        className={apt.status === "confirmed" ? "bg-success/10 text-success hover:bg-success/20" : ""}
                      >
                        {apt.status === "confirmed" ? "Confirmé" : apt.status === "pending" ? "En attente" : "Annulé"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-4"
        >
          <Link to="/medecins">
            <Card className="hover-lift cursor-pointer h-full">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium">Trouver un médecin</p>
                  <p className="text-sm text-muted-foreground">Prendre RDV</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/dashboard/patient/profile">
            <Card className="hover-lift cursor-pointer h-full">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Mon profil</p>
                  <p className="text-sm text-muted-foreground">
                    Mes informations
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
