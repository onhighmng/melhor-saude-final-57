import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatIntroSectionProps {
  onSelectPrompt: (prompt: string) => void;
}

export const ChatIntroSection = ({ onSelectPrompt }: ChatIntroSectionProps) => {
  return (
    <div className="text-center space-y-6 py-8">
      <div className="space-y-2">
        <MessageSquare className="h-12 w-12 mx-auto text-primary" />
        <h2 className="text-2xl font-semibold">
          Olá! Estou aqui para ouvir e apoiar você.
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Envie uma mensagem para o nosso especialista. Ideal para questões rápidas que o nosso especialista irá responder.
        </p>
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          onClick={() => onSelectPrompt('me sinto ultimamente')}
          className="w-full text-left h-auto py-4 px-6"
        >
          <span>
            Gostaria de partilhar o que <span className="underline">"me sinto ultimamente"</span>
          </span>
        </Button>
        
        <Button
          variant="outline"
          onClick={() => onSelectPrompt('Preciso de ajuda com uma questão específica')}
          className="w-full text-left h-auto py-4 px-6"
        >
          Preciso de ajuda com uma questão específica
        </Button>
        
        <Button
          variant="outline"
          onClick={() => onSelectPrompt('Tenho uma dúvida sobre os serviços')}
          className="w-full text-left h-auto py-4 px-6"
        >
          Tenho uma dúvida sobre os serviços
        </Button>
      </div>
    </div>
  );
};
