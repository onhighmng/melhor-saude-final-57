import { Home, Calendar, TrendingUp, BookOpen, MessageCircle, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'inicio', label: 'Início', icon: Home },
    { id: 'agendar', label: 'Agendar', icon: Calendar },
    { id: 'conversa', label: 'Conversa', icon: MessageCircle },
    { id: 'recursos', label: 'Recursos', icon: BookOpen },
    { id: 'definicoes', label: 'Definições', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200 safe-area-bottom z-50">
      <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
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