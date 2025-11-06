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
              <h1 className="text-gray-900">
                Olá, {profile?.full_name?.split(' ')[0] || 'Utilizador'}! 👋
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Bem-vinda de volta ao seu espaço de saúde e bem-estar.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-5 py-6 space-y-5">
        {/* 1. Progress Card - Blue Gradient */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-6 shadow-lg">
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
          
          <div className="relative z-10 flex flex-col items-center text-white space-y-4">
            {/* Calendar Icon */}
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            {/* Title and percentage */}
            <div className="text-center w-full">
              <h3 className="text-white/90 mb-1">Progresso Pessoal</h3>
              <div className="text-5xl text-white">{usagePercent}%</div>
              
              {/* Progress Bar */}
              <div className="mt-4 w-full">
                <Progress value={usagePercent} className="h-2 bg-white/30" indicatorClassName="bg-white" />
              </div>
            </div>

            {/* Sessions completed */}
            <div className="flex items-center gap-2">
              <div className="text-6xl">{completedSessionsCount}</div>
            </div>
            <div className="text-white/90">Sessões Completas</div>

            {/* CTA Button */}
            <button 
              onClick={() => navigate('/user/book')}
              className="w-full mt-2 bg-white text-blue-600 rounded-full py-3 px-6 shadow-md active:scale-95 transition-transform"
            >
              Falar com Especialista
            </button>
          </div>
        </div>

        {/* 2. Progress Checklist Card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-50 rounded-xl">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-gray-900">Progresso Pessoal</h3>
          </div>

          <p className="text-gray-500 text-sm mb-4 italic">
            "Pequenos passos todos os dias levam a grandes conquistas"
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-700">Progresso</span>
              <span className="text-blue-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />

            <div className="space-y-3 mt-5">
              {milestones.slice(0, 4).map((milestone) => (
                <div key={milestone.id} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                    milestone.completed 
                      ? 'border-blue-600 bg-blue-600' 
                      : 'border-gray-300'
                  }`}>
                    {milestone.completed && (
                      <svg className="w-full h-full text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${milestone.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                      {milestone.title}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">+{milestone.points || 90}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Upcoming Sessions */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900">Próximas Sessões</h3>
            <span className="text-sm text-gray-500">{upcomingBookings.length} agendadas</span>
          </div>
          
          {upcomingBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="p-4 bg-yellow-100 rounded-full mb-3">
                <Calendar className="w-8 h-8 text-yellow-600" />
              </div>
              <p className="text-gray-600">Nenhuma sessão agendada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.slice(0, 2).map((booking) => (
                <div 
                  key={booking.id}
                  className="bg-gray-50 rounded-2xl p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => navigate('/user/sessions')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-900 font-medium">{booking.pillar || 'Sessão'}</p>
                      <p className="text-gray-500 text-sm">
                        {booking.date || booking.booking_date} às {booking.time || booking.start_time}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Resources Image Card */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          <div className="relative h-48 rounded-3xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1744648525155-5ff1f8373766?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjB3YWxraW5nJTIwc3Vuc2V0JTIwdGhlcmFweXxlbnwxfHx8fDE3NjIzNDcxMTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Recursos de terapia"
              className="w-full h-full object-cover"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
              <div className="flex items-center gap-2 text-white">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span>Recursos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Call Button - Last Element */}
        <button 
          onClick={() => navigate('/user/chat')}
          className="w-full bg-blue-600 text-white rounded-full py-3 px-5 flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform mb-6"
        >
          <Phone className="w-5 h-5" />
          Solicitar Chamada
        </button>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav userType="user" />
    </div>
  );
}

