import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { NotificationProvider } from '@/contexts/NotificationContext'
import './i18n/config'

createRoot(document.getElementById("root")!).render(
  <NotificationProvider>
    <App />
  </NotificationProvider>
);
