import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SkipLink } from "@/components/ui/accessibility";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { setNavigateFunction } from "@/services/redirectService";
import { useEffect } from "react";
import { DemoAccessButton } from "@/components/DemoAccessButton";

import ScrollIndicator from "@/components/ScrollIndicator";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { usePageTracking } from "@/hooks/usePageTracking";
// Lazy load pages for better performance
import { lazy } from "react";
const Index = lazy(() => import("./pages/Index"));
const UserSettings = lazy(() => import("./pages/UserSettings"));
const PrestadorDashboard = lazy(() => import("./pages/PrestadorDashboard"));
const PrestadorSessions = lazy(() => import("./pages/PrestadorSessions"));
const PrestadorSessionDetail = lazy(() => import("./pages/PrestadorSessionDetail"));
const PrestadorCalendar = lazy(() => import("./pages/PrestadorCalendar"));
const PrestadorPerformance = lazy(() => import("./pages/PrestadorPerformance"));
const PrestadorSettings = lazy(() => import("./pages/PrestadorSettings"));
const Login = lazy(() => import("./pages/Login"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const RegisterCompany = lazy(() => import("./pages/RegisterCompany"));
const RegisterEmployee = lazy(() => import("./pages/RegisterEmployee"));
// Admin pages
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminUsersManagement = lazy(() => import("./pages/AdminUsersManagement"));
const AdminProviders = lazy(() => import("./pages/AdminProviders"));
const AdminProviderDetailMetrics = lazy(() => import("./pages/AdminProviderDetailMetrics"));
const AdminProviderCalendar = lazy(() => import("./pages/AdminProviderCalendar"));
const AdminOperations = lazy(() => import("./pages/AdminOperations"));
const AdminResources = lazy(() => import("./pages/AdminResources"));
const AdminReports = lazy(() => import("./pages/AdminReports"));
const AdminControlCenter = lazy(() => import("./pages/AdminControlCenter"));
const AdminSupport = lazy(() => import("./pages/AdminSupport"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AdminCompanyDetail = lazy(() => import("./pages/AdminCompanyDetail"));

// Specialist pages
const SpecialistDashboard = lazy(() => import("./pages/SpecialistDashboard"));
const EspecialistaCallRequests = lazy(() => import("./pages/EspecialistaCallRequestsRevamped"));
const EspecialistaSessions = lazy(() => import("./pages/EspecialistaSessionsRevamped"));
const EspecialistaUserHistory = lazy(() => import("./pages/EspecialistaUserHistory"));
const EspecialistaStats = lazy(() => import("./pages/EspecialistaStatsRevamped"));
const EspecialistaSettings = lazy(() => import("./pages/EspecialistaSettings"));

// Company pages
const CompanyDashboard = lazy(() => import("./pages/CompanyDashboard"));
const CompanyReportsImpact = lazy(() => import("./pages/CompanyReportsImpact"));
const CompanyResources = lazy(() => import("./pages/CompanyResources"));
const CompanySessions = lazy(() => import("./pages/CompanySessions"));
const CompanyCollaborators = lazy(() => import("./pages/CompanyCollaborators"));
const CompanySettings = lazy(() => import("./pages/CompanySettings"));
const UserSessions = lazy(() => import("./pages/UserSessions"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const UserResources = lazy(() => import("./pages/UserResources"));
const UserFeedback = lazy(() => import("./pages/UserFeedback"));
const UserChat = lazy(() => import("./pages/UserChat"));
const BookingFlow = lazy(() => import("./components/booking/BookingFlow"));
const BookingRouter = lazy(() => import("./components/booking/BookingRouter"));
const Terms = lazy(() => import("./pages/Terms"));
const Support = lazy(() => import("./pages/Support"));
// Demo page - force reload
const Demo = lazy(() => import("./pages/Demo"));
import { Suspense } from "react";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { PerformanceMonitor } from "@/components/ui/performance-monitor";
import { UserLayout } from "@/components/layouts/UserLayout";
import { PrestadorLayout } from "@/components/layouts/PrestadorLayout";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { EspecialistaLayout } from "@/components/layouts/EspecialistaLayout";
import { CompanyLayout } from "@/components/layouts/CompanyLayout";
import { AuthenticatedLayout } from "@/components/layouts/AuthenticatedLayout";

const AppWithTracking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  usePageTracking();
  
  // Set up navigate function for redirectService and error boundary
  useEffect(() => {
    setNavigateFunction(navigate);
    (window as any).__routerNavigate = navigate;
  }, [navigate]);
  
  // Language change listener to force component re-renders
  useEffect(() => {
    const handleLanguageChange = () => {
      // Force React to re-render all components
      window.dispatchEvent(new Event('storage'));
    };
    
    window.addEventListener('languageChanged', handleLanguageChange);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);
  
  const showDemoButton = location.pathname !== '/demo';

  return (
    <>
      {showDemoButton && <DemoAccessButton />}
      
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
          <Route path="/user/dashboard" element={<UserLayout><UserDashboard /></UserLayout>} />
          <Route path="/user/sessions" element={<UserLayout><UserSessions /></UserLayout>} />
          <Route path="/user/settings" element={<UserLayout><UserSettings /></UserLayout>} />
          <Route path="/user/resources" element={<UserLayout><UserResources /></UserLayout>} />
          <Route path="/user/feedback" element={<UserLayout><UserFeedback /></UserLayout>} />
          <Route path="/user/chat" element={<UserLayout><UserChat /></UserLayout>} />
          <Route path="/user/book" element={<UserLayout><BookingRouter /></UserLayout>} />
          <Route path="/user/booking/:step" element={<UserLayout><BookingFlow /></UserLayout>} />
          
          {/* Prestador routes */}
          <Route path="/prestador/dashboard" element={<PrestadorLayout><PrestadorDashboard /></PrestadorLayout>} />
          <Route path="/prestador/calendario" element={<PrestadorLayout><PrestadorCalendar /></PrestadorLayout>} />
          <Route path="/prestador/sessoes" element={<PrestadorLayout><PrestadorSessions /></PrestadorLayout>} />
          <Route path="/prestador/sessoes/:id" element={<PrestadorLayout><PrestadorSessionDetail /></PrestadorLayout>} />
          <Route path="/prestador/desempenho" element={<PrestadorLayout><PrestadorPerformance /></PrestadorLayout>} />
          <Route path="/prestador/configuracoes" element={<PrestadorLayout><PrestadorSettings /></PrestadorLayout>} />
          
          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          <Route path="/admin/users-management" element={<AdminLayout><AdminUsersManagement /></AdminLayout>} />
          <Route path="/admin/gestao-utilizadores" element={<AdminLayout><AdminUsersManagement /></AdminLayout>} />
          <Route path="/admin/providers" element={<AdminLayout><AdminProviders /></AdminLayout>} />
          <Route path="/admin/prestadores" element={<AdminLayout><AdminProviders /></AdminLayout>} />
          <Route path="/admin/provider-metrics/:providerId" element={<AdminLayout><AdminProviderDetailMetrics /></AdminLayout>} />
          <Route path="/admin/provider-calendar/:providerId" element={<AdminLayout><AdminProviderCalendar /></AdminLayout>} />
          <Route path="/admin/operations" element={<AdminLayout><AdminOperations /></AdminLayout>} />
          <Route path="/admin/operacoes" element={<AdminLayout><AdminOperations /></AdminLayout>} />
          <Route path="/admin/companies/:id" element={<AdminLayout><AdminCompanyDetail /></AdminLayout>} />
          <Route path="/admin/empresas/:id" element={<AdminLayout><AdminCompanyDetail /></AdminLayout>} />
          <Route path="/admin/resources" element={<AdminLayout><AdminResources /></AdminLayout>} />
          <Route path="/admin/recursos" element={<AdminLayout><AdminResources /></AdminLayout>} />
          <Route path="/admin/reports" element={<AdminLayout><AdminReports /></AdminLayout>} />
          <Route path="/admin/relatorios" element={<AdminLayout><AdminReports /></AdminLayout>} />
          <Route path="/admin/control-center" element={<AdminLayout><AdminControlCenter /></AdminLayout>} />
          <Route path="/admin/centro-controlo" element={<AdminLayout><AdminControlCenter /></AdminLayout>} />
          <Route path="/admin/support" element={<AdminLayout><AdminSupport /></AdminLayout>} />
          <Route path="/admin/suporte" element={<AdminLayout><AdminSupport /></AdminLayout>} />
          <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />
          <Route path="/admin/configuracoes" element={<AdminLayout><AdminSettings /></AdminLayout>} />
          
          {/* Especialista Geral routes */}
          <Route path="/especialista/dashboard" element={<EspecialistaLayout><SpecialistDashboard /></EspecialistaLayout>} />
          <Route path="/especialista/call-requests" element={<EspecialistaLayout><EspecialistaCallRequests /></EspecialistaLayout>} />
          <Route path="/especialista/sessions" element={<EspecialistaLayout><EspecialistaSessions /></EspecialistaLayout>} />
          <Route path="/especialista/user-history" element={<EspecialistaLayout><EspecialistaUserHistory /></EspecialistaLayout>} />
          <Route path="/especialista/stats" element={<EspecialistaLayout><EspecialistaStats /></EspecialistaLayout>} />
          <Route path="/especialista/settings" element={<EspecialistaLayout><EspecialistaSettings /></EspecialistaLayout>} />
          
          {/* Company HR routes */}
          <Route path="/company/dashboard" element={<CompanyLayout><CompanyDashboard /></CompanyLayout>} />
          <Route path="/company/relatorios" element={<CompanyLayout><CompanyReportsImpact /></CompanyLayout>} />
          <Route path="/company/recursos" element={<CompanyLayout><CompanyResources /></CompanyLayout>} />
          <Route path="/company/sessions" element={<CompanyLayout><CompanySessions /></CompanyLayout>} />
          <Route path="/company/colaboradores" element={<CompanyLayout><CompanyCollaborators /></CompanyLayout>} />
          <Route path="/company/settings" element={<CompanyLayout><CompanySettings /></CompanyLayout>} />
          
          {/* Catch-all route - redirect to home */}
          <Route path="*" element={<Index />} />
        </Routes>
      </Suspense>
    </>
  );
};

const App = () => (
  <TooltipProvider>
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <SkipLink />
          <Toaster />
          <Sonner />
          <AppWithTracking />
          <ScrollIndicator />
          <PWAInstallPrompt />
          <PerformanceMonitor />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;