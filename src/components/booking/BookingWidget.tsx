import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Video, MapPin } from 'lucide-react';

interface BookingWidgetProps {
  prestadorId: string;
}

const toDateInputValue = (d: Date) => d.toISOString().split('T')[0];

const timeLabel = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const BookingWidget: React.FC<BookingWidgetProps> = ({ prestadorId }) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string>(toDateInputValue(new Date()));
  const [duration, setDuration] = useState<number>(60);
  const [format, setFormat] = useState<'online'>('online');
  const [slots, setSlots] = useState<{ slot_time: string; is_available: boolean }[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadPrestador = async () => {
      const { data } = await supabase
        .from('prestadores')
        .select('session_duration')
        .eq('id', prestadorId)
        .maybeSingle();
      if (data?.session_duration) setDuration(data.session_duration);
    };
    loadPrestador();
  }, [prestadorId]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_available_slots', {
        p_prestador_id: prestadorId,
        p_date: selectedDate,
        p_duration: duration,
      });
      if (error) throw error;
      setSlots(data || []);
    } catch (e) {
      console.error('Error fetching slots', e);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (prestadorId && selectedDate) fetchSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prestadorId, selectedDate, duration]);

  const availableSlots = useMemo(() => slots.filter(s => s.is_available), [slots]);

  const handleBook = async (slotISO: string) => {
    try {
      setSubmitting(true);
      // Validate availability just before booking
      const { data: ok, error: chkErr } = await supabase.rpc('check_booking_availability', {
        p_prestador_id: prestadorId,
        p_booking_date: slotISO,
        p_duration: duration,
        p_exclude_booking_id: null,
      });
      if (chkErr || ok === false) {
        alert('Este horário já não está disponível. Por favor, escolha outro.');
        await fetchSlots();
        return;
      }

      // Create booking directly (RLS ensures user_id is current user)
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes?.user) {
        alert('Precisa iniciar sessão para agendar.');
        return;
      }

      const { error: insErr } = await supabase
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
      if (insErr) throw insErr;

      alert('Sessão agendada com sucesso!');
      // Optionally redirect to history or confirmation page
      navigate('/user/sessions');
    } catch (e) {
      console.error('Error booking session', e);
      alert('Falha ao agendar. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agendar Sessão</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
          <div className="p-3 rounded-xl border-2 border-accent-sage bg-accent-sage/10">
            <Video className="inline w-4 h-4 mr-2" /> Online
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Horários Disponíveis</span>
            <Button variant="outline" size="sm" onClick={fetchSlots} disabled={loading}>
              {loading ? 'A carregar...' : 'Atualizar'}
            </Button>
          </div>
          {availableSlots.length === 0 ? (
            <p className="text-sm text-gray-600">Sem horários disponíveis nesta data.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {availableSlots.map((s) => (
                <button
                  key={s.slot_time}
                  onClick={() => handleBook(s.slot_time)}
                  disabled={submitting}
                  className="p-2 border rounded-lg hover:bg-accent-sage/10"
                >
                  {timeLabel(s.slot_time)}
                </button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingWidget;
