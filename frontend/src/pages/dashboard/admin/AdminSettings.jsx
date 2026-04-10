import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Bell, Shield, Save, Loader2, Lock } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";

const AdminSettings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleSave = () => {
    toast({
      title: "Paramètres sauvegardés",
      description: "Les paramètres ont été mis à jour avec succès.",
    });
  };

  const handleChangePassword = async () => {
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) return;
    if (passwordData.new !== passwordData.confirm) {
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
          current_password: passwordData.current,
          password: passwordData.new,
          password_confirmation: passwordData.confirm,
        }),
      });
      setShowPasswordDialog(false);
      setPasswordData({ current: "", new: "", confirm: "" });
      toast({ title: "Mot de passe modifié" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="admin" userName={`Administrateur ${user?.last_name || ""}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <h1 className="font-display text-2xl font-bold text-foreground">
          Paramètres Système
        </h1>

        <div className="grid gap-6 max-w-2xl">
          {/* Général */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Général
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Nom de la plateforme</Label>
                <Input defaultValue="Medi" />
              </div>
              <div className="space-y-1">
                <Label>Email de contact</Label>
                <Input defaultValue="contact@medi.ma" />
              </div>
            </CardContent>
          </Card>

          {/* Sécurité du compte */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Sécurité du compte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full" onClick={() => setShowPasswordDialog(true)}>
                <Lock className="w-4 h-4 mr-2" />
                Modifier mon mot de passe
              </Button>
              <div className="flex items-center justify-between pt-2">
                <div>
                  <Label>Mode maintenance</Label>
                  <p className="text-sm text-muted-foreground">Bloquer l'accès public</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Bouton Sauvegarder */}
          <Button
            variant="hero"
            onClick={handleSave}
            className="w-full"
          >
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder les paramètres système
          </Button>
        </div>
      </motion.div>

      {/* Dialog Mot de passe */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le mot de passe</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Mot de passe actuel</Label>
              <Input
                type="password"
                value={passwordData.current}
                onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Nouveau mot de passe</Label>
              <Input
                type="password"
                value={passwordData.new}
                onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Confirmer le nouveau mot de passe</Label>
              <Input
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Annuler
            </Button>
            <Button
              variant="hero"
              onClick={handleChangePassword}
              disabled={loading || !passwordData.current || !passwordData.new}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminSettings;

