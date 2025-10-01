import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SkipLink } from "@/components/ui/accessibility";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

import ScrollIndicator from "@/components/ScrollIndicator";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import DemoControlPanel from "@/components/DemoControlPanel";
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
// Removed deleted pages for demo
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const CompanyInvites = lazy(() => import("./pages/CompanyInvites"));
const AdminCompanyInvites = lazy(() => import("./pages/AdminCompanyInvites"));
const AdminUserDetail = lazy(() => import("./pages/AdminUserDetail"));
const AdminProviders = lazy(() => import("./pages/AdminProviders"));
const AdminProviderDetail = lazy(() => import("./pages/AdminProviderDetail"));
const AdminProviderNew = lazy(() => import("./pages/AdminProviderNew"));
const AdminMatching = lazy(() => import("./pages/AdminMatching"));
const AdminProviderChangeRequests = lazy(() => import("./pages/AdminProviderChangeRequests"));
const AdminSessions = lazy(() => import("./pages/AdminSessions"));
const AdminLogs = lazy(() => import("./pages/AdminLogs"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const CompanyDashboard = lazy(() => import("./pages/CompanyDashboard"));
const CompanyEmployees = lazy(() => import("./pages/CompanyEmployees"));
const CompanyEmployeeDetail = lazy(() => import("./pages/CompanyEmployeeDetail"));
const CompanyReports = lazy(() => import("./pages/CompanyReports"));
const CompanySettings = lazy(() => import("./pages/CompanySettings"));
const UserSessions = lazy(() => import("./pages/UserSessions"));
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
          
          {/* Static pages */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/support" element={<Support />} />
          
          {/* User routes */}
          <Route path="/user/dashboard" element={<UserLayout><UserSessions /></UserLayout>} />
          <Route path="/user/sessions" element={<UserLayout><UserSessions /></UserLayout>} />
          <Route path="/user/settings" element={<UserLayout><UserSettings /></UserLayout>} />
          <Route path="/user/book" element={<UserLayout><BookingFlow /></UserLayout>} />
          <Route path="/user/help" element={<UserLayout><HelpCenter /></UserLayout>} />
          
          {/* Public help center */}
          <Route path="/help" element={<HelpCenter />} />
          
          {/* Prestador routes */}
          <Route path="/prestador/dashboard" element={<PrestadorLayout><PrestadorDashboard /></PrestadorLayout>} />
          <Route path="/prestador/sessoes" element={<PrestadorLayout><PrestadorSessions /></PrestadorLayout>} />
          <Route path="/prestador/sessoes/:id" element={<PrestadorLayout><PrestadorSessionDetail /></PrestadorLayout>} />
          <Route path="/prestador/sessoes/guia" element={<PrestadorLayout><PrestadorSessionGuide /></PrestadorLayout>} />
          <Route path="/prestador/availability" element={<PrestadorLayout><PrestadorAvailability /></PrestadorLayout>} />
          <Route path="/prestador/profile" element={<PrestadorLayout><PrestadorProfile /></PrestadorLayout>} />
          
          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<AdminLayout><AdminUsers /></AdminLayout>} />
          <Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
          <Route path="/admin/usuarios" element={<AdminLayout><AdminUsers /></AdminLayout>} />
          <Route path="/admin/users/:id" element={<AdminLayout><AdminUserDetail /></AdminLayout>} />
          <Route path="/admin/providers" element={<AdminLayout><AdminProviders /></AdminLayout>} />
          <Route path="/admin/prestadores" element={<AdminLayout><AdminProviders /></AdminLayout>} />
          <Route path="/admin/providers/new" element={<AdminLayout><AdminProviderNew /></AdminLayout>} />
          <Route path="/admin/providers/:id" element={<AdminLayout><AdminProviderDetail /></AdminLayout>} />
          <Route path="/admin/providers/change-requests" element={<AdminLayout><AdminProviderChangeRequests /></AdminLayout>} />
          <Route path="/admin/sessions" element={<AdminLayout><AdminSessions /></AdminLayout>} />
          <Route path="/admin/sessoes" element={<AdminLayout><AdminSessions /></AdminLayout>} />
          <Route path="/admin/matching" element={<AdminLayout><AdminMatching /></AdminLayout>} />
          <Route path="/admin/company-invites" element={<AdminLayout><AdminCompanyInvites /></AdminLayout>} />
          <Route path="/admin/companies" element={<AdminLayout><AdminCompanyInvites /></AdminLayout>} />
          <Route path="/admin/agendamentos" element={<AdminLayout><AdminSessions /></AdminLayout>} />
          <Route path="/admin/logs" element={<AdminLayout><AdminLogs /></AdminLayout>} />
          <Route path="/admin/support" element={<AdminLayout><AdminSupport /></AdminLayout>} />
          <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />
          <Route path="/admin/configuracoes" element={<AdminLayout><AdminSettings /></AdminLayout>} />
          
          {/* Company HR routes */}
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
          <SkipLink />
          <Toaster />
          <Sonner />
          <AppWithTracking />
          <ScrollIndicator />
          <PWAInstallPrompt />
          <DemoControlPanel />
          <PerformanceMonitor />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </ErrorBoundary>
);

export default App;