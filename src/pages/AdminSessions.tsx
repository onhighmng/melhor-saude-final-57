import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, GitBranch, UserCog } from 'lucide-react';
import AdminSessionsTab from '@/components/admin/AdminSessionsTab';
import AdminBookingsTab from '@/components/admin/AdminBookingsTab';
import AdminMatchingTab from '@/components/admin/AdminMatchingTab';
import AdminSpecialistTab from '@/components/admin/AdminSpecialistTab';

export default function AdminSessions() {
  const { t } = useTranslation('admin');
  const [activeTab, setActiveTab] = useState('sessions');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {t('sessions.title', 'Gestão de Sessões')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('sessions.subtitle', 'Gerir sessões, agendamentos e matching de especialistas')}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="sessions" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Sessões</span>
          </TabsTrigger>
          <TabsTrigger value="bookings" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Agendamentos</span>
          </TabsTrigger>
          <TabsTrigger value="matching" className="gap-2">
            <GitBranch className="h-4 w-4" />
            <span className="hidden sm:inline">Matching</span>
          </TabsTrigger>
          <TabsTrigger value="specialist" className="gap-2">
            <UserCog className="h-4 w-4" />
            <span className="hidden sm:inline">Especialista Geral</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions">
          <AdminSessionsTab />
        </TabsContent>

        <TabsContent value="bookings">
          <AdminBookingsTab />
        </TabsContent>

        <TabsContent value="matching">
          <AdminMatchingTab />
        </TabsContent>

        <TabsContent value="specialist">
          <AdminSpecialistTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
