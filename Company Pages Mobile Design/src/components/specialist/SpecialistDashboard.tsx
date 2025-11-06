import { Settings, TrendingUp, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export function SpecialistDashboard() {
  const upcomingSessions = [
    { initial: 'A', name: 'Ana M.', time: '09:00 - 10:00', type: 'online', color: 'bg-blue-500' },
    { initial: 'C', name: 'Carlos S.', time: '14:00 - 15:00', type: 'online', color: 'bg-blue-500' },
    { initial: 'M', name: 'Maria P.', time: '15:30 - 16:30', type: 'presencial', color: 'bg-blue-500' },
  ];

  return (
    <div className="min-h-screen px-4 pt-6 pb-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-slate-900 mb-1">Bem-vindo, Dr.</h1>
          <p className="text-slate-500 text-sm">
            Gerir as suas sessões e disponibilidade
          </p>
        </div>

        {/* Calendar Widget */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 mb-4">
          <div className="aspect-[16/9] relative">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1759216853310-7d315a1fd07d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFjZWZ1bCUyMHRoZXJhcHklMjByb29tfGVufDF8fHx8MTc2MjM3NDkxN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Therapy room"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
          
          <div className="p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-blue-50 rounded-xl p-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-slate-900 mb-1">Calendário</h2>
                <p className="text-slate-600 text-sm">Gerir disponibilidade e horários</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-900">Próximas Sessões</h2>
            <span className="text-slate-500 text-sm">4 sessões agendadas</span>
          </div>

          <div className="space-y-3">
            {upcomingSessions.map((session, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                <div className={`${session.color} text-white rounded-xl w-12 h-12 flex items-center justify-center shrink-0`}>
                  <span>{session.initial}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-slate-900 text-sm mb-0.5">{session.name}</div>
                  <div className="text-slate-500 text-xs capitalize">{session.type}</div>
                </div>
                <div className="flex items-center gap-1 text-slate-600 text-sm shrink-0">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">{session.time.split(' - ')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configurations */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-3xl p-6 mb-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="bg-white/60 rounded-2xl p-3">
              <Settings className="w-7 h-7 text-amber-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-slate-900 mb-1">Configurações</h2>
              <p className="text-slate-600 text-sm mb-3">Perfil e definições</p>
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-white/60 rounded-2xl p-3">
              <TrendingUp className="w-7 h-7 text-purple-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-slate-900 mb-1">Desempenho</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-slate-600 text-xs mb-1">Sessões Concluídas</div>
              <div className="text-slate-900">£2</div>
            </div>
            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-slate-600 text-xs mb-1">Clientes Associados</div>
              <div className="text-slate-900">5</div>
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 mb-4">
            <div className="text-slate-600 text-xs mb-1">Total Sessões</div>
            <div className="flex items-baseline gap-2">
              <span className="text-slate-900">43</span>
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4">
            <div className="text-slate-600 text-xs mb-1">Satisfação</div>
            <div className="flex items-baseline gap-2">
              <span className="text-slate-900">4.5/5</span>
            </div>
          </div>

          <button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl py-3 px-4 flex items-center justify-center gap-2 transition-colors shadow-sm">
            <span>Ver Completo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
