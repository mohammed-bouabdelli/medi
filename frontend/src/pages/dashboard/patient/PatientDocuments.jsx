import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import { Plus, Loader2, FileText, Download, Eye, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

const typeColor = {
  Ordonnance:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Résultats:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Certificat:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "Compte rendu":
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

const PatientDocuments = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [viewDoc, setViewDoc] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  const [newDocData, setNewDocData] = useState({
    title: "",
    type: "Ordonnance",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: documentsData, isLoading } = useQuery({
    queryKey: ["patientDocuments"],
    queryFn: () => apiFetch("/patient/documents"),
  });

  const documents = Array.isArray(documentsData)
    ? documentsData
    : documentsData?.data || [];

  const handleDownload = async (doc) => {
    try {
      // For downloads, we can't easily use apiFetch with Blob in the current wrapper
      // So we use a direct fetch or a link
      const token = localStorage.getItem("auth_token");
      const baseUrl =
        import.meta.env.VITE_API_URL || "http://localhost:8001/api";

      const response = await fetch(
        `${baseUrl}/patient/documents/${doc.id}/download`,
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

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !newDocData.title) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("title", newDocData.title);
    formData.append("type", newDocData.type);
    formData.append("file", selectedFile);

    try {
      const token = localStorage.getItem("auth_token");
      const baseUrl =
        import.meta.env.VITE_API_URL || "http://localhost:8001/api";

      const response = await fetch(`${baseUrl}/patient/documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Erreur d'upload");

      queryClient.invalidateQueries(["patientDocuments"]);
      setShowUpload(false);
      setNewDocData({ title: "", type: "Ordonnance" });
      setSelectedFile(null);

      toast({
        title: "Document ajouté",
        description: "Votre document a été sauvegardé avec succès.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <DashboardLayout role="patient" userName={user?.first_name || "Patient"}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Mes Documents
          </h1>
          <Button variant="hero" onClick={() => setShowUpload(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un document
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Médecin</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
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
                ) : documents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Aucun document disponible.
                    </TableCell>
                  </TableRow>
                ) : (
                  documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        {doc.title}
                      </TableCell>

                      <TableCell>
                        Dr. {doc.appointment?.doctor?.last_name || "N/A"}
                      </TableCell>
                      <TableCell>
                        {format(parseISO(doc.created_at), "dd MMM yyyy", {
                          locale: fr,
                        })}
                      </TableCell>

                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            typeColor[doc.type] ||
                            "bg-secondary text-secondary-foreground"
                          }`}
                        >
                          {doc.type}
                        </span>
                      </TableCell>

                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewDoc(doc)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(doc)}
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

      <Dialog open={viewDoc !== null} onOpenChange={() => setViewDoc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewDoc?.title}</DialogTitle>
          </DialogHeader>

          {viewDoc && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Médecin:</span>{" "}
                  <span className="font-medium">
                    Dr. {viewDoc.appointment?.doctor?.last_name || "N/A"}
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground">Date:</span>{" "}
                  <span className="font-medium">
                    {format(parseISO(viewDoc.created_at), "dd MMM yyyy", {
                      locale: fr,
                    })}
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground">Type:</span>{" "}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      typeColor[viewDoc.type] ||
                      "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {viewDoc.type}
                  </span>
                </div>
              </div>

              {viewDoc.file_path ? (
                <div className="p-4 rounded-xl bg-secondary/50 border border-border text-center">
                  <p className="text-sm">Fichier attaché (backend en cours).</p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <p className="text-sm whitespace-pre-line text-muted-foreground">
                    Aucun contenu textuel disponible.
                  </p>
                </div>
              )}

              <Button
                variant="hero"
                className="w-full"
                onClick={() => {
                  handleDownload(viewDoc);
                  setViewDoc(null);
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Upload Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un document</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre du document</Label>
              <Input
                id="title"
                placeholder="Ex: Analyse de sang"
                value={newDocData.title}
                onChange={(e) =>
                  setNewDocData({ ...newDocData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={newDocData.type}
                onValueChange={(v) => setNewDocData({ ...newDocData, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ordonnance">Ordonnance</SelectItem>
                  <SelectItem value="Résultats">Résultats</SelectItem>
                  <SelectItem value="Certificat">Certificat</SelectItem>
                  <SelectItem value="Compte rendu">Compte rendu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fichier (PDF, Image)</Label>
              <Input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                accept=".pdf,image/*"
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowUpload(false)}
              >
                Annuler
              </Button>
              <Button type="submit" variant="hero" disabled={isUploading}>
                {isUploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Ajouter
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PatientDocuments;
