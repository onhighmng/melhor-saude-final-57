import { ArrowLeft } from 'lucide-react';

type Pillar = 'mental-health' | 'physical-wellness' | 'financial-assistance' | 'legal-assistance';

interface SelectTopicPageProps {
  pillar: Pillar;
  onBack: () => void;
  onContinue: (topic: string) => void;
}

interface Topic {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
}

export function SelectTopicPage({ pillar, onBack, onContinue }: SelectTopicPageProps) {
  const topicsByPillar: Record<Pillar, { title: string; subtitle: string; topics: Topic[] }> = {
    'mental-health': {
      title: 'O que gostaria de abordar?',
      subtitle: 'Selecione uma ou mais áreas que gostaria de trabalhar',
      topics: [
        {
          id: 'ansiedade',
          emoji: '😰',
          title: 'Ansiedade',
          subtitle: 'Preocupação excessiva, nervosismo, tensão constante'
        },
        {
          id: 'depressao',
          emoji: '😔',
          title: 'Depressão',
          subtitle: 'Tristeza profunda, falta de motivação, isolamento'
        },
        {
          id: 'estresse',
          emoji: '😣',
          title: 'Estresse',
          subtitle: 'Pressão no trabalho, sobrecarga, esgotamento'
        },
        {
          id: 'burnout',
          emoji: '🔥',
          title: 'Burnout / Esgotamento',
          subtitle: 'Esgotamento profissional, exaustão emocional'
        },
        {
          id: 'ansiedade-social',
          emoji: '😟',
          title: 'Ansiedade Social / Fobias',
          subtitle: 'Medo de situações sociais, fobias específicas'
        },
        {
          id: 'transtornos-alimentares',
          emoji: '🍽️',
          title: 'Transtornos Alimentares',
          subtitle: 'Relação problemática com comida e imagem corporal'
        },
        {
          id: 'relacionamento',
          emoji: '💔',
          title: 'Dificuldades de Relacionamento',
          subtitle: 'Conflitos familiares, problemas amorosos, isolamento social'
        },
        {
          id: 'autoestima',
          emoji: '🪞',
          title: 'Autoestima e Autoconfiança',
          subtitle: 'Insegurança, baixa confiança, autocrítica'
        },
        {
          id: 'luto',
          emoji: '🕊️',
          title: 'Luto e Perda',
          subtitle: 'Processar perdas, lidar com o luto'
        },
        {
          id: 'trauma',
          emoji: '🦋',
          title: 'Traumas e PTSD',
          subtitle: 'Experiências traumáticas, stress pós-traumático'
        },
        {
          id: 'identidade',
          emoji: '🌈',
          title: 'Questões de Identidade',
          subtitle: 'Orientação sexual, identidade de gênero, autoconhecimento'
        },
        {
          id: 'raiva',
          emoji: '😤',
          title: 'Gestão da Raiva',
          subtitle: 'Controlar impulsos, gerir emoções intensas'
        }
      ]
    },
    'physical-wellness': {
      title: 'Qual área de bem-estar físico?',
      subtitle: 'Selecione o que gostaria de melhorar',
      topics: [
        {
          id: 'exercicio',
          emoji: '💪',
          title: 'Atividade Física',
          subtitle: 'Rotina de exercícios, fitness, condicionamento'
        },
        {
          id: 'nutricao',
          emoji: '🥗',
          title: 'Nutrição e Alimentação',
          subtitle: 'Hábitos alimentares saudáveis, dieta equilibrada'
        },
        {
          id: 'sono',
          emoji: '😴',
          title: 'Qualidade do Sono',
          subtitle: 'Problemas para dormir, insônia, rotina de sono'
        },
        {
          id: 'peso',
          emoji: '⚖️',
          title: 'Gestão de Peso',
          subtitle: 'Perda ou ganho de peso, manutenção saudável'
        },
        {
          id: 'dor-cronica',
          emoji: '🩹',
          title: 'Dor Crónica',
          subtitle: 'Dores persistentes, desconforto físico contínuo'
        },
        {
          id: 'energia',
          emoji: '⚡',
          title: 'Níveis de Energia',
          subtitle: 'Fadiga constante, falta de disposição'
        },
        {
          id: 'postura',
          emoji: '🧘',
          title: 'Postura e Mobilidade',
          subtitle: 'Problemas posturais, flexibilidade, movimento'
        },
        {
          id: 'habitos',
          emoji: '🚭',
          title: 'Hábitos Prejudiciais',
          subtitle: 'Tabagismo, álcool, estilo de vida sedentário'
        }
      ]
    },
    'financial-assistance': {
      title: 'Em que área financeira precisa de ajuda?',
      subtitle: 'Selecione o tema mais relevante para si',
      topics: [
        {
          id: 'orcamento',
          emoji: '💰',
          title: 'Orçamento Pessoal',
          subtitle: 'Gestão de receitas e despesas mensais'
        },
        {
          id: 'dividas',
          emoji: '💳',
          title: 'Gestão de Dívidas',
          subtitle: 'Créditos, empréstimos, dívidas acumuladas'
        },
        {
          id: 'poupanca',
          emoji: '🏦',
          title: 'Poupança e Investimentos',
          subtitle: 'Criar reserva de emergência, investir melhor'
        },
        {
          id: 'planejamento',
          emoji: '📊',
          title: 'Planeamento Financeiro',
          subtitle: 'Objetivos a médio e longo prazo'
        },
        {
          id: 'reforma',
          emoji: '���',
          title: 'Planeamento de Reforma',
          subtitle: 'Preparação para aposentadoria'
        },
        {
          id: 'credito',
          emoji: '📝',
          title: 'Acesso a Crédito',
          subtitle: 'Financiamentos, cartões de crédito'
        },
        {
          id: 'emergencia',
          emoji: '🆘',
          title: 'Situação de Emergência',
          subtitle: 'Dificuldades financeiras urgentes'
        },
        {
          id: 'educacao',
          emoji: '📚',
          title: 'Educação Financeira',
          subtitle: 'Aprender a gerir melhor o dinheiro'
        }
      ]
    },
    'legal-assistance': {
      title: 'Que tipo de assistência jurídica?',
      subtitle: 'Selecione a área legal que precisa de apoio',
      topics: [
        {
          id: 'trabalho',
          emoji: '💼',
          title: 'Direito do Trabalho',
          subtitle: 'Contratos, despedimentos, direitos laborais'
        },
        {
          id: 'familia',
          emoji: '👨‍👩‍👧',
          title: 'Direito de Família',
          subtitle: 'Divórcio, custódia, pensões alimentícias'
        },
        {
          id: 'habitacao',
          emoji: '🏠',
          title: 'Direito de Habitação',
          subtitle: 'Arrendamento, despejo, problemas com proprietário'
        },
        {
          id: 'consumidor',
          emoji: '🛒',
          title: 'Direito do Consumidor',
          subtitle: 'Produtos defeituosos, contratos abusivos'
        },
        {
          id: 'divida',
          emoji: '⚖️',
          title: 'Dívidas e Insolvência',
          subtitle: 'Processos de cobrança, insolvência pessoal'
        },
        {
          id: 'imigracao',
          emoji: '✈️',
          title: 'Imigração e Vistos',
          subtitle: 'Residência, cidadania, documentação'
        },
        {
          id: 'criminal',
          emoji: '🚔',
          title: 'Direito Penal',
          subtitle: 'Processos criminais, defesa legal'
        },
        {
          id: 'contratos',
          emoji: '📄',
          title: 'Contratos e Negócios',
          subtitle: 'Revisão de contratos, acordos comerciais'
        }
      ]
    }
  };

  const pillarData = topicsByPillar[pillar];

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
            <p className="text-gray-500 text-sm">
              {pillarData.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="max-w-6xl mx-auto px-5 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {pillarData.topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => onContinue(topic.id)}
              className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all active:scale-98 text-left group"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">{topic.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
                    {topic.title}
                  </h3>
                  <p className="text-sm text-gray-500">{topic.subtitle}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
