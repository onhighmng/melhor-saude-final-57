import React, { useState } from 'react';
import { Provider } from '@/types/provider';
import { ArrowLeft, Calendar, Clock, MapPin, Video, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useSessionBalance } from "@/hooks/useSessionBalance";
import { useToast } from "@/hooks/use-toast";

interface BookingFormProps {
  provider: Provider;
  onSubmit: (bookingData: any) => void;
  onBack: () => void;
}

const BookingForm = ({ provider, onSubmit, onBack }: BookingFormProps) => {
  const { toast } = useToast();
  const [sessionFormat, setSessionFormat] = useState<'online'>('online');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const { sessionBalance, loading, shouldShowPaymentButton } = useSessionBalance();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos obrigatórios',
        variant: "destructive"
      });
      return;
    }

    // Check if user has available sessions
    if (shouldShowPaymentButton) {
      toast({
        title: 'Sessões Esgotadas',
        description: 'Não tem sessões disponíveis. Adquira um plano para continuar.',
        variant: "destructive"
      });
      return;
    }

    const bookingData = {
      providerId: provider.id,
      providerName: provider.name,
      sessionFormat,
      date: selectedDate,
      time: selectedTime,
      submittedAt: new Date().toISOString()
    };

    onSubmit(bookingData);
  };

  const availableTimes = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
  ];

  return (
    <div className="min-h-screen bg-soft-white text-navy-blue font-medium antialiased" style={{ fontFamily: "'PP Neue Montreal', sans-serif" }}>
      
      
      <section className="relative pt-32 pb-24">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button 
            onClick={onBack}
            className="inline-flex items-center text-royal-blue hover:text-navy-blue transition-colors duration-200 mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Especialistas
          </button>

          <div className="text-center mb-12">
            <h1 className="font-semibold text-4xl sm:text-5xl leading-tight mb-6 text-navy-blue animate-fade-in">
              Marcar Sessão
            </h1>
            <p className="font-medium text-xl lg:text-2xl leading-tight text-royal-blue">
              Com nosso especialista
            </p>
          </div>

          <div className="bg-gradient-to-br from-soft-white via-accent-sage/8 to-vibrant-blue/5 rounded-2xl p-8 shadow-[0_24px_48px_rgba(0,0,0,0.04)] border border-accent-sage/25 mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <div>
                <h3 className="font-bold text-xl text-navy-blue">Nosso especialista</h3>
                <p className="text-royal-blue">{provider.specialization}</p>
              </div>
            </div>
          </div>

          {/* Session Balance Warning */}
          {!loading && shouldShowPaymentButton && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 mb-8">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-amber-600 font-bold">!</span>
                </div>
                <h3 className="font-bold text-lg text-amber-800">Sessões Esgotadas</h3>
              </div>
              <p className="text-amber-700 mb-4">
                Não tem sessões disponíveis. Adquira um plano para continuar a usar os nossos serviços.
              </p>
              <Button
                type="button"
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => {
                  toast({
                    title: 'A redirecionar...',
                    description: 'A redirecionar para a página de compra de sessões'
                  });
                }}
              >
                Adquirir Sessões
              </Button>
            </div>
          )}

          {/* Session Balance Info */}
          {!loading && sessionBalance && sessionBalance.hasActiveSessions && (
            <div className="bg-gradient-to-br from-mint-green/10 to-sky-blue/10 rounded-2xl p-6 border border-mint-green/20 mb-8">
              <h3 className="font-bold text-lg text-navy-blue mb-3">Sessões Disponíveis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {sessionBalance.employerRemaining > 0 && (
                  <div className="flex justify-between">
                    <span className="font-medium text-navy-blue">Empresa:</span>
                    <span className="text-royal-blue">{sessionBalance.employerRemaining} sessões</span>
                  </div>
                )}
                {sessionBalance.personalRemaining > 0 && (
                  <div className="flex justify-between">
                    <span className="font-medium text-navy-blue">Pessoais:</span>
                    <span className="text-royal-blue">{sessionBalance.personalRemaining} sessões</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Session Format Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Video className="h-6 w-6 text-blue-600" />
                <h3 className="font-semibold text-lg text-blue-800">Sessão Online Individual</h3>
              </div>
              <p className="text-blue-700 mb-4">
                Sessão personalizada com o especialista através de videochamada segura
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Google Meet</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Zoom</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>Microsoft Teams</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg text-sm text-blue-800 flex items-start gap-2">
                <Zap className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Link de acesso automático enviado por email</span>
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-lg font-semibold text-navy-blue mb-4">
                <Calendar className="w-5 h-5 inline mr-2" />
                Selecionar Data
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-4 rounded-2xl border border-gray-300 focus:border-accent-sage focus:ring-2 focus:ring-accent-sage/20 transition-all duration-300"
                required
              />
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-lg font-semibold text-navy-blue mb-4">
                <Clock className="w-5 h-5 inline mr-2" />
                Selecionar Hora
              </label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {availableTimes.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                      selectedTime === time 
                        ? 'border-vibrant-blue bg-vibrant-blue/10 text-vibrant-blue' 
                        : 'border-gray-300 bg-white hover:border-vibrant-blue/50'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1"
              >
                Cancelar
              </Button>
              
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-accent-sage to-vibrant-blue hover:from-vibrant-blue hover:to-accent-sage text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105"
              >
                Confirmar Agendamento
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default BookingForm;
