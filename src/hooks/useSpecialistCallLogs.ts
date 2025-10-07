import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SpecialistCallLog } from '@/types/specialist';
import { toast } from '@/hooks/use-toast';

export const useSpecialistCallLogs = (specialistId: string | undefined) => {
  const [callLogs, setCallLogs] = useState<SpecialistCallLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!specialistId) {
      setIsLoading(false);
      return;
    }

    const fetchCallLogs = async () => {
      try {
        const { data, error } = await supabase
          .from('specialist_call_logs')
          .select('*')
          .eq('specialist_id', specialistId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCallLogs((data || []) as SpecialistCallLog[]);
      } catch (error) {
        console.error('Error fetching call logs:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os registos de chamadas.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCallLogs();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('specialist-call-logs')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'specialist_call_logs',
          filter: `specialist_id=eq.${specialistId}`,
        },
        () => {
          fetchCallLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [specialistId]);

  const createCallLog = async (data: Partial<SpecialistCallLog>) => {
    try {
      const { data: newLog, error } = await supabase
        .from('specialist_call_logs')
        .insert([{ ...data, specialist_id: specialistId }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Registo de chamada criado com sucesso.',
      });

      return newLog;
    } catch (error) {
      console.error('Error creating call log:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o registo de chamada.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateCallLog = async (id: string, data: Partial<SpecialistCallLog>) => {
    try {
      const { error } = await supabase
        .from('specialist_call_logs')
        .update(data)
        .eq('id', id)
        .eq('specialist_id', specialistId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Registo de chamada atualizado com sucesso.',
      });
    } catch (error) {
      console.error('Error updating call log:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o registo de chamada.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return { callLogs, isLoading, createCallLog, updateCallLog };
};
