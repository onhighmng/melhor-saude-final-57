import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface ChatIntroSectionProps {
  onSelectPrompt: (prompt: string) => void;
}

export const ChatIntroSection = ({ onSelectPrompt }: ChatIntroSectionProps) => {
  const { t } = useTranslation('user');

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
          onClick={() => onSelectPrompt(t('universalChat.intro.button1'))}
          className="w-full text-left h-auto py-4 px-6"
        >
          <span>
            Gostaria de partilhar o que <span className="underline">"{t('universalChat.intro.button1Highlight')}"</span>
          </span>
        </Button>
        
        <Button
          variant="outline"
          onClick={() => onSelectPrompt(t('universalChat.intro.button2'))}
          className="w-full text-left h-auto py-4 px-6"
        >
          {t('universalChat.intro.button2')}
        </Button>
        
        <Button
          variant="outline"
          onClick={() => onSelectPrompt(t('universalChat.intro.button3'))}
          className="w-full text-left h-auto py-4 px-6"
        >
          {t('universalChat.intro.button3')}
        </Button>
      </div>
    </div>
  );
};
