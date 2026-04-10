import { motion } from "framer-motion";
import { Users, Search, Eye, FileText } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

const MedecinPatients = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [viewPatient, setViewPatient] = useState(null);

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["medecinPatients"],
    queryFn: async () => {
      const res = await apiFetch("/medecin/patients");
      return Array.isArray(res) ? res : (res.data || []);
    },
  });

  const filtered = patients.filter((p) => {
    const fullName = `${p.first_name || ""} ${p.last_name || ""}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  return (
    <DashboardLayout role="medecin" userName={`Dr. ${user?.last_name || "Médecin"}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Mes Patients
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Consultez et gérez vos patients
          </p>
        </div>

        {/* Search */}
        <div className="bg-card p-3 rounded-2xl border border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un patient..."
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
                  <TableHead>Âge</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Dernière visite</TableHead>
                  <TableHead>Visites</TableHead>
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
                ) : filtered.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                       Aucun patient trouvé.
                     </TableCell>
                  </TableRow>
                ) : filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.first_name} {p.last_name}</TableCell>
                    <TableCell>{new Date().getFullYear() - new Date(p.date_of_birth || new Date()).getFullYear()} ans</TableCell>
                    <TableCell>{p.phone}</TableCell>
                    <TableCell>{p.last_appointment?.date || "N/A"}</TableCell>
                    <TableCell>{p.appointments_count || 1}</TableCell>

                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-white hover:bg-primary"
                        onClick={() => setViewPatient(p)}
                        title="Voir"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog
        open={viewPatient !== null}
        onOpenChange={() => setViewPatient(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dossier patient — {viewPatient?.first_name} {viewPatient?.last_name}</DialogTitle>
          </DialogHeader>

          {viewPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Âge:</span>{" "}
                  <span className="font-medium">{new Date().getFullYear() - new Date(viewPatient.date_of_birth || new Date()).getFullYear()} ans</span>
                </div>

                <div>
                  <span className="text-muted-foreground">Téléphone:</span>{" "}
                  <span className="font-medium">{viewPatient.phone}</span>
                </div>

                <div>
                  <span className="text-muted-foreground">
                    Dernière visite:
                  </span>{" "}
                  <span className="font-medium">{viewPatient.last_appointment?.date || "N/A"}</span>
                </div>

                <div>
                  <span className="text-muted-foreground">
                    Nombre de visites:
                  </span>{" "}
                  <span className="font-medium">{viewPatient.appointments_count || 1}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                <p className="text-sm font-medium mb-1">Informations supplémentaires:</p>
                <p className="text-sm text-muted-foreground">
                  Sexe: {viewPatient.gender === 'male' ? 'Homme' : viewPatient.gender === 'female' ? 'Femme' : 'Non précisé'} <br/>
                  Adresse: {viewPatient.address || 'Non précisé'}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MedecinPatients;
