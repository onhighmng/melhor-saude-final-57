import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SkipLink } from "@/components/ui/accessibility";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { setNavigateFunction } from "@/services/redirectService";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useEffect } from "react";

import ScrollIndicator from "@/components/ScrollIndicator";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { usePageTracking } from "@/hooks/usePageTracking";
// Lazy load pages for better performance
import { lazy } from "react";
const Index = lazy(() => import("./pages/Index"));
const UserSettings = lazy(() => 
  import("./pages/UserSettings").catch((error) => {
    console.error("Error loading UserSettings:", error);
    // Return a simple error component as fallback
    return {
      default: () => (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Erro ao carregar página</h2>
            <p className="text-muted-foreground">Por favor, recarregue a página.</p>
          </div>
        </div>
      )
    };
  })
);
const PrestadorDashboard = lazy(() => import("./pages/PrestadorDashboard"));
const PrestadorSessions = lazy(() => import("./pages/PrestadorSessions"));
const PrestadorSessionDetail = lazy(() => import("./pages/PrestadorSessionDetail"));
const PrestadorCalendar = lazy(() => import("./pages/PrestadorCalendar"));
const PrestadorPerformance = lazy(() => import("./pages/PrestadorPerformance"));
const PrestadorSettings = lazy(() => import("./pages/PrestadorSettings"));
const Login = lazy(() => import("./pages/Login"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const UpdatePassword = lazy(() => import("./pages/UpdatePassword"));
const Register = lazy(() => import("./pages/Register"));
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
const EspecialistaCallRequests = lazy(() => import("./pages/EspecialistaCallRequests"));
const EspecialistaSessions = lazy(() => import("./pages/EspecialistaSessionsRevamped"));
const EspecialistaUserHistory = lazy(() => import("./pages/EspecialistaUserHistory"));
const EspecialistaStatsRevamped = lazy(() => import("./pages/EspecialistaStatsRevamped"));
const EspecialistaSettings = lazy(() => import("./pages/EspecialistaSettings"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));

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
const UserNotifications = lazy(() => import("./pages/UserNotifications"));
const BookingFlow = lazy(() => import("./components/booking/BookingFlow"));
const BookingRouter = lazy(() => import("./components/booking/BookingRouter"));
const Terms = lazy(() => import("./pages/Terms"));
const Support = lazy(() => import("./pages/Support"));
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
          {/* Authentication callback - handles OAuth, magic links, email verification */}
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Authentication pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/reset" element={<UpdatePassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/company" element={<RegisterCompany />} />
          <Route path="/register/employee" element={<RegisterEmployee />} />
          
          {/* Home page */}
          <Route path="/" element={<Index />} />
          
          {/* Static pages */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/support" element={<Support />} />
          
          {/* User routes - PROTECTED */}
          <Route path="/user/dashboard" element={<ProtectedRoute requiredRole="user"><UserLayout><UserDashboard /></UserLayout></ProtectedRoute>} />
          <Route path="/user/sessions" element={<ProtectedRoute requiredRole="user"><UserLayout><UserSessions /></UserLayout></ProtectedRoute>} />
          <Route path="/user/settings" element={<ProtectedRoute requiredRole="user"><UserLayout><UserSettings /></UserLayout></ProtectedRoute>} />
          <Route path="/user/resources" element={<ProtectedRoute requiredRole="user"><UserLayout><UserResources /></UserLayout></ProtectedRoute>} />
          <Route path="/user/feedback" element={<ProtectedRoute requiredRole="user"><UserLayout><UserFeedback /></UserLayout></ProtectedRoute>} />
          <Route path="/user/notifications" element={<ProtectedRoute requiredRole="user"><UserLayout><UserNotifications /></UserLayout></ProtectedRoute>} />
          <Route path="/user/chat" element={<ProtectedRoute requiredRole="user"><UserLayout><UserChat /></UserLayout></ProtectedRoute>} />
          <Route path="/user/book" element={<ProtectedRoute requiredRole="user"><UserLayout><BookingRouter /></UserLayout></ProtectedRoute>} />
          <Route path="/user/booking/:step" element={<ProtectedRoute requiredRole="user"><UserLayout><BookingFlow /></UserLayout></ProtectedRoute>} />
          
          {/* Prestador routes - PROTECTED */}
          <Route path="/prestador/dashboard" element={<ProtectedRoute requiredRole="prestador"><PrestadorLayout><PrestadorDashboard /></PrestadorLayout></ProtectedRoute>} />
          <Route path="/prestador/calendario" element={<ProtectedRoute requiredRole="prestador"><PrestadorLayout><PrestadorCalendar /></PrestadorLayout></ProtectedRoute>} />
          <Route path="/prestador/sessoes" element={<ProtectedRoute requiredRole="prestador"><PrestadorLayout><PrestadorSessions /></PrestadorLayout></ProtectedRoute>} />
          <Route path="/prestador/sessoes/:id" element={<ProtectedRoute requiredRole="prestador"><PrestadorLayout><PrestadorSessionDetail /></PrestadorLayout></ProtectedRoute>} />
          <Route path="/prestador/desempenho" element={<ProtectedRoute requiredRole="prestador"><PrestadorLayout><PrestadorPerformance /></PrestadorLayout></ProtectedRoute>} />
          <Route path="/prestador/configuracoes" element={<ProtectedRoute requiredRole="prestador"><PrestadorLayout><PrestadorSettings /></PrestadorLayout></ProtectedRoute>} />
          
          {/* Admin routes - PROTECTED WITH ADMIN ROLE */}
          <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/users-management" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminUsersManagement /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/gestao-utilizadores" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminUsersManagement /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/providers" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminProviders /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/prestadores" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminProviders /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/provider-metrics/:providerId" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminProviderDetailMetrics /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/provider-calendar/:providerId" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminProviderCalendar /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/operations" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminOperations /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/operacoes" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminOperations /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/companies/:id" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminCompanyDetail /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/empresas/:id" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminCompanyDetail /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/resources" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminResources /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/recursos" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminResources /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminReports /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/relatorios" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminReports /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/control-center" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminControlCenter /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/centro-controlo" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminControlCenter /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/support" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminSupport /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/suporte" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminSupport /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminSettings /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/configuracoes" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminSettings /></AdminLayout></ProtectedRoute>} />
          
          {/* Especialista Geral routes - PROTECTED */}
          <Route path="/especialista/dashboard" element={<ProtectedRoute requiredRole="especialista_geral"><EspecialistaLayout><SpecialistDashboard /></EspecialistaLayout></ProtectedRoute>} />
          <Route path="/especialista/call-requests" element={<ProtectedRoute requiredRole="especialista_geral"><EspecialistaLayout><EspecialistaCallRequests /></EspecialistaLayout></ProtectedRoute>} />
          <Route path="/especialista/sessions" element={<ProtectedRoute requiredRole="especialista_geral"><EspecialistaLayout><EspecialistaSessions /></EspecialistaLayout></ProtectedRoute>} />
          <Route path="/especialista/user-history" element={<ProtectedRoute requiredRole="especialista_geral"><EspecialistaLayout><EspecialistaUserHistory /></EspecialistaLayout></ProtectedRoute>} />
          <Route path="/especialista/stats" element={<ProtectedRoute requiredRole="especialista_geral"><EspecialistaLayout><EspecialistaStatsRevamped /></EspecialistaLayout></ProtectedRoute>} />
          <Route path="/especialista/settings" element={<ProtectedRoute requiredRole="especialista_geral"><EspecialistaLayout><EspecialistaSettings /></EspecialistaLayout></ProtectedRoute>} />
          
          {/* Company HR routes - PROTECTED */}
          <Route path="/company/dashboard" element={<ProtectedRoute requiredRole="hr"><CompanyLayout><CompanyDashboard /></CompanyLayout></ProtectedRoute>} />
          <Route path="/company/relatorios" element={<ProtectedRoute requiredRole="hr"><CompanyLayout><CompanyReportsImpact /></CompanyLayout></ProtectedRoute>} />
          <Route path="/company/recursos" element={<ProtectedRoute requiredRole="hr"><CompanyLayout><CompanyResources /></CompanyLayout></ProtectedRoute>} />
          <Route path="/company/sessions" element={<ProtectedRoute requiredRole="hr"><CompanyLayout><CompanySessions /></CompanyLayout></ProtectedRoute>} />
          <Route path="/company/colaboradores" element={<ProtectedRoute requiredRole="hr"><CompanyLayout><CompanyCollaborators /></CompanyLayout></ProtectedRoute>} />
          <Route path="/company/settings" element={<ProtectedRoute requiredRole="hr"><CompanyLayout><CompanySettings /></CompanyLayout></ProtectedRoute>} />
          
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