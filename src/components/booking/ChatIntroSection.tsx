import { MessageSquare } from 'lucide-react';
import { PromptSuggestion } from '@/components/ui/prompt-suggestion';

interface ChatIntroSectionProps {
  onSelectPrompt: (prompt: string) => void;
}

export const ChatIntroSection = ({
  onSelectPrompt
}: ChatIntroSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-3 text-center">
        <MessageSquare className="h-12 w-12 mx-auto text-[#4A90E2]" strokeWidth={2.5} />
        <p className="text-lg font-normal px-4 leading-relaxed">
          Estamos aqui para o ajudar a identificar o tipo de apoio certo — psicológico, físico, financeiro ou jurídico.
        </p>
      </div>

      <div className="px-4">
        <div className="flex gap-3 justify-center flex-wrap">
          <PromptSuggestion 
            onClick={() => onSelectPrompt('Gostaria de partilhar o que sinto')}
            variant="outline"
            size="lg"
            className="h-auto py-3 px-8 text-sm"
          >
            Gostaria de partilhar o que <span className="underline">"sinto"</span>
          </PromptSuggestion>
          
          <PromptSuggestion 
            onClick={() => onSelectPrompt('Já percebi o que preciso')}
            variant="outline"
            size="lg"
            className="h-auto py-3 px-8 text-sm"
          >
            Já percebi o que preciso
          </PromptSuggestion>

          <PromptSuggestion 
            onClick={() => onSelectPrompt('Estou um pouco indeciso sobre o que preciso')}
            variant="outline"
            size="lg"
            className="h-auto py-3 px-8 text-sm"
          >
            Estou um pouco indeciso sobre o que preciso
          </PromptSuggestion>
        </div>
      </div>
    </div>
  );
};