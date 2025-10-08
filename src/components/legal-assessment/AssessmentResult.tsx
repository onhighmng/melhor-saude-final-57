import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { legalTopics, legalSymptoms } from '@/types/legalAssessment';
import { ChevronLeft } from 'lucide-react';

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
  const selectedTopicObjects = legalTopics.filter(topic =>
    selectedTopics.includes(topic.id)
  );

  const selectedSymptomObjects = legalSymptoms.filter(symptom =>
    selectedSymptoms.includes(symptom.id)
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-foreground mb-3">
              Resumo da sua situação
            </h1>
            <p className="text-muted-foreground text-lg">
              Baseado nas suas respostas, aqui está um resumo do seu caso
            </p>
          </div>

          <div className="space-y-6 mb-8">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Áreas Jurídicas Selecionadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedTopicObjects.map(topic => (
                    <div key={topic.id} className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <span className="text-3xl">{topic.icon}</span>
                      <span className="font-medium text-foreground">{topic.title}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Sintomas Identificados</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {selectedSymptomObjects.map(symptom => (
                    <li key={symptom.id} className="flex items-start gap-3 py-1">
                      <span className="text-primary mt-1 font-bold">•</span>
                      <span className="text-sm text-foreground">{symptom.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {additionalNotes && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Informações Adicionais</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {additionalNotes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex justify-center">
            <Button onClick={onStartChat} size="lg" className="min-w-[280px] text-base">
              Conversar com Assistente Jurídico
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentResult;
