import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Check, X, User } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

const statusMap = {
  pending: { text: "En attente", cls: "bg-warning/10 text-warning" },
  confirmed: { text: "Confirmé", cls: "bg-primary/10 text-primary" },
  completed: { text: "Terminé", cls: "bg-success/10 text-success" },
  cancelled: { text: "Annulé", cls: "bg-destructive/10 text-destructive" },
};

const MedecinAppointments = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: appointmentsData, isLoading } = useQuery({
    queryKey: ["medecinAppointments"],
    queryFn: () => apiFetch("/medecin/appointments"),
  });

  const appointments = Array.isArray(appointmentsData) ? appointmentsData : (appointmentsData?.data || []);

  const confirmMutation = useMutation({
    mutationFn: (id) => apiFetch(`/medecin/appointments/${id}/confirm`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries(["medecinAppointments"]);
      toast({
        title: "Rendez-vous confirmé",
        description: "Le patient sera notifié de la confirmation.",
      });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => apiFetch(`/medecin/appointments/${id}/reject`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries(["medecinAppointments"]);
      toast({
        title: "Rendez-vous refusé",
        description: "Le patient sera notifié de l'annulation.",
      });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    }
  });

  const handleAccept = (id) => {
    confirmMutation.mutate(id);
  };

  const handleReject = (id) => {
    rejectMutation.mutate(id);
  };

  return (
    <DashboardLayout role="medecin" userName={`Dr. ${user?.last_name || "Médecin"}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Rendez-vous
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gérez vos rendez-vous avec vos patients
          </p>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              En attente (
              {appointments.filter((a) => a.status === "pending").length})
            </TabsTrigger>

            <TabsTrigger value="confirmed">
              Confirmés (
              {appointments.filter((a) => a.status === "confirmed").length})
            </TabsTrigger>

            <TabsTrigger value="completed">
              Terminés (
              {appointments.filter((a) => a.status === "completed").length})
            </TabsTrigger>

            <TabsTrigger value="cancelled">
              Annulés (
              {appointments.filter((a) => a.status === "cancelled").length})
            </TabsTrigger>
          </TabsList>

          {["pending", "confirmed", "completed", "cancelled"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <Card>
                <CardContent className="p-4 space-y-3">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                       <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : appointments
                    .filter((a) => a.status === tab)
                    .map((apt) => (
                      <div
                        key={apt.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>

                          <div>
                            <p className="font-semibold text-foreground">
                              {apt.patient?.first_name} {apt.patient?.last_name}
                            </p>

                            <p className="text-sm text-muted-foreground">
                              {apt.type}
                            </p>

                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {format(parseISO(apt.date), "dd MMM yyyy", { locale: fr })}
                              <Clock className="w-3 h-3 ml-2" />
                              {apt.time.substring(0, 5)}
                            </div>

                            {apt.reason && (
                              <div className="mt-2 text-sm bg-secondary/50 p-2 rounded-lg border border-border/50 text-foreground">
                                <span className="font-medium text-muted-foreground block mb-1 text-xs uppercase tracking-wider">Motif:</span>
                                {apt.reason}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              statusMap[apt.status].cls
                            }`}
                          >
                            {statusMap[apt.status].text}
                          </span>

                          {apt.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-success border-success/30 hover:text-white hover:bg-success"
                                onClick={() => handleAccept(apt.id)}
                                disabled={confirmMutation.isPending || rejectMutation.isPending}
                              >
                                <Check className="w-4 h-4" />
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive border-destructive/30 hover:text-white hover:bg-destructive"
                                onClick={() => handleReject(apt.id)}
                                disabled={confirmMutation.isPending || rejectMutation.isPending}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}

                  {!isLoading && appointments.filter((a) => a.status === tab).length ===
                    0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Aucun rendez-vous.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
};

export default MedecinAppointments;
