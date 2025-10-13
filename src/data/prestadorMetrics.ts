// Mock data for Prestador (Specialist) user pages

export interface PrestadorPerformance {
  sessionsThisMonth: number;
  avgSatisfaction: number;
  totalClients: number;
  retentionRate: number;
}

export interface SessionEvolution {
  month: string;
  sessions: number;
  satisfaction: number;
}

export interface FinancialData {
  month: string;
  sessions: number;
  grossValue: number;
  commission: number;
  netValue: number;
}

export interface PrestadorSession {
  id: string;
  date: string;
  clientName: string;
  company: string;
  type: 'Virtual' | 'Presencial';
  status: 'Agendada' | 'Concluída' | 'Cancelada';
  rating?: number;
  notes?: string;
}

export interface PrestadorCalendarEvent {
  id: string;
  date: string;
  time: string;
  type: 'session' | 'available' | 'blocked';
  status?: 'confirmed' | 'cancelled';
  clientName?: string;
  company?: string;
  pillar?: string;
  sessionType?: 'Virtual' | 'Presencial';
}

export interface PrestadorSettings {
  id: string;
  name: string;
  email: string;
  pillar: string;
  costPerSession: number;
  availability: string[];
  preferredHours: string;
}

// Mock Prestador Performance
export const mockPrestadorPerformance: PrestadorPerformance = {
  sessionsThisMonth: 18,
  avgSatisfaction: 9.2,
  totalClients: 24,
  retentionRate: 87
};

// Mock Session Evolution (last 6 months)
export const mockSessionEvolution: SessionEvolution[] = [
  { month: 'Mai', sessions: 15, satisfaction: 8.8 },
  { month: 'Jun', sessions: 18, satisfaction: 9.0 },
  { month: 'Jul', sessions: 22, satisfaction: 9.1 },
  { month: 'Ago', sessions: 20, satisfaction: 9.3 },
  { month: 'Set', sessions: 24, satisfaction: 9.2 },
  { month: 'Out', sessions: 18, satisfaction: 9.2 }
];

// Mock Financial Data (last 6 months)
export const mockFinancialData: FinancialData[] = [
  {
    month: 'Mai',
    sessions: 15,
    grossValue: 5250,
    commission: 1312.5,
    netValue: 3937.5
  },
  {
    month: 'Jun',
    sessions: 18,
    grossValue: 6300,
    commission: 1575,
    netValue: 4725
  },
  {
    month: 'Jul',
    sessions: 22,
    grossValue: 7700,
    commission: 1925,
    netValue: 5775
  },
  {
    month: 'Ago',
    sessions: 20,
    grossValue: 7000,
    commission: 1750,
    netValue: 5250
  },
  {
    month: 'Set',
    sessions: 24,
    grossValue: 8400,
    commission: 2100,
    netValue: 6300
  },
  {
    month: 'Out',
    sessions: 18,
    grossValue: 6300,
    commission: 1575,
    netValue: 4725
  }
];

// Mock Prestador Sessions
export const mockPrestadorSessions: PrestadorSession[] = [
  {
    id: '1',
    date: '2024-10-15',
    clientName: 'João Silva',
    company: 'TechCorp Lda',
    type: 'Virtual',
    status: 'Concluída',
    rating: 9.5,
    notes: 'Sessão muito produtiva. Cliente demonstrou grande progresso.'
  },
  {
    id: '2',
    date: '2024-10-14',
    clientName: 'Maria Oliveira',
    company: 'HealthPlus SA',
    type: 'Presencial',
    status: 'Concluída',
    rating: 8.8
  },
  {
    id: '3',
    date: '2024-10-16',
    clientName: 'Ana Costa',
    company: 'InnovateLab',
    type: 'Virtual',
    status: 'Agendada'
  },
  {
    id: '4',
    date: '2024-10-13',
    clientName: 'Pedro Ferreira',
    company: 'ConsultPro',
    type: 'Presencial',
    status: 'Cancelada'
  },
  {
    id: '5',
    date: '2024-10-12',
    clientName: 'Carlos Santos',
    company: 'TechCorp Lda',
    type: 'Virtual',
    status: 'Concluída',
    rating: 9.2,
    notes: 'Excelente engajamento do cliente.'
  },
  {
    id: '6',
    date: '2024-10-11',
    clientName: 'Rita Mendes',
    company: 'MediaGroup SA',
    type: 'Virtual',
    status: 'Concluída',
    rating: 9.0
  },
  {
    id: '7',
    date: '2024-10-10',
    clientName: 'Tiago Pereira',
    company: 'StartupHub',
    type: 'Presencial',
    status: 'Concluída',
    rating: 8.9,
    notes: 'Cliente precisa de mais sessões para consolidar progresso.'
  },
  {
    id: '8',
    date: '2024-10-09',
    clientName: 'Luísa Rodrigues',
    company: 'HealthPlus SA',
    type: 'Virtual',
    status: 'Concluída',
    rating: 9.3
  }
];

