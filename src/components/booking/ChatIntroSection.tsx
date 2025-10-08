import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface ChatIntroSectionProps {
  onSelectPrompt: (prompt: string) => void;
}

export const ChatIntroSection = ({ onSelectPrompt }: ChatIntroSectionProps) => {
  const { t } = useTranslation('user');
  
  const prompts = [
    t('universalChat.prompts.feeling'),
    t('universalChat.prompts.identify'),
    t('universalChat.prompts.preference'),
  ];

  return (
    <div className="text-center space-y-6 py-8">
      <div className="space-y-2">
        <MessageSquare className="h-12 w-12 mx-auto text-primary" />
        <h2 className="text-2xl font-semibold">
          {t('universalChat.intro.title')}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {t('universalChat.intro.description')}
        </p>
      </div>

      <div className="space-y-3">
        {prompts.map((prompt, idx) => (
          <Button
            key={idx}
            variant="outline"
            onClick={() => onSelectPrompt(prompt)}
            className="w-full text-left h-auto py-4 px-6"
          >
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  );
};
