import { Search, CalendarCheck, Bell, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: Search,
    title: "Trouvez votre médecin",
    description: "Recherchez par spécialité ou localisation.",
  },
  {
    icon: CalendarCheck,
    title: "Choisissez un créneau",
    description: "Sélectionnez la date et l'heure qui vous conviennent.",
  },
  {
    icon: Bell,
    title: "Confirmez votre RDV",
    description: "Recevez une confirmation immédiate.",
  },
  {
    icon: CheckCircle,
    title: "Consultez",
    description: "Présentez-vous à l'heure au rendez-vous.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Comment ça marche
          </span>
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-4">
            En 4 étapes simples
          </h2>
          <p className="text-muted-foreground text-lg">
            Un processus rapide pour votre confort.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
