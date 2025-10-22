interface PillarColors {
  bg: string;
  bgLight: string;
  text: string;
  textDark: string;
}

export const PILLAR_COLORS = {
  saude_mental: {
    bg: 'hsl(210 80% 95%)',
    bgLight: 'hsl(210 80% 98%)',
    text: 'hsl(210 80% 40%)',
    textDark: 'hsl(210 80% 30%)'
  },
  bem_estar_fisico: {
    bg: 'hsl(45 90% 90%)',
    bgLight: 'hsl(45 90% 95%)',
    text: 'hsl(45 90% 35%)',
    textDark: 'hsl(45 90% 25%)'
  },
  assistencia_financeira: {
    bg: 'hsl(140 60% 95%)',
    bgLight: 'hsl(140 60% 98%)',
    text: 'hsl(140 60% 35%)',
    textDark: 'hsl(140 60% 25%)'
  },
  assistencia_juridica: {
    bg: 'hsl(270 60% 95%)',
    bgLight: 'hsl(270 60% 98%)',
    text: 'hsl(270 60% 40%)',
    textDark: 'hsl(270 60% 30%)'
  }
} as const;

export const getPillarColors = (pillar: string): PillarColors => {
  return PILLAR_COLORS[pillar as keyof typeof PILLAR_COLORS] || PILLAR_COLORS.saude_mental;
};

export const getPillarLabel = (pillar: string): string => {
  const labels: Record<string, string> = {
    saude_mental: 'Saúde Mental',
    bem_estar_fisico: 'Bem-Estar Físico',
    assistencia_financeira: 'Assistência Financeira',
    assistencia_juridica: 'Assistência Jurídica'
  };
  return labels[pillar] || pillar;
};
