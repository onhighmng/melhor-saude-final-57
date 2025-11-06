import { ArrowLeft } from 'lucide-react';

type Pillar = 'mental-health' | 'physical-wellness' | 'financial-assistance' | 'legal-assistance';

interface PreDiagnosisResultPageProps {
  pillar: Pillar;
  onBack: () => void;
  onBookSpecialist: () => void;
  selectedTopic: string;
  selectedSymptoms: string[];
  additionalInfo: string;
}

export function PreDiagnosisResultPage({
  pillar,
  onBack,
  onBookSpecialist,
  selectedTopic,
  selectedSymptoms,
  additionalInfo
}: PreDiagnosisResultPageProps) {
  // Mental Health Topics
  const mentalHealthTopics: Record<string, { emoji: string; title: string }> = {
    ansiedade: { emoji: '😰', title: 'Ansiedade' },
    depressao: { emoji: '😔', title: 'Depressão' },
    estresse: { emoji: '😣', title: 'Estresse' },
    burnout: { emoji: '🔥', title: 'Burnout / Esgotamento' },
    'ansiedade-social': { emoji: '😟', title: 'Ansiedade Social / Fobias' },
    'transtornos-alimentares': { emoji: '🍽️', title: 'Transtornos Alimentares' },
    relacionamento: { emoji: '💔', title: 'Dificuldades de Relacionamento' },
    autoestima: { emoji: '🪞', title: 'Autoestima e Autoconfiança' },
    luto: { emoji: '🕊️', title: 'Luto e Perda' },
    trauma: { emoji: '🦋', title: 'Traumas e PTSD' },
    identidade: { emoji: '🌈', title: 'Questões de Identidade' },
    raiva: { emoji: '😤', title: 'Gestão da Raiva' }
  };

  // Physical Wellness Topics
  const physicalWellnessTopics: Record<string, { emoji: string; title: string }> = {
    exercicio: { emoji: '💪', title: 'Atividade Física' },
    nutricao: { emoji: '🥗', title: 'Nutrição e Alimentação' },
    sono: { emoji: '😴', title: 'Qualidade do Sono' },
    peso: { emoji: '⚖️', title: 'Gestão de Peso' },
    'dor-cronica': { emoji: '🩹', title: 'Dor Crónica' },
    energia: { emoji: '⚡', title: 'Níveis de Energia' },
    postura: { emoji: '🧘', title: 'Postura e Mobilidade' },
    habitos: { emoji: '🚭', title: 'Hábitos Prejudiciais' }
  };

  // Financial Assistance Topics
  const financialAssistanceTopics: Record<string, { emoji: string; title: string }> = {
    orcamento: { emoji: '💰', title: 'Orçamento Pessoal' },
    dividas: { emoji: '💳', title: 'Gestão de Dívidas' },
    poupanca: { emoji: '🏦', title: 'Poupança e Investimentos' },
    planejamento: { emoji: '📊', title: 'Planeamento Financeiro' },
    reforma: { emoji: '👴', title: 'Planeamento de Reforma' },
    credito: { emoji: '📝', title: 'Acesso a Crédito' },
    emergencia: { emoji: '🆘', title: 'Situação de Emergência' },
    educacao: { emoji: '📚', title: 'Educação Financeira' }
  };

  // Legal Assistance Topics
  const legalAssistanceTopics: Record<string, { emoji: string; title: string }> = {
    trabalho: { emoji: '💼', title: 'Direito do Trabalho' },
    familia: { emoji: '👨‍👩‍👧', title: 'Direito de Família' },
    habitacao: { emoji: '🏠', title: 'Direito de Habitação' },
    consumidor: { emoji: '🛒', title: 'Direito do Consumidor' },
    divida: { emoji: '⚖️', title: 'Dívidas e Insolvência' },
    imigracao: { emoji: '✈️', title: 'Imigração e Vistos' },
    criminal: { emoji: '🚔', title: 'Direito Penal' },
    contratos: { emoji: '📄', title: 'Contratos e Negócios' }
  };

  const topicsByPillar = {
    'mental-health': mentalHealthTopics,
    'physical-wellness': physicalWellnessTopics,
    'financial-assistance': financialAssistanceTopics,
    'legal-assistance': legalAssistanceTopics
  };

  const recommendationByPillar: Record<Pillar, { title: string; message: string; icon: string }> = {
    'mental-health': {
      title: 'Recomendação',
      message: 'Com base nas suas respostas, recomendamos que fale com um dos nossos especialistas em saúde mental para uma avaliação mais detalhada e um plano de apoio personalizado.',
      icon: '💙'
    },
    'physical-wellness': {
      title: 'Recomendação',
      message: 'Com base nas suas respostas, recomendamos que fale com um dos nossos especialistas em bem-estar físico para criar um plano personalizado de saúde e fitness.',
      icon: '💪'
    },
    'financial-assistance': {
      title: 'Recomendação',
      message: 'Com base nas suas respostas, recomendamos que fale com um dos nossos consultores financeiros para desenvolver um plano de ação adequado à sua situação.',
      icon: '💰'
    },
    'legal-assistance': {
      title: 'Recomendação',
      message: 'Com base nas suas respostas, recomendamos que fale com um dos nossos especialistas jurídicos para receber aconselhamento legal adequado à sua situação.',
      icon: '⚖️'
    }
  };

  const selectedTopicData = topicsByPillar[pillar][selectedTopic] || { emoji: '📌', title: selectedTopic };
  const recommendation = recommendationByPillar[pillar];

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
            <h1 className="text-gray-900 mb-2">Resumo da Avaliação</h1>
            <p className="text-blue-600 text-sm">
              Preparamos uma análise com base nas suas respostas
            </p>
          </div>
        </div>
      </div>

      {/* Results Content */}
      <div className="max-w-3xl mx-auto px-5 py-6 space-y-6">
        {/* Selected Areas */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-gray-900 mb-4">Área Selecionada</h2>
          <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <span className="text-2xl">{selectedTopicData.emoji}</span>
            <p className="text-gray-900">{selectedTopicData.title}</p>
          </div>
        </div>

        {/* Symptoms/Issues Presented */}
        {selectedSymptoms.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h2 className="text-gray-900 mb-4">
              {pillar === 'mental-health' ? 'Sintomas Apresentados' : 
               pillar === 'physical-wellness' ? 'Desafios Identificados' :
               pillar === 'financial-assistance' ? 'Dificuldades Financeiras' :
               'Problemas Legais'}
            </h2>
            <ul className="space-y-2">
              {selectedSymptoms.map((symptom, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="text-blue-600 mt-1">·</span>
                  <span className="text-sm">{symptom}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Additional Information */}
        {additionalInfo && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h2 className="text-gray-900 mb-4">Informações Adicionais</h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{additionalInfo}</p>
          </div>
        )}

        {/* Recommendation Card */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
          <h3 className="text-gray-900 mb-2">{recommendation.title}</h3>
          <p className="text-sm text-gray-700 mb-4">
            {recommendation.message}
          </p>
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <span>{recommendation.icon}</span>
            <span>Estamos aqui para ajudar na sua jornada de bem-estar</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={onBookSpecialist}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors active:scale-95 shadow-lg shadow-blue-600/30"
          >
            Falar com Especialista
          </button>
        </div>
      </div>
    </div>
  );
}
