import { useState } from 'react';
import { Calendar, AlertCircle, Clock, User, Video, Brain, Dumbbell, Scale, Briefcase } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

export function PercursoPage() {
  const [openModal, setOpenModal] = useState<'past' | 'upcoming' | null>(null);

  // Mock data for sessions
  const pastSessions = [
    {
      id: 1,
      type: 'Bem-Estar Físico',
      icon: Dumbbell,
      color: 'orange',
      bgColor: 'bg-orange-400',
      textColor: 'text-orange-600',
      date: 'Data não definida',
      time: '14:30:00',
      specialist: 'Frederico prestador',
      platform: 'Google Meet'
    },
    {
      id: 2,
      type: 'Saúde Mental',
      icon: Brain,
      color: 'blue',
      bgColor: 'bg-blue-500',
      textColor: 'text-blue-600',
      date: 'Data não definida',
      time: '15:00:00',
      specialist: 'Frederico prestador',
      platform: 'Google Meet'
    }
  ];

  const upcomingSessions = [
    {
      id: 3,
      type: 'Saúde Mental',
      icon: Brain,
      color: 'blue',
      bgColor: 'bg-blue-500',
      textColor: 'text-blue-600',
      date: '2025-11-10',
      time: '10:00:00',
      specialist: 'Ana Silva',
      platform: 'Google Meet'
    }
  ];
  return (
    <div className="min-h-screen bg-blue-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40 backdrop-blur-xl bg-white/90">
        <div className="max-w-6xl mx-auto px-5 py-6">
          <h1 className="text-gray-900">Meu Percurso</h1>
          <p className="text-gray-500 text-sm mt-1">
            Acompanhe as suas sessões, objetivos e progresso
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-5 py-6">
        {/* Two Column Layout - Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 mb-6">
          {/* Left Column - Objectives */}
          <div className="rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[300px]" style={{ backgroundColor: '#F5F1E8' }}>
            <div className="text-center max-w-md">
              <h2 className="text-gray-900 mb-2">
                Acompanhe o Progresso dos seus{' '}
                <span className="text-blue-600">Objetivos de Bem-Estar</span>
              </h2>
              <p className="text-gray-600 mb-8">
                Cada sessão concluída aproxima você dos seus objetivos de saúde e bem-estar.
              </p>
              <div className="text-gray-400 italic">
                Nenhum objetivo disponível!
              </div>
            </div>
          </div>

          {/* Right Column - Quotas */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-gray-900 mb-1">
              Gestão das suas <span className="text-blue-600">Quotas de Sessões</span>
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Acompanhe o uso das suas quotas e gerencie as suas sessões.
            </p>

            {/* Quota Cards */}
            <div className="space-y-4 mb-6">
              {/* Quota de Empresa */}
              <div className="border border-gray-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900">Quota de Empresa</h3>
                    <p className="text-gray-500 text-sm">Não usado • Disponível: 8</p>
                    {/* Progress bar */}
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '0%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quota Pessoal */}
              <div className="border border-gray-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900">Quota Pessoal</h3>
                    <p className="text-gray-500 text-sm">Não usado • Disponível: 4</p>
                    {/* Progress bar */}
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '0%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Note */}
            <div className="bg-blue-50 rounded-xl p-3 flex gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600">
                Cancelamento, falta e reagendamento não consumem quotas de sessões. Apenas sessões 
                realizadas são descontadas.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Three Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Histórico de Sessões */}
          <button 
            onClick={() => setOpenModal('past')}
            className="bg-orange-50 rounded-3xl p-6 border border-orange-100 text-left hover:bg-orange-100 transition-colors active:scale-95"
          >
            <div className="flex items-start gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-200 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-orange-700" />
              </div>
              <div>
                <h3 className="text-gray-900">Histórico de Sessões</h3>
                <p className="text-gray-600">{pastSessions.length}</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm">sessões concluídas</p>
          </button>

          {/* Próximas Sessões */}
          <button 
            onClick={() => setOpenModal('upcoming')}
            className="rounded-3xl p-6 border border-gray-200 text-left hover:opacity-90 transition-all active:scale-95"
            style={{ backgroundColor: '#E8E6DF' }}
          >
            <div className="flex items-start gap-3 mb-2">
              <div className="w-10 h-10 bg-white/50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h3 className="text-gray-900">Próximas Sessões</h3>
                <p className="text-gray-600">{upcomingSessions.length}</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm">sessões agendadas</p>
          </button>

          {/* Motivational Card */}
          <div className="bg-yellow-50 rounded-3xl p-6 border border-yellow-100 flex items-center justify-center">
            <p className="text-gray-700 text-center italic">
              Pequenos passos, grandes mudanças. O seu bem-estar cresce com cada compromisso. 💛
            </p>
          </div>
        </div>
      </div>

      {/* Past Sessions Modal */}
      <Dialog open={openModal === 'past'} onOpenChange={(open) => !open && setOpenModal(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Histórico de Sessões Passadas</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {pastSessions.map((session) => {
              const Icon = session.icon;
              return (
                <div key={session.id} className="bg-gray-50 rounded-2xl p-5 space-y-3">
                  {/* Icon and Title */}
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className={`w-20 h-20 ${session.bgColor} rounded-full flex items-center justify-center shadow-lg`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className={`${session.textColor}`}>{session.type}</h3>
                  </div>

                  {/* Session Details */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{session.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{session.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{session.specialist}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      <span>{session.platform}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Upcoming Sessions Modal */}
      <Dialog open={openModal === 'upcoming'} onOpenChange={(open) => !open && setOpenModal(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Próximas Sessões</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {upcomingSessions.map((session) => {
              const Icon = session.icon;
              return (
                <div key={session.id} className="bg-gray-50 rounded-2xl p-5 space-y-3">
                  {/* Icon and Title */}
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className={`w-20 h-20 ${session.bgColor} rounded-full flex items-center justify-center shadow-lg`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className={`${session.textColor}`}>{session.type}</h3>
                  </div>

                  {/* Session Details */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{session.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{session.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{session.specialist}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      <span>{session.platform}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
