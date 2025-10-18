import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, User, Phone, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
  const {
    toast
  } = useToast();
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: Message = {
      role: 'user',
      content: input
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('mental-health-chat', {
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
        title: 'Erro',
        description: 'Não foi possível enviar a mensagem. Tente novamente.',
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
  return <div className="min-h-screen bg-soft-white">
      <div className="pt-16 pb-4 px-4">
        <div className="w-full max-w-6xl mx-auto h-[calc(100vh-120px)] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>

          <Card className="flex-1 flex flex-col overflow-hidden">
            <div className="p-6 border-b bg-primary/5">
              <h2 className="font-semibold text-lg">Assistente de Saúde Mental</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && <div className="text-center text-muted-foreground py-8">
                  
                  <p className="text-base mt-2">Contcacte no nosso especialista por mensagem para uma repsosta imediata.</p>
                </div>}
              
              {messages.map((message, index) => <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg p-4 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>)}
              
              {isLoading && <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-4">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                </div>}
              
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t space-y-3">
              <div className="flex gap-2">
                <Textarea value={input} onChange={e => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Digite sua pergunta..." className="resize-none" rows={2} disabled={isLoading} />
                <Button onClick={sendMessage} disabled={!input.trim() || isLoading} size="icon" className="h-full">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          <div className="bg-muted/50 border rounded-lg p-4 mt-4">
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Se as suas questões são complexas, solicite uma sessão 1-on-1 com um especialista.
              </p>
              <Button 
                variant="outline" 
                onClick={onChooseHuman} 
                className="gap-2"
              >
                <Phone className="h-4 w-4" />
                Solicitar Sessão 1-on-1
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default MentalHealthChatInterface;