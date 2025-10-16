import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, UserCog, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { AdminCompaniesTab } from '@/components/admin/AdminCompaniesTab';
import { AdminEmployeesTab } from '@/components/admin/AdminEmployeesTab';
import { AdminProvidersTab } from '@/components/admin/AdminProvidersTab';

const AdminUsersManagement = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Gestão de Utilizadores
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerir empresas, colaboradores e prestadores da plataforma
        </p>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="companies" className="w-full">
        <div className="flex items-center gap-4">
          <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Empresas
          </TabsTrigger>
          <TabsTrigger value="employees" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Colaboradores
          </TabsTrigger>
          <TabsTrigger value="providers" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            Prestadores
          </TabsTrigger>
        </TabsList>
        <Button onClick={() => console.log('Add company')} className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Empresa
        </Button>
        </div>

        <TabsContent value="companies" className="mt-6">
          <AdminCompaniesTab />
        </TabsContent>

        <TabsContent value="employees" className="mt-6">
          <AdminEmployeesTab />
        </TabsContent>

        <TabsContent value="providers" className="mt-6">
          <AdminProvidersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminUsersManagement;
