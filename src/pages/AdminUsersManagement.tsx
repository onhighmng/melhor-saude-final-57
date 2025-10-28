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

  const handleEmployeeClick = (employeeId: number) => {
    // Mock employee data - in real app would fetch from API
    const mockEmployees = [
      {
        id: 1,
        name: "João Silva",
        email: "joao@techcorp.pt",
        company: "TechCorp Lda",
        sessions: { used: 5, total: 10 },
        rating: 4.8,
        objectives: ["Gestão de ansiedade", "Questões contratuais"],
        sessionHistory: [
          { date: "15/01/2025", category: "Saúde Mental", provider: "Dra. Maria Santos" }
        ]
      },
      {
        id: 2,
        name: "Maria Santos",
        email: "maria@healthplus.pt",
        company: "HealthPlus SA",
        sessions: { used: 3, total: 8 },
        rating: 4.5,
        objectives: ["Gestão de ansiedade", "Questões contratuais"],
        sessionHistory: [
          { date: "15/01/2025", category: "Saúde Mental", provider: "Dra. Maria Santos" }
        ]
      },
      {
        id: 3,
        name: "Pedro Costa",
        email: "pedro@startup.pt",
        company: "StartupHub",
        sessions: { used: 2, total: 5 },
        rating: 4.7,
        objectives: ["Gestão de ansiedade", "Questões contratuais"],
        sessionHistory: [
          { date: "15/01/2025", category: "Saúde Mental", provider: "Dra. Maria Santos" }
        ]
      },
      {
        id: 4,
        name: "Ana Pereira",
        email: "ana@consultpro.pt",
        company: "ConsultPro",
        sessions: { used: 7, total: 12 },
        rating: 4.9,
        objectives: ["Gestão de ansiedade", "Questões contratuais"],
        sessionHistory: [
          { date: "15/01/2025", category: "Saúde Mental", provider: "Dra. Maria Santos" }
        ]
      }
    ];

    const employee = mockEmployees.find(emp => emp.id === employeeId);
    if (employee) {
      setSelectedEmployee(employee);
      setIsEmployeeModalOpen(true);
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
          <RuixenSection 
            onAddCompany={() => setIsAddCompanyModalOpen(true)}
            onAddProvider={() => setIsAddProviderModalOpen(true)}
            onTabChange={handleTabChange}
            onEmployeeClick={handleEmployeeClick}
          />

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
