import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useState } from 'react';

export function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  // Calendar data - colored dots representing sessions
  const calendarData = {
    month: 'Novembro, 2025',
    year: 2025,
    monthShort: 'Nov 30, 2025',
    days: [
      { date: 1, sessions: [] },
      { date: 2, sessions: ['green', 'purple', 'orange'] },
      { date: 3, sessions: [] },
      { date: 4, sessions: ['orange', 'green', 'green'] },
      { date: 5, sessions: ['purple', 'orange', 'blue'] },
      { date: 6, sessions: ['blue'] },
      { date: 7, sessions: ['green', 'purple', 'gray'] },
      { date: 8, sessions: [] },
      { date: 9, sessions: [] },
      { date: 10, sessions: ['blue', 'green', 'purple'] },
      { date: 11, sessions: [] },
      { date: 12, sessions: ['orange', 'orange', 'blue'] },
      { date: 13, sessions: ['blue'] },
      { date: 14, sessions: ['purple', 'gray', 'orange'] },
      { date: 15, sessions: ['purple', 'orange', 'gray', 'gray'] },
      { date: 16, sessions: [] },
      { date: 17, sessions: [] },
      { date: 18, sessions: [] },
      { date: 19, sessions: ['orange', 'orange', 'green'] },
      { date: 20, sessions: ['purple', 'gray', 'gray'] },
      { date: 21, sessions: ['green', 'purple', 'orange'] },
      { date: 22, sessions: ['purple', 'orange', 'gray', 'gray', 'gray'] },
      { date: 23, sessions: [] },
      { date: 24, sessions: [] },
      { date: 25, sessions: [] },
      { date: 26, sessions: [] },
      { date: 27, sessions: [] },
      { date: 28, sessions: [] },
      { date: 29, sessions: [] },
      { date: 30, sessions: [] },
    ],
  };

  const getColorClass = (color: string) => {
    const colors: { [key: string]: string } = {
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      blue: 'bg-blue-500',
      gray: 'bg-gray-400',
    };
    return colors[color] || 'bg-gray-400';
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-3xl mb-1">Calendário</h1>
        <p className="text-gray-500 text-sm">Gerir sessões e disponibilidade</p>
      </div>

      {/* Calendar Card */}
      <div className="bg-white rounded-3xl p-4 shadow-sm">
        {/* Month Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
          <div>
            <div className="text-gray-400 text-xs mb-1">NOV</div>
            <div className="text-2xl">6</div>
            <div className="text-xs text-gray-500">Mon 06, 2025</div>
          </div>
          <div className="text-right">
            <div className="text-sm mb-1">{calendarData.month}</div>
            <div className="flex items-center gap-2 justify-end">
              <button className="text-gray-400 hover:text-gray-600">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-500">Today</span>
              <button className="text-gray-400 hover:text-gray-600">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <button className="text-sm text-gray-600 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Disponibilidade
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div key={day} className="text-center text-xs text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before month starts (assuming Nov 1 is on Saturday) */}
            {[...Array(6)].map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Actual calendar days */}
            {calendarData.days.map((day) => (
              <div
                key={day.date}
                className={`aspect-square flex flex-col items-center justify-center p-1 rounded-lg cursor-pointer transition-colors ${
                  selectedDate === day.date
                    ? 'bg-blue-50'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedDate(day.date)}
              >
                <div className="text-sm mb-1">{day.date}</div>
                {day.sessions.length > 0 && (
                  <div className="flex gap-0.5 flex-wrap justify-center">
                    {day.sessions.slice(0, 5).map((color, idx) => (
                      <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full ${getColorClass(color)}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Empty cells to complete the grid */}
            {[...Array(1)].map((_, i) => (
              <div key={`empty-end-${i}`} className="aspect-square" />
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="text-sm mb-3 text-gray-600">Tipos de Sessões</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-600">Saúde Mental</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-gray-600">Nutrição</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-gray-600">Fitness</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-600">Medicina</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span className="text-gray-600">Outros</span>
          </div>
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="mb-1">Sessões do Dia {selectedDate}</h3>
            <p className="text-sm text-gray-500">
              {calendarData.days[selectedDate - 1].sessions.length} sessões agendadas
            </p>
          </div>

          {calendarData.days[selectedDate - 1].sessions.length > 0 ? (
            <div className="space-y-2">
              {calendarData.days[selectedDate - 1].sessions.map((color, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                  <div className={`w-3 h-3 rounded-full ${getColorClass(color)}`} />
                  <div className="flex-1">
                    <div className="text-sm">Sessão {idx + 1}</div>
                    <div className="text-xs text-gray-500">
                      {color === 'green' && 'Saúde Mental'}
                      {color === 'purple' && 'Nutrição'}
                      {color === 'orange' && 'Fitness'}
                      {color === 'blue' && 'Medicina'}
                      {color === 'gray' && 'Outros'}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">{10 + idx}:00</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              Nenhuma sessão agendada
            </div>
          )}
        </div>
      )}
    </div>
  );
}