// Mock data for Company (Empresa) user pages

export interface CompanyMetrics {
  activeEmployees: number;
  totalSessions: number;
  avgSatisfaction: number;
  utilizationRate: number;
}

export interface PillarDistribution {
  pillar: string;
  percentage: number;
  sessions: number;
  color: string;
}

export interface WellnessTrend {
  month: string;
  avgWellness: number;
  sessions: number;
}

export interface EmployeeHighlight {
  id: string;
  name: string;
  pillar: string;
  lastSession: string;
  avgRating: number;
}

export interface CompanySession {
  id: string;
  employeeName: string;
  pillar: string;
  specialist: string;
  type: 'Virtual' | 'Presencial';
  date: string;
  status: 'Agendada' | 'Concluída' | 'Cancelada';
}

export interface CompanyCollaborator {
  id: string;
  name: string;
  status: 'Ativo' | 'Inativo';
  mostUsedPillar: string;
  sessionsCount: number;
  lastFeedback: number;
  sessionHistory: Array<{
    date: string;
    pillar: string;
    specialist: string;
    rating: number;
  }>;
  onboardingGoals: string[];
  personalProgress: number; // percentage
}

// Mock Company Metrics
export const mockCompanyMetrics: CompanyMetrics = {
  activeEmployees: 47,
  totalSessions: 234,
  avgSatisfaction: 8.7,
  utilizationRate: 78
};

// Mock Pillar Distribution
export const mockPillarDistribution: PillarDistribution[] = [
  {
    pillar: 'Saúde Mental',
    percentage: 42,
    sessions: 98,
    color: '#3B82F6'
  },
  {
    pillar: 'Bem-Estar Físico',
    percentage: 28,
    sessions: 66,
    color: '#10B981'
  },
  {
    pillar: 'Assistência Financeira',
    percentage: 18,
    sessions: 42,
    color: '#F59E0B'
  },
  {
    pillar: 'Assistência Jurídica',
    percentage: 12,
    sessions: 28,
    color: '#8B5CF6'
  }
];

// Mock Wellness Trends (last 6 months)
export const mockWellnessTrends: WellnessTrend[] = [
  { month: 'Mai', avgWellness: 7.2, sessions: 32 },
  { month: 'Jun', avgWellness: 7.8, sessions: 38 },
  { month: 'Jul', avgWellness: 8.1, sessions: 41 },
  { month: 'Ago', avgWellness: 8.3, sessions: 43 },
  { month: 'Set', avgWellness: 8.5, sessions: 45 },
  { month: 'Out', avgWellness: 8.7, sessions: 35 }
];

// Mock Employee Highlights
export const mockEmployeeHighlights: EmployeeHighlight[] = [
  {
    id: '1',
    name: 'João Silva',
    pillar: 'Saúde Mental',
    lastSession: '2024-10-15',
    avgRating: 9.2
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    pillar: 'Bem-Estar Físico',
    lastSession: '2024-10-14',
    avgRating: 8.9
  },
  {
    id: '3',
    name: 'Ana Costa',
    pillar: 'Assistência Financeira',
    lastSession: '2024-10-12',
    avgRating: 9.0
  },
  {
    id: '4',
    name: 'Pedro Ferreira',
    pillar: 'Assistência Jurídica',
    lastSession: '2024-10-10',
    avgRating: 8.7
  },
  {
    id: '5',
    name: 'Carlos Santos',
    pillar: 'Saúde Mental',
    lastSession: '2024-10-08',
    avgRating: 9.1
  }
];

// Mock Company Sessions
export const mockCompanySessions: CompanySession[] = [
  {
    id: '1',
    employeeName: 'João Silva',
    pillar: 'Saúde Mental',
    specialist: 'Dra. Maria Santos',
    type: 'Virtual',
    date: '2024-10-15',
    status: 'Concluída'
  },
  {
    id: '2',
    employeeName: 'Maria Oliveira',
    pillar: 'Bem-Estar Físico',
    specialist: 'Prof. Ana Rodrigues',
    type: 'Presencial',
    date: '2024-10-14',
    status: 'Concluída'
  },
  {
    id: '3',
    employeeName: 'Ana Costa',
    pillar: 'Assistência Financeira',
    specialist: 'Dr. Paulo Reis',
    type: 'Virtual',
    date: '2024-10-16',
    status: 'Agendada'
  },
  {
    id: '4',
    employeeName: 'Pedro Ferreira',
    pillar: 'Assistência Jurídica',
    specialist: 'Dra. Sofia Alves',
    type: 'Presencial',
    date: '2024-10-13',
    status: 'Cancelada'
  },
  {
    id: '5',
    employeeName: 'Carlos Santos',
    pillar: 'Saúde Mental',
    specialist: 'Dr. Fernando Alves',
    type: 'Virtual',
    date: '2024-10-12',
    status: 'Concluída'
  },
  {
    id: '6',
    employeeName: 'Rita Mendes',
    pillar: 'Bem-Estar Físico',
    specialist: 'Prof. Joana Martins',
    type: 'Virtual',
    date: '2024-10-17',
    status: 'Agendada'
  },
  {
    id: '7',
    employeeName: 'Tiago Pereira',
    pillar: 'Assistência Financeira',
    specialist: 'Dr. Ricardo Costa',
    type: 'Presencial',
    date: '2024-10-11',
    status: 'Concluída'
  },
  {
    id: '8',
    employeeName: 'Luísa Rodrigues',
    pillar: 'Assistência Jurídica',
    specialist: 'Dra. Beatriz Silva',
    type: 'Virtual',
    date: '2024-10-10',
    status: 'Concluída'
  }
];

