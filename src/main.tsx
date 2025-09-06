import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { NotificationProvider } from '@/contexts/NotificationContext'

// Preload critical resources
const preloadCriticalResources = () => {
  // Preload common admin components
  if (window.location.pathname.startsWith('/admin')) {
    import('@/components/admin/EmailNotificationsPanel');
    import('@/components/admin/OptimizedEmailTemplates');
  }
};

// Start preloading after initial render
setTimeout(preloadCriticalResources, 100);

createRoot(document.getElementById("root")!).render(
  <NotificationProvider>
    <App />
  </NotificationProvider>
);
