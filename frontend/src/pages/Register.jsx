import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Stethoscope,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const moroccanCities = [
  "Casablanca", "Rabat", "Fès", "Tanger", "Marrakech", "Agadir", "Meknès", "Oujda", 
  "Kenitra", "Tétouan", "Safi", "Mohammédia", "Khouribga", "El Jadida", "Béni Mellal", 
  "Nador", "Taza", "Settat", "Berrechid", "Khémisset", "Laâyoune", "Guelmim", 
  "Khénifra", "Larache", "Taourirt", "Ksar El Kébir", "Sidi Slimane", "Sidi Kacem", 
  "Youssoufia", "Taroudant", "Berkane", "Errachidia", "Ouarzazate", "Tiznit"
].sort();

const phoneRegex = /^(?:(?:\+|00)212|0)[5-7]\d{8}$/;

const timeSlots24h = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2).toString().padStart(2, "0");
  const minutes = (i % 2 === 0 ? "00" : "30");
  return `${hours}:${minutes}`;
});

const Register = () => {
  const location = useLocation();
  const fromDoctor = location.state?.fromDoctor;
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
    role: "patient",
    specialty: "",
    price: "",
    schedules: [
      { day_of_week: "Lundi", start_time: "09:00", end_time: "18:00", is_active: true },
      { day_of_week: "Mardi", start_time: "09:00", end_time: "18:00", is_active: true },
      { day_of_week: "Mercredi", start_time: "09:00", end_time: "18:00", is_active: true },
      { day_of_week: "Jeudi", start_time: "09:00", end_time: "18:00", is_active: true },
      { day_of_week: "Vendredi", start_time: "09:00", end_time: "18:00", is_active: true },
      { day_of_week: "Samedi", start_time: "09:00", end_time: "13:00", is_active: false },
      { day_of_week: "Dimanche", start_time: "09:00", end_time: "13:00", is_active: false },
    ],
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (!phoneRegex.test(formData.phone)) {
      toast.error("Format de téléphone invalide (Ex: 0612345678)");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        role: formData.role,
      };

      if (formData.role === "medecin") {
        payload.specialty = formData.specialty;
        payload.price = formData.price ? parseFloat(formData.price) : null;
        
        // Normalize schedules: ensure HH:mm format and boolean is_active
        payload.schedules = formData.schedules.map(s => ({
          ...s,
          start_time: s.start_time.split(':').slice(0, 2).join(':'),
          end_time: s.end_time.split(':').slice(0, 2).join(':'),
          is_active: !!s.is_active
        }));
      }

      await register(payload);
      toast.success("Inscription réussie");
      
      if (fromDoctor && formData.role === "patient") {
        const doctorId = location.state?.doctorId;
        navigate(`/doctor/${doctorId}`);
      } else {
        navigate(`/dashboard/${formData.role}`);
      }
    } catch (error) {
      toast.error(error.message || "Erreur d'inscription");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative">
      <Link
        to="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-semibold text-2xl tracking-tight">Medi</span>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight mb-2">
            Créer un compte
          </h1>
          <p className="text-muted-foreground text-sm">
            Inscrivez-vous gratuitement
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium">
                Prénom
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Ex: Ahmed"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  className="pl-10 h-11 rounded-xl border-border bg-card"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium">
                Nom
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Ex: Alaoui"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                className="h-11 rounded-xl border-border bg-card"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="votre.nom@email.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="pl-10 h-11 rounded-xl border-border bg-card"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Téléphone
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="06 XX XX XX XX"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className={`pl-10 h-11 rounded-xl border-border bg-card ${
                  formData.phone && !phoneRegex.test(formData.phone) ? "border-destructive" : ""
                }`}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium">
              Adresse
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
              <Select
                value={formData.address}
                onValueChange={(value) => handleChange("address", value)}
              >
                <SelectTrigger className="pl-10 h-11 rounded-xl border-border bg-card">
                  <SelectValue placeholder="Sélectionnez votre ville" />
                </SelectTrigger>
                <SelectContent>
                  {moroccanCities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium">
              Type de compte
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleChange("role", value)}
            >
              <SelectTrigger className="h-11 rounded-xl border-border bg-card">
                <SelectValue placeholder="Sélectionnez votre rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="medecin">Médecin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.role === "medecin" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="specialty" className="text-sm font-medium">
                  Spécialité
                </Label>
                <Select
                  value={formData.specialty}
                  onValueChange={(value) => handleChange("specialty", value)}
                >
                  <SelectTrigger className="h-11 rounded-xl border-border bg-card">
                    <SelectValue placeholder="Sélectionnez votre spécialité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medecine-generale">Médecine Générale</SelectItem>
                    <SelectItem value="cardiologie">Cardiologie</SelectItem>
                    <SelectItem value="dermatologie">Dermatologie</SelectItem>
                    <SelectItem value="pediatrie">Pédiatrie</SelectItem>
                    <SelectItem value="gynecologie">Gynécologie</SelectItem>
                    <SelectItem value="neurologie">Neurologie</SelectItem>
                    <SelectItem value="ophtalmologie">Ophtalmologie</SelectItem>
                    <SelectItem value="orl">ORL</SelectItem>
                    <SelectItem value="orthopedie">Orthopédie</SelectItem>
                    <SelectItem value="psychiatrie">Psychiatrie</SelectItem>
                    <SelectItem value="rhumatologie">Rhumatologie</SelectItem>
                    <SelectItem value="urologie">Urologie</SelectItem>
                    <SelectItem value="endocrinologie">Endocrinologie</SelectItem>
                    <SelectItem value="gastro-enterologie">Gastro-entérologie</SelectItem>
                    <SelectItem value="pneumologie">Pneumologie</SelectItem>
                    <SelectItem value="nephrologie">Néphrologie</SelectItem>
                    <SelectItem value="oncologie">Oncology</SelectItem>
                    <SelectItem value="radiologie">Radiologie</SelectItem>
                    <SelectItem value="anesthesie">Anesthésie-réanimation</SelectItem>
                    <SelectItem value="medecine-interne">Médecine interne</SelectItem>
                    <SelectItem value="chirurgie-generale">Chirurgie générale</SelectItem>
                    <SelectItem value="chirurgie-cardiaque">Chirurgie cardiaque</SelectItem>
                    <SelectItem value="chirurgie-plastique">Chirurgie plastique</SelectItem>
                    <SelectItem value="odontologie">Odontologie</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium">
                  Prix de consultation (DH)
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Ex: 200"
                  value={formData.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  className="h-11 rounded-xl border-border bg-card"
                  required={formData.role === "medecin"}
                />
              </div>

              <div className="space-y-4 pt-2 border-t border-border mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold">Vos disponibilités</h3>
                </div>
                <div className="space-y-3">
                  {formData.schedules.map((day, index) => (
                    <div key={day.day_of_week} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium">{day.day_of_week}</Label>
                        <Switch 
                          checked={day.is_active}
                          onCheckedChange={(checked) => {
                            const newSched = [...formData.schedules];
                            newSched[index].is_active = checked;
                            handleChange("schedules", newSched);
                          }}
                        />
                      </div>
                      {day.is_active && (
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <Select
                            value={day.start_time}
                            onValueChange={(val) => {
                              const newSched = [...formData.schedules];
                              newSched[index].start_time = val;
                              handleChange("schedules", newSched);
                            }}
                          >
                            <SelectTrigger className="h-9 text-xs rounded-lg">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots24h.map((t) => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select
                            value={day.end_time}
                            onValueChange={(val) => {
                              const newSched = [...formData.schedules];
                              newSched[index].end_time = val;
                              handleChange("schedules", newSched);
                            }}
                          >
                            <SelectTrigger className="h-9 text-xs rounded-lg">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots24h.map((t) => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Mot de passe
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Créez un mot de passe"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="pl-10 pr-10 h-11 rounded-xl border-border bg-card"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirmer le mot de passe
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmez le mot de passe"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleChange("confirmPassword", e.target.value)
                }
                className="pl-10 pr-10 h-11 rounded-xl border-border bg-card"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-primary hover:bg-primary-hover text-white mt-2"
          >
            {loading ? "Création..." : "Créer mon compte"}
            {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="text-muted-foreground">
            Vous avez déjà un compte ?{" "}
          </span>
          <Link 
            to="/login" 
            state={location.state}
            className="text-primary font-medium"
          >
            Se connecter
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
