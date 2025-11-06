import { CheckCircle2, Calendar, Clock, Video, Phone } from 'lucide-react';

type Pillar = 'mental-health' | 'physical-wellness' | 'financial-assistance' | 'legal-assistance';

interface BookingConfirmationPageProps {
  pillar: Pillar;
  sessionType: 'online' | 'phone';
  date: Date;
  time: string;
  onGoHome: () => void;
}

export function BookingConfirmationPage({
  pillar,
  sessionType,
  date,
  time,
  onGoHome
}: BookingConfirmationPageProps) {
  const pillarTitles: Record<Pillar, string> = {
    'mental-health': 'Saúde Mental',
    'physical-wellness': 'Bem-estar Físico',
    'financial-assistance': 'Assistência Financeira',
    'legal-assistance': 'Assistência Jurídica'
  };

  const formatDate = (date: Date) => {
    const days = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5 py-8">
      <div className="max-w-2xl w-full">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-8">
          <h1 className="text-gray-900 mb-2">Sessão Agendada com Sucesso!</h1>
          <p className="text-gray-600">
            A sua sessão de {pillarTitles[pillar]} foi confirmada
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6 space-y-4">
          {/* Date */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Data</p>
              <p className="text-gray-900">{formatDate(date)}</p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Horário</p>
              <p className="text-gray-900">{time}</p>
            </div>
          </div>

          {/* Session Type */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              {sessionType === 'online' ? (
                <Video className="w-5 h-5 text-blue-600" />
              ) : (
                <Phone className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Tipo de Sessão</p>
              <p className="text-gray-900">
                {sessionType === 'online' ? 'Videochamada Online' : 'Chamada Telefónica'}
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200 mb-6">
          <p className="text-sm text-blue-900">
            <span className="block mb-2">📧 Enviámos uma confirmação por email com os detalhes da sua sessão.</span>
            <span className="block">🔔 Receberá uma notificação 15 minutos antes da sessão começar.</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onGoHome}
            className="w-full px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors active:scale-95 shadow-lg shadow-blue-600/30"
          >
            Voltar ao Início
          </button>
          <button
            onClick={onGoHome}
            className="w-full px-8 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors active:scale-95"
          >
            Ver Minhas Sessões
          </button>
        </div>
      </div>
    </div>
  );
}
