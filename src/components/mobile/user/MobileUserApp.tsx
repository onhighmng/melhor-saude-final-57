import { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionBalance } from '@/hooks/useSessionBalance';
import { useBookings } from '@/hooks/useBookings';
import { useMilestones } from '@/hooks/useMilestones';
import { ProgressCard } from './figma/ProgressCard';
import { SessionHistoryCard } from './figma/SessionHistoryCard';
import { ProgressChecklistCard } from './figma/ProgressChecklistCard';
import { UpcomingSessionsCard } from './figma/UpcomingSessionsCard';
import { AgendarPage } from './figma/AgendarPage';
import { PercursoPage } from './figma/PercursoPage';
import { RecursosPage } from './figma/RecursosPage';
import { ChatPage } from './figma/ChatPage';
import { SettingsPage } from './figma/SettingsPage';
import { BottomNav } from './figma/BottomNav';

type AppView = 'inicio' | 'agendar' | 'conversa' | 'percurso' | 'recursos' | 'definicoes';
type Pillar = 'mental-health' | 'physical-wellness' | 'financial-assistance' | 'legal-assistance';

export function MobileUserApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const { sessionBalance } = useSessionBalance();
  const { upcomingBookings, allBookings } = useBookings();
  const { milestones, progress } = useMilestones();

  const [activeTab, setActiveTab] = useState<AppView>('inicio');
  const [currentView, setCurrentView] = useState<AppView>('inicio');

  // Map router paths to Figma internal tab states
  useEffect(() => {
    const pathToTab: Record<string, AppView> = {
      '/user/dashboard': 'inicio',
      '/user/book': 'agendar',
      '/user/chat': 'conversa',
      '/user/resources': 'recursos',
      '/user/settings': 'definicoes',
      '/user/sessions': 'percurso',
    };

    const tab = pathToTab[location.pathname];
    if (tab) {
      setActiveTab(tab);
      setCurrentView(tab);
    }
  }, [location.pathname]);

  // Handle tab changes from Figma BottomNav
  const handleTabChange = (tab: string) => {
    const tabToPath: Record<string, string> = {
      'inicio': '/user/dashboard',
      'agendar': '/user/book',
      'conversa': '/user/chat',
      'recursos': '/user/resources',
      'definicoes': '/user/settings',
      'percurso': '/user/sessions',
    };

    const path = tabToPath[tab];
    if (path) {
      navigate(path);
    }
  };

  // Show Agendar page when that tab is active
  if (activeTab === 'agendar' || currentView === 'agendar') {
    return (
      <>
        <AgendarPage
          onBack={() => navigate('/user/dashboard')}
          onSelectPillar={(pillar) => {
            // Navigate to booking flow with pillar selected
            navigate(`/user/book?pillar=${pillar}`);
          }}
        />
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </>
    );
  }

  // Show Percurso page when that tab is active
  if (activeTab === 'percurso') {
    return (
      <>
        <PercursoPage />
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </>
    );
  }

  // Show Recursos page when that tab is active
  if (activeTab === 'recursos') {
    return (
      <>
        <RecursosPage />
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </>
    );
  }

  // Show Chat page when that tab is active
  if (activeTab === 'conversa') {
    return (
      <>
        <ChatPage />
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </>
    );
  }

  // Show Settings page when that tab is active
  if (activeTab === 'definicoes') {
    return (
      <>
        <SettingsPage />
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </>
    );
  }

  // Default: Show Dashboard (Inicio)
  const completedSessionsCount = allBookings.filter(b => b.status === 'completed').length;
  const remainingSessions = sessionBalance?.totalRemaining || 0;
  const totalSessions = (sessionBalance?.company || 0) + (sessionBalance?.personal || 0);
  const usedSessions = totalSessions - remainingSessions;
  const usagePercent = totalSessions > 0 ? Math.round((usedSessions / totalSessions) * 100) : 0;

  return (
    <div className="min-h-screen bg-blue-100 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40 backdrop-blur-xl bg-white/90">
        <div className="max-w-md mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900 text-2xl font-bold">
                Olá, {profile?.full_name?.split(' ')[0] || 'Utilizador'}! 👋
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Bem-vindo ao seu espaço de saúde e bem-estar.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-5 py-6 space-y-5">
        {/* 1. Sessões Completas and Falar com Especialista */}
        <ProgressCard 
          onStartConsultation={() => navigate('/user/book')}
          completedSessions={completedSessionsCount}
          totalSessions={totalSessions}
          usagePercent={usagePercent}
        />

        {/* 2. Progresso Pessoal */}
        <ProgressChecklistCard 
          milestones={milestones}
          progress={progress}
        />

        {/* 3. Próximas Sessões */}
        <UpcomingSessionsCard 
          upcomingBookings={upcomingBookings}
          onViewSessions={() => navigate('/user/sessions')}
        />

        {/* 4. Recursos */}
        <SessionHistoryCard imageUrl="https://images.unsplash.com/photo-1744648525155-5ff1f8373766?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjB3YWxraW5nJTIwc3Vuc2V0JTIwdGhlcmFweXxlbnwxfHx8fDE3NjIzNDcxMTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" />

        {/* Call Button - Last Element */}
        <button 
          onClick={() => navigate('/user/chat')}
          className="w-full bg-blue-600 text-white rounded-full py-3 px-5 flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform mb-6"
        >
          <Phone className="w-5 h-5" />
          Solicitar Chamada
        </button>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}

