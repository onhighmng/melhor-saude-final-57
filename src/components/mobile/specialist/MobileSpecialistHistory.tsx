import { useState, useEffect } from 'react';
import { Clock, User, Calendar, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MobileBottomNav } from '../shared/MobileBottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LoadingAnimation } from '@/components/LoadingAnimation';

interface HistoryItem {
  id: string;
  user_name: string;
  date: string;
  type: 'session' | 'note' | 'assessment';
  pillar: string;
  notes?: string;
}

export function MobileSpecialistHistory() {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }

      try {
        // Get prestador ID for this specialist
        const { data: prestador } = await supabase
          .from('prestadores')
          .select('id')
          .eq('user_id', profile.id)
          .single();

        if (!prestador) {
          setHistory([]);
          setLoading(false);
          return;
        }

        // Fetch bookings history
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            booking_date,
            pillar,
            status,
            notes,
            profiles!bookings_user_id_fkey(name)
          `)
          .eq('prestador_id', prestador.id)
          .in('status', ['completed', 'cancelled'])
          .order('booking_date', { ascending: false })
          .limit(50);

        if (bookingsError) throw bookingsError;

        // Fetch call logs
        const { data: callLogs, error: callLogsError } = await supabase
          .from('specialist_call_logs')
          .select(`
            id,
            created_at,
            call_notes,
            outcome,
            user_id,
            profiles!specialist_call_logs_user_id_fkey(name)
          `)
          .eq('specialist_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (callLogsError) throw callLogsError;

        // Combine and map to HistoryItem
        const allHistory: HistoryItem[] = [];

        // Map bookings
        if (bookings) {
          bookings.forEach((booking: any) => {
            let pillarLabel = 'Saúde Mental';
            if (booking.pillar === 'bem_estar_fisico' || booking.pillar === 'physical') {
              pillarLabel = 'Bem-Estar Físico';
            } else if (booking.pillar === 'assistencia_financeira' || booking.pillar === 'financial') {
              pillarLabel = 'Assistência Financeira';
            } else if (booking.pillar === 'assistencia_juridica' || booking.pillar === 'legal') {
              pillarLabel = 'Assistência Jurídica';
            }

            allHistory.push({
              id: `booking-${booking.id}`,
              user_name: booking.profiles?.name || 'Utilizador',
              date: booking.booking_date,
              type: 'session',
              pillar: pillarLabel,
              notes: booking.notes || 'Sessão realizada'
            });
          });
        }

        // Map call logs
        if (callLogs) {
          callLogs.forEach((log: any) => {
            allHistory.push({
              id: `call-${log.id}`,
              user_name: log.profiles?.name || 'Utilizador',
              date: log.created_at.split('T')[0],
              type: 'note',
              pillar: 'Chamada',
              notes: log.call_notes || log.outcome || 'Chamada realizada'
            });
          });
        }

        // Sort by date (most recent first)
        allHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setHistory(allHistory);
      } catch (error) {
        console.error('Error loading history:', error);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [profile?.id]);

  if (loading) {
    return <LoadingAnimation variant="fullscreen" message="A carregar histórico..." showProgress={true} />;
  }

  const filteredHistory = history.filter(item => 
    item.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-5 py-6">
          <h1 className="text-gray-900 text-2xl font-bold">Histórico</h1>
          <p className="text-gray-500 text-sm">Histórico de interações</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-5 py-4">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum histórico disponível</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((item) => (
            <Card 
              key={item.id}
              className="bg-white rounded-2xl p-4 border border-gray-200 active:scale-95 transition-transform cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 font-medium">{item.user_name}</h3>
                  <p className="text-gray-500 text-sm mt-1">{item.notes}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="text-xs">{item.pillar}</Badge>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span className="text-xs">
                        {new Date(item.date).toLocaleDateString('pt-PT')}
                      </span>
                    </div>
                  </div>
                </div>
                <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            </Card>
            ))}
          </div>
        )}
      </div>

      <MobileBottomNav userType="specialist" />
    </div>
  );
}

