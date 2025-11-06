import { Download, AlertCircle, MapPin, Video, Calendar, Star } from 'lucide-react';

export function SessionsPage() {
  const sessions = [
    {
      name: 'Ana Costa',
      type: 'Virtual',
      icon: Video,
      sessionCode: 'InnovationLab',
      time: '01/10/2025',
      rating: null,
      status: 'Agendado',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      name: 'João Silva',
      type: 'Virtual',
      icon: Video,
      sessionCode: 'TechCorp-Lda',
      time: '05/10/2025',
      rating: 9.2,
      status: 'Concluído',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      name: 'Maria Oliveira',
      type: 'Presencial',
      icon: MapPin,
      sessionCode: 'HealthPlus SA',
      time: '12/10/2025',
      rating: 8.8,
      status: 'Concluído',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      name: 'Pedro Ferreira',
      type: 'Presencial',
      icon: MapPin,
      sessionCode: null,
      time: null,
      rating: null,
      status: 'Cancelado',
      statusColor: 'bg-red-50 text-red-700 border-red-200',
    },
  ];

  return (
    <div className="min-h-screen px-4 pt-6 pb-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-slate-900 mb-2">
            Sessões Recentes{' '}
            <span className="text-blue-600">Plataforma de Bem-Estar</span>
          </h1>
          <p className="text-slate-600 text-sm">
            Acompanhar as suas últimas sessões com colaboradores e empresas.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4">
          <select className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 min-w-[140px]">
            <option>Todas as Datas</option>
          </select>
          <select className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 min-w-[150px]">
            <option>Todos os Estados</option>
          </select>
          <button className="text-slate-600 text-sm whitespace-nowrap px-3 py-2">
            Limpar Filtro
          </button>
          <button className="ml-auto text-blue-600 text-sm whitespace-nowrap flex items-center gap-1 px-3 py-2">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>

        {/* Scheduled Sessions Alert */}
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="bg-amber-100 rounded-full p-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <div className="text-amber-900 text-sm mb-1">Agendadas</div>
              <div className="text-amber-950">1</div>
              <div className="text-amber-700 text-xs mt-1">Próximas sessões</div>
            </div>
          </div>
        </div>

        {/* Promo Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 mb-6 border border-blue-200">
          <h2 className="text-slate-900 mb-2">
            Experiência Profissional Intuitiva com{' '}
            <span className="text-blue-600">Plataforma de Bem-Estar</span>
          </h2>
          <p className="text-slate-600 text-sm">
            Simplifique a gestão das suas sessões com ferramentas profissionais que favorecem
            fácilidade e controlo total.
          </p>
        </div>

        {/* Sessions List */}
        <div className="space-y-4 mb-6">
          {sessions.map((session, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-slate-900 mb-1">{session.name}</h3>
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <session.icon className="w-4 h-4" />
                    <span>{session.type}</span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs border ${session.statusColor}`}
                >
                  {session.status}
                </span>
              </div>

              {session.sessionCode && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-slate-50 rounded-lg px-3 py-1.5 text-slate-700 text-xs">
                    {session.sessionCode}
                  </div>
                  {session.time && (
                    <div className="flex items-center gap-1 text-slate-500 text-xs">
                      <Calendar className="w-3 h-3" />
                      <span>{session.time}</span>
                    </div>
                  )}
                </div>
              )}

              {session.rating && (
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-slate-900 text-sm">{session.rating}/10</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="text-center">
            <div className="text-slate-900 mb-1">+150</div>
            <div className="text-slate-600 text-xs">Prestadores Ativos</div>
          </div>
          <div className="text-center border-x border-slate-100">
            <div className="text-slate-900 mb-1">5K+</div>
            <div className="text-slate-600 text-xs">Sessões Realizadas</div>
          </div>
          <div className="text-center">
            <div className="text-slate-900 mb-1">4.9</div>
            <div className="text-slate-600 text-xs">Avaliação Média</div>
          </div>
        </div>
      </div>
    </div>
  );
}
