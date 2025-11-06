import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Calendar, TrendingUp, BookOpen, Bell, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionBalance } from '@/hooks/useSessionBalance';
import { useBookings } from '@/hooks/useBookings';
import { useMilestones } from '@/hooks/useMilestones';
import { MobileBottomNav } from '../shared/MobileBottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export function MobileUserDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { sessionBalance } = useSessionBalance();
  const { upcomingBookings, allBookings } = useBookings();
  const { milestones, progress } = useMilestones();

  const completedSessionsCount = allBookings.filter(b => b.status === 'completed').length;
  const remainingSessions = sessionBalance?.totalRemaining || 0;
  const totalSessions = (sessionBalance?.company || 0) + (sessionBalance?.personal || 0);
  const usedSessions = totalSessions - remainingSessions;
  const usagePercent = totalSessions > 0 ? Math.round((usedSessions / totalSessions) * 100) : 0;

  return (
    <div className="min-h-screen bg-blue-100 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40 backdrop-blur-xl bg-white/90">
        <div className="max-w-md mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900 text-2xl font-bold">
                Olá, {profile?.full_name?.split(' ')[0] || 'Utilizador'}! 👋
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Bem-vindo ao seu espaço de saúde e bem-estar.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-5 py-6 space-y-5">
        {/* Progress Card */}
        <Card className="bg-white rounded-3xl p-6 shadow-md border-none">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-900 text-lg font-semibold">Sessões Completas</h3>
                <p className="text-gray-500 text-sm">Continue a sua jornada</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-blue-600">{completedSessionsCount}</span>
                <span className="text-gray-400 text-sm">/28</span>
              </div>
            </div>
            
            <Progress value={usagePercent} className="h-2" />
            
            <Button 
              onClick={() => navigate('/user/book')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-3"
            >
              Falar com Especialista
            </Button>
          </div>
        </Card>

        {/* Personal Progress Checklist */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 shadow-md border-none">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-gray-900 font-semibold">Progresso Pessoal</h3>
              <p className="text-gray-600 text-sm">Acompanhe a sua evolução</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {milestones.slice(0, 3).map((milestone) => (
              <div key={milestone.id} className="flex items-center gap-3">
                <CheckCircle 
                  className={`w-5 h-5 ${
                    milestone.completed ? 'text-green-600' : 'text-gray-300'
                  }`}
                />
                <span className={`text-sm ${
                  milestone.completed ? 'text-gray-900 font-medium' : 'text-gray-500'
                }`}>
                  {milestone.title}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Sessions */}
        {upcomingBookings.length > 0 && (
          <Card className="bg-white rounded-3xl p-6 shadow-md border-none">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold">Próximas Sessões</h3>
                <p className="text-gray-600 text-sm">{upcomingBookings.length} agendadas</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {upcomingBookings.slice(0, 2).map((booking) => (
                <div 
                  key={booking.id}
                  className="bg-gray-50 rounded-2xl p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => navigate('/user/sessions')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-900 font-medium">{booking.pillar}</p>
                      <p className="text-gray-500 text-sm">{booking.date} às {booking.time}</p>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Resources Card */}
        <Card 
          className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 shadow-md border-none cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/user/resources')}
        >
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-gray-900 font-semibold">Recursos de Bem-Estar</h3>
              <p className="text-gray-600 text-sm">Explore conteúdos personalizados</p>
            </div>
          </div>
        </Card>

        {/* Call Request Button */}
        <Button 
          onClick={() => navigate('/user/chat')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-3 flex items-center justify-center gap-2 shadow-md"
        >
          <Phone className="w-5 h-5" />
          Solicitar Chamada
        </Button>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav userType="user" />
    </div>
  );
}

