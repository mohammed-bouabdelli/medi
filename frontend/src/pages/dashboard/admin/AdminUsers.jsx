import { motion } from "framer-motion";
import { Search, Trash2, Ban, CheckCircle } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

const roleColor = {
  patient: "bg-primary/10 text-primary",
  medecin: "bg-success/10 text-success",
  admin: "bg-warning/10 text-warning",
};

const roleLabels = {
  patient: "Patient",
  medecin: "Médecin",
  admin: "Admin",
};

const AdminUsers = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [deleteId, setDeleteId] = useState(null);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["adminUsers", search, roleFilter],
    queryFn: () => {
      let url = "/admin/users?";
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (roleFilter !== "all") url += `role=${encodeURIComponent(roleFilter)}`;
      return apiFetch(url);
    },
  });

  const users = Array.isArray(usersData) ? usersData : usersData?.data || [];



  const deleteMutation = useMutation({
    mutationFn: (id) => apiFetch(`/admin/users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminUsers"]);
      setDeleteId(null);
      toast({
        title: "Utilisateur supprimé",
        description: `L'utilisateur a été supprimé.`,
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => apiFetch(`/admin/users/${id}/toggle-status`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminUsers"]);
      toast({ title: "Statut modifié" });
    },
  });



  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  const handleToggleStatus = (id) => {
    toggleMutation.mutate(id);
  };

  return (
    <DashboardLayout role="admin" userName={`Administrateur ${user?.last_name || ""}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Utilisateurs
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Gérez les utilisateurs de la plateforme
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-card p-3 rounded-2xl border border-border flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-xl border-0 bg-secondary"
            />
          </div>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-40 h-11 rounded-xl bg-secondary border-0">
              <SelectValue placeholder="Rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="Patient">Patients</SelectItem>
              <SelectItem value="Médecin">Médecins</SelectItem>
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
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Inscription</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                     <TableCell colSpan={6} className="h-24 text-center">
                       <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                     </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                       Aucun utilisateur trouvé.
                     </TableCell>
                  </TableRow>
                ) : users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.first_name} {u.last_name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${roleColor[u.role] || ""}`}
                      >
                        {roleLabels[u.role] || u.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.status === "active"
                            ? "bg-success/10 text-success"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {u.status === "active" ? "Actif" : "Inactif"}
                      </span>
                    </TableCell>
                    <TableCell>{format(parseISO(u.created_at), "dd MMM yyyy", { locale: fr })}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={toggleMutation.isPending}
                          className="h-8 w-8 hover:text-white hover:bg-primary group"
                          onClick={() => handleToggleStatus(u.id)}
                          title={
                            u.status === "active" ? "Désactiver" : "Activer"
                          }
                        >
                          {u.status === "active" ? (
                            <Ban className="w-4 h-4 text-warning group-hover:text-white" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-success group-hover:text-white" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-white hover:bg-destructive"
                          onClick={() => setDeleteId(u.id)}
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default AdminUsers;
