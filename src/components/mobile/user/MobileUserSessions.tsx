import { useState } from 'react';
import { Calendar, AlertCircle, Brain, Heart, DollarSign, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionBalance } from '@/hooks/useSessionBalance';
import { useBookings } from '@/hooks/useBookings';
import { MobileBottomNav } from '../shared/MobileBottomNav';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingAnimation } from '@/components/LoadingAnimation';

export function MobileUserSessions() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { sessionBalance, loading: balanceLoading } = useSessionBalance();
  const { upcomingBookings, completedBookings, loading: bookingsLoading } = useBookings();

  const getPillarIcon = (pillar: string) => {
    if (pillar.toLowerCase().includes('mental')) return Brain;
    if (pillar.toLowerCase().includes('físico') || pillar.toLowerCase().includes('physical')) return Heart;
    if (pillar.toLowerCase().includes('financ')) return DollarSign;
    if (pillar.toLowerCase().includes('juríd') || pillar.toLowerCase().includes('legal')) return Scale;
    return Brain;
  };

  const companyQuota = sessionBalance?.company || 0;
  const personalQuota = sessionBalance?.personal || 0;
  
  // Calculate actual used sessions from completed bookings
  const companyUsed = completedBookings.filter(b => b.booking_source === 'company').length;
  const personalUsed = completedBookings.filter(b => 
    b.booking_source === 'personal' || !b.booking_source
  ).length;

  if (balanceLoading || bookingsLoading) {
    return <LoadingAnimation variant="fullscreen" message="A carregar sessões..." showProgress={true} />;
  }

  return (
    <div className="min-h-screen bg-blue-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-md mx-auto px-5 py-6">
          <h1 className="text-gray-900 text-2xl font-bold">Meu Percurso</h1>
          <p className="text-gray-500 text-sm mt-1">
            Acompanhe as suas sessões e progresso
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-5 py-6 space-y-4">
        {/* Objectives Card */}
        <Card className="rounded-3xl p-6 shadow-sm border-none" style={{ backgroundColor: '#F5F1E8' }}>
          <div className="text-center">
            <h2 className="text-gray-900 text-lg font-semibold mb-2">
              Acompanhe o Progresso dos seus{' '}
              <span className="text-blue-600">Objetivos de Bem-Estar</span>
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Cada sessão concluída aproxima você dos seus objetivos
            </p>
            <p className="text-gray-400 italic text-sm">
              Nenhum objetivo disponível!
            </p>
          </div>
        </Card>

        {/* Quotas Card */}
        <Card className="bg-white rounded-3xl p-6 shadow-sm border-none">
          <h2 className="text-gray-900 font-semibold mb-1">
            Gestão das suas <span className="text-blue-600">Quotas de Sessões</span>
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Acompanhe o uso das suas quotas
          </p>

          {/* Quota Items */}
          <div className="space-y-4 mb-4">
            {/* Company Quota */}
            <div className="border border-gray-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 font-medium">Quota de Empresa</h3>
                  <p className="text-gray-500 text-sm">
                    Usado: {companyUsed} • Disponível: {companyQuota}
                  </p>
                  <Progress 
                    value={companyQuota > 0 ? (companyUsed / companyQuota) * 100 : 0} 
                    className="h-2 mt-2" 
                  />
                </div>
              </div>
            </div>

            {/* Personal Quota */}
            <div className="border border-gray-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 font-medium">Quota Pessoal</h3>
                  <p className="text-gray-500 text-sm">
                    Usado: {personalUsed} • Disponível: {personalQuota}
                  </p>
                  <Progress 
                    value={personalQuota > 0 ? (personalUsed / personalQuota) * 100 : 0} 
                    className="h-2 mt-2" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 rounded-xl p-3 flex gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600">
              Cancelamento e falta não consumem quotas. Apenas sessões realizadas são descontadas.
            </p>
          </div>
        </Card>

        {/* Sessions Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Past Sessions */}
          <Card 
            className="bg-orange-50 rounded-3xl p-5 shadow-sm border-orange-100 cursor-pointer active:scale-95 transition-transform"
            onClick={() => {
              // Navigate to sessions history view
              console.log('View past sessions');
            }}
          >
            <div className="text-center">
              <div className="w-10 h-10 bg-orange-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-5 h-5 text-orange-700" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-1">Histórico</h3>
              <p className="text-2xl font-bold text-orange-600">{completedBookings.length}</p>
              <p className="text-gray-500 text-xs">sessões</p>
            </div>
          </Card>

          {/* Upcoming Sessions */}
          <Card 
            className="rounded-3xl p-5 shadow-sm border-gray-200 cursor-pointer active:scale-95 transition-transform"
            style={{ backgroundColor: '#E8E6DF' }}
            onClick={() => {
              // Navigate to upcoming sessions view
              console.log('View upcoming sessions');
            }}
          >
            <div className="text-center">
              <div className="w-10 h-10 bg-white/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-5 h-5 text-gray-700" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-1">Próximas</h3>
              <p className="text-2xl font-bold text-gray-700">{upcomingBookings.length}</p>
              <p className="text-gray-500 text-xs">sessões</p>
            </div>
          </Card>
        </div>

        {/* Motivational Card */}
        <Card className="bg-yellow-50 rounded-3xl p-6 shadow-sm border-yellow-100">
          <p className="text-gray-700 text-center italic text-sm">
            Pequenos passos, grandes mudanças. O seu bem-estar cresce com cada compromisso. 💛
          </p>
        </Card>
      </div>

      <MobileBottomNav userType="user" />
    </div>
  );
}

