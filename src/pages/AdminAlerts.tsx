import AdminAlertsTab from '@/components/admin/AdminAlertsTab';

const AdminAlerts = () => {
  return (
    <div className="space-y-6">
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
  );
};

export default AdminAlerts;
