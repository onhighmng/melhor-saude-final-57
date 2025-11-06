import { useState } from 'react';
import { SpecialistDashboard } from './components/specialist/SpecialistDashboard';
import { SpecialistCalendar } from './components/specialist/SpecialistCalendar';
import { SessionsPage } from './components/specialist/SessionsPage';
import { PerformancePage } from './components/specialist/PerformancePage';
import { SettingsPage } from './components/specialist/SettingsPage';
import { Home, Calendar, ClipboardList, BarChart3, Settings } from 'lucide-react';

export default function SpecialistApp() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'sessions' | 'performance' | 'settings'>('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Content */}
      <div className="pb-20">
        {activeTab === 'dashboard' && <SpecialistDashboard />}
        {activeTab === 'calendar' && <SpecialistCalendar />}
        {activeTab === 'sessions' && <SessionsPage />}
        {activeTab === 'performance' && <PerformancePage />}
        {activeTab === 'settings' && <SettingsPage />}
      </div>

      {/* iOS-style Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 safe-area-pb">
        <div className="max-w-md mx-auto px-1 py-2">
          <div className="flex justify-around items-center">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all ${
                activeTab === 'dashboard'
                  ? 'text-blue-600'
                  : 'text-slate-500'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs">Início</span>
            </button>
            
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all ${
                activeTab === 'calendar'
                  ? 'text-blue-600'
                  : 'text-slate-500'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-xs">Calendário</span>
            </button>
            
            <button
              onClick={() => setActiveTab('sessions')}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all ${
                activeTab === 'sessions'
                  ? 'text-blue-600'
                  : 'text-slate-500'
              }`}
            >
              <ClipboardList className="w-5 h-5" />
              <span className="text-xs">Sessões</span>
            </button>
            
            <button
              onClick={() => setActiveTab('performance')}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all ${
                activeTab === 'performance'
                  ? 'text-blue-600'
                  : 'text-slate-500'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-xs">Desempenho</span>
            </button>
            
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all ${
                activeTab === 'settings'
                  ? 'text-blue-600'
                  : 'text-slate-500'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-xs">Configurar</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