// Mock Company Collaborators
export const mockCompanyCollaborators: CompanyCollaborator[] = [
  {
    id: '1',
    name: 'João Silva',
    status: 'Ativo',
    mostUsedPillar: 'Saúde Mental',
    sessionsCount: 12,
    lastFeedback: 9.2,
    sessionHistory: [
      { date: '2024-10-15', pillar: 'Saúde Mental', specialist: 'Dra. Maria Santos', rating: 9.5 },
      { date: '2024-10-01', pillar: 'Saúde Mental', specialist: 'Dr. Fernando Alves', rating: 8.9 },
      { date: '2024-09-18', pillar: 'Bem-Estar Físico', specialist: 'Prof. Ana Rodrigues', rating: 9.0 }
    ],
    onboardingGoals: [
      'Melhorar gestão de stress',
      'Desenvolver técnicas de mindfulness',
      'Estabelecer rotina de exercício físico'
    ],
    personalProgress: 75
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    status: 'Ativo',
    mostUsedPillar: 'Bem-Estar Físico',
    sessionsCount: 8,
    lastFeedback: 8.9,
    sessionHistory: [
      { date: '2024-10-14', pillar: 'Bem-Estar Físico', specialist: 'Prof. Ana Rodrigues', rating: 9.0 },
      { date: '2024-09-28', pillar: 'Bem-Estar Físico', specialist: 'Prof. Joana Martins', rating: 8.8 },
      { date: '2024-09-10', pillar: 'Saúde Mental', specialist: 'Dra. Maria Santos', rating: 9.1 }
    ],
    onboardingGoals: [
      'Melhorar condição física geral',
      'Aprender técnicas de relaxamento',
      'Estabelecer hábitos alimentares saudáveis'
    ],
    personalProgress: 60
  },
  {
    id: '3',
    name: 'Ana Costa',
    status: 'Ativo',
    mostUsedPillar: 'Assistência Financeira',
    sessionsCount: 6,
    lastFeedback: 9.0,
    sessionHistory: [
      { date: '2024-10-12', pillar: 'Assistência Financeira', specialist: 'Dr. Paulo Reis', rating: 9.2 },
      { date: '2024-09-25', pillar: 'Assistência Financeira', specialist: 'Dr. Ricardo Costa', rating: 8.8 },
      { date: '2024-09-05', pillar: 'Bem-Estar Físico', specialist: 'Prof. Ana Rodrigues', rating: 9.0 }
    ],
    onboardingGoals: [
      'Organizar finanças pessoais',
      'Criar plano de poupança',
      'Entender investimentos básicos'
    ],
    personalProgress: 80
  },
  {
    id: '4',
    name: 'Pedro Ferreira',
    status: 'Inativo',
    mostUsedPillar: 'Assistência Jurídica',
    sessionsCount: 4,
    lastFeedback: 8.7,
    sessionHistory: [
      { date: '2024-09-20', pillar: 'Assistência Jurídica', specialist: 'Dra. Sofia Alves', rating: 8.5 },
      { date: '2024-09-05', pillar: 'Assistência Jurídica', specialist: 'Dr. Ricardo Costa', rating: 8.9 }
    ],
    onboardingGoals: [
      'Resolver questões contratuais',
      'Entender direitos laborais',
      'Planejar sucessão familiar'
    ],
    personalProgress: 45
  },
  {
    id: '5',
    name: 'Carlos Santos',
    status: 'Ativo',
    mostUsedPillar: 'Saúde Mental',
    sessionsCount: 10,
    lastFeedback: 9.1,
    sessionHistory: [
      { date: '2024-10-08', pillar: 'Saúde Mental', specialist: 'Dr. Fernando Alves', rating: 9.3 },
      { date: '2024-09-22', pillar: 'Saúde Mental', specialist: 'Dra. Maria Santos', rating: 8.9 },
      { date: '2024-09-08', pillar: 'Assistência Financeira', specialist: 'Dr. Paulo Reis', rating: 9.1 }
    ],
    onboardingGoals: [
      'Melhorar comunicação interpessoal',
      'Gerir ansiedade no trabalho',
      'Desenvolver liderança'
    ],
    personalProgress: 85
  }
];
