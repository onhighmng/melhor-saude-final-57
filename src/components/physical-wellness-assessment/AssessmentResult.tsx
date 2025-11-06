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
  'nutrition': { emoji: '🥗', title: 'Nutrição' },
  'exercise': { emoji: '🏃', title: 'Exercício Físico' },
  'sleep': { emoji: '😴', title: 'Sono' },
  'chronic-pain': { emoji: '🩹', title: 'Dor Crónica' },
  'chronic-diseases': { emoji: '💊', title: 'Gestão de Doenças Crónicas' },
  'post-surgery': { emoji: '🏥', title: 'Reabilitação Pós-Cirúrgica' },
  'reproductive-health': { emoji: '🤰', title: 'Saúde Reprodutiva' },
  'physiotherapy': { emoji: '🦴', title: 'Fisioterapia e Recuperação' },
  'preventive-health': { emoji: '🔬', title: 'Medicina Preventiva' },
  'posture': { emoji: '🪑', title: 'Saúde Postural e Ergonomia' },
  'allergies': { emoji: '🤧', title: 'Alergias e Imunidade' },
  'digestive-health': { emoji: '🫃', title: 'Saúde Digestiva' },
  'lifestyle': { emoji: '🌱', title: 'Estilo de Vida Saudável' }
};

const symptomLabels: Record<string, string> = {
  'low-energy': 'Baixa energia ou fadiga constante',
  'poor-diet': 'Dificuldade em manter uma alimentação saudável',
  'sedentary': 'Estilo de vida sedentário',
  'weight-concerns': 'Preocupações com o peso',
  'muscle-pain': 'Dores musculares ou articulares',
  'poor-sleep-quality': 'Má qualidade de sono',
  'stress-physical': 'Sintomas físicos de estresse',
  'lack-motivation': 'Falta de motivação para exercício',
  'joint-pain': 'Dores articulares persistentes',
  'mobility-issues': 'Problemas de mobilidade',
  'chronic-tension': 'Tensão muscular crónica',
  'frequent-headaches': 'Cefaleias frequentes',
  'digestive-problems': 'Problemas gastrointestinais recorrentes',
  'breathing-difficulty': 'Dificuldade respiratória',
  'skin-issues': 'Alterações na pele',
  'dizziness': 'Vertigens ou tonturas',
  'muscle-weakness': 'Fraqueza muscular',
  'vision-problems': 'Problemas de visão',
  'chronic-fatigue': 'Fadiga crónica severa',
  'inflammation': 'Inflamação persistente'
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
