import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface AssessmentResultProps {
  selectedTopics: string[];
  selectedSymptoms: string[];
  additionalNotes?: string;
  onStartChat: () => void;
  onBack: () => void;
}

const topicLabels: Record<string, { emoji: string; title: string }> = {
  'consumer': { emoji: '🛒', title: 'Direito do Consumidor' },
  'labor': { emoji: '💼', title: 'Direito do Trabalho' },
  'family': { emoji: '👨‍👩‍👧‍👦', title: 'Direito de Família' },
  'real-estate': { emoji: '🏠', title: 'Direito Imobiliário' },
  'criminal': { emoji: '⚖️', title: 'Direito Criminal' },
  'civil': { emoji: '📜', title: 'Direito Civil' }
};

const symptomLabels: Record<string, string> = {
  'contract-general': 'Problemas com contratos em geral',
  'moral-damage': 'Dano moral ou material sofrido',
  'judicial-debt': 'Dívidas ou cobrança judicial',
  'defamation': 'Nome sujo ou negativado indevidamente',
  'civil-liability': 'Questões de responsabilidade civil'
};

const AssessmentResult: React.FC<AssessmentResultProps> = ({
  selectedTopics,
  selectedSymptoms,
  additionalNotes,
  onStartChat,
  onBack
}) => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="flex items-center gap-2 text-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Button>

      <div className="text-center">
        <h1 className="text-4xl font-serif font-bold mb-4 text-foreground">
          Resumo da sua situação
        </h1>
        <p className="text-lg text-primary">
          Com base nas informações fornecidas, nosso assistente jurídico está pronto para ajudar
        </p>
      </div>

      <Card className="p-8 border-2">
        <h2 className="text-xl font-serif font-semibold mb-6 text-foreground">
          Áreas Jurídicas Selecionadas
        </h2>
        <div className="flex flex-wrap gap-3">
          {selectedTopics.map((topicId) => {
            const topic = topicLabels[topicId];
            if (!topic) return null;
            
            return (
              <div
                key={topicId}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-foreground rounded-full"
              >
                <span className="text-xl">{topic.emoji}</span>
                <span className="font-medium">{topic.title}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-8 border-2">
        <h2 className="text-xl font-serif font-semibold mb-6 text-foreground">
          Sintomas Identificados
        </h2>
        <ul className="space-y-3">
          {selectedSymptoms.map((symptomId) => {
            const symptomText = symptomLabels[symptomId];
            if (!symptomText) return null;
            
            return (
              <li key={symptomId} className="flex items-start gap-3">
                <span className="text-primary mt-1 font-bold">•</span>
                <span className="text-foreground">{symptomText}</span>
              </li>
            );
          })}
        </ul>
      </Card>

      {additionalNotes && additionalNotes.trim() && (
        <Card className="p-8 border-2">
          <h2 className="text-xl font-serif font-semibold mb-6 text-foreground">
            Informações Adicionais
          </h2>
          <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {additionalNotes}
          </p>
        </Card>
      )}

      <div className="flex justify-center pt-4">
        <Button 
          onClick={onStartChat}
          size="lg"
          className="min-w-[240px] bg-primary hover:bg-primary/90 text-white rounded-lg"
        >
          Iniciar Conversa
        </Button>
      </div>
    </div>
  );
};

export default AssessmentResult;
