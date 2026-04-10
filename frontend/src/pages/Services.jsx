import { motion } from "framer-motion";
import {
  Calendar,
  Shield,
  Clock,
  Video,
  FileText,
  Bell,
  Stethoscope,
  HeartPulse,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const services = [
  {
    icon: Calendar,
    title: "Prise de rendez-vous en ligne",
    description:
      "Réservez votre consultation en quelques clics, 24h/24 et 7j/7, sans attente téléphonique.",
  },
  {
    icon: Video,
    title: "Téléconsultation",
    description:
      "Consultez votre médecin à distance par vidéo, depuis le confort de votre domicile.",
  },
  {
    icon: FileText,
    title: "Ordonnances numériques",
    description:
      "Recevez vos ordonnances et certificats médicaux directement en format numérique.",
  },
  {
    icon: Bell,
    title: "Rappels automatiques",
    description:
      "Recevez des rappels par SMS et email avant chaque rendez-vous pour ne rien oublier.",
  },
  {
    icon: Shield,
    title: "Dossier médical sécurisé",
    description:
      "Accédez à votre historique médical complet, stocké de manière sécurisée et confidentielle.",
  },
  {
    icon: Clock,
    title: "Gestion du planning médecin",
    description:
      "Les médecins gèrent leur disponibilité en temps réel pour une organisation optimale.",
  },
  {
    icon: Stethoscope,
    title: "Annuaire médical",
    description:
      "Trouvez le spécialiste qu'il vous faut grâce à notre annuaire complet et filtrable.",
  },
  {
    icon: HeartPulse,
    title: "Suivi patient",
    description:
      "Suivez l'évolution de votre santé avec des tableaux de bord personnalisés.",
  },
];

const Services = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <section className="gradient-hero py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-2xl mx-auto mb-12"
            >
              <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Nos Services
              </h1>
              <p className="text-muted-foreground text-lg">
                Medi vous offre une gamme complète de services médicaux
                numériques pour simplifier votre parcours de santé.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {services.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 border-border hover:border-primary/30 group">
                    <CardContent className="p-6 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                        <service.icon className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="font-display font-semibold text-foreground mb-2">
                        {service.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {service.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-xl mx-auto"
          >
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Prêt à simplifier votre santé ?
            </h2>
            <p className="text-muted-foreground mb-8">
              Inscrivez-vous gratuitement et prenez votre premier rendez-vous en
              ligne dès maintenant.
            </p>
            <Link to="/register">
              <Button variant="hero" size="lg">
                <Calendar className="w-4 h-4 mr-2" />
                Commencer maintenant
              </Button>
            </Link>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Services;
