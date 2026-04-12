import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, X, FileText, Download } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, getAuthToken } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

const statusConfig = {
  confirmed: { text: "Confirmé", className: "bg-success/10 text-success" },
  pending: { text: "En attente", className: "bg-primary/10 text-primary" },
  completed: { text: "Terminé", className: "bg-success/10 text-success" },
  cancelled: { text: "Annulé", className: "bg-destructive/10 text-destructive" },
};

const PatientAppointments = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: appointmentsData, isLoading } = useQuery({
    queryKey: ["patientAppointments"],
    queryFn: () => apiFetch("/patient/appointments"),
  });

  const appointments = Array.isArray(appointmentsData) ? appointmentsData : (appointmentsData?.data || []);

  const cancelMutation = useMutation({
    mutationFn: (id) => apiFetch(`/patient/appointments/${id}/cancel`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries(["patientAppointments"]);
      toast({
        title: "Rendez-vous annulé",
        description: "Votre rendez-vous a été annulé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Erreur lors de l'annulation",
      });
    }
  });

  const handleCancel = (id) => {
    cancelMutation.mutate(id);
  };

  const handleDownload = async (doc) => {
    try {
      const token = getAuthToken();
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8001/api";

      const response = await fetch(`${baseUrl}/patient/documents/${doc.id}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Erreur de téléchargement");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.title || "document";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Succès",
        description: "Téléchargement réussi.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    }
  };

  const filteredAppointments = filter === "all"
    ? appointments
    : appointments.filter((apt) => 
        filter === "upcoming" ? (apt.status === "confirmed" || apt.status === "pending") : apt.status === filter
      );

  return (
    <DashboardLayout role="patient" userName={user?.first_name || "Patient"}>
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Mes rendez-vous
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos consultations médicales
            </p>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {["all", "upcoming", "completed"].map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
                className="rounded-lg"
              >
                {f === "all"
                  ? "Tous"
                  : f === "upcoming"
                    ? "À venir"
                    : "Terminés"}
              </Button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-3">
            {isLoading ? (
               <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : filteredAppointments.length === 0 ? (
               <p className="text-center py-4 text-muted-foreground bg-secondary/50 rounded-xl">Aucun rendez-vous trouvé</p>
            ) : filteredAppointments.map((apt, index) => (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover-lift">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-secondary flex flex-col items-center justify-center">
                        <Calendar className="w-4 h-4 text-muted-foreground mb-1" />
                        <span className="text-sm font-semibold text-center leading-tight">
                          {format(parseISO(apt.date), "dd\nMMM", { locale: fr })}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">Dr. {apt.doctor?.first_name} {apt.doctor?.last_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {apt.doctor?.doctor_profile?.specialty?.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {apt.time.substring(0, 5)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {apt.doctor?.doctor_profile?.location}
                          </span>
                        </div>
                      </div>
                        <div className="flex items-center gap-2">
                          <Badge className={statusConfig[apt.status]?.className || ""}>
                            {statusConfig[apt.status]?.text || apt.status}
                          </Badge>
                          {(apt.status === "confirmed" || apt.status === "pending") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-destructive"
                              onClick={() => handleCancel(apt.id)}
                              disabled={cancelMutation.isPending}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Documents Section for Completed Appointments */}
                      {apt.status === "completed" && apt.documents && apt.documents.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2">
                          {apt.documents.map((doc) => (
                            <Button
                              key={doc.id}
                              variant="outline"
                              size="sm"
                              className="h-9 px-3 gap-2 rounded-xl text-xs font-medium border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
                              onClick={() => handleDownload(doc)}
                            >
                              <FileText className="w-3.5 h-3.5" />
                              {doc.type === 'ordonnance' ? 'Ordonnance' : doc.type === 'certificat' ? 'Certificat Médical' : doc.title}
                              <Download className="w-3 h-3 ml-1 opacity-50" />
                            </Button>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default PatientAppointments;