// Mock Calendar Events (October 2024)
export const mockCalendarEvents: PrestadorCalendarEvent[] = [
  // Available slots
  { id: 'avail-1', date: '2024-10-18', time: '09:00', type: 'available' },
  { id: 'avail-2', date: '2024-10-18', time: '10:00', type: 'available' },
  { id: 'avail-3', date: '2024-10-18', time: '14:00', type: 'available' },
  { id: 'avail-4', date: '2024-10-18', time: '15:00', type: 'available' },
  
  // Confirmed sessions
  {
    id: 'session-1',
    date: '2024-10-18',
    time: '11:00',
    type: 'session',
    status: 'confirmed',
    clientName: 'João Silva',
    company: 'TechCorp Lda',
    pillar: 'Saúde Mental',
    sessionType: 'Virtual'
  },
  {
    id: 'session-2',
    date: '2024-10-18',
    time: '16:00',
    type: 'session',
    status: 'confirmed',
    clientName: 'Maria Oliveira',
    company: 'HealthPlus SA',
    pillar: 'Bem-Estar Físico',
    sessionType: 'Presencial'
  },
  
  // Blocked time
  { id: 'block-1', date: '2024-10-18', time: '12:00', type: 'blocked' },
  { id: 'block-2', date: '2024-10-18', time: '13:00', type: 'blocked' },
  
  // Future sessions
  {
    id: 'session-3',
    date: '2024-10-19',
    time: '09:00',
    type: 'session',
    status: 'confirmed',
    clientName: 'Ana Costa',
    company: 'InnovateLab',
    pillar: 'Assistência Financeira',
    sessionType: 'Virtual'
  },
  {
    id: 'session-4',
    date: '2024-10-19',
    time: '10:30',
    type: 'session',
    status: 'confirmed',
    clientName: 'Pedro Ferreira',
    company: 'ConsultPro',
    pillar: 'Assistência Jurídica',
    sessionType: 'Presencial'
  },
  {
    id: 'session-5',
    date: '2024-10-19',
    time: '14:00',
    type: 'session',
    status: 'confirmed',
    clientName: 'Carlos Santos',
    company: 'TechCorp Lda',
    pillar: 'Saúde Mental',
    sessionType: 'Virtual'
  },
  
  // Cancelled session
  {
    id: 'session-6',
    date: '2024-10-20',
    time: '11:00',
    type: 'session',
    status: 'cancelled',
    clientName: 'Rita Mendes',
    company: 'MediaGroup SA',
    pillar: 'Bem-Estar Físico',
    sessionType: 'Presencial'
  }
];

// Mock Prestador Settings
export const mockPrestadorSettings: PrestadorSettings = {
  id: '1',
  name: 'Dra. Maria Santos',
  email: 'maria.santos@clinic.pt',
  pillar: 'Saúde Mental',
  costPerSession: 350,
  availability: [
    'Segunda-feira: 09:00 - 17:00',
    'Terça-feira: 09:00 - 17:00',
    'Quarta-feira: 09:00 - 17:00',
    'Quinta-feira: 09:00 - 17:00',
    'Sexta-feira: 09:00 - 16:00'
  ],
  preferredHours: '09:00 - 17:00'
};
