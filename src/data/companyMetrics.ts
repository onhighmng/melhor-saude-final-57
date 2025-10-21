// Mock data for Company (Empresa) user pages

export interface CompanyMetrics {
  activeEmployees: number;
  totalSessions: number;
  avgSatisfaction: number;
  utilizationRate: number;
  totalEmployeesInPlan: number;
  registeredEmployees: number;
  unregisteredEmployees: number;
  contractedSessions: number;
  usedSessions: number;
  mostUsedPillar: string;
  activePercentage: number;
  inactivePercentage: number;
}

export interface ContractInfo {
  planName: string;
  planType: 'basic' | 'premium' | 'enterprise';
  totalEmployees: number;
  sessionsIncluded: number;
  monthlyFee: number;
  currency: string;
  nextBillingDate: string;
  contractStartDate: string;
  contractEndDate: string;
}

export interface InvoiceHistory {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  downloadUrl: string;
}

export interface ROIData {
  monthlyCost: number;
  estimatedSavings: {
    absenteeism: number;
    healthcare: number;
    productivity: number;
    retention: number;
  };
  totalEstimatedSavings: number;
  roiPercentage: number;
  paybackPeriod: number; // months
}

export interface AbsenteeismData {
  currentRate: number;
  estimatedReduction: number;
  monthlySessions: number;
  trendData: Array<{
    month: string;
    before: number;
    after: number;
  }>;
}

export interface SessionAnalytics {
  totalContracted: number;
  totalUsed: number;
  utilizationRate: number;
  employeesUsingServices: number;
  pillarBreakdown: Array<{
    pillar: string;
    sessionsUsed: number;
    sessionsAvailable: number;
    utilizationRate: number;
    topSpecialists: Array<{
      name: string;
      sessions: number;
    }>;
  }>;
  monthlyTrend: Array<{
    month: string;
    total: number;
    byPillar: {
      mental: number;
      physical: number;
      financial: number;
      legal: number;
    };
  }>;
  peakHours: Array<{
    hour: string;
    sessions: number;
  }>;
  peakDays: Array<{
    day: string;
    sessions: number;
  }>;
}

export interface EmployeeMetrics {
  totalRegistered: number;
  pendingRegistration: number;
  averageSessionsPerEmployee: number;
  mostPopularPillar: string;
  activityDistribution: {
    active: number;
    inactive: number;
  };
  goalsCompleted: {
    totalGoals: number;
    completedGoals: number;
    completionRate: number;
  };
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
  utilizationRate: 78,
  totalEmployeesInPlan: 50,
  registeredEmployees: 47,
  unregisteredEmployees: 3,
  contractedSessions: 400,
  usedSessions: 234,
  mostUsedPillar: 'Saúde Mental',
  activePercentage: 78,
  inactivePercentage: 22
};

// Mock Contract Information
export const mockContractInfo: ContractInfo = {
  planName: 'Plano Premium',
  planType: 'premium',
  totalEmployees: 50,
  sessionsIncluded: 400,
  monthlyFee: 140000,
  currency: 'MZN',
  nextBillingDate: '2024-11-05',
  contractStartDate: '2024-01-01',
  contractEndDate: '2024-12-31'
};

// Mock Invoice History
export const mockInvoiceHistory: InvoiceHistory[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    date: '2024-10-01',
    amount: 140000,
    status: 'paid',
    downloadUrl: '/invoices/inv-2024-001.pdf'
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    date: '2024-09-01',
    amount: 140000,
    status: 'paid',
    downloadUrl: '/invoices/inv-2024-002.pdf'
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    date: '2024-08-01',
    amount: 140000,
    status: 'paid',
    downloadUrl: '/invoices/inv-2024-003.pdf'
  }
];

// Mock ROI Data - Simplified
export const mockROIData: ROIData = {
  monthlyCost: 140000,
  estimatedSavings: {
    absenteeism: 45000,
    healthcare: 32000,
    productivity: 28000,
    retention: 15000
  },
  totalEstimatedSavings: 120000,
  roiPercentage: 85.7,
  paybackPeriod: 1.2
};

// Mock Absenteeism Data - Simplified
export const mockAbsenteeismData: AbsenteeismData = {
  currentRate: 4.2,
  estimatedReduction: 15,
  monthlySessions: 234,
  trendData: [] // Removed detailed trend data
};

// Mock Session Analytics
export const mockSessionAnalytics: SessionAnalytics = {
  totalContracted: 400,
  totalUsed: 234,
  utilizationRate: 58.5,
  employeesUsingServices: 42,
  pillarBreakdown: [
    {
      pillar: 'Saúde Mental',
      sessionsUsed: 98,
      sessionsAvailable: 100,
      utilizationRate: 98,
      topSpecialists: [
        { name: 'Dra. Maria Santos', sessions: 25 },
        { name: 'Dr. Fernando Alves', sessions: 20 },
        { name: 'Dra. Ana Costa', sessions: 15 }
      ]
    },
    {
      pillar: 'Bem-Estar Físico',
      sessionsUsed: 66,
      sessionsAvailable: 100,
      utilizationRate: 66,
      topSpecialists: [
        { name: 'Prof. Ana Rodrigues', sessions: 18 },
        { name: 'Prof. Joana Martins', sessions: 15 },
        { name: 'Dr. Carlos Silva', sessions: 12 }
      ]
    },
    {
      pillar: 'Assistência Financeira',
      sessionsUsed: 42,
      sessionsAvailable: 100,
      utilizationRate: 42,
      topSpecialists: [
        { name: 'Dr. Paulo Reis', sessions: 12 },
        { name: 'Dr. Ricardo Costa', sessions: 10 },
        { name: 'Dra. Sofia Lima', sessions: 8 }
      ]
    },
    {
      pillar: 'Assistência Jurídica',
      sessionsUsed: 28,
      sessionsAvailable: 100,
      utilizationRate: 28,
      topSpecialists: [
        { name: 'Dra. Beatriz Silva', sessions: 8 },
        { name: 'Dr. Miguel Santos', sessions: 6 },
        { name: 'Dra. Catarina Alves', sessions: 5 }
      ]
    }
  ],
  monthlyTrend: [
    { month: 'Jan', total: 45, byPillar: { mental: 20, physical: 12, financial: 8, legal: 5 } },
    { month: 'Fev', total: 52, byPillar: { mental: 22, physical: 15, financial: 10, legal: 5 } },
    { month: 'Mar', total: 67, byPillar: { mental: 28, physical: 18, financial: 12, legal: 9 } },
    { month: 'Abr', total: 58, byPillar: { mental: 24, physical: 16, financial: 11, legal: 7 } },
    { month: 'Mai', total: 72, byPillar: { mental: 30, physical: 20, financial: 14, legal: 8 } },
    { month: 'Jun', total: 65, byPillar: { mental: 27, physical: 18, financial: 13, legal: 7 } }
  ],
          peakHours: [], // Removed detailed peak hours data
          peakDays: [] // Removed detailed peak days data
};

// Mock Employee Metrics
export const mockEmployeeMetrics: EmployeeMetrics = {
  totalRegistered: 47,
  pendingRegistration: 3,
  averageSessionsPerEmployee: 4.98,
  mostPopularPillar: 'Saúde Mental',
  activityDistribution: {
    active: 78,
    inactive: 22
  },
  goalsCompleted: {
    totalGoals: 150,
    completedGoals: 89,
    completionRate: 59.3
  }
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
