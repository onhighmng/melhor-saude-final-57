// Topic selection data for each pillar
export interface Topic {
  id: string;
  icon: string;
}

export const pillarTopics: Record<string, Topic[]> = {
  saude_mental: [
    { id: 'anxiety', icon: 'AlertCircle' },
    { id: 'depression', icon: 'CloudRain' },
    { id: 'stress', icon: 'Zap' },
    { id: 'burnout', icon: 'Flame' },
    { id: 'relationships', icon: 'Heart' },
    { id: 'selfEsteem', icon: 'Sparkles' },
    { id: 'other', icon: 'MoreHorizontal' },
  ],
  
  assistencia_financeira: [
    { id: 'budgeting', icon: 'Calculator' },
    { id: 'debt', icon: 'CreditCard' },
    { id: 'savings', icon: 'PiggyBank' },
    { id: 'investments', icon: 'TrendingUp' },
    { id: 'retirement', icon: 'Palmtree' },
    { id: 'taxes', icon: 'Receipt' },
    { id: 'other', icon: 'MoreHorizontal' },
  ],
  
  bem_estar_fisico: [
    { id: 'fitness', icon: 'Dumbbell' },
    { id: 'nutrition', icon: 'Apple' },
    { id: 'sleep', icon: 'Moon' },
    { id: 'pain', icon: 'Activity' },
    { id: 'chronicConditions', icon: 'Stethoscope' },
    { id: 'preventiveCare', icon: 'Shield' },
    { id: 'other', icon: 'MoreHorizontal' },
  ],
  
  assistencia_juridica: [
    { id: 'employment', icon: 'Briefcase' },
    { id: 'contracts', icon: 'FileText' },
    { id: 'family', icon: 'Users' },
    { id: 'housing', icon: 'Home' },
    { id: 'consumerRights', icon: 'ShoppingCart' },
    { id: 'immigration', icon: 'Plane' },
    { id: 'other', icon: 'MoreHorizontal' },
  ],
};

export const getTopicsForPillar = (pillar: string): Topic[] => {
  return pillarTopics[pillar] || [];
};
