import { motion } from "framer-motion";
import {
  Search,
  Star,
  Check,
  X,
  MoreVertical,
  Eye,
  Plus,
  Trash2,
} from "lucide-react";
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
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

const AdminDoctors = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [viewDoc, setViewDoc] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: doctorsData, isLoading } = useQuery({
    queryKey: ["adminDoctors", search, statusFilter],
    queryFn: () => {
      let url = "/admin/doctors?";
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (statusFilter !== "all") url += `status=${encodeURIComponent(statusFilter)}`;
      return apiFetch(url);
    },
  });

  const doctors = Array.isArray(doctorsData) ? doctorsData : doctorsData?.data || [];

  const approveMutation = useMutation({
    mutationFn: (id) => apiFetch(`/admin/doctors/${id}/approve`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminDoctors"]);
      toast({
        title: "Médecin approuvé",
        description: "Le médecin a été vérifié avec succès.",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => apiFetch(`/admin/doctors/${id}/reject`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminDoctors"]);
      toast({
        title: "Médecin refusé",
        description: "Le médecin a été refusé.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiFetch(`/admin/doctors/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminDoctors"]);
      toast({
        title: "Médecin supprimé",
        description: "Le médecin a été supprimé avec succès.",
      });
    },
  });

  const handleApprove = (id) => approveMutation.mutate(id);
  const handleReject = (id) => rejectMutation.mutate(id);
  const handleDelete = (id) => deleteMutation.mutate(id);

  return (
    <DashboardLayout role="admin" userName={`Administrateur ${user?.last_name || ""}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Médecins
          </h1>
        </div>

        {/* Search */}
        <div className="bg-card p-3 rounded-2xl border border-border flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un médecin..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-xl border-0 bg-secondary"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 h-11 rounded-xl bg-secondary border-0">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="verified">Vérifié</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Spécialité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                     <TableCell colSpan={5} className="h-24 text-center">
                       <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                     </TableCell>
                  </TableRow>
                ) : doctors.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                       Aucun médecin trouvé.
                     </TableCell>
                  </TableRow>
                ) : doctors.map((d) => {
                  const status = d.doctor_profile?.verification_status || "pending";
                  return (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">Dr. {d.first_name} {d.last_name}</TableCell>
                    <TableCell>{d.email}</TableCell>
                    <TableCell>{d.doctor_profile?.specialty || "Non spécifié"}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          status === "verified"
                            ? "bg-success/10 text-success"
                            : status === "rejected" ? "bg-destructive/10 text-destructive"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        {status === "verified" ? "Vérifié" : status === "rejected" ? "Refusé" : "En attente"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                            className="text-success border-success/30 hover:text-white hover:bg-success"
                            onClick={() => handleApprove(d.id)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                            className="text-destructive border-destructive/30 hover:text-white hover:bg-destructive"
                            onClick={() => handleReject(d.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setViewDoc({
                              name: `Dr. ${d.first_name} ${d.last_name}`,
                              specialty: d.doctor_profile?.specialty || "Non spécifié",
                              rating: 0,
                              patients: 0,
                              status: status,
                            })}
                            className="hover:text-white hover:bg-primary"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Voir
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(d.id)}
                            disabled={deleteMutation.isPending}
                            className="text-destructive hover:text-white hover:bg-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )})}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={!!viewDoc} onOpenChange={() => setViewDoc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails du médecin</DialogTitle>
          </DialogHeader>
          {viewDoc && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Nom:</span>{" "}
                <span className="font-medium">{viewDoc.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Spécialité:</span>{" "}
                <span className="font-medium">{viewDoc.specialty}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Note:</span>{" "}
                <span className="font-medium flex items-center gap-1">
                  <Star className="w-4 h-4 fill-warning text-warning" />
                  {viewDoc.rating}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Patients:</span>{" "}
                <span className="font-medium">{viewDoc.patients}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Statut:</span>{" "}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    viewDoc.status === "verified"
                      ? "bg-success/10 text-success"
                      : "bg-warning/10 text-warning"
                  }`}
                >
                  {viewDoc.status === "verified" ? "Vérifié" : "En attente"}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminDoctors;
