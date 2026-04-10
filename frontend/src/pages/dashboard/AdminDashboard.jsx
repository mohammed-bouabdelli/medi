import {
  Calendar,
  Users,
  Stethoscope,
  TrendingUp,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  
  const { data, isLoading } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: () => apiFetch("/admin/dashboard"),
  });

  if (isLoading) {
    return (
      <DashboardLayout role="admin" userName={`Administrateur ${user?.last_name || ""}`}>
         <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
         </div>
      </DashboardLayout>
    );
  }

  const dbStats = data?.stats || {};
  const chartData = data?.chart_data || [];
  const recentUsers = data?.recent_users || [];

  const stats = [
    {
      title: "Total Utilisateurs",
      value: dbStats.total_users || 0,
      icon: Users,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Médecins Actifs",
      value: dbStats.active_doctors || 0,
      icon: Stethoscope,
      color: "bg-success/10 text-success",
    },
    {
      title: "RDV ce mois",
      value: dbStats.monthly_appointments || 0,
      icon: Calendar,
      color: "bg-accent/10 text-accent",
    },
    {
      title: "Taux d'annulation",
      value: `${dbStats.cancellation_rate || 0}%`,
      icon: TrendingUp,
      color: "bg-warning/10 text-warning",
    },
  ];

  return (
    <DashboardLayout role="admin" userName={`Administrateur ${user?.last_name || ""}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Welcome */}
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Tableau de bord administrateur
          </h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de la plateforme Medi
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}
                    >
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {stat.title}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Chart + Users */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Évolution des rendez-vous</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="rdv"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary) / 0.2)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle>Nouveaux inscrits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers.map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                        <span className="text-sm font-medium text-foreground">
                          {user.name.charAt(0)}
                        </span>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.role}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs text-muted-foreground">
                      {user.date}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
