import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ClipboardList, UserCheck, MessageSquare } from 'lucide-react';
import AdminSessionsTab from '@/components/admin/AdminSessionsTab';
import AdminBookingsTab from '@/components/admin/AdminBookingsTab';
import AdminMatchingTab from '@/components/admin/AdminMatchingTab';
import AdminSpecialistTab from '@/components/admin/AdminSpecialistTab';

const AdminOperations = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Operações
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerir sessões, agendamentos, matching e especialista geral
        </p>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="sessions" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Sessões
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Agendamentos
          </TabsTrigger>
          <TabsTrigger value="matching" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Matching
          </TabsTrigger>
          <TabsTrigger value="specialist" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Especialista Geral
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="mt-6">
          <AdminSessionsTab />
        </TabsContent>

        <TabsContent value="bookings" className="mt-6">
          <AdminBookingsTab />
        </TabsContent>

        <TabsContent value="matching" className="mt-6">
          <AdminMatchingTab />
        </TabsContent>

        <TabsContent value="specialist" className="mt-6">
          <AdminSpecialistTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminOperations;
