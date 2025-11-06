import { useState } from 'react';
import { CompanyDashboard } from './components/company/CompanyDashboard';
import { EmployeeManagement } from './components/company/EmployeeManagement';
import { SessionsPage } from './components/company/SessionsPage';
import { ResourcesPage } from './components/company/ResourcesPage';
import { ReportsPage } from './components/company/ReportsPage';
import { LayoutDashboard, Users, Calendar, BookOpen, FileBarChart } from 'lucide-react';

export default function CompanyApp() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'sessions' | 'resources' | 'reports'>('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Content */}
      <div className="pb-20">
        {activeTab === 'dashboard' && <CompanyDashboard />}
        {activeTab === 'employees' && <EmployeeManagement />}
        {activeTab === 'sessions' && <SessionsPage />}
        {activeTab === 'resources' && <ResourcesPage />}
        {activeTab === 'reports' && <ReportsPage />}
      </div>

      {/* iOS-style Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 safe-area-pb">
        <div className="max-w-md mx-auto px-2 py-2">
          <div className="flex justify-around items-center">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all ${
                activeTab === 'dashboard'
                  ? 'text-blue-600'
                  : 'text-slate-500'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-xs">Dashboard</span>
            </button>
            
            <button
              onClick={() => setActiveTab('employees')}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all ${
                activeTab === 'employees'
                  ? 'text-blue-600'
                  : 'text-slate-500'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-xs">Equipa</span>
            </button>
            
            <button
              onClick={() => setActiveTab('sessions')}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all ${
                activeTab === 'sessions'
                  ? 'text-blue-600'
                  : 'text-slate-500'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-xs">Sessões</span>
            </button>
            
            <button
              onClick={() => setActiveTab('resources')}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all ${
                activeTab === 'resources'
                  ? 'text-blue-600'
                  : 'text-slate-500'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-xs">Recursos</span>
            </button>
            
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all ${
                activeTab === 'reports'
                  ? 'text-blue-600'
                  : 'text-slate-500'
              }`}
            >
              <FileBarChart className="w-5 h-5" />
              <span className="text-xs">Relatórios</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
