import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminAlertsTab from '@/components/admin/AdminAlertsTab';
import AdminTeamTab from '@/components/admin/AdminTeamTab';
import AdminLogsTab from '@/components/admin/AdminLogsTab';
import AdminPermissionsTab from '@/components/admin/AdminPermissionsTab';

const AdminControlCenter = () => {
  const { t } = useTranslation('admin');
  const [activeTab, setActiveTab] = useState('alerts');

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('controlCenter.title', 'Centro de Controlo')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('controlCenter.description', 'Monitorize alertas, equipa, logs e permissões do sistema')}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="alerts">
              {t('controlCenter.tabs.alerts', 'Alertas')}
            </TabsTrigger>
            <TabsTrigger value="team">
              {t('controlCenter.tabs.team', 'Equipa')}
            </TabsTrigger>
            <TabsTrigger value="logs">
              {t('controlCenter.tabs.logs', 'Logs')}
            </TabsTrigger>
            <TabsTrigger value="permissions">
              {t('controlCenter.tabs.permissions', 'Permissões')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="space-y-6">
            <AdminAlertsTab />
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <AdminTeamTab />
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <AdminLogsTab />
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <AdminPermissionsTab />
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default AdminControlCenter;
