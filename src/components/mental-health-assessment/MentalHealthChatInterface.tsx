import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface MentalHealthAssessment {
  selectedTopics: string[];
  selectedSymptoms: string[];
  additionalNotes: string;
}

interface MentalHealthChatInterfaceProps {
  assessment: MentalHealthAssessment;
  onBack: () => void;
  onComplete: () => void;
  onChooseHuman?: () => void;
}

const MentalHealthChatInterface: React.FC<MentalHealthChatInterfaceProps> = ({
  assessment,
  onBack,
  onComplete,
  onChooseHuman
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { t } = useTranslation(['user', 'errors']);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('mental-health-chat', {
        body: {
          messages: [...messages, userMessage],
          assessment
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: t('errors:title'),
        description: t('errors:messageSendFailed'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-soft-white">
      <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={onBack}>
              {t('user:assessment.chat.backButton')}
            </Button>
            <Button variant="outline" onClick={onComplete}>
              {t('user:assessment.chat.finishButton')}
            </Button>
          </div>

          <Card className="flex-1 flex flex-col overflow-hidden">
            <div className="p-6 border-b bg-primary/5">
              <h2 className="font-semibold text-lg">{t('user:assessment.chat.mentalHealthAssistant')}</h2>
              <p className="text-sm text-muted-foreground">
                {t('user:assessment.chat.mentalHealthDescription')}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <p>{t('user:assessment.chat.mentalHealthGreeting')}</p>
                  <p className="text-sm mt-2">{t('user:assessment.chat.startPrompt')}</p>
                </div>
              )}
              
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-4">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t space-y-3">
              {onChooseHuman && (
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={onChooseHuman}
                >
                  <User className="h-4 w-4" />
                  {t('user:assessment.chat.speakWithSpecialistButton')}
                </Button>
              )}
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('user:assessment.chat.inputPlaceholder')}
                  className="resize-none"
                  rows={2}
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="h-full"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MentalHealthChatInterface;
