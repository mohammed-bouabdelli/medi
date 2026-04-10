import { Calendar, Users, FileText, Bell, Shield, Clock } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Calendar,
    title: "Réservation simple",
    description:
      "Prenez rendez-vous en 3 clics, 24h/24, sans attendre au téléphone.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Users,
    title: "Médecins vérifiés",
    description:
      "Tous nos médecins sont certifiés et évalués par les patients.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: FileText,
    title: "Dossier numérique",
    description: "Votre historique médical accessible en un clic, partout.",
    color: "bg-success/10 text-success",
  },
  {
    icon: Bell,
    title: "Rappels intelligents",
    description:
      "Notifications automatiques pour ne jamais oublier un rendez-vous.",
    color: "bg-warning/10 text-warning",
  },
  {
    icon: Shield,
    title: "Sécurité maximale",
    description:
      "Vos données sont chiffrées et protégées selon les normes médicales.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Clock,
    title: "Gain de temps",
    description:
      "Finis les déplacements inutiles. Gérez tout depuis votre téléphone.",
    color: "bg-accent/10 text-accent",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Pourquoi nous choisir
          </span>
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-4">
            La santé à portée de main
          </h2>
          <p className="text-muted-foreground text-lg">
            Une expérience simple et moderne pour gérer votre santé au
            quotidien.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group p-6 rounded-2xl bg-card border border-border hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}
              >
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
