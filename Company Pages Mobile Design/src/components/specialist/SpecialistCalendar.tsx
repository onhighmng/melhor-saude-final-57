import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Link2, Calendar, Video, X } from 'lucide-react';

interface Session {
  id: string;
  time: string;
  patientName: string;
  platform: 'Zoom' | 'Teams' | 'Google Meet';
  status: 'scheduled' | 'completed' | 'cancelled';
  type: string;
  hasLink: boolean;
}

export function SpecialistCalendar() {
  const [currentMonth] = useState('Novembro, 2025');
  const [currentWeek] = useState('Dez 1, 2025 - Nov 30, 2025');
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock sessions data for different dates
  const sessionsData: Record<number, Session[]> = {
    2: [
      { id: '1', time: '09:00', patientName: 'Ana Costa', platform: 'Zoom', status: 'scheduled', type: 'Terapia Individual', hasLink: true },
      { id: '2', time: '11:00', patientName: 'João Silva', platform: 'Teams', status: 'scheduled', type: 'Consulta', hasLink: false },
      { id: '3', time: '14:30', patientName: 'Maria Santos', platform: 'Google Meet', status: 'scheduled', type: 'Acompanhamento', hasLink: true },
    ],
    3: [
      { id: '4', time: '10:00', patientName: 'Pedro Almeida', platform: 'Zoom', status: 'scheduled', type: 'Terapia Individual', hasLink: true },
      { id: '5', time: '13:00', patientName: 'Sofia Rodrigues', platform: 'Teams', status: 'scheduled', type: 'Consulta', hasLink: true },
      { id: '6', time: '16:00', patientName: 'Carlos Pereira', platform: 'Zoom', status: 'scheduled', type: 'Terapia Familiar', hasLink: false },
    ],
    4: [
      { id: '7', time: '09:30', patientName: 'Beatriz Lima', platform: 'Google Meet', status: 'scheduled', type: 'Avaliação', hasLink: true },
      { id: '8', time: '12:00', patientName: 'Ricardo Costa', platform: 'Zoom', status: 'scheduled', type: 'Terapia Individual', hasLink: true },
      { id: '9', time: '15:00', patientName: 'Inês Ferreira', platform: 'Teams', status: 'scheduled', type: 'Consulta', hasLink: false },
    ],
    5: [
      { id: '10', time: '08:00', patientName: 'Miguel Sousa', platform: 'Zoom', status: 'scheduled', type: 'Terapia Individual', hasLink: true },
      { id: '11', time: '11:30', patientName: 'Laura Martins', platform: 'Google Meet', status: 'scheduled', type: 'Acompanhamento', hasLink: true },
    ],
    6: [
      { id: '12', time: '09:00', patientName: 'Tiago Nunes', platform: 'Teams', status: 'scheduled', type: 'Consulta', hasLink: false },
      { id: '13', time: '10:30', patientName: 'Catarina Dias', platform: 'Zoom', status: 'scheduled', type: 'Terapia Individual', hasLink: true },
      { id: '14', time: '14:00', patientName: 'Francisco Gomes', platform: 'Google Meet', status: 'scheduled', type: 'Avaliação', hasLink: true },
      { id: '15', time: '16:30', patientName: 'Mariana Lopes', platform: 'Zoom', status: 'scheduled', type: 'Terapia Familiar', hasLink: false },
    ],
    7: [
      { id: '16', time: '09:00', patientName: 'Luís Carvalho', platform: 'Google Meet', status: 'scheduled', type: 'Terapia Individual', hasLink: true },
      { id: '17', time: '13:00', patientName: 'Teresa Pinto', platform: 'Teams', status: 'scheduled', type: 'Consulta', hasLink: true },
      { id: '18', time: '15:30', patientName: 'André Oliveira', platform: 'Zoom', status: 'scheduled', type: 'Acompanhamento', hasLink: false },
    ],
    8: [
      { id: '19', time: '08:30', patientName: 'Rita Fonseca', platform: 'Zoom', status: 'scheduled', type: 'Avaliação', hasLink: true },
      { id: '20', time: '10:00', patientName: 'Hugo Mendes', platform: 'Google Meet', status: 'scheduled', type: 'Terapia Individual', hasLink: true },
      { id: '21', time: '14:00', patientName: 'Joana Correia', platform: 'Teams', status: 'scheduled', type: 'Consulta', hasLink: false },
      { id: '22', time: '16:00', patientName: 'Nuno Ramos', platform: 'Zoom', status: 'scheduled', type: 'Terapia Familiar', hasLink: true },
    ],
    11: [
      { id: '23', time: '09:30', patientName: 'Paula Ribeiro', platform: 'Zoom', status: 'scheduled', type: 'Terapia Individual', hasLink: true },
      { id: '24', time: '12:00', patientName: 'Rui Barbosa', platform: 'Google Meet', status: 'scheduled', type: 'Consulta', hasLink: true },
      { id: '25', time: '15:00', patientName: 'Sandra Moreira', platform: 'Teams', status: 'scheduled', type: 'Acompanhamento', hasLink: false },
    ],
    12: [
      { id: '26', time: '10:00', patientName: 'Vasco Freitas', platform: 'Zoom', status: 'scheduled', type: 'Terapia Individual', hasLink: true },
      { id: '27', time: '14:30', patientName: 'Helena Cardoso', platform: 'Teams', status: 'scheduled', type: 'Avaliação', hasLink: false },
    ],
    13: [
      { id: '28', time: '09:00', patientName: 'Bruno Teixeira', platform: 'Google Meet', status: 'scheduled', type: 'Consulta', hasLink: true },
      { id: '29', time: '11:30', patientName: 'Cristina Machado', platform: 'Zoom', status: 'scheduled', type: 'Terapia Individual', hasLink: true },
      { id: '30', time: '16:00', patientName: 'Daniel Soares', platform: 'Teams', status: 'scheduled', type: 'Terapia Familiar', hasLink: false },
    ],
    14: [
      { id: '31', time: '08:00', patientName: 'Eva Castro', platform: 'Zoom', status: 'scheduled', type: 'Acompanhamento', hasLink: true },
      { id: '32', time: '13:00', patientName: 'Fábio Moura', platform: 'Google Meet', status: 'scheduled', type: 'Consulta', hasLink: true },
    ],
    15: [
      { id: '33', time: '09:30', patientName: 'Gabriela Monteiro', platform: 'Teams', status: 'scheduled', type: 'Avaliação', hasLink: false },
      { id: '34', time: '11:00', patientName: 'Henrique Varela', platform: 'Zoom', status: 'scheduled', type: 'Terapia Individual', hasLink: true },
      { id: '35', time: '14:30', patientName: 'Isabel Azevedo', platform: 'Google Meet', status: 'scheduled', type: 'Consulta', hasLink: true },
      { id: '36', time: '16:30', patientName: 'Jorge Baptista', platform: 'Zoom', status: 'scheduled', type: 'Terapia Familiar', hasLink: false },
    ],
    19: [
      { id: '37', time: '10:00', patientName: 'Liliana Cunha', platform: 'Google Meet', status: 'scheduled', type: 'Terapia Individual', hasLink: true },
      { id: '38', time: '13:30', patientName: 'Mário Pires', platform: 'Zoom', status: 'scheduled', type: 'Consulta', hasLink: true },
      { id: '39', time: '15:30', patientName: 'Natália Vaz', platform: 'Teams', status: 'scheduled', type: 'Acompanhamento', hasLink: false },
    ],
    20: [
      { id: '40', time: '09:00', patientName: 'Orlando Simões', platform: 'Zoom', status: 'scheduled', type: 'Avaliação', hasLink: false },
      { id: '41', time: '11:00', patientName: 'Patrícia Esteves', platform: 'Teams', status: 'scheduled', type: 'Terapia Individual', hasLink: true },
      { id: '42', time: '14:00', patientName: 'Quintas Rocha', platform: 'Google Meet', status: 'scheduled', type: 'Consulta', hasLink: true },
      { id: '43', time: '16:00', patientName: 'Raquel Duarte', platform: 'Zoom', status: 'scheduled', type: 'Terapia Familiar', hasLink: false },
    ],
  };

  // Calendar data - sessions represented by colored dots
  const calendarDays = [
    { date: 27, sessions: [] },
    { date: 28, sessions: [] },
    { date: 29, sessions: [] },
    { date: 30, sessions: [] },
    { date: 31, sessions: [] },
    { date: 1, sessions: [] },
    { date: 2, sessions: ['emerald', 'purple', 'amber'] },
    { date: 3, sessions: ['blue', 'emerald', 'purple'] },
    { date: 4, sessions: ['orange', 'blue', 'emerald'] },
    { date: 5, sessions: ['blue', 'amber'] },
    { date: 6, sessions: ['orange', 'slate', 'blue', 'blue'] },
    { date: 7, sessions: ['emerald', 'purple', 'slate'] },
    { date: 8, sessions: ['orange', 'blue', 'emerald', 'slate'] },
    { date: 9, sessions: [] },
    { date: 10, sessions: [] },
    { date: 11, sessions: ['blue', 'emerald', 'purple'] },
    { date: 12, sessions: ['blue', 'amber'] },
    { date: 13, sessions: ['orange', 'blue', 'emerald'] },
    { date: 14, sessions: ['blue', 'emerald'] },
    { date: 15, sessions: ['purple', 'orange', 'slate', 'emerald'] },
    { date: 16, sessions: [] },
    { date: 17, sessions: [] },
    { date: 18, sessions: [] },
    { date: 19, sessions: ['orange', 'blue', 'emerald'] },
    { date: 20, sessions: ['purple', 'slate', 'blue', 'orange'] },
    { date: 21, sessions: [] },
    { date: 22, sessions: [] },
    { date: 23, sessions: [] },
    { date: 24, sessions: [] },
    { date: 25, sessions: [] },
    { date: 26, sessions: [] },
    { date: 27, sessions: [] },
    { date: 28, sessions: [] },
    { date: 29, sessions: [] },
    { date: 30, sessions: [] },
    { date: 1, sessions: [] },
    { date: 2, sessions: [] },
    { date: 3, sessions: [] },
    { date: 4, sessions: [] },
    { date: 5, sessions: [] },
    { date: 6, sessions: [] },
  ];

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-500',
      emerald: 'bg-emerald-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      amber: 'bg-amber-500',
      slate: 'bg-slate-500',
    };
    return colors[color] || 'bg-slate-500';
  };

  const handleDateClick = (date: number, hasSessions: boolean) => {
    if (hasSessions) {
      setSelectedDate(date);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Zoom':
        return 'bg-blue-500';
      case 'Teams':
        return 'bg-purple-500';
      case 'Google Meet':
        return 'bg-emerald-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className="min-h-screen px-4 pt-6 pb-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-slate-900 mb-1">Calendário</h1>
          <p className="text-slate-500 text-sm">
            Gerir sessões e disponibilidade
          </p>
        </div>

        {/* Month Navigation */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-slate-400 text-xs mb-1">NOV</div>
              <h2 className="text-slate-900">{currentMonth}</h2>
              <p className="text-slate-500 text-xs">{currentWeek}</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-slate-600 hover:text-slate-900 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm">
                Today
              </button>
              <button className="text-slate-600 hover:text-slate-900 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <button className="text-blue-600 text-sm flex items-center gap-1 ml-auto">
            <Clock className="w-4 h-4" />
            <span>Disponibilidade</span>
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
          {/* Week Headers */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div key={day} className="text-center text-slate-600 text-xs py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => (
              <button
                key={index}
                onClick={() => handleDateClick(day.date, day.sessions.length > 0)}
                className={`aspect-square rounded-xl border ${
                  day.date === 5 ? 'border-blue-600 bg-blue-50' : 'border-slate-100'
                } p-2 flex flex-col items-start justify-between ${
                  day.sessions.length > 0 ? 'cursor-pointer hover:bg-slate-50 transition-colors' : ''
                }`}
              >
                <div className={`text-xs ${day.date === 5 ? 'text-blue-600' : 'text-slate-700'}`}>
                  {day.date}
                </div>
                {day.sessions.length > 0 && (
                  <div className="flex gap-0.5 flex-wrap w-full">
                    {day.sessions.map((color, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${getColorClass(color)}`}
                      />
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Session Details Modal */}
      {isModalOpen && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg sm:mx-4 max-h-[85vh] sm:max-h-[90vh] flex flex-col shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-slate-900 mb-1">Sessões Agendadas</h2>
                <p className="text-slate-600 text-sm">
                  {selectedDate} de Novembro, 2025
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {sessionsData[selectedDate]?.map((session) => (
                <div
                  key={session.id}
                  className="bg-slate-50 rounded-2xl p-5 border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  {/* Session Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`${getPlatformColor(session.platform)} rounded-xl p-2.5`}>
                        <Video className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-slate-900">{session.patientName}</h3>
                        <p className="text-slate-600 text-sm">{session.type}</p>
                      </div>
                    </div>
                    {session.hasLink && (
                      <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs">
                        Link Adicionado
                      </div>
                    )}
                  </div>

                  {/* Session Details */}
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="w-4 h-4" />
                      <span>{session.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Video className="w-4 h-4" />
                      <span>{session.platform}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm transition-colors">
                      {session.hasLink ? 'Ver Link' : 'Adicionar Link'}
                    </button>
                    <button className="flex-1 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm transition-colors">
                      Reagendar
                    </button>
                    <button className="px-3 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl text-sm transition-colors">
                      Cancelar
                    </button>
                  </div>
                </div>
              ))}

              {/* No sessions message */}
              {(!sessionsData[selectedDate] || sessionsData[selectedDate].length === 0) && (
                <div className="text-center py-12">
                  <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600">Nenhuma sessão agendada para este dia</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
