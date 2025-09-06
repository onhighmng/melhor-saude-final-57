import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SkipLink } from "@/components/ui/accessibility";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { MusicProvider } from "@/contexts/MusicContext";

import ScrollIndicator from "@/components/ScrollIndicator";
import MusicPlayer from "@/components/MusicPlayer";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { usePageTracking } from "@/hooks/usePageTracking";
// Lazy load pages for better performance
import { lazy } from "react";
const Index = lazy(() => import("./pages/Index"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const UserSettings = lazy(() => import("./pages/UserSettings"));
const PrestadorDashboard = lazy(() => import("./pages/PrestadorDashboard"));
const PrestadorAvailability = lazy(() => import("./pages/PrestadorAvailability"));
const PrestadorSessions = lazy(() => import("./pages/PrestadorSessions"));
const PrestadorSessionDetail = lazy(() => import("./pages/PrestadorSessionDetail"));
const PrestadorProfile = lazy(() => import("./pages/PrestadorProfile"));
const Login = lazy(() => import("./pages/Login"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const RegisterCompany = lazy(() => import("./pages/RegisterCompany"));
const RegisterEmployee = lazy(() => import("./pages/RegisterEmployee"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

const AdminCompanyInvites = lazy(() => import("./pages/AdminCompanyInvites"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const CompanyInvites = lazy(() => import("./pages/CompanyInvites"));
const AdminUserDetail = lazy(() => import("./pages/AdminUserDetail"));
const AdminProviders = lazy(() => import("./pages/AdminProviders"));
const AdminProviderDetail = lazy(() => import("./pages/AdminProviderDetail"));
const AdminProviderNew = lazy(() => import("./pages/AdminProviderNew"));
const AdminMatching = lazy(() => import("./pages/AdminMatching"));
const AdminProviderChangeRequests = lazy(() => import("./pages/AdminProviderChangeRequests"));
const AdminScheduling = lazy(() => import("./pages/AdminScheduling"));
const AdminSessions = lazy(() => import("./pages/AdminSessions"));
const AdminEmails = lazy(() => import("./pages/AdminEmails"));
const AdminLogs = lazy(() => import("./pages/AdminLogs"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const CompanyDashboard = lazy(() => import("./pages/CompanyDashboard"));
const CompanyEmployees = lazy(() => import("./pages/CompanyEmployees"));
const CompanyEmployeeDetail = lazy(() => import("./pages/CompanyEmployeeDetail"));
const CompanyReports = lazy(() => import("./pages/CompanyReports"));
const CompanySettings = lazy(() => import("./pages/CompanySettings"));
const UserSessions = lazy(() => import("./pages/UserSessions"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const BookingFlow = lazy(() => import("./components/booking/BookingFlow"));
const Terms = lazy(() => import("./pages/Terms"));
const PrestadorSessionGuide = lazy(() => import("./pages/PrestadorSessionGuide"));
const Support = lazy(() => import("./pages/Support"));
const AdminSupport = lazy(() => import("./pages/AdminSupport"));
const Demo = lazy(() => import("./pages/Demo"));
import { Suspense } from "react";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { PerformanceMonitor } from "@/components/ui/performance-monitor";
import { UserLayout } from "@/components/layouts/UserLayout";
import { PrestadorLayout } from "@/components/layouts/PrestadorLayout";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { CompanyLayout } from "@/components/layouts/CompanyLayout";
import { AuthenticatedLayout } from "@/components/layouts/AuthenticatedLayout";

const AppWithTracking = () => {
  usePageTracking();
  
  return (
    <>
      
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        </div>
      }>
        <Routes>
          {/* Authentication pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register/company" element={<RegisterCompany />} />
          <Route path="/register/employee" element={<RegisterEmployee />} />
          
          {/* Home page */}
          <Route path="/" element={<Index />} />
          
          {/* Demo page */}
          <Route path="/demo" element={<Demo />} />
          
          
          {/* User routes */}
          <Route path="/user/dashboard" element={<UserLayout><UserDashboard /></UserLayout>} />
          <Route path="/user/book" element={<UserLayout><BookingFlow /></UserLayout>} />
          <Route path="/user/sessions" element={<UserLayout><UserSessions /></UserLayout>} />
          <Route path="/user/help" element={<UserLayout><HelpCenter /></UserLayout>} />
          <Route path="/user/settings" element={<UserLayout><UserSettings /></UserLayout>} />
          
          {/* Static pages */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/support" element={<Support />} />
          
          
          {/* Provider Dashboard */}
          <Route path="/prestador/dashboard" element={<PrestadorLayout><PrestadorDashboard /></PrestadorLayout>} />
          <Route path="/prestador/availability" element={<PrestadorLayout><PrestadorAvailability /></PrestadorLayout>} />
          <Route path="/prestador/sessoes" element={<PrestadorLayout><PrestadorSessions /></PrestadorLayout>} />
          <Route path="/prestador/sessoes/guia" element={<PrestadorLayout><PrestadorSessionGuide /></PrestadorLayout>} />
          <Route path="/prestador/sessoes/:id" element={<PrestadorLayout><PrestadorSessionDetail /></PrestadorLayout>} />
          <Route path="/prestador/profile" element={<PrestadorLayout><PrestadorProfile /></PrestadorLayout>} />
          
          {/* Admin Dashboard */}
          <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          
          <Route path="/admin/usuarios" element={<AdminLayout><AdminUsers /></AdminLayout>} />
          <Route path="/admin/usuarios/:id" element={<AdminLayout><AdminUserDetail /></AdminLayout>} />
          <Route path="/admin/companies/:id/invites" element={<AdminLayout><AdminCompanyInvites /></AdminLayout>} />
          <Route path="/admin/prestadores" element={<AdminLayout><AdminProviders /></AdminLayout>} />
          <Route path="/admin/prestadores/:id" element={<AdminLayout><AdminProviderDetail /></AdminLayout>} />
          <Route path="/admin/prestadores/novo" element={<AdminLayout><AdminProviderNew /></AdminLayout>} />
          <Route path="/admin/matching" element={<AdminLayout><AdminMatching /></AdminLayout>} />
          <Route path="/admin/provider-change-requests" element={<AdminLayout><AdminProviderChangeRequests /></AdminLayout>} />
          <Route path="/admin/agendamentos" element={<AdminLayout><AdminScheduling /></AdminLayout>} />
          <Route path="/admin/sessoes" element={<AdminLayout><AdminSessions /></AdminLayout>} />
          <Route path="/admin/support" element={<AdminLayout><AdminSupport /></AdminLayout>} />
          <Route path="/admin/emails" element={<AdminLayout><AdminEmails /></AdminLayout>} />
          <Route path="/admin/logs" element={<AdminLayout><AdminLogs /></AdminLayout>} />
          <Route path="/admin/configuracoes" element={<AdminLayout><AdminSettings /></AdminLayout>} />
          
          {/* Company HR Dashboard */}
          <Route path="/company/dashboard" element={<CompanyLayout><CompanyDashboard /></CompanyLayout>} />
          <Route path="/company/employees" element={<CompanyLayout><CompanyEmployees /></CompanyLayout>} />
          <Route path="/company/employees/:id" element={<CompanyLayout><CompanyEmployeeDetail /></CompanyLayout>} />
          <Route path="/company/invites" element={<CompanyLayout><CompanyInvites /></CompanyLayout>} />
          <Route path="/company/reports" element={<CompanyLayout><CompanyReports /></CompanyLayout>} />
          <Route path="/company/settings" element={<CompanyLayout><CompanySettings /></CompanyLayout>} />
          
          {/* Catch-all route - redirect to home */}
          <Route path="*" element={<Index />} />
        </Routes>
      </Suspense>
    </>
  );
};

const App = () => (
  <ErrorBoundary>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <MusicProvider>
            <SkipLink />
            <Toaster />
            <Sonner />
            <AppWithTracking />
            <ScrollIndicator />
            <MusicPlayer />
            <PWAInstallPrompt />
            <PerformanceMonitor />
          </MusicProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </ErrorBoundary>
);

export default App;