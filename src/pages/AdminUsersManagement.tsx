import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, UserCog } from 'lucide-react';
import { AdminCompaniesTab } from '@/components/admin/AdminCompaniesTab';
import { AdminEmployeesTab } from '@/components/admin/AdminEmployeesTab';
import { AdminProvidersTab } from '@/components/admin/AdminProvidersTab';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';

const AdminUsersManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('companies');

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

  return (
    <div className="relative w-full min-h-screen h-full flex flex-col">
      <div className="relative z-10 h-full flex flex-col">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 space-y-4 h-full flex flex-col min-h-0">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Gestão de Utilizadores
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerir empresas, colaboradores e prestadores da plataforma
            </p>
          </div>

          {/* Bento Grid Layout - Tab Navigation */}
          <div className="space-y-6">
            <BentoGrid className="grid-rows-1 auto-rows-[80px]">
              <BentoCard 
                name="Empresas" 
                description="Gerir empresas e códigos" 
                Icon={Building2} 
                onClick={() => handleTabChange('companies')} 
                className={`col-span-1 ${activeTab === 'companies' ? 'ring-2 ring-blue-500' : ''}`}
                background={<div className={`absolute inset-0 bg-gradient-to-br ${activeTab === 'companies' ? 'from-blue-100 to-blue-200' : 'from-blue-50 to-blue-100'}`} />}
                iconColor="text-blue-600"
                textColor="text-gray-900"
                descriptionColor="text-gray-600"
                href="#"
                cta="Gerir"
              />

              <BentoCard 
                name="Colaboradores" 
                description="Gerir utilizadores" 
                Icon={Users} 
                onClick={() => handleTabChange('employees')} 
                className={`col-span-1 ${activeTab === 'employees' ? 'ring-2 ring-green-500' : ''}`}
                background={<div className={`absolute inset-0 bg-gradient-to-br ${activeTab === 'employees' ? 'from-green-100 to-green-200' : 'from-green-50 to-green-100'}`} />}
                iconColor="text-green-600"
                textColor="text-gray-900"
                descriptionColor="text-gray-600"
                href="#"
                cta="Gerir"
              />

              <BentoCard 
                name="Prestadores" 
                description="Gerir especialistas" 
                Icon={UserCog} 
                onClick={() => handleTabChange('providers')} 
                className={`col-span-1 ${activeTab === 'providers' ? 'ring-2 ring-purple-500' : ''}`}
                background={<div className={`absolute inset-0 bg-gradient-to-br ${activeTab === 'providers' ? 'from-purple-100 to-purple-200' : 'from-purple-50 to-purple-100'}`} />}
                iconColor="text-purple-600"
                textColor="text-gray-900"
                descriptionColor="text-gray-600"
                href="#"
                cta="Gerir"
              />
            </BentoGrid>

            {/* Content Area */}
            <div className="mt-6">
              {activeTab === 'companies' && <AdminCompaniesTab />}
              {activeTab === 'employees' && <AdminEmployeesTab />}
              {activeTab === 'providers' && <AdminProvidersTab />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersManagement;
