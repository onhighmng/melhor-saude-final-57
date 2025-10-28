import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, UserCog } from 'lucide-react';
import { AdminCompaniesTab } from '@/components/admin/AdminCompaniesTab';
import { AdminEmployeesTab } from '@/components/admin/AdminEmployeesTab';
import { AdminProvidersTab } from '@/components/admin/AdminProvidersTab';
import { EmployeeDetailModal } from '@/components/admin/EmployeeDetailModal';
import { AddCompanyModal } from '@/components/admin/AddCompanyModal';
import { AddProviderModal } from '@/components/admin/AddProviderModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminUsersManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('companies');
  const [isAddCompanyModalOpen, setIsAddCompanyModalOpen] = useState(false);
  const [isAddProviderModalOpen, setIsAddProviderModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['companies', 'employees', 'providers'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    // Add admin-page class to body for gray background
    document.body.classList.add('admin-page');
    
    // Cleanup: remove class when component unmounts
    return () => {
      document.body.classList.remove('admin-page');
    };
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  const handleEmployeeClick = async (employeeId: string) => {
    try {
      // Fetch employee data from database
      const { data: employeeData, error } = await supabase
        .from('company_employees')
        .select(`
          *,
          company:companies(id, company_name)
        `)
        .eq('id', employeeId)
        .single();

      if (error) throw error;
      if (!employeeData) return;

      // Get user profile separately
      const { data: userData } = await supabase
        .from('profiles')
        .select('id, name, email, avatar_url')
        .eq('id', employeeData.user_id)
        .single();

      // Get bookings for this employee
      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          *,
          prestador:prestadores(id, name, photo_url)
        `)
        .eq('user_id', employeeData.user_id)
        .order('booking_date', { ascending: false })
        .limit(10);

      const avgRating = bookings && bookings.length > 0
        ? bookings.reduce((sum, b) => sum + (b.rating || 0), 0) / bookings.filter(b => b.rating).length
        : 0;

      // Transform to modal format
      const employee = {
        id: employeeData.id,
        name: userData?.name || 'Unknown',
        email: userData?.email || '',
        company: employeeData.company?.company_name || '',
        sessions: {
          used: employeeData.sessions_used || 0,
          total: employeeData.sessions_allocated || 0
        },
        rating: Math.round(avgRating * 10) / 10,
        objectives: [],
        sessionHistory: (bookings || []).map(b => ({
          date: b.booking_date ? new Date(b.booking_date).toLocaleDateString('pt-PT') : 'N/A',
          category: b.pillar || 'N/A',
          provider: b.prestador?.name || 'N/A'
        }))
      };

      setSelectedEmployee(employee);
      setIsEmployeeModalOpen(true);
    } catch (error) {
      console.error('Error loading employee:', error);
      toast.error('Erro ao carregar dados do colaborador');
    }
  };

  return (
    <div className="relative w-full min-h-screen h-full flex flex-col">
      <div className="relative z-10 h-full flex flex-col">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 space-y-6 h-full flex flex-col min-h-0">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Gestão de Utilizadores
              </h1>
              <p className="text-muted-foreground">
                Gerir empresas, colaboradores e prestadores
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
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

            <TabsContent value="companies" className="mt-6">
              <AdminCompaniesTab 
                isAddCompanyModalOpen={isAddCompanyModalOpen}
                setIsAddCompanyModalOpen={setIsAddCompanyModalOpen}
              />
            </TabsContent>

            <TabsContent value="employees" className="mt-6">
              <AdminEmployeesTab 
                onEmployeeClick={handleEmployeeClick}
              />
            </TabsContent>

            <TabsContent value="providers" className="mt-6">
              <AdminProvidersTab 
                onAddProvider={() => setIsAddProviderModalOpen(true)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Employee Detail Modal */}
      <EmployeeDetailModal
        employee={selectedEmployee}
        open={isEmployeeModalOpen}
        onOpenChange={setIsEmployeeModalOpen}
      />

      {/* Add Company Modal */}
      <AddCompanyModal
        open={isAddCompanyModalOpen}
        onOpenChange={setIsAddCompanyModalOpen}
      />

      {/* Add Provider Modal */}
      <AddProviderModal
        open={isAddProviderModalOpen}
        onOpenChange={setIsAddProviderModalOpen}
      />
    </div>
  );
};

export default AdminUsersManagement;
