import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SkipLink } from "@/components/ui/accessibility";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { setNavigateFunction } from "@/services/redirectService";
import { useEffect } from "react";

import ScrollIndicator from "@/components/ScrollIndicator";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import DemoControlPanel from "@/components/DemoControlPanel";
import { usePageTracking } from "@/hooks/usePageTracking";
// Lazy load pages for better performance
import { lazy } from "react";
const Index = lazy(() => import("./pages/Index"));
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
// Admin pages
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminUsersManagement = lazy(() => import("./pages/AdminUsersManagement"));
const AdminOperations = lazy(() => import("./pages/AdminOperations"));
const AdminResources = lazy(() => import("./pages/AdminResources"));
const AdminReports = lazy(() => import("./pages/AdminReports"));
const AdminControlCenter = lazy(() => import("./pages/AdminControlCenter"));
const AdminSupport = lazy(() => import("./pages/AdminSupport"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AdminCompanyDetail = lazy(() => import("./pages/AdminCompanyDetail"));

// Company pages
const CompanyInvites = lazy(() => import("./pages/CompanyInvites"));
const CompanyDashboard = lazy(() => import("./pages/CompanyDashboard"));
const CompanyEmployees = lazy(() => import("./pages/CompanyEmployees"));
const CompanyEmployeeDetail = lazy(() => import("./pages/CompanyEmployeeDetail"));
const CompanyReports = lazy(() => import("./pages/CompanyReports"));
const CompanySettings = lazy(() => import("./pages/CompanySettings"));
const UserSessions = lazy(() => import("./pages/UserSessions"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const UserNotifications = lazy(() => import("./pages/UserNotifications"));
const UserResources = lazy(() => import("./pages/UserResources"));
const UserFeedback = lazy(() => import("./pages/UserFeedback"));
const BookingFlow = lazy(() => import("./components/booking/BookingFlow"));
const UserBooking = lazy(() => import("./pages/UserBooking"));
const DirectBookingFlow = lazy(() => import("./components/booking/DirectBookingFlow").then(m => ({ default: m.DirectBookingFlow })));
const Terms = lazy(() => import("./pages/Terms"));
const PrestadorSessionGuide = lazy(() => import("./pages/PrestadorSessionGuide"));
const Support = lazy(() => import("./pages/Support"));
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
  const navigate = useNavigate();
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
          <Route path="/user/notifications" element={<UserLayout><UserNotifications /></UserLayout>} />
          <Route path="/user/resources" element={<UserLayout><UserResources /></UserLayout>} />
          <Route path="/user/feedback/:sessionId" element={<UserLayout><UserFeedback /></UserLayout>} />
          <Route path="/user/settings" element={<UserLayout><UserSettings /></UserLayout>} />
          <Route path="/user/book" element={<UserLayout><UserBooking /></UserLayout>} />
          <Route path="/user/book-session" element={<UserLayout><DirectBookingFlow /></UserLayout>} />
          <Route path="/user/book-old" element={<UserLayout><BookingFlow /></UserLayout>} />
          
          {/* Prestador routes */}
          <Route path="/prestador/dashboard" element={<PrestadorLayout><PrestadorDashboard /></PrestadorLayout>} />
          <Route path="/prestador/sessoes" element={<PrestadorLayout><PrestadorSessions /></PrestadorLayout>} />
          <Route path="/prestador/sessoes/:id" element={<PrestadorLayout><PrestadorSessionDetail /></PrestadorLayout>} />
          <Route path="/prestador/sessoes/guia" element={<PrestadorLayout><PrestadorSessionGuide /></PrestadorLayout>} />
          <Route path="/prestador/availability" element={<PrestadorLayout><PrestadorAvailability /></PrestadorLayout>} />
          <Route path="/prestador/profile" element={<PrestadorLayout><PrestadorProfile /></PrestadorLayout>} />
          
          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          <Route path="/admin/users-management" element={<AdminLayout><AdminUsersManagement /></AdminLayout>} />
          <Route path="/admin/gestao-utilizadores" element={<AdminLayout><AdminUsersManagement /></AdminLayout>} />
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
          <DemoControlPanel />
          <PerformanceMonitor />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;