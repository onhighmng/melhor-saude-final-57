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
import * as Sentry from "@sentry/react";
import "@/sentry.config";

import ScrollIndicator from "@/components/ScrollIndicator";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { usePageTracking } from "@/hooks/usePageTracking";
// Lazy load pages for better performance
import { lazy } from "react";
const Index = lazy(() => import("./pages/Index"));
const PrestadorDashboard = lazy(() => import("./pages/SpecialistDashboardResponsive"));
const PrestadorSessions = lazy(() => import("./pages/SpecialistSessionsResponsive"));
const PrestadorSessionDetail = lazy(() => import("./pages/PrestadorSessionDetail"));
const PrestadorCalendar = lazy(() => import("./pages/PrestadorCalendar"));
const PrestadorPerformance = lazy(() => import("./pages/PrestadorPerformance"));
const PrestadorSettings = lazy(() => import("./pages/PrestadorSettings"));
const Login = lazy(() => import("./pages/Login"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const UpdatePassword = lazy(() => import("./pages/UpdatePassword"));
const Register = lazy(() => import("./pages/Register"));
// RegisterCompany route disabled - all companies must use admin-generated codes
const RegisterEmployee = lazy(() => import("./pages/RegisterEmployee"));
const SetupHRAccount = lazy(() => import("./pages/SetupHRAccount"));
const CreateMyCompany = lazy(() => import("./pages/CreateMyCompany"));
const QuickSetup = lazy(() => import("./pages/QuickSetup"));
// Admin pages
const AdminDashboard = lazy(() => import("./pages/AdminDashboardResponsive"));
const AdminUsersManagement = lazy(() => import("./pages/AdminUsersManagement"));
const AdminProviders = lazy(() => import("./pages/AdminProviders"));
const AdminProviderDetailMetrics = lazy(() => import("./pages/AdminProviderDetailMetrics"));
const AdminProviderCalendar = lazy(() => import("./pages/AdminProviderCalendar"));
const AdminOperations = lazy(() => import("./pages/AdminOperationsResponsive"));
const AdminResources = lazy(() => import("./pages/AdminResourcesResponsive"));
const AdminReports = lazy(() => import("./pages/AdminReportsResponsive"));
const AdminControlCenter = lazy(() => import("./pages/AdminControlCenter"));
const AdminSupport = lazy(() => import("./pages/AdminSupport"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AdminCompanies = lazy(() => import("./pages/AdminCompanies"));
const AdminCompanyDetail = lazy(() => import("./pages/AdminCompanyDetail"));
const AdminPerformanceSupervision = lazy(() => import("./pages/AdminPerformanceSupervision"));

// Specialist pages
const SpecialistDashboard = lazy(() => import("./pages/SpecialistDashboardResponsive"));
const EspecialistaCallRequests = lazy(() => import("./pages/EspecialistaCallRequestsResponsive"));
const EspecialistaUserHistory = lazy(() => import("./pages/EspecialistaUserHistoryResponsive"));
const EspecialistaStatsRevamped = lazy(() => import("./pages/EspecialistaStatsResponsive"));
const EspecialistaSettings = lazy(() => import("./pages/EspecialistaSettingsResponsive"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));

// Company pages
const CompanyDashboard = lazy(() => import("./pages/CompanyDashboardResponsive"));
const CompanyReportsImpact = lazy(() => import("./pages/CompanyReportsResponsive"));
const CompanyResources = lazy(() => import("./pages/CompanyResourcesResponsive"));
const CompanySessions = lazy(() => import("./pages/CompanySessionsResponsive"));
const CompanyCollaborators = lazy(() => import("./pages/CompanyCollaboratorsResponsive"));
const CompanySettings = lazy(() => import("./pages/CompanySettings"));
const UserSessions = lazy(() => import("./pages/UserSessionsResponsive"));
const UserDashboard = lazy(() => import("./pages/UserDashboardResponsive"));
const UserResources = lazy(() => import("./pages/UserResourcesResponsive"));
const UserChat = lazy(() => import("./pages/UserChatResponsive"));
const UserFeedback = lazy(() => import("./pages/UserFeedback"));
const UserNotifications = lazy(() => import("./pages/UserNotificationsResponsive"));
const UserSettings = lazy(() => import("./pages/UserSettingsResponsive"));
const BookingFlow = lazy(() => import("./components/booking/BookingFlow"));
const BookingRouter = lazy(() => import("./pages/UserBookingResponsive"));
const SpecialistSessions = lazy(() => import("./pages/SpecialistSessionsResponsive"));
const Terms = lazy(() => import("./pages/Terms"));
const Support = lazy(() => import("./pages/Support"));
const N8NChatTest = lazy(() => import("./pages/N8NChatTest"));
import { Suspense, useState } from "react";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { PerformanceMonitor } from "@/components/ui/performance-monitor";
import { UserLayout } from "@/components/layouts/UserLayout";
import { PrestadorLayout } from "@/components/layouts/PrestadorLayout";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { EspecialistaLayout } from "@/components/layouts/EspecialistaLayout";
import { CompanyLayout } from "@/components/layouts/CompanyLayout";
import { AuthenticatedLayout } from "@/components/layouts/AuthenticatedLayout";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { loadingAnimationConfig } from "@/components/LoadingAnimationConfig";

const AppWithTracking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
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

  // Show loading animation on route changes
  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 1500); // Show for minimum 1.5 seconds for smooth transition

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {/* Route transition loading overlay */}
      {isNavigating && (
        <LoadingAnimation
          variant="fullscreen"
          message="Carregando página..."
          submessage="Aguarde um momento"
          mascotSrc={loadingAnimationConfig.mascot}
          wordmarkSrc={loadingAnimationConfig.wordmark}
          primaryColor={loadingAnimationConfig.primaryColor}
          textColor={loadingAnimationConfig.textColor}
          showProgress={true}
        />
      )}
      
      <Suspense fallback={
        <LoadingAnimation
          variant="fullscreen"
          message="Carregando..."
          submessage="Aguarde enquanto carregamos a página"
          mascotSrc={loadingAnimationConfig.mascot}
          wordmarkSrc={loadingAnimationConfig.wordmark}
          primaryColor={loadingAnimationConfig.primaryColor}
          textColor={loadingAnimationConfig.textColor}
          showProgress={true}
        />
      }>
        <Routes>
          {/* Authentication callback - handles OAuth, magic links, email verification */}
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Authentication pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/reset" element={<UpdatePassword />} />
          <Route path="/register" element={<Register />} />
          {/* /register/company route disabled - all companies must use admin-generated codes */}
          <Route path="/register/employee" element={<RegisterEmployee />} />
          <Route path="/setup-hr" element={<ProtectedRoute><SetupHRAccount /></ProtectedRoute>} />
          <Route path="/create-company" element={<ProtectedRoute><CreateMyCompany /></ProtectedRoute>} />
          <Route path="/quick-setup" element={<ProtectedRoute><QuickSetup /></ProtectedRoute>} />
          
          {/* Home page */}
          <Route path="/" element={<Index />} />
          
          {/* Static pages */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/support" element={<Support />} />
          
          {/* N8N Chatbot Test Page */}
          <Route path="/n8n-chat-test" element={<N8NChatTest />} />
          
          {/* User routes - PROTECTED */}
          <Route path="/user/dashboard" element={<ProtectedRoute requiredRole="user"><UserLayout><UserDashboard /></UserLayout></ProtectedRoute>} />
          <Route path="/user/sessions" element={<ProtectedRoute requiredRole="user"><UserLayout><UserSessions /></UserLayout></ProtectedRoute>} />
          <Route path="/user/chat" element={<ProtectedRoute requiredRole="user"><UserLayout><UserChat /></UserLayout></ProtectedRoute>} />
          <Route path="/user/settings" element={<ProtectedRoute requiredRole="user"><UserLayout><UserSettings /></UserLayout></ProtectedRoute>} />
          <Route path="/user/resources" element={<ProtectedRoute requiredRole="user"><UserLayout><UserResources /></UserLayout></ProtectedRoute>} />
          <Route path="/user/feedback" element={<ProtectedRoute requiredRole="user"><UserLayout><UserFeedback /></UserLayout></ProtectedRoute>} />
          <Route path="/user/notifications" element={<ProtectedRoute requiredRole="user"><UserLayout><UserNotifications /></UserLayout></ProtectedRoute>} />
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
          <Route path="/admin/companies" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminCompanies /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/empresas" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminCompanies /></AdminLayout></ProtectedRoute>} />
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
          <Route path="/admin/performance" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminPerformanceSupervision /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/desempenho" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminPerformanceSupervision /></AdminLayout></ProtectedRoute>} />
          
          {/* Especialista Geral routes - PROTECTED */}
          <Route path="/especialista/dashboard" element={<ProtectedRoute requiredRole="especialista_geral"><EspecialistaLayout><SpecialistDashboard /></EspecialistaLayout></ProtectedRoute>} />
          <Route path="/especialista/sessions" element={<ProtectedRoute requiredRole="especialista_geral"><EspecialistaLayout><SpecialistSessions /></EspecialistaLayout></ProtectedRoute>} />
          <Route path="/especialista/call-requests" element={<ProtectedRoute requiredRole="especialista_geral"><EspecialistaLayout><EspecialistaCallRequests /></EspecialistaLayout></ProtectedRoute>} />
          <Route path="/especialista/calendario" element={<ProtectedRoute requiredRole="especialista_geral"><EspecialistaLayout><PrestadorCalendar /></EspecialistaLayout></ProtectedRoute>} />
          <Route path="/especialista/calendar" element={<ProtectedRoute requiredRole="especialista_geral"><EspecialistaLayout><PrestadorCalendar /></EspecialistaLayout></ProtectedRoute>} />
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
        <Sentry.Profiler>
          <ErrorBoundary>
            <SkipLink />
            <Toaster />
            <Sonner />
            <AppWithTracking />
            <ScrollIndicator />
            <PWAInstallPrompt />
            <PerformanceMonitor />
          </ErrorBoundary>
        </Sentry.Profiler>
      </AuthProvider>
    </BrowserRouter>
  </TooltipProvider>
);

export default Sentry.withProfiler(App);