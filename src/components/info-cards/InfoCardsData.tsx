import { Brain, DollarSign, Dumbbell, Scale } from 'lucide-react';

// Translation keys are used in PillarStep component
export const pillars = [
  {
    title: "pillars.psychological.title", // Translation key
    description: "pillars.psychological.description", // Translation key
    features: [], // Not used in new implementation
    icon: <Brain className="hidden sm:block w-8 h-8 text-mint-green" />
  },
  {
    title: "pillars.physical.title",
    description: "pillars.physical.description",
    features: [],
    icon: <Dumbbell className="hidden sm:block w-8 h-8 text-royal-blue" />
  },
  {
    title: "pillars.financial.title",
    description: "pillars.financial.description",
    features: [],
    icon: <DollarSign className="hidden sm:block w-8 h-8 text-mint-green" />
  },
  {
    title: "pillars.legal.title",
    description: "pillars.legal.description",
    features: [],
    icon: <Scale className="hidden sm:block w-8 h-8 text-sky-blue" />
  }
];

export const values = [
  {
    title: "values.confidentiality.title", // Translation key
    description: "values.confidentiality.description", // Translation key
    icon: "🔐"
  },
  {
    title: "values.wellbeing.title",
    description: "values.wellbeing.description",
    icon: "Heart"
  }
];
