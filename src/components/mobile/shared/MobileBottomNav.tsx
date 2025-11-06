import { Home, Calendar, MessageCircle, BookOpen, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface MobileBottomNavProps {
  userType?: 'user' | 'company' | 'specialist' | 'admin' | 'prestador';
}

export function MobileBottomNav({ userType = 'user' }: MobileBottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();

  // Define tabs based on user type
  const getUserTabs = () => {
    switch (userType) {
      case 'user':
        return [
          { id: 'dashboard', label: 'Início', icon: Home, path: '/user/dashboard' },
          { id: 'book', label: 'Agendar', icon: Calendar, path: '/user/book' },
          { id: 'chat', label: 'Conversa', icon: MessageCircle, path: '/user/chat' },
          { id: 'resources', label: 'Recursos', icon: BookOpen, path: '/user/resources' },
          { id: 'settings', label: 'Definições', icon: Settings, path: '/user/settings' },
        ];
      case 'company':
        return [
          { id: 'dashboard', label: 'Início', icon: Home, path: '/company/dashboard' },
          { id: 'sessions', label: 'Sessões', icon: Calendar, path: '/company/sessions' },
          { id: 'employees', label: 'Equipa', icon: MessageCircle, path: '/company/colaboradores' },
          { id: 'resources', label: 'Recursos', icon: BookOpen, path: '/company/recursos' },
          { id: 'reports', label: 'Relatórios', icon: Settings, path: '/company/relatorios' },
        ];
      case 'specialist':
      case 'prestador':
        return [
          { id: 'dashboard', label: 'Início', icon: Home, path: '/especialista/dashboard' },
          { id: 'sessions', label: 'Sessões', icon: Calendar, path: '/especialista/sessions' },
          { id: 'clients', label: 'Clientes', icon: MessageCircle, path: '/especialista/user-history' },
          { id: 'stats', label: 'Estatísticas', icon: BookOpen, path: '/especialista/stats' },
          { id: 'settings', label: 'Definições', icon: Settings, path: '/especialista/settings' },
        ];
      case 'admin':
        return [
          { id: 'dashboard', label: 'Início', icon: Home, path: '/admin/dashboard' },
          { id: 'users', label: 'Utilizadores', icon: Calendar, path: '/admin/users-management' },
          { id: 'sessions', label: 'Sessões', icon: MessageCircle, path: '/admin/operations' },
          { id: 'companies', label: 'Empresas', icon: BookOpen, path: '/admin/companies' },
          { id: 'settings', label: 'Definições', icon: Settings, path: '/admin/settings' },
        ];
      default:
        return [];
    }
  };

  const tabs = getUserTabs();
  const currentPath = location.pathname;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200 safe-area-bottom z-50 md:hidden">
      <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentPath.startsWith(tab.path);
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center justify-center gap-1 px-4 py-1 min-w-0 flex-1"
            >
              <div className={`transition-all ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : 'scale-100'} transition-transform`} />
              </div>
              <span className={`text-[10px] transition-colors ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

