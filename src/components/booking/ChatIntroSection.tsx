import { MessageSquare } from 'lucide-react';
import { PromptSuggestion } from '@/components/ui/prompt-suggestion';
interface ChatIntroSectionProps {
  onSelectPrompt: (prompt: string) => void;
}
export const ChatIntroSection = ({
  onSelectPrompt
}: ChatIntroSectionProps) => {
  return <div className="space-y-6 py-6">
      <div className="space-y-4 text-center py-0 my-[103px]">
        <MessageSquare className="h-12 w-12 mx-auto text-[#4A90E2]" strokeWidth={2.5} />
        <p className="text-lg font-normal px-4 leading-relaxed">
          Estamos aqui para o ajudar a identificar o tipo de apoio certo — psicológico, físico, financeiro ou jurídico.
        </p>
      </div>

      <div className="space-y-3 px-2">
        <div className="grid grid-cols-2 gap-3">
          <PromptSuggestion onClick={() => onSelectPrompt('Gostaria de partilhar o que sinto')} variant="outline" className="text-center h-auto py-4 px-4">
            Gostaria de partilhar o que <span className="underline">"sinto"</span>
          </PromptSuggestion>
          
          <PromptSuggestion onClick={() => onSelectPrompt('Já percebi o que preciso')} variant="outline" className="text-center h-auto py-4 px-4">
            Já percebi o que preciso
          </PromptSuggestion>
        </div>
        
        <PromptSuggestion onClick={() => onSelectPrompt('Estou um pouco indeciso sobre o que preciso')} variant="outline" className="w-full text-center h-auto py-4 px-4">
          Estou um pouco indeciso sobre o que preciso
        </PromptSuggestion>
      </div>
    </div>;
};