
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const IntercomChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleContactSupport = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Send notification to admin dashboard
      const { error } = await supabase.functions.invoke('notification-send', {
        body: {
          user_id: 'admin', // This will need to be handled by the function to send to all admins
          title: 'Solicitação de Suporte',
          body: `Prestador ${user.email} solicitou suporte através do chat.`,
          data: {
            type: 'support_request',
            prestador_id: user.id,
            prestador_email: user.email,
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) {
        console.error('Error sending notification:', error);
        toast({
          title: "Erro",
          description: "Não foi possível enviar a solicitação. Tente novamente.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Solicitação Enviada",
          description: "Sua solicitação de suporte foi enviada para a equipe administrativa."
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-royal-blue rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-soft-white text-xl">💬</span>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg text-navy-blue mb-2">
              Precisa de Ajuda?
            </h3>
            <p className="text-sm text-navy-blue opacity-80 mb-4">
              Nossa equipe está sempre disponível para ajudar com questões sobre o seu perfil.
            </p>
          </div>
          
          <Button 
            onClick={handleContactSupport}
            disabled={isLoading}
            className="w-full bg-royal-blue text-soft-white hover:bg-navy-blue disabled:opacity-50"
          >
            {isLoading ? 'Enviando...' : 'Contactar Suporte'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntercomChat;
