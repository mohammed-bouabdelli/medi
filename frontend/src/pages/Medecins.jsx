import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Star, MapPin, Clock, Stethoscope } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
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
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";


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

const Medecins = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [specialty, setSpecialty] = useState("Toutes les spécialités");
  const navigate = useNavigate();

  // Debounce search slightly for better UX (simplified for this context)
  const searchQuery = searchTerm.trim();

  const { data, isLoading } = useQuery({
    queryKey: ["doctors", searchQuery, specialty],
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (specialty && specialty !== "Toutes les spécialités") {
        params.append("specialty", specialty);
      }
      return apiFetch(`/doctors?${params.toString()}`);
    },
  });

  const filteredDoctors = data?.data || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        {/* Hero Search */}
        <section className="gradient-hero py-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-2xl mx-auto mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Stethoscope className="w-4 h-4" />
                Trouvez le praticien qu'il vous faut
              </div>
              <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-4">
                Trouvez votre médecin
              </h1>
              <p className="text-muted-foreground">
                Recherchez par spécialité ou nom pour prendre rendez-vous.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-card p-3 rounded-2xl shadow-lg border border-border flex flex-col sm:flex-row gap-3">
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
            </motion.div>
          </div>
        </section>

        {/* Results */}
        <section className="container mx-auto px-4 py-12">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.map((doctor, index) => (
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
                            onClick={() => {
                              if (user?.role === "patient") {
                                navigate(`/doctor/${doctor.id}`);
                              } else {
                                navigate("/register", {
                                  state: { fromDoctor: true, doctorId: doctor.id },
                                });
                              }
                            }}
                          >
                            Prendre RDV
                          </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

            {!isLoading && filteredDoctors.length === 0 && (
              <div className="text-center py-12 bg-secondary/50 rounded-2xl">
                <p className="text-muted-foreground text-lg">Aucun médecin trouvé correspondant à votre recherche.</p>
              </div>
            )}
          </>
        )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Medecins;
