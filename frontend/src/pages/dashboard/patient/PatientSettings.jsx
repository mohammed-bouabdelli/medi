import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Shield, Globe, Save, Moon } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";


const PatientSettings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const handleSave = () => {
    toast({
      title: "Paramètres sauvegardés",
      description: "Vos préférences ont été mises à jour.",
    });
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) return;
    if (newPw !== confirmPw) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Les nouveaux mots de passe ne correspondent pas.",
      });
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/auth/password", {
        method: "PUT",
        body: JSON.stringify({
          current_password: currentPw,
          password: newPw,
          password_confirmation: confirmPw,
        }),
      });
      setShowPasswordDialog(false);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été mis à jour avec succès.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Échec du changement de mot de passe.",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <DashboardLayout role="patient" userName={user?.first_name || "Patient"}>

      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Paramètres
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos préférences et sécurité
            </p>
          </div>

          {/* Notifications */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  label: "Rappels de rendez-vous",
                  desc: "Recevoir un rappel avant chaque rendez-vous",
                  defaultChecked: true,
                },
                {
                  label: "Notifications par email",
                  desc: "Recevoir les notifications par email",
                  defaultChecked: false,
                },
                {
                  label: "Notifications SMS",
                  desc: "Recevoir les notifications par SMS",
                  defaultChecked: false,
                },
              ].map((n) => (
                <div
                  key={n.label}
                  className="flex items-center justify-between"
                >
                  <div>
                    <Label className="font-medium">{n.label}</Label>
                    <p className="text-sm text-muted-foreground">{n.desc}</p>
                  </div>
                  <Switch defaultChecked={n.defaultChecked} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Moon className="w-5 h-5 text-primary" />
                Apparence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Mode sombre</Label>
                  <p className="text-sm text-muted-foreground">
                    Activer le thème sombre
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowPasswordDialog(true)}
              >
                Changer le mot de passe
              </Button>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">
                    Authentification à deux facteurs
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Sécurité renforcée pour votre compte
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Language */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Langue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Langue de l'interface</p>
                  <p className="text-sm text-muted-foreground">Français</p>
                </div>
                <Button variant="outline" size="sm">
                  Modifier
                </Button>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleSave}
            className="w-full h-11 rounded-xl bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20"
          >
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder les paramètres
          </Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default PatientSettings;
