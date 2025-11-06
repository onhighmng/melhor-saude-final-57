import React, { useState } from 'react';
import { TrendingUp, Phone, Calendar, Users, BarChart3, Package, User } from 'lucide-react';
import DesktopCalls from './desktop-calls';
import DesktopSessions from './desktop-sessions';

type PageType = 'dashboard' | 'calls' | 'sessions' | 'history' | 'stats' | 'products';

export default function DesktopLayout() {
  const [currentPage, setCurrentPage] = useState<PageType>('calls');

  const navItems = [
    { id: 'dashboard' as PageType, label: 'Dashboard', icon: TrendingUp },
    { id: 'calls' as PageType, label: 'Chamadas de Triagem', icon: Phone },
    { id: 'sessions' as PageType, label: 'Sessões Agendadas', icon: Calendar },
    { id: 'history' as PageType, label: 'Histórial de Utilizadores', icon: Users },
    { id: 'stats' as PageType, label: 'Estatísticas', icon: BarChart3 },
    { id: 'products' as PageType, label: 'Produtivos', icon: Package },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo/Profile Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Profissional</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-8">
          {currentPage === 'calls' && <DesktopCalls />}
          {currentPage === 'sessions' && <DesktopSessions />}
          {currentPage === 'dashboard' && (
            <div>
              <h1 className="mb-2">Dashboard</h1>
              <p className="text-gray-600">Visão geral das atividades</p>
            </div>
          )}
          {currentPage === 'history' && (
            <div>
              <h1 className="mb-2">Histórial de Utilizadores</h1>
              <p className="text-gray-600">Histórico de interações com utilizadores</p>
            </div>
          )}
          {currentPage === 'stats' && (
            <div>
              <h1 className="mb-2">Estatísticas</h1>
              <p className="text-gray-600">Métricas e análises de desempenho</p>
            </div>
          )}
          {currentPage === 'products' && (
            <div>
              <h1 className="mb-2">Produtivos</h1>
              <p className="text-gray-600">Gestão de produtos e serviços</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
