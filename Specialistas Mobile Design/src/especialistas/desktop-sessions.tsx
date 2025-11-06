import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function DesktopSessions() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 6)); // November 6, 2025

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const sessions = {
    2: [{ color: 'bg-orange-500' }],
    3: [{ color: 'bg-blue-500' }],
    4: [{ color: 'bg-purple-500' }, { color: 'bg-green-500' }],
    5: [{ color: 'bg-orange-500' }, { color: 'bg-blue-500' }],
    6: [{ color: 'bg-blue-500' }, { color: 'bg-blue-500' }, { color: 'bg-purple-500' }],
    7: [{ color: 'bg-orange-500' }, { color: 'bg-green-500' }],
    8: [{ color: 'bg-orange-500' }, { color: 'bg-blue-500' }],
    9: [{ color: 'bg-green-500' }],
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const days = getDaysInMonth(currentDate);

  const formatDateRange = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const formatDay = (date: Date) => {
      const day = date.getDate();
      const monthShort = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][date.getMonth()];
      return `${day} de ${monthShort}`;
    };

    const dayName = daysOfWeek[startOfWeek.getDay()];
    const endDayName = daysOfWeek[endOfWeek.getDay()];

    return `${dayName}, ${formatDay(startOfWeek)} - ${endDayName}, ${formatDay(endOfWeek)}, ${currentDate.getFullYear()}`;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2">Calendário Pessoal</h1>
        <p className="text-gray-600">
          Sessões futuras e passadas com tipo e estado
        </p>
      </div>

      {/* Calendar Card */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Calendar Navigation */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 text-white rounded-lg px-4 py-3 text-center min-w-[60px]">
              <div className="text-xs uppercase tracking-wide">NOV</div>
              <div className="text-2xl font-semibold mt-1">6</div>
            </div>
            <div>
              <h2 className="mb-1">{monthNames[currentDate.getMonth()]}, {currentDate.getFullYear()}</h2>
              <p className="text-sm text-gray-600">
                {formatDateRange()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="px-6"
            >
              Today
            </Button>
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <ChevronRight className="w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="ml-4"
            >
              Disponibilidade
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-4 mb-4">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center text-sm text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-4">
            {days.map((day, index) => (
              <div
                key={index}
                className={`aspect-square border border-gray-200 rounded-lg p-3 flex flex-col ${
                  day === 6 ? 'bg-blue-50 border-blue-300' : 'bg-white'
                }`}
              >
                {day && (
                  <>
                    <span className={`text-sm mb-auto ${day === 6 ? 'text-blue-600' : 'text-gray-900'}`}>
                      {day}
                    </span>
                    {sessions[day] && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {sessions[day].map((session, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 rounded-full ${session.color}`}
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
      </div>
    </div>
  );
}
