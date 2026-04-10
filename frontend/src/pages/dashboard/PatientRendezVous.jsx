import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Stethoscope,
  User,
  Check,
  Download,
  ArrowLeft,
  MapPin,
  Star,
  FileText,
  ChevronRight,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";





const generateICSFile = (appointmentData) => {
  const { doctor, specialty, date, time, reason } = appointmentData;
  const [hours, minutes] = time.split(":");
  const startDate = new Date(date);
  startDate.setHours(parseInt(hours), parseInt(minutes));

  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + 30);

  const formatDate = (d) => {
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:Rendez-vous médical - ${doctor}
DESCRIPTION:Spécialité: ${specialty}${reason ? `\\nMotif: ${reason}` : ""}
LOCATION:Cabinet médical
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `rendez-vous-${doctor.replace(/\s+/g, "-").toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

const PatientRendezVous = () => {
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: doctorWrapper, isLoading: loadingDoctor } = useQuery({
    queryKey: ["doctorDetails", id],
    queryFn: () => apiFetch(`/doctors/${id}`),
  });

  const doctor = doctorWrapper?.data || location.state?.doctor;

  const [step, setStep] = useState(1);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [appointmentConfirmed, setAppointmentConfirmed] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);

  const { data: dynamicTimeSlots = [], isFetching: loadingSlots } = useQuery({
    queryKey: ["timeSlots", id, date],
    queryFn: () => apiFetch(`/doctors/${id}/time-slots?date=${date}`),
    enabled: !!id && !!date,
  });

  const bookMutation = useMutation({
    mutationFn: (payload) => apiFetch("/patient/appointments", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
    onSuccess: (data) => {
      const finalData = {
        doctor: `Dr. ${doctor?.first_name} ${doctor?.last_name}`,
        specialty: doctor?.doctor_profile?.specialty,
        date,
        time,
        reason,
        id: data.data?.id || `RDV-${Date.now()}`,
      };
      setAppointmentData(finalData);
      setAppointmentConfirmed(true);
      setStep(2);

      toast({
        title: "Rendez-vous confirmé !",
        description: `Votre rendez-vous avec le Dr. ${doctor?.first_name} est confirmé.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Erreur lors de la prise de rendez-vous",
      });
    }
  });

  if (loadingDoctor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 flex justify-center items-center h-[60vh]">
           <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 flex flex-col items-center justify-center h-[60vh]">
          <p className="text-muted-foreground mb-4">Médecin non trouvé</p>
          <Button onClick={() => navigate("/medecins")}>
            Retour à la liste des médecins
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const handleBook = () => {
    if (!user) {
      toast({
         title: "Connexion requise",
         description: "Veuillez vous connecter pour prendre un rendez-vous.",
      });
      navigate("/login", { state: { from: { pathname: `/doctor/${doctor.id}` } } });
      return;
    }
    
    if (user.role !== "patient") {
      toast({
         variant: "destructive",
         title: "Non autorisé",
         description: "Seul un patient peut prendre un rendez-vous.",
      });
      return;
    }

    if (!date || !time) return;

    bookMutation.mutate({
      doctor_id: doctor.id,
      date,
      time,
      type: `Consultation - ${doctor.doctor_profile?.specialty}`,
      reason,
    });
  };

  const handleDownload = () => {
    if (appointmentData) {
      generateICSFile(appointmentData);
      toast({
        title: "Fichier téléchargé",
        description: "Le fichier de confirmation a été téléchargé.",
      });
    }
  };

  const goToMyAppointments = () => {
    navigate("/dashboard/patient/appointments");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 max-w-4xl"
        >
        {/* Doctor Info Header */}
        <div className="mb-6 pb-4 border-b border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 -ml-2"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <span>Retour</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Dr. {doctor.first_name} {doctor.last_name}</h2>
          <p className="text-primary font-medium">{doctor.doctor_profile?.specialty}</p>
        </div>

        {/* Step 1: Date & Time Selection */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Choisir la date et l&apos;heure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Selection */}
              <div className="space-y-3">
                <Label className="text-base">Date</Label>
                <Input
                  type="date"
                  value={date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>

              {/* Time Selection */}
              {date && (
                <div className="space-y-3">
                  <Label className="text-base flex items-center gap-2">Créneau horaire {loadingSlots && <Loader2 className="w-4 h-4 animate-spin text-primary" />}</Label>
                  {!loadingSlots && (!dynamicTimeSlots?.slots || dynamicTimeSlots.slots.length === 0) ? (
                      <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg text-center">Aucun créneau disponible pour cette date.</p>
                  ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {dynamicTimeSlots?.slots?.map((slotObj) => (
                      <button
                        key={slotObj.time}
                        onClick={() => slotObj.available && setTime(slotObj.time)}
                        disabled={!slotObj.available}
                        className={`p-2 rounded-lg text-sm font-medium transition-all ${
                          !slotObj.available
                            ? "bg-secondary/50 text-muted-foreground/40 cursor-not-allowed line-through"
                            : time === slotObj.time
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {slotObj.time.substring(0, 5)}
                      </button>
                    ))}
                  </div>
                  )}
                </div>
              )}

              {/* Reason */}
              <div className="space-y-3">
                <Label className="text-base">
                  Motif de la consultation (optionnel)
                </Label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Décrivez brièvement le motif de votre visite..."
                  className="min-h-[100px] rounded-xl"
                />
              </div>

              {/* Price Display */}
              <div className="flex items-center justify-between p-4 bg-secondary rounded-xl">
                <span className="text-muted-foreground">
                  Prix de la consultation
                </span>
                <span className="text-xl font-semibold text-primary">
                  {doctor.doctor_profile?.price} DH
                </span>
              </div>

              {/* Actions */}
              <Button
                onClick={handleBook}
                disabled={!date || !time || bookMutation.isPending}
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20"
              >
                {bookMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Confirmation...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Confirmer le rendez-vous
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Confirmation */}
        {step === 2 && appointmentConfirmed && appointmentData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-success/20">
              <CardContent className="p-8 text-center">
                {/* Success Icon */}
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-success" />
                </div>

                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Rendez-vous confirmé !
                </h2>
                <p className="text-muted-foreground mb-8">
                  Votre rendez-vous a été enregistré avec succès
                </p>

                {/* Appointment Details Card */}
                <Card className="max-w-md mx-auto mb-6">
                  <CardContent className="p-6 text-left">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Médecin
                          </p>
                          <p className="font-medium">
                            {appointmentData.doctor}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Stethoscope className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Spécialité
                          </p>
                          <p className="font-medium">
                            {appointmentData.specialty}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="font-medium">{appointmentData.date}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Heure</p>
                          <p className="font-medium">{appointmentData.time}</p>
                        </div>
                      </div>

                      {appointmentData.reason && (
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Motif
                            </p>
                            <p className="font-medium">
                              {appointmentData.reason}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-4 border-t">
                        <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                          <Check className="w-5 h-5 text-success" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Numéro de rendez-vous
                          </p>
                          <p className="font-mono font-medium">
                            {appointmentData.id}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    className="rounded-xl"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </Button>
                  <Button
                    onClick={goToMyAppointments}
                    className="rounded-xl bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20"
                  >
                    <ChevronRight className="w-4 h-4 mr-2" />
                    Voir mes rendez-vous
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default PatientRendezVous;
