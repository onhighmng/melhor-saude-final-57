import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bot, User } from 'lucide-react';

interface SpecialistChoiceProps {
  onChooseAI: () => void;
  onChooseHuman: () => void;
  onBack: () => void;
}

const SpecialistChoice: React.FC<SpecialistChoiceProps> = ({
  onChooseAI,
  onChooseHuman,
  onBack
}) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6"
          >
            ← Voltar
          </Button>

          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-foreground mb-3">
              Como gostaria de receber apoio?
            </h1>
            <p className="text-muted-foreground">
              Escolha entre conversar com a nossa IA ou falar diretamente com o nosso especialista
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card 
              className="p-8 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary"
              onClick={onChooseAI}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Assistente Virtual</h3>
                <p className="text-muted-foreground">
                  Resposta imediata com o nosso assistente de saúde mental treinado
                </p>
                <Button className="w-full mt-4">
                  Conversar com IA
                </Button>
              </div>
            </Card>

            <Card 
              className="p-8 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary"
              onClick={onChooseHuman}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Nosso Especialista</h3>
                <p className="text-muted-foreground">
                  Agende uma sessão individual com o nosso especialista em saúde mental
                </p>
                <Button className="w-full mt-4">
                  Falar com Especialista
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialistChoice;
