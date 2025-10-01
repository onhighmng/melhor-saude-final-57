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
    <div className="min-h-screen bg-soft-white">
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
            <h1 className="text-3xl font-bold text-navy-blue mb-3">
              Escolha o Tipo de Assistência
            </h1>
            <p className="text-royal-blue">
              Selecione como prefere obter ajuda jurídica
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
                <h3 className="text-xl font-semibold">Assistente Jurídico AI</h3>
                <p className="text-muted-foreground">
                  Obtenha respostas imediatas através do nosso assistente inteligente especializado em questões jurídicas
                </p>
                <Button className="w-full mt-4">
                  Falar com AI
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
                <h3 className="text-xl font-semibold">Especialista Humano</h3>
                <p className="text-muted-foreground">
                  Agende uma consulta personalizada com um dos nossos especialistas jurídicos
                </p>
                <Button className="w-full mt-4">
                  Agendar Consulta
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
