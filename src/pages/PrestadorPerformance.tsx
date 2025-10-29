import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { PrestadorPerformanceFeatures } from '@/components/ui/prestador-performance-features';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const PrestadorPerformance = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();
  const [performance, setPerformance] = useState<any>(null);
  const [sessionEvolution, setSessionEvolution] = useState<any[]>([]);
  const [financialData, setFinancialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPerformance = async () => {
      if (!profile?.id) return;

      try {
        const { data: prestador } = await supabase
          .from('prestadores')
          .select('id')
          .eq('user_id', profile.id)
          .single();

        if (!prestador) return;

        const { data: bookings } = await supabase
          .from('bookings')
          .select('*')
          .eq('prestador_id', prestador.id);

        if (bookings) {
          const total = bookings.length;
          const completed = bookings.filter(b => b.status === 'completed').length;
          const cancelled = bookings.filter(b => b.status === 'cancelled').length;
          const noShow = bookings.filter(b => b.status === 'no_show').length;
          const avgRating = bookings.filter(b => b.rating)
            .reduce((sum, b) => sum + (b.rating || 0), 0) / (bookings.filter(b => b.rating).length || 1);
          
          const completionRate = total > 0 ? (completed / total) * 100 : 0;

          setPerformance({
            totalSessions: total,
            completedSessions: completed,
            cancelledSessions: cancelled,
            noShowSessions: noShow,
            averageRating: Number(avgRating.toFixed(1)),
            completionRate: Number(completionRate.toFixed(1))
          });

          // Calculate monthly evolution (last 6 months)
          const evolution = [];
          for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthStr = date.toISOString().slice(0, 7);
            
            const monthBookings = bookings.filter(b => b.date.startsWith(monthStr));
            evolution.push({
              month: date.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' }),
              sessions: monthBookings.length,
              completed: monthBookings.filter(b => b.status === 'completed').length
            });
          }
          setSessionEvolution(evolution);

          // Fetch pricing from prestador_pricing table
          const { data: pricing } = await supabase
            .from('prestador_pricing')
            .select('session_price, platform_commission_rate')
            .eq('prestador_id', prestador.id)
            .single();

          const sessionPrice = pricing?.session_price || 1500;
          const commissionRate = pricing?.platform_commission_rate || 0.25;
          const providerRevenue = sessionPrice * (1 - commissionRate);

          const monthlyRevenue = completed * providerRevenue;
          setFinancialData({
            totalRevenue: completed * providerRevenue,
            pendingRevenue: (total - completed) * providerRevenue,
            monthlyRevenue,
            sessionsValue: sessionPrice
          });
        }
      } catch (error) {
        console.error('Error loading performance:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados de desempenho',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadPerformance();
  }, [profile?.id]);

  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      // Prepare CSV data
      const csvHeader = 'Mês,Sessões,Completas,Avaliação Média\n';
      const csvRows = sessionEvolution.map(row => 
        `${row.month},${row.sessions},${row.completed},${performance.averageRating}`
      ).join('\n');
      const csvContent = csvHeader + csvRows;

      // Create downloadable blob
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `desempenho-${Date.now()}.csv`;
      link.click();

      toast({
        title: "Relatório exportado",
        description: "CSV gerado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao gerar CSV",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (loading || !performance) {
    return (
      <div className="min-h-screen bg-blue-50 p-6 -m-6 flex items-center justify-center">
        <p>A carregar dados de desempenho...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6 -m-6">
      <PrestadorPerformanceFeatures
        performance={performance}
        sessionEvolution={sessionEvolution}
        financialData={financialData}
        onExportReport={handleExportReport}
        isExporting={isExporting}
      />
    </div>
  );
};

export default PrestadorPerformance;
