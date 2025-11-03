import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EscalatedChat } from '@/types/specialist';
import { toast } from '@/hooks/use-toast';

export const useEscalatedChats = () => {
  const [escalatedChats, setEscalatedChats] = useState<EscalatedChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEscalatedChats = async () => {
      try {
        // Fetch chat sessions with phone escalation
        const { data: sessions, error: sessionsError } = await supabase
          .from('chat_sessions')
          .select('*')
          .not('phone_escalation_reason', 'is', null)
          .order('created_at', { ascending: false });

        if (sessionsError) throw sessionsError;

        if (!sessions || sessions.length === 0) {
          setEscalatedChats([]);
          setIsLoading(false);
          return;
        }

        // Fetch user profiles for these sessions
        const userIds = [...new Set(sessions.map(s => s.user_id).filter(Boolean))];
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        // Fetch messages for each session
        const sessionIds = sessions.map(s => s.id);
        const { data: messages, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*')
          .in('session_id', sessionIds)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;

        // Fetch call logs
        const { data: callLogs, error: callLogsError } = await supabase
          .from('specialist_call_logs')
          .select('*')
          .in('chat_session_id', sessionIds);

        if (callLogsError) throw callLogsError;

        // Combine data
        const enrichedChats: EscalatedChat[] = sessions.map(session => {
          const profile = profiles?.find(p => p.id === session.user_id);
          const sessionMessages = messages?.filter(m => m.session_id === session.id) || [];
          const callLog = callLogs?.find(cl => cl.chat_session_id === session.id);

          return {
            ...session,
            pillar: session.pillar as 'legal' | 'psychological' | 'physical' | 'financial' | null,
            status: session.status as 'active' | 'escalated' | 'resolved' | 'phone_escalated' | 'pending',
            satisfaction_rating: session.satisfaction_rating as 'satisfied' | 'unsatisfied' | null,
            type: 'triage' as const,
            resolved: session.status === 'resolved',
            user_name: profile?.name || 'Utilizador Desconhecido',
            user_email: profile?.email || '',
            messages: sessionMessages.map(m => ({
              ...m,
              role: m.role as 'user' | 'assistant',
              metadata: m.metadata as Record<string, any>,
            })),
            call_log: (callLog || null) as any,
          };
        });

        setEscalatedChats(enrichedChats);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Não foi possível carregar as conversas escaladas.';
        toast({
          title: 'Erro',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEscalatedChats();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('escalated-chats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_sessions',
        },
        () => {
          fetchEscalatedChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { escalatedChats, isLoading };
};
