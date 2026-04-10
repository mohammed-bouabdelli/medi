import { Star, Stethoscope } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

const DoctorsPreview = () => {
  const { data } = useQuery({
    queryKey: ["doctorsPreview"],
    queryFn: () => apiFetch("/doctors?per_page=4"),
  });

  const doctors = data?.data || [];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Nos médecins
          </span>
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-4">
            Des professionnels à votre service
          </h2>
          <p className="text-muted-foreground text-lg">
            Une équipe qualifiée pour prendre soin de votre santé.
          </p>
        </motion.div>

        {/* Doctors Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.map((doctor, index) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Link to="/medecins">
                <div className="bg-card rounded-2xl border border-border p-6 text-center group">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 overflow-hidden">
                    {doctor.avatar ? (
                      <img src={doctor.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-semibold text-primary">
                        {doctor.first_name[0]}{doctor.last_name[0]}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold mb-1">
                    Dr. {doctor.first_name} {doctor.last_name}
                  </h3>
                  <p className="text-sm text-primary">
                    {doctor.doctor_profile?.specialty?.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link to="/medecins">
            <button className="text-primary font-medium hover:underline">
              Voir tous les médecins →
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DoctorsPreview;
