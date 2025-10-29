import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n/config'
import { NotificationProvider } from '@/contexts/NotificationContext'

createRoot(document.getElementById("root")!).render(
  <NotificationProvider>
    <App />
  </NotificationProvider>
);
