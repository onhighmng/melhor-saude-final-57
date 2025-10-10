import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatIntroSectionProps {
  onSelectPrompt: (prompt: string) => void;
}

export const ChatIntroSection = ({ onSelectPrompt }: ChatIntroSectionProps) => {
  const prompts = [
    {
      text: 'Eu gostaria de partilhar o que "sinto"',
      value: 'Eu gostaria de partilhar o que sinto'
    },
    {
      text: 'Estou um pouco indeciso sobre o que preciso',
      value: 'Estou um pouco indeciso sobre o que preciso'
    },
    {
      text: 'Já percebi o que preciso',
      value: 'Já percebi o que preciso'
    }
  ];

  return (
    <div className="text-center space-y-6 py-8">
      <div className="space-y-2">
        <MessageSquare className="h-12 w-12 mx-auto text-primary" />
        <h2 className="text-2xl font-semibold">
          Como podemos ajudar?
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Partilhe comigo o que sente e veremos juntos como apoiá-lo ou apoiá-la.
        </p>
      </div>

      <div className="space-y-3">
        {prompts.map((prompt, idx) => (
          <Button
            key={idx}
            variant="outline"
            onClick={() => onSelectPrompt(prompt.value)}
            className="w-full text-left h-auto py-4 px-6"
          >
            {idx === 0 ? (
              <span>
                Eu gostaria de partilhar o que <span className="underline">"sinto"</span>
              </span>
            ) : (
              prompt.text
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};
