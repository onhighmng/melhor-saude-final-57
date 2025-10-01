
import { Brain, DollarSign, Dumbbell, Scale } from 'lucide-react';

export const pillars = [
  {
    title: "Saúde mental",
    description: "Cuidar da saúde mental é essencial para manter o equilíbrio emocional, a produtividade e a qualidade de vida no ambiente de trabalho.",
    features: [
      "Sessões individuais com psicólogos certificados", 
      "Atendimento em situações de crise emocional", 
      "Aconselhamento sobre stress laboral e burnout",
      "Programas de mindfulness e autocuidado",
      "Apoio psicológico 24/7",
      "Terapia de grupo especializada"
    ],
    icon: <Brain className="hidden sm:block w-8 h-8 text-mint-green" />
  },
  {
    title: "Bem estar físico",
    description: "Promover vitalidade e bem-estar através de medicina preventiva, nutrição balanceada e programas de exercício físico adaptados ao ambiente empresarial.",
    features: [
      "Acesso a médicos e nutricionistas qualificados", 
      "Planos alimentares personalizados", 
      "Programas de exercício e pausas ativas",
      "Avaliações de saúde ocupacional",
      "Fisioterapia e reabilitação",
      "Rastreios de saúde regulares"
    ],
    icon: <Dumbbell className="hidden sm:block w-8 h-8 text-royal-blue" />
  },
  {
    title: "Assistência financeira",
    description: "Reduzir o stress financeiro através de literacia financeira abrangente e apoio prático na gestão económica pessoal e familiar.",
    features: [
      "Sessões com consultores financeiros certificados", 
      "Apoio na elaboração de orçamentos personalizados", 
      "Programas educativos sobre gestão de dinheiro",
      "Orientação para reorganizar finanças",
      "Planeamento de poupanças e investimentos",
      "Renegociação de dívidas"
    ],
    icon: <DollarSign className="hidden sm:block w-8 h-8 text-mint-green" />
  },
  {
    title: "Assistência Jurídica",
    description: "Segurança jurídica é parte essencial do bem-estar, permitindo decisões informadas e proteção legal completa para colaboradores e suas famílias.",
    features: [
      "Consultoria com advogados especializados", 
      "Esclarecimento sobre contratos e direitos", 
      "Acompanhamento preventivo para evitar litígios",
      "Direito da família e civil",
      "Direito do trabalho",
      "Representação legal quando necessário"
    ],
    icon: <Scale className="hidden sm:block w-8 h-8 text-sky-blue" />
  }
];

export const values = [
  {
    title: "Confidencialidade e Sigilo Profissional",
    description: "Respeitamos a privacidade e dignidade de cada utilizador com o mais alto grau de sigilo e ética profissional.",
    icon: "🔐"
  },
  {
    title: "Compromisso com Bem-estar Integral", 
    description: "Promovemos equilíbrio emocional, segurança jurídica, estabilidade financeira e saúde física de forma integrada e sustentável.",
    icon: "Heart"
  }
];
