import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Star, MapPin, Clock, Stethoscope } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const specialties = [
  "Toutes les spécialités",
  "Médecine Générale",
  "Cardiologie",
  "Dermatologie",
  "Pédiatrie",
  "Gynécologie",
  "Neurologie",
  "Ophtalmologie",
  "ORL",
  "Orthopédie",
  "Psychiatrie",
  "Rhumatologie",
  "Urologie",
  "Endocrinologie",
  "Gastro-entérologie",
  "Pneumologie",
  "Néphrologie",
  "Oncologie",
  "Radiologie",
  "Anesthésie-réanimation",
  "Médecine interne",
  "Chirurgie générale",
  "Chirurgie cardiaque",
  "Chirurgie plastique",
  "Odontologie",
];

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

const PatientDoctors = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [specialty, setSpecialty] = useState("");
  const navigate = useNavigate();

  const { data: doctorsData, isLoading } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => apiFetch("/doctors"),
  });

  const doctors = Array.isArray(doctorsData) ? doctorsData : doctorsData?.data || [];

  const filteredDoctors = doctors.filter((doc) => {
    const name = `${doc.first_name} ${doc.last_name}`.toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase());
    const matchesSpecialty =
      !specialty ||
      specialty === "Toutes les spécialités" ||
      doc.doctor_profile?.specialty === specialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <DashboardLayout role="patient" userName={user?.first_name || "Patient"}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Trouvez votre médecin
          </h1>
          <p className="text-muted-foreground mt-1">
            {filteredDoctors.length} médecins disponibles
          </p>
        </div>

        {/* Search */}
        <div className="bg-card p-3 rounded-2xl border border-border flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Nom du médecin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 rounded-xl border-0 bg-secondary"
            />
          </div>

          <Select value={specialty} onValueChange={setSpecialty}>
            <SelectTrigger className="w-full sm:w-52 h-11 rounded-xl bg-secondary border-0">
              <SelectValue placeholder="Spécialité" />
            </SelectTrigger>
            <SelectContent>
              {specialties.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full py-12 flex justify-center">
               <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredDoctors.map((doctor, index) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <div className="bg-card rounded-2xl border border-border overflow-hidden hover-lift group">
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                       {doctor.avatar ? (
                         <img src={doctor.avatar} alt="Avatar" className="w-full h-full object-cover" />
                       ) : (
                        <span className="text-lg font-semibold text-primary">
                          {doctor.first_name[0]}{doctor.last_name[0]}
                        </span>
                       )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                        Dr. {doctor.first_name} {doctor.last_name}
                      </h3>
                      <Badge variant="secondary" className="mt-1 font-normal">
                        {doctor.doctor_profile?.specialty?.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {doctor.doctor_profile?.location}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-lg font-semibold text-primary">
                      {doctor.doctor_profile?.price} DH
                    </span>
                    <Button
                      size="sm"
                      className="rounded-xl bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20"
                      onClick={() =>
                        navigate(`/doctor/${doctor.id}`, { state: { doctor } })
                      }
                    >
                      Prendre RDV
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun médecin trouvé</p>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default PatientDoctors;
