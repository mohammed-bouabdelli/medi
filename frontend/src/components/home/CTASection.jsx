import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const CTASection = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-primary p-10 lg:p-16"
        >
          {/* Soft background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Rejoignez-nous aujourd'hui
            </div>

            <h2 className="text-3xl lg:text-4xl font-semibold text-white mb-4">
              Prêt à simplifier votre santé ?
            </h2>

            <p className="text-lg text-white/80 mb-8">
              Prenez rendez-vous avec les meilleurs médecins en quelques clics.
              Simple, rapide et sécurisé.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 rounded-xl shadow-xl px-8"
                >
                  Créer un compte gratuit
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>

              <Link to="/medecins">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/30 text-white bg-transparent hover:bg-white/10 rounded-xl px-8"
                >
                  Explorer les médecins
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
