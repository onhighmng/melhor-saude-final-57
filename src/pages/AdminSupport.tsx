import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminSupportTicketsTab from '@/components/admin/AdminSupportTicketsTab';
import AdminChangeRequestsTab from '@/components/admin/AdminChangeRequestsTab';
import { MessageSquare, FileEdit } from 'lucide-react';

export default function AdminSupport() {
  const { t } = useTranslation('admin');

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('support.title', 'Gestão de Suporte')}</h1>
          <p className="text-muted-foreground">
            {t('support.description', 'Gerir tickets e pedidos de alteração')}
          </p>
        </div>

        <Tabs defaultValue="tickets" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              {t('support.tabs.tickets', 'Tickets')}
            </TabsTrigger>
            <TabsTrigger value="change-requests" className="flex items-center gap-2">
              <FileEdit className="h-4 w-4" />
              {t('support.tabs.changeRequests', 'Pedidos de Alteração')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="space-y-4 mt-6">
            <AdminSupportTicketsTab />
          </TabsContent>

          <TabsContent value="change-requests" className="space-y-4 mt-6">
            <AdminChangeRequestsTab />
          </TabsContent>
        </Tabs>
      </div>
  );
}
