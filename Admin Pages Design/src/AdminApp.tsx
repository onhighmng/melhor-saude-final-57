import { useState } from 'react';
import { AdminSessions } from './components/admin/AdminSessions';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminTeam } from './components/admin/AdminTeam';
import { AdminResources } from './components/admin/AdminResources';
import { AdminReports } from './components/admin/AdminReports';
import { LayoutDashboard, Users, Calendar, BookOpen, FileText } from 'lucide-react';

export default function AdminApp() {
  const [currentTab, setCurrentTab] = useState('sessions');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'team', label: 'Equipa', icon: Users },
    { id: 'sessions', label: 'Sessões', icon: Calendar },
    { id: 'resources', label: 'Recursos', icon: BookOpen },
    { id: 'reports', label: 'Relatórios', icon: FileText },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {currentTab === 'dashboard' && <AdminDashboard />}
        {currentTab === 'team' && <AdminTeam />}
        {currentTab === 'sessions' && <AdminSessions />}
        {currentTab === 'resources' && <AdminResources />}
        {currentTab === 'reports' && <AdminReports />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex flex-col items-center gap-1 px-3 py-1 min-w-0 flex-1 transition-colors ${
                  isActive ? 'text-blue-500' : 'text-gray-400'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs truncate w-full text-center">{tab.label}</span>
                {isActive && (
                  <div className="w-8 h-1 bg-blue-500 rounded-full mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
