// Topic selection data for each pillar
export interface Topic {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const pillarTopics: Record<string, Topic[]> = {
  saude_mental: [
    { id: 'anxiety', name: 'Ansiedade', description: 'Gerir ansiedade e preocupações', icon: 'AlertCircle' },
    { id: 'depression', name: 'Depressão', description: 'Apoio para lidar com depressão', icon: 'CloudRain' },
    { id: 'stress', name: 'Stress', description: 'Técnicas para reduzir o stress', icon: 'Zap' },
    { id: 'burnout', name: 'Burnout', description: 'Recuperação de esgotamento profissional', icon: 'Flame' },
    { id: 'relationships', name: 'Relações', description: 'Melhorar relações pessoais', icon: 'Heart' },
    { id: 'selfEsteem', name: 'Autoestima', description: 'Construir confiança pessoal', icon: 'Sparkles' },
    { id: 'other', name: 'Outro', description: 'Outras questões de saúde mental', icon: 'MoreHorizontal' },
  ],
  
  assistencia_financeira: [
    { id: 'budgeting', name: 'Orçamento', description: 'Gestão de orçamento pessoal', icon: 'Calculator' },
    { id: 'debt', name: 'Dívidas', description: 'Estratégias para gerir dívidas', icon: 'CreditCard' },
    { id: 'savings', name: 'Poupanças', description: 'Planos de poupança', icon: 'PiggyBank' },
    { id: 'investments', name: 'Investimentos', description: 'Orientação sobre investimentos', icon: 'TrendingUp' },
    { id: 'retirement', name: 'Reforma', description: 'Planeamento de reforma', icon: 'Palmtree' },
    { id: 'taxes', name: 'Impostos', description: 'Ajuda com impostos', icon: 'Receipt' },
    { id: 'other', name: 'Outro', description: 'Outras questões financeiras', icon: 'MoreHorizontal' },
  ],
  
  bem_estar_fisico: [
    { id: 'fitness', name: 'Fitness', description: 'Programas de exercício físico', icon: 'Dumbbell' },
    { id: 'nutrition', name: 'Nutrição', description: 'Orientação nutricional', icon: 'Apple' },
    { id: 'sleep', name: 'Sono', description: 'Melhorar qualidade do sono', icon: 'Moon' },
    { id: 'pain', name: 'Dor', description: 'Gestão de dor crónica', icon: 'Activity' },
    { id: 'chronicConditions', name: 'Condições Crónicas', description: 'Apoio para condições de longo prazo', icon: 'Stethoscope' },
    { id: 'preventiveCare', name: 'Cuidados Preventivos', description: 'Prevenção de saúde', icon: 'Shield' },
    { id: 'other', name: 'Outro', description: 'Outras questões de bem-estar físico', icon: 'MoreHorizontal' },
  ],
  
  assistencia_juridica: [
    { id: 'employment', name: 'Emprego', description: 'Questões laborais', icon: 'Briefcase' },
    { id: 'contracts', name: 'Contratos', description: 'Revisão e orientação contratual', icon: 'FileText' },
    { id: 'family', name: 'Família', description: 'Direito da família', icon: 'Users' },
    { id: 'housing', name: 'Habitação', description: 'Questões de arrendamento e habitação', icon: 'Home' },
    { id: 'consumerRights', name: 'Direitos do Consumidor', description: 'Proteção do consumidor', icon: 'ShoppingCart' },
    { id: 'immigration', name: 'Imigração', description: 'Apoio com questões de imigração', icon: 'Plane' },
    { id: 'other', name: 'Outro', description: 'Outras questões jurídicas', icon: 'MoreHorizontal' },
  ],
};

export const getTopicsForPillar = (pillar: string): Topic[] => {
  return pillarTopics[pillar] || [];
};
