import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, MessageSquare } from 'lucide-react';
import AdminSessionsTab from '@/components/admin/AdminSessionsTab';
import AdminSpecialistTab from '@/components/admin/AdminSpecialistTab';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const AdminOperations = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('sessions');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['sessions', 'specialist'].includes(tab)) {
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
              Operações
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerir sessões e profissional de permanencia
            </p>
          </div>

          {/* Bento Grid Layout - Tab Navigation */}
          <div className="space-y-6">
            <BentoGrid className="grid-rows-1 auto-rows-[80px] grid-cols-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <BentoCard 
                name="Sessões Agendadas" 
                description="Gerir sessões e agendamentos" 
                Icon={ClipboardList} 
                onClick={() => handleTabChange('sessions')} 
                className={`col-span-1 ${activeTab === 'sessions' ? 'ring-2 ring-yellow-400' : ''}`}
                background={<div className={`absolute inset-0 bg-gradient-to-br ${activeTab === 'sessions' ? 'from-yellow-50 to-yellow-100' : 'from-yellow-50/50 to-yellow-50'}`} />}
                iconColor="text-yellow-600"
                textColor="text-gray-900"
                descriptionColor="text-gray-600"
                href="#"
                cta=""
              />

              <BentoCard 
                name="Profissional de Permanencia" 
                description="Gerir profissional de permanencia" 
                Icon={MessageSquare} 
                onClick={() => handleTabChange('specialist')} 
                className={`col-span-1 ${activeTab === 'specialist' ? 'ring-2 ring-blue-400' : ''}`}
                background={<div className={`absolute inset-0 bg-gradient-to-br ${activeTab === 'specialist' ? 'from-blue-200 to-blue-300' : 'from-blue-100 to-blue-200'}`} />}
                iconColor="text-blue-600"
                textColor="text-gray-900"
                descriptionColor="text-gray-600"
                href="#"
                cta=""
              />
            </BentoGrid>

            {/* Content Area */}
            <div className="mt-6">
              {activeTab === 'sessions' && (
                <div className="p-6 bg-white rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">Sessões Agendadas</h3>
                  <p className="text-gray-600">Nenhuma sessão encontrada. Adicione dados através do painel de administração.</p>
                </div>
              )}
              {activeTab === 'specialist' && (
                <div className="p-6 bg-white rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">Profissional de Permanência</h3>
                  <p className="text-gray-600">Nenhum caso encontrado. Os casos aparecerão aqui quando houver dados.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOperations;
