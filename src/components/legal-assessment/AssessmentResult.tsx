import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { legalTopics, legalSymptoms } from '@/types/legalAssessment';
import { MessageCircle } from 'lucide-react';

interface AssessmentResultProps {
  selectedTopics: string[];
  selectedSymptoms: string[];
  additionalNotes?: string;
  onStartChat: () => void;
  onBack: () => void;
}

const AssessmentResult: React.FC<AssessmentResultProps> = ({
  selectedTopics,
  selectedSymptoms,
  additionalNotes,
  onStartChat,
  onBack
}) => {
  const topics = legalTopics.filter(t => selectedTopics.includes(t.id));
  const symptoms = legalSymptoms.filter(s => selectedSymptoms.includes(s.id));

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

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-navy-blue mb-3">
              Resumo da sua situação
            </h1>
            <p className="text-royal-blue">
              Com base nas informações fornecidas, nosso assistente jurídico está pronto para ajudar
            </p>
          </div>

          <div className="space-y-6 mb-8">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Áreas Jurídicas Selecionadas</h3>
              <div className="flex flex-wrap gap-2">
                {topics.map(topic => (
                  <div key={topic.id} className="bg-primary/10 px-4 py-2 rounded-full">
                    <span className="mr-2">{topic.icon}</span>
                    <span className="font-medium">{topic.title}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Sintomas Identificados</h3>
              <ul className="space-y-2">
                {symptoms.map(symptom => (
                  <li key={symptom.id} className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span className="text-sm">{symptom.text}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {additionalNotes && (
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">Informações Adicionais</h3>
                <p className="text-sm text-muted-foreground">{additionalNotes}</p>
              </Card>
            )}
          </div>

          <div className="flex justify-center">
            <Button
              onClick={onStartChat}
              size="lg"
              className="min-w-[250px] gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              Conversar com Assistente Jurídico
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentResult;
