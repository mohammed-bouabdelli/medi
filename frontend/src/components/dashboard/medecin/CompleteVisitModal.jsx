import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ClipboardCheck } from "lucide-react";

const CompleteVisitModal = ({ appointment, isOpen, onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [medications, setMedications] = useState("");
  const [certificateContent, setCertificateContent] = useState("");

  const completeMutation = useMutation({
    mutationFn: (data) =>
      apiFetch(`/medecin/appointments/${appointment.id}/complete`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["medecinAppointments"]);
      toast({
        title: "Visite terminée",
        description: "L'ordonnance et le certificat ont été générés.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!medications || !certificateContent) {
      toast({
        variant: "destructive",
        title: "Champs requis",
        description: "Veuillez remplir l'ordonnance et le certificat.",
      });
      return;
    }
    completeMutation.mutate({ medications, certificate_content: certificateContent });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            Terminer la visite
          </DialogTitle>
          <DialogDescription>
            Remplissez les détails pour générer les documents du patient {appointment?.patient?.first_name} {appointment?.patient?.last_name}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-3">
            <Label htmlFor="medications" className="text-sm font-semibold">
              Ordonnance (Médicaments)
            </Label>
            <Textarea
              id="medications"
              placeholder="Ex: Doliprane 1000mg, 1 comprimé 3 fois par jour pendant 5 jours..."
              className="min-h-[120px] resize-none"
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
              required
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="certificate" className="text-sm font-semibold">
              Certificat Médical
            </Label>
            <Textarea
              id="certificate"
              placeholder="Ex: Je soussigné Dr. certifie avoir examiné M. ... et lui prescris un repos de ..."
              className="min-h-[120px] resize-none"
              value={certificateContent}
              onChange={(e) => setCertificateContent(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90"
              disabled={completeMutation.isPending}
            >
              {completeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                "Valider et Clôturer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CompleteVisitModal;
