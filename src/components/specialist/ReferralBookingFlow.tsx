import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Prestador {
  id: string;
  name: string;
  specialty: string;
  pillar: string;
  photo_url?: string;
  rating?: number;
}

interface ReferralBookingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  sessionPillar?: string;
  userName: string;
  userId: string;
  onBookingComplete: (prestadorId: string, date: Date, notes: string) => void;
}

// Mock data removed - using real database queries

const pillarOptions = [
  { value: 'psychological', label: 'Saúde Mental', bgColor: 'hsl(210 80% 95%)', textColor: 'hsl(210 80% 40%)' },
  { value: 'physical', label: 'Bem-Estar Físico', bgColor: 'hsl(45 90% 90%)', textColor: 'hsl(45 90% 35%)' },
  { value: 'financial', label: 'Assistência Financeira', bgColor: 'hsl(140 60% 95%)', textColor: 'hsl(140 60% 35%)' },
  { value: 'legal', label: 'Assistência Jurídica', bgColor: 'hsl(270 60% 95%)', textColor: 'hsl(270 60% 40%)' },
];

const generateTimeSlots = (date: Date) => {
  const slots = [];
  for (let hour = 9; hour <= 17; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 17) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  return slots;
};

const generateDays = () => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    days.push(date);
  }
  return days;
};

export const ReferralBookingFlow = ({
  isOpen,
  onClose,
  sessionPillar,
  userName,
  userId,
  onBookingComplete,
}: ReferralBookingFlowProps) => {
  const [step, setStep] = useState<'pillar' | 'provider' | 'calendar'>('pillar');
  const [selectedPillar, setSelectedPillar] = useState(sessionPillar || '');
  const [selectedProvider, setSelectedProvider] = useState<Prestador | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState('');

  const handlePillarSelect = (pillar: string) => {
    setSelectedPillar(pillar);
    setStep('provider');
  };

  const handleProviderSelect = (provider: Prestador) => {
    setSelectedProvider(provider);
    setStep('calendar');
  };

  const handleBack = () => {
    if (step === 'provider') setStep('pillar');
    if (step === 'calendar') setStep('provider');
  };

  const handleConfirmBooking = () => {
    if (selectedProvider && selectedDate && selectedTime) {
      const bookingDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      bookingDateTime.setHours(parseInt(hours), parseInt(minutes));
      
      onBookingComplete(selectedProvider.id, bookingDateTime, notes);
      
      // Reset state
      setStep('pillar');
      setSelectedPillar(sessionPillar || '');
      setSelectedProvider(null);
      setSelectedDate(null);
      setSelectedTime('');
      setNotes('');
      onClose();
    }
  };

  // Load real providers from database
  const [providers, setProviders] = useState<Prestador[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const { data, error } = await supabase
          .from('prestadores')
          .select('*')
          .contains('pillar_specialties', [selectedPillar])
          .eq('is_active', true);

        if (error) throw error;

        const transformedProviders = (data || []).map(p => ({
          id: p.id,
          name: p.name,
          specialty: p.specialties?.[0] || '',
          pillar: p.pillar_specialties?.[0] || selectedPillar,
          photo_url: p.photo_url,
          rating: 4.8 // Default rating, could query from feedback
        }));

        setProviders(transformedProviders);
      } catch (err) {
        console.error('Error loading providers:', err);
      } finally {
        setLoading(false);
      }
    };

    if (selectedPillar) {
      loadProviders();
    }
  }, [selectedPillar]);

  const filteredProviders = providers.filter(p => p.pillar === selectedPillar);
  const days = generateDays();
  const timeSlots = selectedDate ? generateTimeSlots(selectedDate) : [];

  const getPillarLabel = (pillar: string) => {
    return pillarOptions.find(p => p.value === pillar)?.label || pillar;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {step !== 'pillar' && (
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle>
              {step === 'pillar' && 'Selecionar Pilar'}
              {step === 'provider' && `Selecionar Prestador - ${getPillarLabel(selectedPillar)}`}
              {step === 'calendar' && `Agendar com ${selectedProvider?.name}`}
            </DialogTitle>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1">
          {/* Pillar Selection */}
          {step === 'pillar' && (
            <div className="space-y-4 p-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm"><strong>Colaborador:</strong> {userName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {pillarOptions.map((pillar) => (
                  <Button
                    key={pillar.value}
                    variant="outline"
                    className="h-24 flex flex-col gap-2 border-transparent hover:opacity-90"
                    style={{ backgroundColor: pillar.bgColor, color: pillar.textColor }}
                    onClick={() => handlePillarSelect(pillar.value)}
                  >
                    <span className="text-lg font-semibold">{pillar.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Provider Selection */}
          {step === 'provider' && (
            <div className="space-y-4 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProviders.map((provider) => (
                  <div
                    key={provider.id}
                    className="p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors"
                    onClick={() => handleProviderSelect(provider)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{provider.name}</h3>
                        <p className="text-sm text-muted-foreground">{provider.specialty}</p>
                        {provider.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-sm">⭐ {provider.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calendar Selection */}
          {step === 'calendar' && selectedProvider && (
            <div className="space-y-4 p-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm"><strong>Prestador:</strong> {selectedProvider.name}</p>
                <p className="text-sm"><strong>Especialidade:</strong> {selectedProvider.specialty}</p>
                <p className="text-sm"><strong>Colaborador:</strong> {userName}</p>
              </div>

              {/* Date Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Selecionar Data</label>
                <div className="grid grid-cols-7 gap-2">
                  {days.map((day, index) => {
                    const isSelected = selectedDate?.toDateString() === day.toDateString();
                    return (
                      <Button
                        key={index}
                        variant={isSelected ? 'default' : 'outline'}
                        className="flex flex-col h-auto py-2"
                        onClick={() => setSelectedDate(day)}
                      >
                        <span className="text-xs">{day.toLocaleDateString('pt-PT', { weekday: 'short' })}</span>
                        <span className="text-lg font-semibold">{day.getDate()}</span>
                        <span className="text-xs">{day.toLocaleDateString('pt-PT', { month: 'short' })}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Selecionar Horário</label>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((time) => {
                      const isAvailable = Math.random() > 0.3; // Mock availability
                      const isSelected = selectedTime === time;
                      return (
                        <Button
                          key={time}
                          variant={isSelected ? 'default' : 'outline'}
                          disabled={!isAvailable}
                          onClick={() => setSelectedTime(time)}
                          className="h-auto py-2"
                        >
                          {time}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedDate && selectedTime && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Notas (opcional)</label>
                  <textarea
                    className="w-full min-h-[80px] p-3 border rounded-lg"
                    placeholder="Adicione observações sobre o encaminhamento..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          {step === 'calendar' && selectedDate && selectedTime && (
            <Button onClick={handleConfirmBooking}>
              <Calendar className="h-4 w-4 mr-2" />
              Confirmar Agendamento
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
