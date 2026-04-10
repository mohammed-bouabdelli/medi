import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { GuestRoute } from "./components/GuestRoute";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Medecins from "./pages/Medecins";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
// Patient
import PatientDashboard from "./pages/dashboard/PatientDashboard";
import PatientAppointments from "./pages/dashboard/patient/PatientAppointments";
import PatientBook from "./pages/dashboard/patient/PatientBook";
import PatientDocuments from "./pages/dashboard/patient/PatientDocuments";
import PatientProfile from "./pages/dashboard/patient/PatientProfile";
import PatientDoctors from "./pages/dashboard/patient/PatientDoctors";
import PatientRendezVous from "./pages/dashboard/PatientRendezVous";
// Medecin
import MedecinDashboard from "./pages/dashboard/MedecinDashboard";
import MedecinSchedule from "./pages/dashboard/medecin/MedecinSchedule";
import MedecinPatients from "./pages/dashboard/medecin/MedecinPatients";
import MedecinAppointments from "./pages/dashboard/medecin/MedecinAppointments";
import MedecinPrescriptions from "./pages/dashboard/medecin/MedecinPrescriptions";
import MedecinProfile from "./pages/dashboard/medecin/MedecinProfile";
// Admin
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import AdminUsers from "./pages/dashboard/admin/AdminUsers";
import AdminDoctors from "./pages/dashboard/admin/AdminDoctors";
import AdminAppointments from "./pages/dashboard/admin/AdminAppointments";
import AdminReports from "./pages/dashboard/admin/AdminReports";
import AdminProfile from "./pages/dashboard/admin/AdminProfile";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <BrowserRouter>
          {/* Toaster components */}
          <Toaster />
          <Sonner />

          {/* Routes */}
          <Routes>
            {/* Guest/Public Routes - Only accessible when NOT logged in */}
            <Route path="/" element={<GuestRoute><Index /></GuestRoute>} />
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            
            {/* Unprotected Pages - Can be seen by anyone */}
            <Route path="/medecins" element={<Medecins />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/doctor/:id" element={<PatientRendezVous />} />

            {/* Patient */}
            <Route path="/dashboard/patient" element={<ProtectedRoute allowedRoles={["patient"]}><PatientDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/patient/doctors" element={<ProtectedRoute allowedRoles={["patient"]}><PatientDoctors /></ProtectedRoute>} />
            <Route path="/dashboard/patient/appointments" element={<ProtectedRoute allowedRoles={["patient"]}><PatientAppointments /></ProtectedRoute>} />
            <Route path="/dashboard/patient/book" element={<ProtectedRoute allowedRoles={["patient"]}><PatientBook /></ProtectedRoute>} />
            <Route path="/dashboard/patient/profile" element={<ProtectedRoute allowedRoles={["patient"]}><PatientProfile /></ProtectedRoute>} />

            {/* Medecin */}
            <Route path="/dashboard/medecin" element={<ProtectedRoute allowedRoles={["medecin"]}><MedecinDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/medecin/schedule" element={<ProtectedRoute allowedRoles={["medecin"]}><MedecinSchedule /></ProtectedRoute>} />
            <Route path="/dashboard/medecin/patients" element={<ProtectedRoute allowedRoles={["medecin"]}><MedecinPatients /></ProtectedRoute>} />
            <Route path="/dashboard/medecin/appointments" element={<ProtectedRoute allowedRoles={["medecin"]}><MedecinAppointments /></ProtectedRoute>} />
            <Route path="/dashboard/medecin/prescriptions" element={<ProtectedRoute allowedRoles={["medecin"]}><MedecinPrescriptions /></ProtectedRoute>} />
            <Route path="/dashboard/medecin/profile" element={<ProtectedRoute allowedRoles={["medecin"]}><MedecinProfile /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />
            <Route path="/dashboard/admin/doctors" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDoctors /></ProtectedRoute>} />
            <Route path="/dashboard/admin/appointments" element={<ProtectedRoute allowedRoles={["admin"]}><AdminAppointments /></ProtectedRoute>} />
            <Route path="/dashboard/admin/reports" element={<ProtectedRoute allowedRoles={["admin"]}><AdminReports /></ProtectedRoute>} />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
