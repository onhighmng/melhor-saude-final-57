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
  'anxiety': { emoji: '😰', title: 'Ansiedade' },
  'depression': { emoji: '😔', title: 'Depressão' },
  'stress': { emoji: '😫', title: 'Estresse' },
  'burnout': { emoji: '🔥', title: 'Burnout / Esgotamento' },
  'social-anxiety': { emoji: '😶', title: 'Ansiedade Social / Fobias' },
  'eating-disorders': { emoji: '🍽️', title: 'Transtornos Alimentares' },
  'relationships': { emoji: '💔', title: 'Dificuldades de Relacionamento' },
  'self-esteem': { emoji: '🪞', title: 'Autoestima e Autoconfiança' },
  'grief': { emoji: '🕊️', title: 'Luto e Perda' },
  'trauma': { emoji: '🌪️', title: 'Traumas e PTSD' },
  'identity': { emoji: '🌈', title: 'Questões de Identidade' },
  'anger': { emoji: '😤', title: 'Gestão da Raiva' }
};

const symptomLabels: Record<string, string> = {
  'sleep-problems': 'Dificuldade para dormir ou sono excessivo',
  'lack-energy': 'Falta de energia ou cansaço constante',
  'concentration': 'Dificuldade de concentração persistente',
  'mood-swings': 'Mudanças repentinas de humor',
  'loss-interest': 'Perda de interesse em atividades que gostava',
  'social-withdrawal': 'Isolamento social frequente',
  'physical-symptoms': 'Sintomas físicos (dor de cabeça, tensão muscular)',
  'negative-thoughts': 'Pensamentos negativos recorrentes',
  'intrusive-thoughts': 'Pensamentos intrusivos recorrentes',
  'appetite-changes': 'Mudanças significativas no apetite',
  'mental-fatigue': 'Fadiga mental constante',
  'irritability': 'Irritabilidade aumentada',
  'decision-difficulty': 'Dificuldade em tomar decisões',
  'emptiness': 'Sentimento de vazio ou desesperança',
  'sleep-pattern-changes': 'Alterações nos padrões de sono',
  'panic-attacks': 'Palpitações ou ataques de pânico',
  'excessive-worry': 'Preocupação excessiva com o futuro',
  'guilt-feelings': 'Sentimentos de culpa constantes',
  'emotional-numbness': 'Sensação de anestesia emocional',
  'crying-spells': 'Crises de choro frequentes'
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
        onClick={onBack}
        variant="outline"
        className="flex items-center gap-2 hover:bg-green-600 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Button>

      <div className="text-center">
        <h1 className="text-4xl font-serif font-bold mb-4 text-foreground">
          Resultado do Pré-Diagnóstico
        </h1>
        <p className="text-lg text-primary">
          Preparamos uma análise com base nas suas respostas
        </p>
      </div>

      <Card className="p-8 border-2">
        <h2 className="text-xl font-serif font-semibold mb-6 text-foreground">
          Áreas Selecionadas
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
          Sintomas Apresentados
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
          Falar com Especialista
        </Button>
      </div>
    </div>
  );
};

export default AssessmentResult;
