import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SpecialistAnalytics } from '@/types/specialist';
import { toast } from '@/hooks/use-toast';

interface AggregatedMetrics {
  totalChats: number;
  aiResolvedRate: number;
  phoneEscalationRate: number;
  sessionBookingRate: number;
  satisfactionRate: number;
  pillarBreakdown: {
    legal: number;
    psychological: number;
    physical: number;
    financial: number;
  };
}

export const useSpecialistAnalytics = () => {
  const [analytics, setAnalytics] = useState<SpecialistAnalytics[]>([]);
  const [metrics, setMetrics] = useState<AggregatedMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data, error } = await supabase
          .from('specialist_analytics')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;

        setAnalytics(data || []);

        // Calculate aggregated metrics
        if (data && data.length > 0) {
          const totalChats = data.reduce((sum, row) => sum + row.total_chats, 0);
          const totalAiResolved = data.reduce((sum, row) => sum + row.ai_resolved, 0);
          const totalPhoneEscalated = data.reduce((sum, row) => sum + row.phone_escalated, 0);
          const totalSessionsBooked = data.reduce((sum, row) => sum + row.sessions_booked, 0);
          const totalSatisfied = data.reduce((sum, row) => sum + row.satisfied_users, 0);
          const totalRatings = data.reduce((sum, row) => sum + row.satisfied_users + row.unsatisfied_users, 0);

          const pillarBreakdown = {
            legal: data.filter(d => d.pillar === 'legal').reduce((sum, row) => sum + row.total_chats, 0),
            psychological: data.filter(d => d.pillar === 'psychological').reduce((sum, row) => sum + row.total_chats, 0),
            physical: data.filter(d => d.pillar === 'physical').reduce((sum, row) => sum + row.total_chats, 0),
            financial: data.filter(d => d.pillar === 'financial').reduce((sum, row) => sum + row.total_chats, 0),
          };

          setMetrics({
            totalChats,
            aiResolvedRate: totalChats > 0 ? (totalAiResolved / totalChats) * 100 : 0,
            phoneEscalationRate: totalChats > 0 ? (totalPhoneEscalated / totalChats) * 100 : 0,
            sessionBookingRate: totalChats > 0 ? (totalSessionsBooked / totalChats) * 100 : 0,
            satisfactionRate: totalRatings > 0 ? (totalSatisfied / totalRatings) * 100 : 0,
            pillarBreakdown,
          });
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as análises.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return { analytics, metrics, isLoading };
};
