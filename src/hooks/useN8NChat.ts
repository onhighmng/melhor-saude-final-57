import { useState, useCallback, useMemo } from 'react';
import { n8nChatService, ChatMessage, N8NChatResponse } from '@/services/n8nChatService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UseN8NChatOptions {
  sessionId?: string;
  onMessageSent?: (message: string) => void;
  onResponseReceived?: (response: N8NChatResponse) => void;
  onError?: (error: Error) => void;
}

export function useN8NChat(options: UseN8NChatOptions = {}) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Generate a sessionId if not provided (persists for the lifetime of this hook instance)
  // Uses browser's built-in crypto.randomUUID() for UUID generation
  const sessionId = useMemo(() => options.sessionId || crypto.randomUUID(), [options.sessionId]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(
    async (message: string, additionalContext?: Record<string, any>) => {
      if (!message.trim() || isLoading) return null;

      setIsLoading(true);
      setError(null);

      // Add user message to UI
      const userMessage: ChatMessage = {
        role: 'user',
        content: message.trim(),
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Callback for message sent
      options.onMessageSent?.(message);

      try {
        // Send to N8N webhook with sessionId (required)
        const response = await n8nChatService.sendMessageWithHistory(
          message.trim(),
          messages,
          sessionId, // Required sessionId
          user?.id,
          additionalContext
        );

        if (!response.success) {
          throw new Error(response.error || 'Failed to get response');
        }

        // Add assistant message to UI
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.message,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Callback for response received
        options.onResponseReceived?.(response);

        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        options.onError?.(error);

        toast({
          title: 'Erro',
          description: 'Não foi possível enviar a mensagem. Tente novamente.',
          variant: 'destructive',
        });

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, user, options, toast, sessionId]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const setMessageHistory = useCallback((history: ChatMessage[]) => {
    setMessages(history);
  }, []);

  return {
    sessionId,
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    addMessage,
    setMessageHistory,
  };
}

