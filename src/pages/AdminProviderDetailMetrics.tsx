import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { ProviderFeatures } from '@/components/ui/provider-features';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminProviderDetailMetrics = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProvider();
  }, [providerId]);

  const loadProvider = async () => {
    if (!providerId) return;

    try {
      // Load prestador
      const { data: prestadorData, error: prestadorError } = await supabase
        .from('prestadores')
        .select('*')
        .eq('id', providerId)
        .single();

      if (prestadorError) throw prestadorError;

      // Load performance data
      const { data: performanceData } = await supabase
        .from('prestador_performance')
        .select('*')
        .eq('prestador_id', providerId)
        .order('period_start', { ascending: false })
        .limit(6);

      // Load pricing
      const { data: pricingData } = await supabase
        .from('prestador_pricing')
        .select('*')
        .eq('prestador_id', providerId)
        .single();

      const sessionPrice = pricingData?.session_price || 1500;
      const commissionRate = pricingData?.platform_commission_rate || 0.25;

      // Calculate revenue from performance
      const monthlyRevenue = performanceData?.map(p => ({
        month: p.period_start,
        revenue: (p.completed_sessions || 0) * sessionPrice * (1 - commissionRate)
      })) || [];

      setProvider({
        ...prestadorData,
        performance: performanceData || [],
        pricing: pricingData,
        monthlyRevenue
      });
    } catch (error) {
      console.error('Error loading provider:', error);
      toast.error('Erro ao carregar prestador');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="container mx-auto p-8">
        <Button variant="ghost" onClick={() => navigate('/admin/users-management')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Prestador não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      <div className="space-y-6">
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
        </Button>
              <div>
              <h1 className="text-3xl font-bold">Detalhes do Prestador</h1>
              <p className="text-muted-foreground">Gestão de prestador e métricas de desempenho</p>
            </div>
          </div>
        </div>

        {/* Provider Features Component */}
        <ProviderFeatures provider={provider} />
      </div>
    </div>
  );
};

export default AdminProviderDetailMetrics;
