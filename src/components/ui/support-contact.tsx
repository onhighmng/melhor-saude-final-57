import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageCircle, Mail, Phone, Clock, Bot, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SupportContactProps {
  children: React.ReactNode;
  className?: string;
}

export function SupportContact({ children, className }: SupportContactProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'initial' | 'bot' | 'human'>('initial');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const handleContactSupport = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('notification-send', {
        body: {
          type: 'support_request',
          message: `Support request from ${user.email}`,
          userId: user.id,
          metadata: {
            userRole: user.user_metadata?.role,
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Pedido enviado!",
        description: "A nossa equipa entrará em contacto consigo brevemente.",
      });
      setStep('bot');
    } catch (error) {
      console.error('Error sending support request:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o pedido. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHumanContact = async () => {
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('notification-send', {
        body: {
          type: 'human_support_request',
          message: `Human support request: ${formData.subject}`,
          userId: user?.id,
          metadata: {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message,
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Mensagem enviada!",
        description: "Responderemos o mais breve possível.",
      });
      
      // Reset form
      setFormData({ name: '', email: '', subject: '', message: '' });
      setStep('initial');
    } catch (error) {
      console.error('Error sending human support request:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={() => setStep('initial')}>
      <DialogTrigger asChild className={className}>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Centro de Ajuda
          </DialogTitle>
        </DialogHeader>

        {step === 'initial' && (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Como podemos ajudá-lo hoje? Escolha uma das opções abaixo:
            </p>
            
            <div className="grid gap-4">
              <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={handleContactSupport}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Bot className="h-5 w-5 text-primary" />
                    Assistente Virtual
                  </CardTitle>
                  <CardDescription>
                    Obtenha ajuda instantânea do nosso assistente virtual para questões comuns
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => setStep('human')}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-primary" />
                    Falar com um Humano
                  </CardTitle>
                  <CardDescription>
                    Contacte diretamente a nossa equipa de suporte para questões mais complexas
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="border-t pt-4 mt-6">
              <div className="grid gap-4 md:grid-cols-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-muted-foreground">suporte@plataforma.pt</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium">Telefone</p>
                    <p className="text-muted-foreground">+351 XXX XXX XXX</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium">Horário</p>
                    <p className="text-muted-foreground">Seg-Sex: 9h-18h</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'bot' && (
          <div className="space-y-4">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="h-5 w-5 text-primary" />
                <span className="font-medium">Assistente Virtual</span>
              </div>
              <p className="text-sm">
                Olá! Sou o assistente virtual da plataforma. Como posso ajudá-lo?
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Se não conseguir resolver o seu problema, pode sempre escolher falar com um humano.
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setStep('human')}
                className="flex-1"
              >
                Falar com Humano
              </Button>
              <Button 
                onClick={() => setStep('initial')}
                variant="ghost"
              >
                Voltar
              </Button>
            </div>
          </div>
        )}

        {step === 'human' && (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Preencha o formulário abaixo e a nossa equipa entrará em contacto consigo:
            </p>
            
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input 
                    id="name" 
                    placeholder="O seu nome"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="O seu email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Assunto</Label>
                <Input 
                  id="subject" 
                  placeholder="Assunto da mensagem"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Mensagem *</Label>
                <Textarea 
                  id="message" 
                  placeholder="Descreva o seu problema ou questão"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleHumanContact}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "A enviar..." : "Enviar Mensagem"}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setStep('initial')}
              >
                Voltar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}