import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Plus, Eye, Download, Printer } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MedecinPrescriptions = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showNew, setShowNew] = useState(false);
  const [viewPrescription, setViewPrescription] = useState(null);
  const [newPatient, setNewPatient] = useState("");
  const [newMeds, setNewMeds] = useState("");

  const { data: prescriptions = [], isLoading } = useQuery({
    queryKey: ["medecinPrescriptions"],
    queryFn: async () => {
      const res = await apiFetch("/medecin/prescriptions");
      return Array.isArray(res) ? res : res.data || [];
    },
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["medecinPatientsList"],
    queryFn: async () => {
      const res = await apiFetch("/medecin/patients");
      return Array.isArray(res) ? res : res.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload) =>
      apiFetch("/medecin/prescriptions", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["medecinPrescriptions"]);
      setShowNew(false);
      setNewPatient("");
      setNewMeds("");
      toast({
        title: "Ordonnance créée",
        description: `L'ordonnance a été ajoutée avec succès.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    },
  });

  const handleCreate = () => {
    if (!newPatient || !newMeds) return;
    createMutation.mutate({
      patient_id: parseInt(newPatient, 10),
      medications: newMeds,
    });
  };

  const handlePrint = (p) => {
    toast({
      title: "Impression lancée",
      description: `Ordonnance de ${p.patient} envoyée à l'imprimante.`,
    });
  };

  const handleDownload = async (p) => {
    try {
      const token = localStorage.getItem("auth_token");
      const baseUrl =
        import.meta.env.VITE_API_URL || "http://localhost:8001/api";

      const response = await fetch(
        `${baseUrl}/medecin/prescriptions/${p.id}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Erreur de téléchargement");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ordonnance-${p.id}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Succès",
        description: "Ordonnance téléchargée.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    }
  };

  return (
    <DashboardLayout
      role="medecin"
      userName={`Dr. ${user?.last_name || "Médecin"}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Ordonnances
          </h1>

          <Button variant="hero" onClick={() => setShowNew(true)}>
            <Plus className="w-4 h-4" />
            Nouvelle ordonnance
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Médicaments</TableHead>
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
                ) : prescriptions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Aucune ordonnance.
                    </TableCell>
                  </TableRow>
                ) : (
                  prescriptions.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        {p.patient?.first_name} {p.patient?.last_name}
                      </TableCell>

                      <TableCell>
                        {format(
                          parseISO(p.created_at || p.date),
                          "dd MMM yyyy",
                          { locale: fr },
                        )}
                      </TableCell>

                      <TableCell className="max-w-xs truncate">
                        {p.medications}
                      </TableCell>

                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            p.status === "active"
                              ? "bg-success/10 text-success"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {p.status === "active" ? "Active" : "Expirée"}
                        </span>
                      </TableCell>

                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewPrescription(p)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePrint(p)}
                        >
                          <Printer className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(p)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* New Prescription Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle ordonnance</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Patient</Label>
              <Select value={newPatient} onValueChange={setNewPatient}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner un patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((pt) => (
                    <SelectItem key={pt.id} value={pt.id.toString()}>
                      {pt.first_name} {pt.last_name}
                    </SelectItem>
                  ))}
                  {patients.length === 0 && (
                    <SelectItem value="none" disabled>
                      Aucun patient trouvé
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Médicaments</Label>
              <Textarea
                placeholder="Liste des médicaments et posologie..."
                value={newMeds}
                onChange={(e) => setNewMeds(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>
              Annuler
            </Button>

            <Button
              variant="hero"
              onClick={handleCreate}
              disabled={!newPatient || !newMeds || createMutation.isPending}
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Créer l'ordonnance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Prescription Dialog */}
      <Dialog
        open={viewPrescription !== null}
        onOpenChange={() => setViewPrescription(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ordonnance — {viewPrescription?.patient}</DialogTitle>
          </DialogHeader>

          {viewPrescription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Patient:</span>{" "}
                  <span className="font-medium">
                    {viewPrescription.patient?.first_name}{" "}
                    {viewPrescription.patient?.last_name}
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground">Date:</span>{" "}
                  <span className="font-medium">
                    {format(
                      parseISO(
                        viewPrescription.created_at || viewPrescription.date,
                      ),
                      "dd MMM yyyy",
                      { locale: fr },
                    )}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                <p className="text-sm font-medium mb-1">Médicaments:</p>
                <p className="text-sm">{viewPrescription.medications}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    handlePrint(viewPrescription);
                    setViewPrescription(null);
                  }}
                >
                  <Printer className="w-4 h-4" />
                  Imprimer
                </Button>

                <Button
                  variant="hero"
                  className="flex-1"
                  onClick={() => {
                    handleDownload(viewPrescription);
                    setViewPrescription(null);
                  }}
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MedecinPrescriptions;
