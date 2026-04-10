import { motion } from "framer-motion";
import { Search, MoreVertical, Eye, Trash2 } from "lucide-react";
import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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

const AdminAppointments = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [viewApt, setViewApt] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { data: appointmentsData, isLoading } = useQuery({
    queryKey: ["adminAppointments", search],
    queryFn: () => {
      let url = "/admin/appointments";
      if (search) url += `?search=${encodeURIComponent(search)}`;
      return apiFetch(url);
    },
  });

  const appointments = Array.isArray(appointmentsData) ? appointmentsData : appointmentsData?.data || [];

  const deleteMutation = useMutation({
    mutationFn: (id) => apiFetch(`/admin/appointments/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminAppointments"]);
      setDeleteId(null);
      toast({ title: "Rendez-vous supprimé" });
    },
  });

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  return (
    <DashboardLayout role="admin" userName={`Administrateur ${user?.last_name || ""}`}>
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
            Gérez les rendez-vous de la plateforme
          </p>
        </div>

        {/* Search */}
        <div className="bg-card p-3 rounded-2xl border border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un médecin..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-xl border-0 bg-secondary"
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Médecin</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Heure</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                     <TableCell colSpan={5} className="h-24 text-center">
                       <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                     </TableCell>
                  </TableRow>
                ) : appointments.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                       Aucun rendez-vous.
                     </TableCell>
                  </TableRow>
                ) : appointments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.patient?.first_name} {a.patient?.last_name}</TableCell>
                    <TableCell>Dr. {a.doctor?.first_name} {a.doctor?.last_name}</TableCell>
                    <TableCell>{format(parseISO(a.date), "dd MMM yyyy", { locale: fr })}</TableCell>
                    <TableCell>{a.time.substring(0, 5)}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[a.status]?.cls || ""}`}
                      >
                        {statusMap[a.status]?.text || a.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialog pour voir détails */}
      <Dialog open={!!viewApt} onOpenChange={() => setViewApt(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails du rendez-vous</DialogTitle>
          </DialogHeader>
          {viewApt && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Patient:</span>{" "}
                <span className="font-medium">{viewApt.patient}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Médecin:</span>{" "}
                <span className="font-medium">{viewApt.doctor}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Date:</span>{" "}
                <span className="font-medium">{viewApt.date}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Heure:</span>{" "}
                <span className="font-medium">{viewApt.time}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Statut:</span>{" "}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[viewApt.status].cls}`}
                >
                  {statusMap[viewApt.status].text}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog pour supprimer */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le rendez-vous</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce rendez-vous ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminAppointments;
