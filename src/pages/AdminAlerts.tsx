import AdminAlertsTab from '@/components/admin/AdminAlertsTab';
import { useEffect } from 'react';

const AdminAlerts = () => {
  useEffect(() => {
    // Add admin-page class to body for gray background
    document.body.classList.add('admin-page');
    
    // Cleanup: remove class when component unmounts
    return () => {
      document.body.classList.remove('admin-page');
    };
  }, []);
  return (
    <div className="relative w-full min-h-screen h-full flex flex-col">
      <div className="relative z-10 h-full flex flex-col">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 space-y-4 h-full flex flex-col min-h-0">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Alertas
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitore chamadas pendentes, sessões agendadas, feedback negativo e utilizadores inativos
          </p>
        </div>
        <AdminAlertsTab />
        </div>
      </div>
    </div>
  );
};

export default AdminAlerts;
