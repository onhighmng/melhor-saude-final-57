import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
interface ChatIntroSectionProps {
  onSelectPrompt: (prompt: string) => void;
}
export const ChatIntroSection = ({
  onSelectPrompt
}: ChatIntroSectionProps) => {
  return <div className="space-y-6 py-6">
      <div className="space-y-2 text-center">
        <MessageSquare className="h-10 w-10 mx-auto text-primary" />
        <h2 className="text-xl font-semibold px-4">Estamos aqui para o ajudar a identificar o tipo de apoio certo — psicológico, físico, financeiro ou jurídico.</h2>
      </div>

      <div className="flex gap-2 px-2">
        <Button variant="outline" onClick={() => onSelectPrompt('Gostaria de partilhar o que sinto')} className="flex-1 text-center h-auto py-3 px-3 text-sm">
          <span>
            Gostaria de partilhar o que <span className="underline">"sinto"</span>
          </span>
        </Button>
        
        <Button variant="outline" onClick={() => onSelectPrompt('Estou um pouco indeciso sobre o que preciso')} className="flex-1 text-center h-auto py-3 px-3 text-sm">
          Estou um pouco indeciso sobre o que preciso
        </Button>
        
        <Button variant="outline" onClick={() => onSelectPrompt('Já percebi o que preciso')} className="flex-1 text-center h-auto py-3 px-3 text-sm">
          Já percebi o que preciso
        </Button>
      </div>
    </div>;
};