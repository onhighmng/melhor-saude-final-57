import React, { useState } from 'react';
import { Phone, Calendar as CalendarIcon, TrendingUp, User, ChevronLeft, ChevronRight, Users, BarChart3, Settings } from 'lucide-react';
import { Button } from '../components/ui/button';

interface SessionsProps {
  onNavigate: (view: 'dashboard' | 'calls' | 'sessions' | 'history' | 'stats' | 'settings') => void;
}

export default function Sessions({ onNavigate }: SessionsProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 6)); // November 6, 2025

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const sessions = {
    2: [{ color: 'bg-orange-500', type: 'session' }],
    3: [{ color: 'bg-blue-500', type: 'session' }],
    4: [{ color: 'bg-purple-500', type: 'session' }, { color: 'bg-green-500', type: 'session' }],
    5: [{ color: 'bg-orange-500', type: 'session' }, { color: 'bg-blue-500', type: 'session' }],
    6: [{ color: 'bg-blue-500', type: 'session' }, { color: 'bg-blue-500', type: 'session' }, { color: 'bg-purple-500', type: 'session' }],
    7: [{ color: 'bg-orange-500', type: 'session' }, { color: 'bg-green-500', type: 'session' }],
    8: [{ color: 'bg-orange-500', type: 'session' }, { color: 'bg-blue-500', type: 'session' }],
    9: [{ color: 'bg-green-500', type: 'session' }],
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days in the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* iOS-style Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 pt-12 pb-4">
          <div className="flex items-center justify-between mb-2">
            <button className="p-2 -ml-2">
              <ChevronLeft className="w-6 h-6 text-blue-600" />
            </button>
            <h1 className="text-center flex-1">Calendário Pessoal</h1>
            <div className="w-10"></div>
          </div>
          <p className="text-center text-gray-500 text-sm">
            Sessões futuras e passadas com tipo e estado
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24">
        {/* Calendar Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Month/Year Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h2>{monthNames[currentDate.getMonth()]}, {currentDate.getFullYear()}</h2>
              <p className="text-sm text-gray-600">
                Dom, 5 de Nov - Sáb, 10 de Nov, 2025
              </p>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center text-sm text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, index) => (
                <div
                  key={index}
                  className="aspect-square flex flex-col items-center justify-center relative"
                >
                  {day && (
                    <>
                      <span className={`text-sm mb-1 ${day === 6 ? 'text-blue-600' : 'text-gray-900'}`}>
                        {day}
                      </span>
                      {sessions[day] && (
                        <div className="flex gap-1 absolute bottom-1">
                          {sessions[day].map((session, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${session.color}`}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Today Button */}
          <div className="p-4 border-t border-gray-200 flex justify-center">
            <Button variant="outline" className="rounded-full px-6">
              Today
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <h3 className="text-sm mb-3">Tipo de Sessões</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Saúde Mental</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Financeira</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Jurídica</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Bem-Estar</span>
            </div>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm">Disponibilidade</h3>
              <p className="text-xs text-gray-600 mt-1">Aceitar novas sessões agendadas</p>
            </div>
            <div className="relative inline-block w-12 h-7">
              <input type="checkbox" id="availability" className="peer sr-only" defaultChecked />
              <label 
                htmlFor="availability" 
                className="block h-full cursor-pointer rounded-full bg-gray-300 peer-checked:bg-green-500 transition-colors"
              ></label>
              <div className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5"></div>
            </div>
          </div>
        </div>
      </div>

      {/* iOS-style Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="grid grid-cols-6 px-2 py-2">
          <button className="flex flex-col items-center gap-1 py-2 text-gray-400" onClick={() => onNavigate('dashboard')}>
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs">Dashboard</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2 text-gray-400" onClick={() => onNavigate('calls')}>
            <Phone className="w-5 h-5" />
            <span className="text-xs">Chamadas</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2 text-blue-600">
            <CalendarIcon className="w-5 h-5" />
            <span className="text-xs">Sessões</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2 text-gray-400" onClick={() => onNavigate('history')}>
            <Users className="w-5 h-5" />
            <span className="text-xs">Histórico</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2 text-gray-400" onClick={() => onNavigate('stats')}>
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs">Stats</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2 text-gray-400" onClick={() => onNavigate('settings')}>
            <Settings className="w-5 h-5" />
            <span className="text-xs">Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
}