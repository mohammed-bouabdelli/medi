import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const timeSlots24h = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2).toString().padStart(2, "0");
  const minutes = i % 2 === 0 ? "00" : "30";
  return `${hours}:${minutes}`;
});

const MedecinSchedule = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newSlot, setNewSlot] = useState({ day: "", start: "", end: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: scheduleData, isLoading } = useQuery({
    queryKey: ["medecinSchedule"],
    queryFn: () => apiFetch("/medecin/schedule"),
  });

  const weekDays = scheduleData?.schedule || [];

  const addMutation = useMutation({
    mutationFn: (payload) => apiFetch("/medecin/schedule", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["medecinSchedule"]);
      setNewSlot({ day: "", start: "", end: "" });
      setIsDialogOpen(false);
      toast.success("Créneau ajouté");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id) => apiFetch(`/medecin/schedule/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries(["medecinSchedule"]);
      toast.success("Créneau supprimé");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const addSlot = () => {
    if (newSlot.day && newSlot.start && newSlot.end) {
      addMutation.mutate({
        day_of_week: newSlot.day,
        start_time: newSlot.start,
        end_time: newSlot.end,
      });
    }
  };

  const removeSlot = (slotId) => {
    removeMutation.mutate(slotId);
  };

  return (
    <DashboardLayout role="medecin" userName={`Dr. ${user?.last_name || "Médecin"}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Mon Planning
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gérez vos disponibilités et créneaux horaires
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary-hover text-white rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une disponibilité
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Ajouter un créneau</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Jour</Label>
                  <Select
                    value={newSlot.day}
                    onValueChange={(value) =>
                      setNewSlot({ ...newSlot, day: value })
                    }
                  >
                    <SelectTrigger className="w-full h-11 rounded-xl border-border bg-card">
                      <SelectValue placeholder="Sélectionner un jour" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"].map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Début</Label>
                    <Select
                      value={newSlot.start}
                      onValueChange={(val) => setNewSlot({ ...newSlot, start: val })}
                    >
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="--:--" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots24h.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fin</Label>
                    <Select
                      value={newSlot.end}
                      onValueChange={(val) => setNewSlot({ ...newSlot, end: val })}
                    >
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="--:--" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots24h.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={addSlot}
                  disabled={addMutation.isPending}
                  className="w-full bg-primary hover:bg-primary-hover text-white rounded-xl"
                >
                  {addMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Ajouter
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid lg:grid-cols-1 gap-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="w-5 h-5 text-primary" />
                Horaires hebdomadaires
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                 <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : (
              weekDays.map((d) => (
                <div
                  key={d.day}
                  className="flex items-center justify-between p-3 rounded-xl border border-border"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-foreground w-24">
                      {d.day}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {d.slots.length > 0 ? (
                      d.slots.map((s) => (
                        <span
                          key={s.id}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/10 text-primary text-sm font-medium"
                        >
                          {s.start_time} - {s.end_time}
                          <button
                            onClick={() => removeSlot(s.id)}
                            disabled={removeMutation.isPending}
                            className="hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Fermé
                      </span>
                    )}
                  </div>
                </div>
              ))
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default MedecinSchedule;
