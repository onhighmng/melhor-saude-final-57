import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, UserCog } from 'lucide-react';
import { AdminCompaniesTab } from '@/components/admin/AdminCompaniesTab';
import { AdminEmployeesTab } from '@/components/admin/AdminEmployeesTab';
import { AdminProvidersTab } from '@/components/admin/AdminProvidersTab';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import FeaturedSectionStats from '@/components/ui/featured-section-stats';
import RuixenSection from '@/components/ui/ruixen-feature-section';
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
          user:profiles(id, name, email, avatar_url),
          company:companies(id, company_name)
        `)
        .eq('id', employeeId)
        .single();

      if (error) throw error;
      if (!employeeData) return;

      // Get bookings for this employee
      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          *,
          prestador:prestadores(id, name, photo_url),
          pillar:pillars(id, name)
        `)
        .eq('user_id', employeeData.user_id)
        .order('scheduled_for', { ascending: false })
        .limit(10);

      // Get feedback ratings
      const { data: feedback } = await supabase
        .from('session_feedback')
        .select('rating')
        .in('booking_id', bookings?.map(b => b.id) || []);

      const avgRating = feedback?.length
        ? feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.length
        : 0;

      // Transform to modal format
      const employee = {
        id: employeeData.id,
        name: employeeData.user?.name || 'Unknown',
        email: employeeData.user?.email || '',
        company: employeeData.company?.company_name || '',
        sessions: {
          used: employeeData.sessions_used || 0,
          total: employeeData.sessions_allocated || 0
        },
        rating: Math.round(avgRating * 10) / 10,
        objectives: employeeData.onboarding_goals || [],
        sessionHistory: (bookings || []).map(b => ({
          date: new Date(b.scheduled_for).toLocaleDateString('pt-PT'),
          category: b.pillar?.name || 'N/A',
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

  const userStats = [
    { value: "150+", label: "Empresas Ativas" },
    { value: "5,000+", label: "Colaboradores" },
    { value: "200+", label: "Prestadores" },
    { value: "98%", label: "Taxa de Satisfação" },
  ];

  const chartData = [
    { name: "Jan", value: 850 },
    { name: "Fev", value: 1200 },
    { name: "Mar", value: 1800 },
    { name: "Abr", value: 2400 },
    { name: "Mai", value: 3200 },
    { name: "Jun", value: 4100 },
    { name: "Jul", value: 5000 },
  ];

  return (
    <div className="relative w-full min-h-screen h-full flex flex-col">
      <div className="relative z-10 h-full flex flex-col">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 space-y-6 h-full flex flex-col min-h-0">
          {/* Feature Section */}
          <RuixenSection />

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
