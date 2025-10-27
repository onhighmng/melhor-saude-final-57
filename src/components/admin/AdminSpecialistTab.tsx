import { useState, useEffect } from 'react';
import SpecialistLayout from './SpecialistLayout';
import { supabase } from '@/integrations/supabase/client';
import { LiveIndicator } from '@/components/ui/live-indicator';

interface Case {
  id: string;
  collaborator: string;
  pillar: string;
  status: 'resolved' | 'in_progress' | 'forwarded';
  responseTime: string;
  resolution: string;
  date: string;
  email?: string;
  phone?: string;
  notes?: string;
  priority?: string;
  company?: string;
}

const pillarLabelMap: Record<string, string> = {
  'saude_mental': 'Saúde Mental',
  'bem_estar_fisico': 'Bem-Estar Físico',
  'assistencia_financeira': 'Assistência Financeira',
  'assistencia_juridica': 'Assistência Jurídica'
};

export default function AdminSpecialistTab() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCases();

    // Real-time subscription
    const subscription = supabase
      .channel('specialist-cases-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings'
      }, () => {
        loadCases();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadCases = async () => {
    try {
      // Load bookings from AI chat that require specialist attention
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_source', 'ai_chat')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles and companies separately
      const userIds = [...new Set((bookings || []).map(b => b.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email, phone')
        .in('id', userIds);

      const companyIds = [...new Set((bookings || []).filter(b => b.company_id).map(b => b.company_id as string))];
      
      let companiesData: any[] = [];
      if (companyIds.length > 0) {
        const { data } = await supabase
          .from('companies')
          .select('id, name')
          .in('id', companyIds);
        
        if (data) companiesData = data;
      }

      const formattedCases: Case[] = (bookings || []).map(booking => {
        const profile = profiles?.find(p => p.id === booking.user_id);
        const company = companiesData.find(c => c.id === booking.company_id);

        return {
          id: booking.id,
          collaborator: profile?.name || '',
          pillar: pillarLabelMap[booking.pillar as keyof typeof pillarLabelMap] || booking.pillar,
          status: booking.status === 'completed' ? 'resolved' as const 
                 : booking.status === 'confirmed' ? 'in_progress' as const
                 : 'forwarded' as const,
          responseTime: booking.notes || '-',
          resolution: booking.status === 'completed' ? 'Sessão concluída' 
                      : booking.status === 'confirmed' ? 'Em acompanhamento'
                      : 'Aguarda confirmação',
          date: booking.date,
          email: profile?.email,
          phone: profile?.phone,
          priority: booking.notes ? 'Alta' : 'Média',
          company: company?.name,
          notes: booking.notes
        };
      });

      setCases(formattedCases);
    } catch (error) {
      console.error('Error loading specialist cases:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <SpecialistLayout cases={cases} />
    </div>
  );
}
