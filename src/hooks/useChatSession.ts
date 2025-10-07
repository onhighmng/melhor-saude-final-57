import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { isValidUUID } from '@/utils/uuid';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatSession {
  id: string;
  pillar?: string;
  status: string;
}

export const useChatSession = (userId: string | undefined) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pillar, setPillar] = useState<string | null>(null);
  const { toast } = useToast();

  const createSession = useCallback(async () => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'User ID is required to start a chat session',
        variant: 'destructive'
      });
      return null;
    }

    if (!isValidUUID(userId)) {
      console.error('Invalid user ID format:', userId);
      toast({
        title: 'Error',
        description: 'Invalid user session. Please try logging in again.',
        variant: 'destructive'
      });
      return null;
    }

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: userId,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating chat session:', error);
      toast({
        title: 'Error',
        description: 'Failed to start chat session',
        variant: 'destructive'
      });
      return null;
    }

    setSessionId(data.id);
    return data.id;
  }, [userId, toast]);

  const saveMessage = useCallback(async (role: 'user' | 'assistant', content: string, metadata = {}) => {
    if (!sessionId) return;

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role,
        content,
        metadata
      });

    if (error) {
      console.error('Error saving message:', error);
    }
  }, [sessionId]);

  const updateSession = useCallback(async (updates: Partial<ChatSession>) => {
    if (!sessionId) return;

    const { error } = await supabase
      .from('chat_sessions')
      .update(updates)
      .eq('id', sessionId);

    if (error) {
      console.error('Error updating session:', error);
    }
  }, [sessionId]);

  const addMessage = useCallback((message: Message, saveToDb = true) => {
    setMessages(prev => [...prev, message]);
    if (saveToDb && message.role !== 'system') {
      saveMessage(message.role, message.content);
    }
  }, [saveMessage]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content };
    addMessage(userMessage);
    setIsLoading(true);

    try {
      const mode = pillar ? 'specialist' : 'identify_pillar';
      
      const { data, error } = await supabase.functions.invoke('universal-specialist-chat', {
        body: { 
          messages: [...messages, userMessage],
          pillar,
          mode
        }
      });

      if (error) throw error;

      if (mode === 'identify_pillar' && data.identified_pillar && data.identified_pillar !== 'unclear') {
        setPillar(data.identified_pillar);
        await updateSession({ pillar: data.identified_pillar });
      }

      const assistantMessage: Message = { role: 'assistant', content: data.message };
      addMessage(assistantMessage);

      // Track progress
      if (userId) {
        await supabase.from('user_progress').insert({
          user_id: userId,
          pillar: pillar || 'general',
          action_type: 'chat_interaction',
          metadata: { complexity: data.complexity }
        });
      }

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, pillar, isLoading, addMessage, updateSession, userId, toast]);

  const endSession = useCallback(async (satisfaction?: 'satisfied' | 'unsatisfied') => {
    if (!sessionId) return;

    await updateSession({
      status: 'resolved',
      satisfaction_rating: satisfaction
    } as any);
  }, [sessionId, updateSession]);

  return {
    sessionId,
    messages,
    isLoading,
    pillar,
    createSession,
    sendMessage,
    addMessage,
    endSession
  };
};
