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
  ChevronRight,
  FileText,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";



const specialties = [
  "Toutes",
  "Médecine Générale",
  "Cardiologie",
  "Pédiatrie",
  "Dermatologie",
  "Ophtalmologie",
  "Gynécologie",
];



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

const PatientBook = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [selectedSpecialty, setSelectedSpecialty] = useState("Toutes");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [appointmentConfirmed, setAppointmentConfirmed] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);

  const { data: doctorsData = [], isLoading: loadingDoctors } = useQuery({
    queryKey: ["allDoctorsList"],
    queryFn: async () => {
      const res = await apiFetch("/doctors?per_page=100");
      return res.data;
    },
  });

  const { data: dynamicTimeSlots = [], isFetching: loadingSlots } = useQuery({
    queryKey: ["timeSlots", selectedDoctor?.id, date],
    queryFn: () => apiFetch(`/doctors/${selectedDoctor.id}/time-slots?date=${date}`),
    enabled: !!selectedDoctor?.id && !!date,
  });

  const filteredDoctors =
    selectedSpecialty === "Toutes"
      ? doctorsData
      : doctorsData.filter((d) => d.doctor_profile?.specialty === selectedSpecialty);

  const bookMutation = useMutation({
    mutationFn: (payload) => apiFetch("/patient/appointments", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
    onSuccess: (data) => {
      const finalData = {
        doctor: `Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name}`,
        specialty: selectedDoctor.doctor_profile?.specialty,
        date,
        time,
        reason,
        id: data.data?.id || `RDV-${Date.now()}`,
      };
      setAppointmentData(finalData);
      setAppointmentConfirmed(true);
      setStep(3);

      toast({
        title: "Rendez-vous confirmé !",
        description: `Votre rendez-vous avec le Dr. ${selectedDoctor.first_name} est confirmé.`,
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

  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setStep(2);
  };

  const handleBook = () => {
    if (!date || !time || !selectedDoctor) return;

    bookMutation.mutate({
      doctor_id: selectedDoctor.id,
      date,
      time,
      type: `Consultation - ${selectedDoctor.doctor_profile?.specialty}`,
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

  const handleNewBooking = () => {
    setStep(1);
    setSelectedSpecialty("Toutes");
    setSelectedDoctor(null);
    setDate("");
    setTime("");
    setReason("");
    setAppointmentConfirmed(false);
    setAppointmentData(null);
  };

  const goToMyAppointments = () => {
    navigate("/dashboard/patient/appointments");
  };

  return (
    <DashboardLayout role="patient" userName={user?.first_name || "Patient"}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          {step > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setStep(step - 1)}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Prendre un rendez-vous
            </h1>
            <p className="text-muted-foreground mt-1">
              {step === 1 && "Choisissez un médecin"}
              {step === 2 && "Sélectionnez une date et heure"}
              {step === 3 && "Confirmation de votre rendez-vous"}
            </p>
          </div>
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s, index) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  step >= s
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {index < 2 && (
                <div
                  className={`w-12 h-0.5 rounded-full transition-all ${
                    step > s ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Doctor */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Specialty Filter */}
            <div className="flex flex-wrap gap-2">
              {specialties.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => setSelectedSpecialty(specialty)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedSpecialty === specialty
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>

            {/* Doctors Grid */}
            {loadingDoctors ? (
               <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : filteredDoctors.length === 0 ? (
               <div className="text-center py-10 bg-secondary/30 rounded-xl"><p className="text-muted-foreground">Aucun médecin trouvé pour cette spécialité.</p></div>
            ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredDoctors.map((doctor) => (
                <Card
                  key={doctor.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedDoctor?.id === doctor.id
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border"
                  }`}
                  onClick={() => handleSelectDoctor(doctor)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {doctor.avatar ? (
                          <img src={doctor.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-8 h-8 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-foreground truncate">
                              Dr. {doctor.first_name} {doctor.last_name}
                            </h3>
                            <p className="text-sm text-primary">
                              {doctor.doctor_profile?.specialty}
                            </p>
                          </div>
                          {doctor.doctor_profile?.is_available && (
                            <Badge
                              variant="secondary"
                              className="bg-success/10 text-success"
                            >
                              Disponible
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-warning text-warning" />
                            <span>{doctor.doctor_profile?.rating}</span>
                            <span>({doctor.doctor_profile?.reviews_count} avis)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{doctor.doctor_profile?.location}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm text-primary font-semibold">
                            {doctor.doctor_profile?.price} DH
                          </span>
                          <Button size="sm" className="rounded-lg">
                            Choisir
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            )}
          </div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 2 && selectedDoctor && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Doctor Info Card */}
            <Card className="lg:col-span-1 h-fit">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedDoctor.name}</h3>
                    <p className="text-sm text-primary">
                      {selectedDoctor.specialty}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {selectedDoctor.location}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Star className="w-4 h-4 fill-warning text-warning" />
                    {selectedDoctor.rating} ({selectedDoctor.reviews} avis)
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Date & Time Selection */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Choisir la date et l&apos;heure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date Selection */}
                <div className="space-y-3">
                  <Label className="text-base">Date</Label>
                  <input
                    type="date"
                    value={date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-input bg-background"
                  />
                </div>

                {/* Time Selection */}
                {date && (
                  <div className="space-y-3">
                    <Label className="text-base flex items-center gap-2">Créneau horaire {loadingSlots && <Loader2 className="w-4 h-4 animate-spin text-primary" />}</Label>
                    {!loadingSlots && dynamicTimeSlots.length === 0 ? (
                      <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg text-center">Aucun créneau disponible pour cette date.</p>
                    ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {dynamicTimeSlots.map((t) => (
                        <button
                          key={t}
                          onClick={() => setTime(t)}
                          className={`p-2 rounded-lg text-sm font-medium transition-all ${
                            time === t
                              ? "bg-primary text-primary-foreground shadow-md"
                              : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                          }`}
                        >
                          {t.substring(0, 5)}
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

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="rounded-xl"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                  </Button>
                  <Button
                    onClick={handleBook}
                    disabled={!date || !time || bookMutation.isPending}
                    className="flex-1 rounded-xl bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20"
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
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && appointmentConfirmed && appointmentData && (
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
                <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    className="rounded-xl"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </Button>
                  <Button
                    variant="outline"
                    onClick={goToMyAppointments}
                    className="rounded-xl"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Mes rendez-vous
                  </Button>
                  <Button
                    onClick={handleNewBooking}
                    className="rounded-xl bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20"
                  >
                    <Stethoscope className="w-4 h-4 mr-2" />
                    Nouveau RDV
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default PatientBook;
