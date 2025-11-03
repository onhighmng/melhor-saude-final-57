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
      if (!profile?.id) {
        // No profile - set empty defaults
        setPerformance({
          sessionsThisMonth: 0,
          avgSatisfaction: 0,
          totalClients: 0,
          retentionRate: 0
        });
        setSessionEvolution([]);
        setFinancialData([]);
        setLoading(false);
        return;
      }

      try {
        // Get prestador ID with timeout
        const prestadorQuery = supabase
          .from('prestadores')
          .select('id')
          .eq('user_id', profile.id)
          .single();

        const { data: prestador, error: prestadorError } = await Promise.race([
          prestadorQuery,
          new Promise<any>((_, reject) => 
            setTimeout(() => reject(new Error('Query timeout')), 3000)
          )
        ]);

        if (prestadorError || !prestador) {
          console.warn('[PrestadorPerformance] No prestador found, showing empty stats');
          // Set empty defaults - no error shown
          setPerformance({
            sessionsThisMonth: 0,
            avgSatisfaction: 0,
            totalClients: 0,
            retentionRate: 0
          });
          setSessionEvolution([]);
          setFinancialData([]);
          setLoading(false);
          return;
        }

        // Fetch bookings with timeout
        const bookingsQuery = supabase
          .from('bookings')
          .select('*')
          .eq('prestador_id', prestador.id);

        const { data: bookings } = await Promise.race([
          bookingsQuery,
          new Promise<any>((_, reject) => 
            setTimeout(() => reject(new Error('Query timeout')), 3000)
          )
        ]).catch(() => ({ data: [] }));

        // Calculate stats from bookings (or use empty array if failed)
        const total = bookings?.length || 0;
        const completed = bookings?.filter(b => b.status === 'completed').length || 0;
        const cancelled = bookings?.filter(b => b.status === 'cancelled').length || 0;
        const noShow = bookings?.filter(b => b.status === 'no_show').length || 0;
        const avgRating = bookings?.filter(b => b.rating)
          .reduce((sum, b) => sum + (b.rating || 0), 0) / (bookings?.filter(b => b.rating).length || 1) || 0;
        
        const completionRate = total > 0 ? (completed / total) * 100 : 0;

        // Get current month sessions
        const currentMonth = new Date().toISOString().slice(0, 7);
        const currentMonthBookings = bookings?.filter(b => b.booking_date?.startsWith(currentMonth)) || [];
        const sessionsThisMonth = currentMonthBookings.length;

        // Calculate peak booking day
        const dayCounts = (bookings || []).reduce((acc: any, b: any) => {
          const day = new Date(b.booking_date || '').getDay();
          acc[day] = (acc[day] || 0) + 1;
          return acc;
        }, {});
        const peakDayEntry = Object.entries(dayCounts).sort((a: any, b: any) => b[1] - a[1])[0];
        const peakBookingDay = peakDayEntry ? ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][parseInt(peakDayEntry[0])] : 'N/A';

        // Calculate peak booking hour
        const hourCounts = (bookings || []).reduce((acc: any, b: any) => {
          const hour = parseInt(b.start_time?.split(':')[0] || '0');
          acc[hour] = (acc[hour] || 0) + 1;
          return acc;
        }, {});
        const peakHourEntry = Object.entries(hourCounts).sort((a: any, b: any) => b[1] - a[1])[0];
        const peakBookingHour = peakHourEntry ? `${peakHourEntry[0]}:00` : 'N/A';

        setPerformance({
          sessionsThisMonth,
          avgSatisfaction: Number(avgRating.toFixed(1)),
          totalClients: new Set(bookings?.map(b => b.user_id)).size, // Unique clients
          retentionRate: completionRate,
          // New metrics
          completionRate: Number(completionRate.toFixed(1)),
          noShowRate: total > 0 ? Number(((noShow / total) * 100).toFixed(1)) : 0,
          cancellationRate: total > 0 ? Number(((cancelled / total) * 100).toFixed(1)) : 0,
          peakBookingDay,
          peakBookingHour
        });

        // Calculate monthly evolution (last 6 months)
        const evolution = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthStr = date.toISOString().slice(0, 7);
          
          const monthBookings = bookings?.filter(b => b.booking_date?.startsWith(monthStr)) || [];
          const monthCompleted = monthBookings.filter(b => b.status === 'completed');
          const monthAvgRating = monthCompleted.filter(b => b.rating)
            .reduce((sum, b) => sum + (b.rating || 0), 0) / (monthCompleted.filter(b => b.rating).length || 1) || 0;
          
          evolution.push({
            month: date.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' }),
            sessions: monthBookings.length,
            satisfaction: Number(monthAvgRating.toFixed(1))
          });
        }
        setSessionEvolution(evolution);

        // PAYMENT FEATURE DISABLED
        // Fetch pricing from prestador_pricing table (with timeout and fallback)
        // const pricingQuery = supabase
        //   .from('prestador_pricing')
        //   .select('session_price, platform_commission_rate')
        //   .eq('prestador_id', prestador.id)
        //   .single();

        // PAYMENT FEATURE DISABLED - No financial/earnings tracking
        // const { data: pricing } = await Promise.race([
        //   pricingQuery,
        //   new Promise<any>((_, reject) => 
        //     setTimeout(() => reject(new Error('Query timeout')), 3000)
        //   )
        // ]).catch(() => ({ data: null }));

        // const sessionPrice = pricing?.session_price || 1500;
        // const commissionRate = pricing?.platform_commission_rate || 0.25;

        // Calculate financial data by month (last 6 months)
        // PAYMENT FEATURE DISABLED
        // const financialByMonth = [];
        // for (let i = 5; i >= 0; i--) {
        //   const date = new Date();
        //   date.setMonth(date.getMonth() - i);
        //   const monthStr = date.toISOString().slice(0, 7);
          
        //   const monthBookings = bookings?.filter(b => b.date?.startsWith(monthStr) && b.status === 'completed') || [];
        //   const monthSessions = monthBookings.length;
        //   const grossValue = monthSessions * sessionPrice;
        //   const commission = grossValue * commissionRate;
        //   const netValue = grossValue - commission;
          
        //   financialByMonth.push({
        //     month: date.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' }),
        //     sessions: monthSessions,
        //     grossValue: Number(grossValue.toFixed(2)),
        //     commission: Number(commission.toFixed(2)),
        //     netValue: Number(netValue.toFixed(2))
        //   });
        // }
        setFinancialData([]); // Payment feature disabled
      } catch (error) {
        // Silently fail - show empty stats instead of error
        console.warn('[PrestadorPerformance] Error loading performance data, showing empty stats:', error);
        setPerformance({
          sessionsThisMonth: 0,
          avgSatisfaction: 0,
          totalClients: 0,
          retentionRate: 0
        });
        setSessionEvolution([]);
        setFinancialData([]);
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
      const csvHeader = 'Mês,Sessões,Satisfação\n';
      const csvRows = sessionEvolution.map(row => 
        `${row.month},${row.sessions},${row.satisfaction}`
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
