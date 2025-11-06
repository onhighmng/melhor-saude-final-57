import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Textarea } from './ui/textarea';

type Pillar = 'mental-health' | 'physical-wellness' | 'financial-assistance' | 'legal-assistance';

interface SelectSymptomsPageProps {
  pillar: Pillar;
  onBack: () => void;
  onContinue: (symptoms: string[], additionalInfo: string) => void;
}

export function SelectSymptomsPage({ pillar, onBack, onContinue }: SelectSymptomsPageProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState('');

  const symptomsByPillar: Record<Pillar, { title: string; subtitle: string; symptoms: string[]; label: string; placeholder: string }> = {
    'mental-health': {
      title: 'Como se tem sentido?',
      subtitle: 'Selecione os sintomas que tem experimentado',
      label: 'Informações Adicionais (Opcional)',
      placeholder: 'Forneça mais detalhes sobre como se sente...',
      symptoms: [
        'Dificuldade para dormir ou sono excessivo',
        'Falta de energia ou cansaço constante',
        'Dificuldade de concentração persistente',
        'Mudanças repentinas de humor',
        'Perda de interesse em atividades que gostava',
        'Isolamento social frequente',
        'Sintomas físicos (dor de cabeça, tensão muscular)',
        'Pensamentos negativos recorrentes',
        'Pensamentos intrusivos recorrentes',
        'Mudanças significativas no apetite',
        'Fadiga mental constante',
        'Irritabilidade aumentada',
        'Dificuldade em tomar decisões',
        'Sentimento de vazio ou desesperança',
        'Alterações nos padrões de sono',
        'Palpitações ou ataques de pânico',
        'Preocupação excessiva com o futuro',
        'Sentimentos de culpa constantes',
        'Sensação de ansiedade emocional',
        'Crises de choro frequentes'
      ]
    },
    'physical-wellness': {
      title: 'Quais são os seus desafios?',
      subtitle: 'Selecione as dificuldades que enfrenta',
      label: 'Informações Adicionais (Opcional)',
      placeholder: 'Conte-nos mais sobre a sua situação física atual...',
      symptoms: [
        'Sedentarismo (falta de atividade física regular)',
        'Dificuldade em manter rotina de exercícios',
        'Dores musculares ou articulares frequentes',
        'Ganho ou perda de peso não intencional',
        'Alimentação desequilibrada ou irregular',
        'Consumo excessivo de açúcar ou alimentos processados',
        'Insônia ou dificuldade para dormir',
        'Cansaço ao acordar mesmo após dormir',
        'Falta de energia durante o dia',
        'Problemas digestivos recorrentes',
        'Pressão arterial alta',
        'Níveis elevados de stress físico',
        'Má postura no trabalho ou dia a dia',
        'Dificuldade em estabelecer hábitos saudáveis',
        'Consumo de tabaco ou álcool',
        'Hidratação insuficiente',
        'Dores de cabeça frequentes',
        'Dificuldade em controlar a alimentação emocional'
      ]
    },
    'financial-assistance': {
      title: 'Quais são as suas dificuldades?',
      subtitle: 'Selecione os desafios financeiros que enfrenta',
      label: 'Detalhes Adicionais (Opcional)',
      placeholder: 'Descreva a sua situação financeira com mais detalhes...',
      symptoms: [
        'Dificuldade em pagar contas mensais',
        'Dívidas em cartão de crédito acumuladas',
        'Empréstimos com juros elevados',
        'Falta de poupança de emergência',
        'Gastos superiores aos rendimentos',
        'Dificuldade em controlar despesas',
        'Sem planeamento financeiro definido',
        'Preocupação constante com dinheiro',
        'Receio de perder o emprego',
        'Dívidas em atraso ou incobráveis',
        'Falta de conhecimento em gestão financeira',
        'Dependência de crédito para despesas básicas',
        'Sem objetivos financeiros claros',
        'Dificuldade em poupar dinheiro',
        'Gastos impulsivos frequentes',
        'Rendimento instável ou irregular',
        'Dificuldade em negociar dívidas',
        'Falta de seguro ou proteção financeira'
      ]
    },
    'legal-assistance': {
      title: 'Qual é a sua situação?',
      subtitle: 'Selecione os problemas legais que enfrenta',
      label: 'Descrição da Situação (Opcional)',
      placeholder: 'Descreva a sua situação legal com o máximo de detalhes possível...',
      symptoms: [
        'Conflito com empregador atual ou anterior',
        'Demissão sem justa causa',
        'Assédio no local de trabalho',
        'Salários ou benefícios em atraso',
        'Problemas com contrato de arrendamento',
        'Ameaça de despejo',
        'Conflitos com senhorio',
        'Processo de divórcio em curso',
        'Disputa de custódia de filhos',
        'Pensão alimentícia não paga',
        'Dívidas em cobrança judicial',
        'Processos de insolvência',
        'Problemas com documentação ou vistos',
        'Processos criminais pendentes',
        'Contratos abusivos ou enganosos',
        'Produtos ou serviços defeituosos',
        'Discriminação ou violação de direitos',
        'Necessidade de aconselhamento legal urgente'
      ]
    }
  };

  const pillarData = symptomsByPillar[pillar];

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-5 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
          <div className="text-center">
            <h1 className="text-gray-900 mb-2">{pillarData.title}</h1>
            <p className="text-blue-600 text-sm">
              {pillarData.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Symptoms Grid */}
      <div className="max-w-6xl mx-auto px-5 py-6">
        <div className="flex flex-wrap gap-3 mb-8">
          {pillarData.symptoms.map((symptom) => {
            const isSelected = selectedSymptoms.includes(symptom);
            return (
              <button
                key={symptom}
                onClick={() => toggleSymptom(symptom)}
                className={`px-5 py-3 rounded-xl border-2 transition-all active:scale-95 text-sm ${
                  isSelected
                    ? 'bg-blue-100 border-blue-500 text-blue-900'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {symptom}
              </button>
            );
          })}
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
          <h3 className="text-gray-900 mb-2">{pillarData.label}</h3>
          <Textarea
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            placeholder={pillarData.placeholder}
            className="min-h-32 resize-none"
          />
        </div>

        {/* Continue Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={() => onContinue(selectedSymptoms, additionalInfo)}
            disabled={selectedSymptoms.length === 0}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors active:scale-95 shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
