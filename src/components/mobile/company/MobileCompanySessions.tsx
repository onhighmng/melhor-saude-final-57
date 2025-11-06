import { useState } from 'react';
import { Calendar, Users, TrendingUp, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MobileBottomNav } from '../shared/MobileBottomNav';

export function MobileCompanySessions() {
  const [activeTab, setActiveTab] = useState('upcoming');

  const sessions = [
    {
      id: '1',
      employee: 'João Silva',
      specialist: 'Dr. Ana Costa',
      pillar: 'Saúde Mental',
      date: '2025-11-10',
      time: '10:00',
      status: 'upcoming'
    },
    {
      id: '2',
      employee: 'Maria Santos',
      specialist: 'Dr. Carlos Rodrigues',
      pillar: 'Bem-Estar Físico',
      date: '2025-11-09',
      time: '14:00',
      status: 'completed'
    }
  ];

  const upcomingSessions = sessions.filter(s => s.status === 'upcoming');
  const completedSessions = sessions.filter(s => s.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-5 py-6">
          <h1 className="text-gray-900 text-2xl font-bold">Sessões</h1>
          <p className="text-gray-500 text-sm">Gerir sessões da empresa</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-5 py-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="bg-blue-50 rounded-2xl p-4 border-none text-center">
            <Calendar className="w-5 h-5 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">12</p>
            <p className="text-xs text-gray-600">Este Mês</p>
          </Card>
          <Card className="bg-green-50 rounded-2xl p-4 border-none text-center">
            <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">85%</p>
            <p className="text-xs text-gray-600">Taxa Presença</p>
          </Card>
          <Card className="bg-purple-50 rounded-2xl p-4 border-none text-center">
            <Users className="w-5 h-5 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">45</p>
            <p className="text-xs text-gray-600">Participantes</p>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-6">
            <TabsTrigger value="upcoming" className="flex-1">
              Próximas ({upcomingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1">
              Concluídas ({completedSessions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-3 mt-0">
            {upcomingSessions.map((session) => (
              <Card 
                key={session.id}
                className="bg-white rounded-2xl p-4 border border-gray-200"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 font-medium">{session.employee}</h3>
                    <p className="text-gray-500 text-sm">com {session.specialist}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="text-xs">{session.pillar}</Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(session.date).toLocaleDateString('pt-PT')} às {session.time}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3 mt-0">
            {completedSessions.map((session) => (
              <Card 
                key={session.id}
                className="bg-white rounded-2xl p-4 border border-gray-200 opacity-75"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 font-medium">{session.employee}</h3>
                    <p className="text-gray-500 text-sm">com {session.specialist}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">{session.pillar}</Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(session.date).toLocaleDateString('pt-PT')}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      <MobileBottomNav userType="company" />
    </div>
  );
}

