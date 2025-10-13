import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, MessageSquare } from 'lucide-react';
import AdminSessionsTab from '@/components/admin/AdminSessionsTab';
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
          Gerir sessões e especialista geral
        </p>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="sessions" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Sessões
          </TabsTrigger>
          <TabsTrigger value="specialist" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Especialista Geral
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="mt-6">
          <AdminSessionsTab />
        </TabsContent>

        <TabsContent value="specialist" className="mt-6">
          <AdminSpecialistTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminOperations;
