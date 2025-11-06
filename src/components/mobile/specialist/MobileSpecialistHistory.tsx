import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MobileBottomNav } from '../shared/MobileBottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import melhorSaudeLogo from '@/assets/melhor-saude-logo.png';

interface UserHistory {
  id: string;
  name: string;
  company: string;
  plan: string;
  planColor: string;
  date: string;
  rating: string;
  ratingColor: string;
  notes: string;
}

export function MobileSpecialistHistory() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data: prestador } = await supabase
          .from('prestadores')
          .select('id')
          .eq('user_id', profile.id)
          .single();

        if (!prestador) {
          setUsers([]);
          setLoading(false);
          return;
        }

        // Fetch unique users from completed bookings
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select(`
            id,
            booking_date,
            pillar,
            notes,
            user_id,
            profiles!bookings_user_id_fkey(name, email),
            company:companies(name)
          `)
          .eq('prestador_id', prestador.id)
          .eq('status', 'completed')
          .order('booking_date', { ascending: false });

        if (error) throw error;

        // Group by user and get most recent session for each
        const userMap = new Map<string, any>();
        (bookings || []).forEach((booking: any) => {
          if (!userMap.has(booking.user_id)) {
            userMap.set(booking.user_id, booking);
          }
        });

        const mappedUsers: UserHistory[] = Array.from(userMap.values()).map((booking: any) => ({
          id: booking.user_id,
          name: booking.profiles?.name || 'Cliente',
          company: booking.company?.name || 'Empresa',
          plan: getPillarLabel(booking.pillar || 'saude_mental'),
          planColor: getPillarColor(booking.pillar || 'saude_mental'),
          date: new Date(booking.booking_date).toLocaleDateString('pt-PT'),
          rating: '4.5/5',
          ratingColor: 'text-yellow-600',
          notes: booking.notes || 'Sem notas disponíveis'
        }));

        setUsers(mappedUsers);
      } catch (error) {
        console.error('Error loading history:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [profile?.id]);

  const getPillarLabel = (pillar: string): string => {
    const labels: Record<string, string> = {
      'saude_mental': 'Saúde Mental',
      'mental_health': 'Saúde Mental',
      'assistencia_financeira': 'Assistência Financeira',
      'financial': 'Assistência Financeira',
      'assistencia_juridica': 'Assistência Jurídica',
      'legal': 'Assistência Jurídica',
      'bem_estar_fisico': 'Bem-Estar Físico',
      'physical': 'Bem-Estar Físico'
    };
    return labels[pillar] || 'Saúde Mental';
  };

  const getPillarColor = (pillar: string): string => {
    const colors: Record<string, string> = {
      'saude_mental': 'bg-blue-100 text-blue-700',
      'mental_health': 'bg-blue-100 text-blue-700',
      'assistencia_financeira': 'bg-green-100 text-green-700',
      'financial': 'bg-green-100 text-green-700',
      'assistencia_juridica': 'bg-purple-100 text-purple-700',
      'legal': 'bg-purple-100 text-purple-700',
      'bem_estar_fisico': 'bg-yellow-100 text-yellow-700',
      'physical': 'bg-yellow-100 text-yellow-700'
    };
    return colors[pillar] || 'bg-blue-100 text-blue-700';
  };

  if (loading) {
    return (
      <LoadingAnimation 
        variant="fullscreen" 
        message="A carregar histórico..." 
        showProgress={true}
        mascotSrc={melhorSaudeLogo}
        wordmarkSrc={melhorSaudeLogo}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* iOS-style Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 pt-12 pb-4">
          <h1 className="text-center text-gray-900 text-xl font-semibold mb-1">
            Histórial de Utilizadores
          </h1>
          <p className="text-center text-gray-500 text-sm">
            Lista de utilizadores já atendidos com histórico completo
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 pb-24">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <Eye className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum histórico disponível</p>
          </div>
        ) : (
          users.map((user) => (
            <div 
              key={user.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200"
            >
              {/* User Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-gray-900 font-medium mb-1">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.company}</p>
                </div>
                <Badge className={`${user.planColor} border-0 rounded-full px-3 py-1`}>
                  {user.plan}
                </Badge>
              </div>

              {/* Date and Rating */}
              <div className="flex items-center gap-4 mb-3 text-sm">
                <span className="text-gray-600">{user.date}</span>
                <span className={user.ratingColor}>★ {user.rating}</span>
              </div>

              {/* Notes */}
              <div className="mb-3">
                <p className="text-sm text-gray-700">{user.notes}</p>
              </div>

              {/* Action Button */}
              <Button 
                variant="outline" 
                className="w-full rounded-full border-gray-300 flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Ver mais detalhes
              </Button>
            </div>
          ))
        )}
      </div>

      <MobileBottomNav userType="specialist" />
    </div>
  );
}
