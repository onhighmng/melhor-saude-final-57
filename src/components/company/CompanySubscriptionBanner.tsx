import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface SeatStats {
  employee_seats: number;
  active_employees: number;
  pending_invites: number;
  total_used_seats: number;
  available_seats: number;
  sessions_allocated: number;
  sessions_used: number;
  sessions_available: number;
}

interface CompanySubscriptionBannerProps {
  compact?: boolean;
  showDetails?: boolean;
}

export const CompanySubscriptionBanner = ({ 
  compact = false,
  showDetails = true 
}: CompanySubscriptionBannerProps) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [seatStats, setSeatStats] = useState<SeatStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSeatStats = async () => {
      if (!profile?.company_id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .rpc('get_company_seat_stats', { p_company_id: profile.company_id })
          .single();

        if (error) {
          console.error('Error loading seat stats:', error);
        } else {
          setSeatStats(data);
        }
      } catch (error) {
        console.error('Error loading seat stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSeatStats();
  }, [profile?.company_id]);

  if (loading || !seatStats) {
    return null;
  }

  const utilizationPercent = seatStats.employee_seats > 0 
    ? Math.round((seatStats.total_used_seats / seatStats.employee_seats) * 100) 
    : 0;

  const isLow = seatStats.available_seats <= 5 && seatStats.available_seats > 0;
  const isZero = seatStats.available_seats <= 0;

  // Compact version for sub-pages
  if (compact) {
    return (
      <div className="max-w-7xl mx-auto px-6">
        <Card className={`border ${isZero ? 'border-red-200 bg-red-50/50' : isLow ? 'border-amber-200 bg-amber-50/50' : 'border-primary/20 bg-primary/5'}`}>
          <CardContent className="py-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <Users className={`h-5 w-5 ${isZero ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-primary'}`} />
                <div>
                  <p className="text-sm font-medium">
                    Plano: {seatStats.employee_seats} lugares
                    {showDetails && (
                      <span className="text-muted-foreground ml-2">
                        • {seatStats.active_employees} ativos • {seatStats.pending_invites} pendentes • {seatStats.available_seats} disponíveis
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
              {(isLow || isZero) && (
                <button 
                  onClick={() => navigate('/company/colaboradores')}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Gerir Códigos →
                </button>
              )}
            </div>
            
            {isZero && (
              <div className="mt-2 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-800">
                  Limite atingido. Entre em contato para fazer upgrade do plano.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Full version for main pages
  return (
    <div className="max-w-7xl mx-auto px-6">
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Plano de Subscrição</p>
                <p className="text-2xl font-bold text-foreground">{seatStats.employee_seats} Lugares para Colaboradores</p>
              </div>
            </div>
            
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{seatStats.active_employees}</p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{seatStats.pending_invites}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{seatStats.available_seats}</p>
                <p className="text-xs text-muted-foreground">Disponíveis</p>
              </div>
            </div>
          </div>
          
          {isLow && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
              <span className="text-amber-600 text-sm">⚠️</span>
              <div className="flex-1">
                <p className="text-sm text-amber-800">
                  Atenção: Restam apenas {seatStats.available_seats} lugar{seatStats.available_seats !== 1 ? 'es' : ''} disponível{seatStats.available_seats !== 1 ? 'is' : ''} no seu plano.
                </p>
                <button 
                  onClick={() => navigate('/company/colaboradores')}
                  className="text-sm font-medium text-amber-900 hover:underline mt-1"
                >
                  Gerir códigos de acesso →
                </button>
              </div>
            </div>
          )}
          
          {isZero && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <span className="text-red-600 text-sm">🚫</span>
              <div className="flex-1">
                <p className="text-sm text-red-800">
                  Limite do plano atingido. Você usou todos os {seatStats.employee_seats} lugares disponíveis. 
                  Entre em contato para fazer upgrade do seu plano.
                </p>
                <button 
                  onClick={() => navigate('/company/colaboradores')}
                  className="text-sm font-medium text-red-900 hover:underline mt-1"
                >
                  Ver detalhes →
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};



