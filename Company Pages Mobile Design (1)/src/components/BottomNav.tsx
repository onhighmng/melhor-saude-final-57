import { LayoutGrid, Calendar, CalendarDays, BookOpen, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: 'dashboard' | 'calendario' | 'sessoes' | 'recursos' | 'desempenho') => void;
}

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: 'dashboard', icon: LayoutGrid, label: 'Início' },
    { id: 'calendario', icon: Calendar, label: 'Calendário' },
    { id: 'sessoes', icon: CalendarDays, label: 'Sessões' },
    { id: 'recursos', icon: BookOpen, label: 'Recursos' },
    { id: 'desempenho', icon: TrendingUp, label: 'Desempenho' },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-w-md mx-auto safe-area-bottom">
      <div className="grid grid-cols-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id as any)}
              className="flex flex-col items-center justify-center py-2 px-1 relative"
              whileTap={{ scale: 0.9 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon 
                className={`w-6 h-6 mb-1 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400'}`}
              />
              <span className={`text-xs transition-colors ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}