import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, Video, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface EnhancedBookingWidgetProps {
  prestadorId: string;
}

type BookingError = {
  type: 'availability' | 'network' | 'auth' | 'validation' | 'unknown';
  message: string;
  retryable: boolean;
};

const toDateInputValue = (d: Date) => d.toISOString().split('T')[0];
const timeLabel = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const EnhancedBookingWidget: React.FC<EnhancedBookingWidgetProps> = ({ prestadorId }) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string>(toDateInputValue(new Date()));
  const [duration, setDuration] = useState<number>(60);
  const [format, setFormat] = useState<'online'>('online');
  const [slots, setSlots] = useState<{ slot_time: string; is_available: boolean }[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<BookingError | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const createError = (type: BookingError['type'], message: string, retryable: boolean = true): BookingError => ({
    type,
    message,
    retryable
  });

  useEffect(() => {
    const loadPrestador = async () => {
      try {
        const { data, error } = await supabase
          .from('prestadores')
          .select('session_duration')
          .eq('id', prestadorId)
          .maybeSingle();
        
        if (error) throw error;
        if (data?.session_duration) setDuration(data.session_duration);
      } catch (e) {
        console.error('Error loading prestador data:', e);
        setError(createError('network', 'Erro ao carregar dados do prestador', true));
      }
    };
    loadPrestador();
  }, [prestadorId]);

  const fetchSlots = async (isRetry: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.rpc('get_available_slots', {
        p_prestador_id: prestadorId,
        p_date: selectedDate,
        p_duration: duration,
      });
      
      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
      
      setSlots(data || []);
      if (isRetry) {
        setRetryCount(0);
        toast({
          title: "Sucesso",
          description: "Horários atualizados com sucesso",
        });
      }
    } catch (e: any) {
      console.error('Error fetching slots:', e);
      
      if (e.message?.includes('network') || e.message?.includes('fetch')) {
        setError(createError('network', 'Erro de conexão. Verifique sua internet e tente novamente.', true));
      } else {
        setError(createError('unknown', 'Erro ao carregar horários disponíveis', true));
      }
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const retryFetchSlots = () => {
    setRetryCount(prev => prev + 1);
    fetchSlots(true);
  };

  useEffect(() => {
    if (prestadorId && selectedDate) {
      fetchSlots();
    }
  }, [prestadorId, selectedDate, duration]);

  const availableSlots = useMemo(() => slots.filter(s => s.is_available), [slots]);

  const handleBook = async (slotISO: string) => {

    try {
      setSubmitting(true);
      setError(null);
      
      // Check authentication
      const { data: userRes, error: authError } = await supabase.auth.getUser();
      if (authError || !userRes?.user) {
        setError(createError('auth', 'Precisa iniciar sessão para agendar', false));
        return;
      }

      // Validate availability just before booking
      const { data: availabilityCheck, error: availabilityError } = await supabase.rpc('check_booking_availability', {
        p_prestador_id: prestadorId,
        p_booking_date: slotISO,
        p_duration: duration,
        p_exclude_booking_id: null,
      });

      if (availabilityError) {
        throw new Error(`Availability check failed: ${availabilityError.message}`);
      }

      if (availabilityCheck === false) {
        setError(createError('availability', 'Este horário já não está disponível. Por favor, escolha outro.', true));
        await fetchSlots();
        return;
      }

      // Create booking
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: userRes.user.id,
          prestador_id: prestadorId,
          booking_date: slotISO,
          duration,
          session_type: 'individual',
          status: 'scheduled',
          notes: 'Formato: online',
        });

      if (bookingError) {
        if (bookingError.message?.includes('session_balance') || bookingError.message?.includes('allocation')) {
          setError(createError('validation', 'Não tem sessões disponíveis para reservar', false));
          return;
        }
        throw new Error(`Booking creation failed: ${bookingError.message}`);
      }

      toast({
        title: "Sessão agendada!",
        description: "A sua sessão foi agendada com sucesso",
      });

      // Refresh slots and redirect
      await fetchSlots();
      setTimeout(() => {
        navigate('/user/sessions');
      }, 1500);

    } catch (e: any) {
      console.error('Error booking session:', e);
      
      if (e.message?.includes('network') || e.message?.includes('fetch')) {
        setError(createError('network', 'Erro de conexão durante o agendamento', true));
      } else if (e.message?.includes('conflict') || e.message?.includes('already booked')) {
        setError(createError('availability', 'Conflito de horário. Por favor, escolha outro horário.', true));
      } else {
        setError(createError('unknown', 'Falha ao agendar. Tente novamente.', true));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    if (error?.type === 'availability') {
      fetchSlots();
    } else {
      retryFetchSlots();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agendar Sessão</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant={error.type === 'validation' ? 'destructive' : 'default'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error.message}</span>
              {error.retryable && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetry}
                  disabled={loading}
                  className="ml-2"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Tentar Novamente
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">
            <Calendar className="inline w-4 h-4 mr-2" /> Data
          </label>
          <input
            type="date"
            value={selectedDate}
            min={toDateInputValue(new Date())}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-3 rounded-xl border"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            <Clock className="inline w-4 h-4 mr-2" /> Duração
          </label>
          <input
            type="number"
            min={15}
            step={15}
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
            className="w-full p-3 rounded-xl border"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Formato</label>
          <div className="p-3 rounded-xl border-2 border-primary bg-primary/10">
            <Video className="inline w-4 h-4 mr-2" /> Online
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Horários Disponíveis</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={retryFetchSlots} 
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="sm" /> : <RefreshCw className="w-4 h-4" />}
              {loading ? 'A carregar...' : 'Atualizar'}
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" text="A carregar horários..." />
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                {error ? 'Erro ao carregar horários' : 'Sem horários disponíveis nesta data'}
              </p>
              {error && error.retryable && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetry}
                  className="mt-2"
                >
                  Tentar Novamente
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {availableSlots.map((s) => (
                <Button
                  key={s.slot_time}
                  onClick={() => handleBook(s.slot_time)}
                  disabled={submitting}
                  variant="outline"
                  className="p-2 h-auto hover:bg-primary/10"
                >
                  {submitting ? <LoadingSpinner size="sm" /> : timeLabel(s.slot_time)}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedBookingWidget;