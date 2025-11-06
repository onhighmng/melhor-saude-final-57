import { MapPin, Video, Star } from 'lucide-react';

export function Sessions() {
  const sessions = [
    {
      name: 'Ana Costa',
      type: 'Virtual',
      location: 'Barcelona/ES',
      time: '08/08/2025',
      rating: null,
      status: 'Agendado',
      statusColor: 'bg-blue-100 text-blue-700',
      avatar: 'AC',
      color: 'from-blue-400 to-blue-600',
    },
    {
      name: 'João Silva',
      type: 'Virtual',
      location: 'TechCorp Lda',
      time: '12/08/2025',
      rating: 8,
      status: 'Concluído',
      statusColor: 'bg-green-100 text-green-700',
      avatar: 'JS',
      color: 'from-green-400 to-green-600',
    },
    {
      name: 'Maria Oliveira',
      type: 'Presencial',
      location: 'HealthPlus SA',
      time: '14/08/2025',
      rating: 9,
      status: 'Concluído',
      statusColor: 'bg-green-100 text-green-700',
      avatar: 'MO',
      color: 'from-purple-400 to-purple-600',
    },
    {
      name: 'Pedro Ferreira',
      type: 'Presencial',
      location: '',
      time: '',
      rating: null,
      status: 'Cancelado',
      statusColor: 'bg-red-100 text-red-700',
      avatar: 'PF',
      color: 'from-gray-400 to-gray-600',
    },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-3xl mb-1">Sessões</h1>
        <p className="text-gray-500 text-sm">Acompanhe suas sessões agendadas e concluídas</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-gray-500 mb-1">Total</div>
          <div className="text-2xl">234</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-gray-500 mb-1">Agendadas</div>
          <div className="text-2xl text-blue-600">12</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-gray-500 mb-1">Concluídas</div>
          <div className="text-2xl text-green-600">222</div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {sessions.map((session, index) => (
          <div key={index} className="bg-white rounded-3xl p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${session.color} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white text-sm">{session.avatar}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="truncate">{session.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${session.statusColor}`}>
                    {session.status}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  {session.type === 'Virtual' ? (
                    <Video className="w-4 h-4" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                  <span className="text-xs">{session.type}</span>
                </div>
                
                {session.location && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <MapPin className="w-3 h-3" />
                    <span>{session.location}</span>
                    {session.time && <span>• {session.time}</span>}
                  </div>
                )}
                
                {session.rating !== null && (
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{session.rating}/10</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}