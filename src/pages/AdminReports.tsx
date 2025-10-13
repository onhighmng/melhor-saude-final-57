import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminBillingTab from '@/components/admin/AdminBillingTab';
import AdminInternalReportsTab from '@/components/admin/AdminInternalReportsTab';
import AdminCompanyReportsTab from '@/components/admin/AdminCompanyReportsTab';

const AdminReports = () => {
  const { t } = useTranslation('admin');
  const [activeTab, setActiveTab] = useState('billing');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('reports.title', 'Relatórios e Faturação')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('reports.description', 'Gerencie faturação, relatórios internos e relatórios para empresas')}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="billing">
              {t('reports.tabs.billing', 'Faturação')}
            </TabsTrigger>
            <TabsTrigger value="internal">
              {t('reports.tabs.internal', 'Relatórios Internos')}
            </TabsTrigger>
            <TabsTrigger value="company">
              {t('reports.tabs.company', 'Relatórios para Empresas')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="billing" className="space-y-6">
            <AdminBillingTab />
          </TabsContent>

          <TabsContent value="internal" className="space-y-6">
            <AdminInternalReportsTab />
          </TabsContent>

          <TabsContent value="company" className="space-y-6">
            <AdminCompanyReportsTab />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
