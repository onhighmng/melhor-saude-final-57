// Topic selection data for each pillar
export interface Topic {
  id: string;
  nameKey: string;
  descriptionKey: string;
  icon: string;
}

export const pillarTopics: Record<string, Topic[]> = {
  saude_mental: [
    { id: 'anxiety', nameKey: 'topics.psychological.anxiety', descriptionKey: 'topics.psychological.anxietyDesc', icon: 'AlertCircle' },
    { id: 'depression', nameKey: 'topics.psychological.depression', descriptionKey: 'topics.psychological.depressionDesc', icon: 'CloudRain' },
    { id: 'stress', nameKey: 'topics.psychological.stress', descriptionKey: 'topics.psychological.stressDesc', icon: 'Zap' },
    { id: 'burnout', nameKey: 'topics.psychological.burnout', descriptionKey: 'topics.psychological.burnoutDesc', icon: 'Flame' },
    { id: 'relationships', nameKey: 'topics.psychological.relationships', descriptionKey: 'topics.psychological.relationshipsDesc', icon: 'Heart' },
    { id: 'self_esteem', nameKey: 'topics.psychological.selfEsteem', descriptionKey: 'topics.psychological.selfEsteemDesc', icon: 'Sparkles' },
    { id: 'other', nameKey: 'topics.psychological.other', descriptionKey: 'topics.psychological.otherDesc', icon: 'MoreHorizontal' },
  ],
  
  assistencia_financeira: [
    { id: 'budgeting', nameKey: 'topics.financial.budgeting', descriptionKey: 'topics.financial.budgetingDesc', icon: 'Calculator' },
    { id: 'debt', nameKey: 'topics.financial.debt', descriptionKey: 'topics.financial.debtDesc', icon: 'CreditCard' },
    { id: 'savings', nameKey: 'topics.financial.savings', descriptionKey: 'topics.financial.savingsDesc', icon: 'PiggyBank' },
    { id: 'investments', nameKey: 'topics.financial.investments', descriptionKey: 'topics.financial.investmentsDesc', icon: 'TrendingUp' },
    { id: 'retirement', nameKey: 'topics.financial.retirement', descriptionKey: 'topics.financial.retirementDesc', icon: 'Palmtree' },
    { id: 'taxes', nameKey: 'topics.financial.taxes', descriptionKey: 'topics.financial.taxesDesc', icon: 'Receipt' },
    { id: 'other', nameKey: 'topics.financial.other', descriptionKey: 'topics.financial.otherDesc', icon: 'MoreHorizontal' },
  ],
  
  bem_estar_fisico: [
    { id: 'fitness', nameKey: 'topics.physical.fitness', descriptionKey: 'topics.physical.fitnessDesc', icon: 'Dumbbell' },
    { id: 'nutrition', nameKey: 'topics.physical.nutrition', descriptionKey: 'topics.physical.nutritionDesc', icon: 'Apple' },
    { id: 'sleep', nameKey: 'topics.physical.sleep', descriptionKey: 'topics.physical.sleepDesc', icon: 'Moon' },
    { id: 'pain', nameKey: 'topics.physical.pain', descriptionKey: 'topics.physical.painDesc', icon: 'Activity' },
    { id: 'chronic_conditions', nameKey: 'topics.physical.chronicConditions', descriptionKey: 'topics.physical.chronicConditionsDesc', icon: 'Stethoscope' },
    { id: 'preventive_care', nameKey: 'topics.physical.preventiveCare', descriptionKey: 'topics.physical.preventiveCareDesc', icon: 'Shield' },
    { id: 'other', nameKey: 'topics.physical.other', descriptionKey: 'topics.physical.otherDesc', icon: 'MoreHorizontal' },
  ],
  
  assistencia_juridica: [
    { id: 'employment', nameKey: 'topics.legal.employment', descriptionKey: 'topics.legal.employmentDesc', icon: 'Briefcase' },
    { id: 'contracts', nameKey: 'topics.legal.contracts', descriptionKey: 'topics.legal.contractsDesc', icon: 'FileText' },
    { id: 'family', nameKey: 'topics.legal.family', descriptionKey: 'topics.legal.familyDesc', icon: 'Users' },
    { id: 'housing', nameKey: 'topics.legal.housing', descriptionKey: 'topics.legal.housingDesc', icon: 'Home' },
    { id: 'consumer_rights', nameKey: 'topics.legal.consumerRights', descriptionKey: 'topics.legal.consumerRightsDesc', icon: 'ShoppingCart' },
    { id: 'immigration', nameKey: 'topics.legal.immigration', descriptionKey: 'topics.legal.immigrationDesc', icon: 'Plane' },
    { id: 'other', nameKey: 'topics.legal.other', descriptionKey: 'topics.legal.otherDesc', icon: 'MoreHorizontal' },
  ],
};

export const getTopicsForPillar = (pillar: string): Topic[] => {
  return pillarTopics[pillar] || [];
};
