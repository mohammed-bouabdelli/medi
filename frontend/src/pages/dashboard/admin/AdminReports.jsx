import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Calendar, Download } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

const COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--accent))", "hsl(var(--muted-foreground))"];

const AdminReports = () => {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["adminReports"],
    queryFn: () => apiFetch("/admin/reports")
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

  const { stats, monthly_data: monthlyData, specialty_data: specialtyData } = data || {};

  return (
  <DashboardLayout role="admin" userName={`Administrateur ${user?.last_name || ""}`}>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Rapports</h1>
        <Button variant="outline"><Download className="w-4 h-4 mr-2" />Exporter</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "RDV ce mois", value: stats?.monthly_appointments || 0, icon: Calendar, change: "+0%" },
          { label: "Nouveaux patients", value: stats?.new_patients || 0, icon: Users, change: "+0%" },
          { label: "Taux satisfaction", value: stats?.satisfaction_rate || "N/A", icon: TrendingUp, change: "+0%" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <s.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
              <span className="ml-auto text-sm font-medium text-success">{s.change}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Bar Chart: Rendez-vous par mois */}
        <Card>
          <CardHeader>
            <CardTitle>Rendez-vous par mois</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} 
                  />
                  <Bar dataKey="rdv" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart: Répartition par spécialité */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par spécialité</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={specialtyData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={60} 
                    outerRadius={100} 
                    paddingAngle={4} 
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {specialtyData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>
    </motion.div>
  </DashboardLayout>
  );
};

export default AdminReports;