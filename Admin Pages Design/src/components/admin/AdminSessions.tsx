import { Monitor, MapPin, Star } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';

const sessions = [
  {
    id: 1,
    name: 'Ana Costa',
    initials: 'AC',
    type: 'Virtual',
    location: 'Barcelona/ES',
    date: '08/08/2025',
    status: 'Agendado',
    statusColor: 'blue',
    rating: null,
  },
  {
    id: 2,
    name: 'João Silva',
    initials: 'JS',
    type: 'Virtual',
    company: 'TechCorp Lda',
    date: '12/08/2025',
    status: 'Concluído',
    statusColor: 'green',
    rating: 8,
  },
  {
    id: 3,
    name: 'Maria Oliveira',
    initials: 'MO',
    type: 'Presencial',
    company: 'HealthPlus SA',
    date: '14/08/2025',
    status: 'Concluído',
    statusColor: 'green',
    rating: 9,
  },
  {
    id: 4,
    name: 'Pedro Ferreira',
    initials: 'PF',
    type: 'Presencial',
    status: 'Cancelado',
    statusColor: 'red',
    rating: null,
  },
];

export function AdminSessions() {
  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Sessões Recentes</h1>
        <p className="text-sm text-gray-500">Acompanhe suas sessões</p>
      </div>

      {/* Session Cards */}
      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <Avatar className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500">
                <AvatarFallback className="bg-transparent text-white">
                  {session.initials}
                </AvatarFallback>
              </Avatar>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-gray-900">{session.name}</h3>
                  <Badge
                    variant="secondary"
                    className={`rounded-full text-xs shrink-0 ${
                      session.statusColor === 'blue'
                        ? 'bg-blue-100 text-blue-700'
                        : session.statusColor === 'green'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {session.status}
                  </Badge>
                </div>

                {/* Session Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Monitor className="w-4 h-4" />
                    <span>{session.type}</span>
                  </div>

                  {session.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{session.location} • {session.date}</span>
                    </div>
                  )}

                  {session.company && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{session.company} • {session.date}</span>
                    </div>
                  )}

                  {/* Rating */}
                  {session.rating && (
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-900">{session.rating}/10</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
