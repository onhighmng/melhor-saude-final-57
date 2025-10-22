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

// Mock Calendar Events (October-November 2024)
export const mockCalendarEvents: PrestadorCalendarEvent[] = [
  // Week 1 - October 21-25, 2024
  {
    id: 'session-w1-1',
    date: '2024-10-21',
    time: '09:00',
    type: 'session',
    status: 'confirmed',
    clientName: 'Sofia Rodrigues',
    company: 'TechCorp Lda',
    pillar: 'psychological',
    sessionType: 'Virtual'
  },
  {
    id: 'session-w1-2',
    date: '2024-10-21',
    time: '11:00',
    type: 'session',
    status: 'confirmed',
    clientName: 'Miguel Alves',
    company: 'HealthPlus SA',
    pillar: 'physical',
    sessionType: 'Presencial'
  },
  {
    id: 'session-w1-3',
    date: '2024-10-21',
    time: '14:00',
    type: 'session',
    status: 'confirmed',
    clientName: 'Beatriz Lima',
    company: 'InnovateLab',
    pillar: 'financial',
    sessionType: 'Virtual'
  },
  { id: 'block-w1-1', date: '2024-10-21', time: '16:00', type: 'blocked' },

  {
    id: 'session-w1-4',
    date: '2024-10-22',
    time: '10:00',
    type: 'session',
    status: 'confirmed',
    clientName: 'João Silva',
    company: 'ConsultPro',
    pillar: 'legal',
    sessionType: 'Virtual'
  },
  {
    id: 'session-w1-5',
    date: '2024-10-22',
    time: '13:00',
    type: 'session',
    status: 'confirmed',
    clientName: 'Ana Costa',
    company: 'MediaGroup SA',
    pillar: 'psychological',
    sessionType: 'Presencial'
  },
  {
    id: 'session-w1-6',
    date: '2024-10-22',
    time: '15:30',
    type: 'session',
    status: 'confirmed',
    clientName: 'Pedro Santos',
    company: 'TechCorp Lda',
    pillar: 'physical',
    sessionType: 'Virtual'
  },

  {
    id: 'session-w1-7',
    date: '2024-10-23',
    time: '09:30',
    type: 'session',
    status: 'confirmed',
    clientName: 'Maria Oliveira',
    company: 'HealthPlus SA',
    pillar: 'financial',
    sessionType: 'Virtual'
  },
  {
    id: 'session-w1-8',
    date: '2024-10-23',
    time: '11:30',
    type: 'session',
    status: 'cancelled',
    clientName: 'Carlos Ferreira',
    company: 'InnovateLab',
    pillar: 'legal',
    sessionType: 'Presencial'
  },
  { id: 'block-w1-2', date: '2024-10-23', time: '14:00', type: 'blocked' },
  { id: 'block-w1-3', date: '2024-10-23', time: '15:00', type: 'blocked' },

  {
    id: 'session-w1-9',
    date: '2024-10-24',
    time: '10:00',
    type: 'session',
    status: 'confirmed',
    clientName: 'Rita Mendes',
    company: 'ConsultPro',
    pillar: 'psychological',
    sessionType: 'Virtual'
  },
  {
    id: 'session-w1-10',
    date: '2024-10-24',
    time: '13:30',
    type: 'session',
    status: 'confirmed',
    clientName: 'Tiago Nunes',
    company: 'MediaGroup SA',
    pillar: 'physical',
    sessionType: 'Presencial'
  },
  {
    id: 'session-w1-11',
    date: '2024-10-24',
    time: '16:00',
    type: 'session',
    status: 'confirmed',
    clientName: 'Luisa Pereira',
    company: 'TechCorp Lda',
    pillar: 'financial',
    sessionType: 'Virtual'
  },

  {
    id: 'session-w1-12',
    date: '2024-10-25',
    time: '09:00',
    type: 'session',
    status: 'confirmed',
    clientName: 'André Martins',
    company: 'HealthPlus SA',
    pillar: 'legal',
    sessionType: 'Virtual'
  },
  {
    id: 'session-w1-13',
    date: '2024-10-25',
    time: '11:00',
    type: 'session',
    status: 'confirmed',
    clientName: 'Mariana Sousa',
    company: 'InnovateLab',
    pillar: 'psychological',
    sessionType: 'Presencial'
  },
  { id: 'avail-w1-1', date: '2024-10-25', time: '14:00', type: 'available' },

  // Week 2 - October 28-31, 2024
  {
    id: 'session-w2-1',
    date: '2024-10-28',
    time: '09:30',
    type: 'session',
    status: 'confirmed',
    clientName: 'Francisco Dias',
    company: 'ConsultPro',
    pillar: 'physical',
    sessionType: 'Virtual'
  },
  {
    id: 'session-w2-2',
    date: '2024-10-28',
    time: '11:30',
    type: 'session',
    status: 'confirmed',
    clientName: 'Carolina Gomes',
    company: 'MediaGroup SA',
    pillar: 'financial',
    sessionType: 'Presencial'
  },
  {
    id: 'session-w2-3',
    date: '2024-10-28',
    time: '14:30',
    type: 'session',
    status: 'confirmed',
    clientName: 'Diogo Pinto',
    company: 'TechCorp Lda',
    pillar: 'legal',
    sessionType: 'Virtual'
  },

  {
    id: 'session-w2-4',
    date: '2024-10-29',
    time: '10:00',
    type: 'session',
    status: 'confirmed',
    clientName: 'Inês Cardoso',
    company: 'HealthPlus SA',
    pillar: 'psychological',
    sessionType: 'Virtual'
  },
  {
    id: 'session-w2-5',
    date: '2024-10-29',
    time: '13:00',
    type: 'session',
    status: 'cancelled',
    clientName: 'Rui Teixeira',
    company: 'InnovateLab',
    pillar: 'physical',
    sessionType: 'Presencial'
  },
  {
    id: 'session-w2-6',
    date: '2024-10-29',
    time: '15:00',
    type: 'session',
    status: 'confirmed',
    clientName: 'Vera Ramos',
    company: 'ConsultPro',
    pillar: 'financial',
    sessionType: 'Virtual'
  },

  {
    id: 'session-w2-7',
    date: '2024-10-30',
    time: '09:00',
    type: 'session',
    status: 'confirmed',
    clientName: 'Paulo Moreira',
    company: 'MediaGroup SA',
    pillar: 'legal',
    sessionType: 'Presencial'
  },
  { id: 'block-w2-1', date: '2024-10-30', time: '11:00', type: 'blocked' },
  { id: 'block-w2-2', date: '2024-10-30', time: '12:00', type: 'blocked' },
  {
    id: 'session-w2-8',
    date: '2024-10-30',
    time: '14:00',
    type: 'session',
    status: 'confirmed',
    clientName: 'Teresa Fonseca',
    company: 'TechCorp Lda',
    pillar: 'psychological',
    sessionType: 'Virtual'
  },

  {
    id: 'session-w2-9',
    date: '2024-10-31',
    time: '10:30',
    type: 'session',
    status: 'confirmed',
    clientName: 'Hugo Barbosa',
    company: 'HealthPlus SA',
    pillar: 'physical',
    sessionType: 'Virtual'
  },
  {
    id: 'session-w2-10',
    date: '2024-10-31',
    time: '13:30',
    type: 'session',
    status: 'confirmed',
    clientName: 'Sandra Carvalho',
    company: 'InnovateLab',
    pillar: 'financial',
    sessionType: 'Presencial'
  },
  { id: 'avail-w2-1', date: '2024-10-31', time: '16:00', type: 'available' },

  // Week 3 - November 1-8, 2024
  {
    id: 'session-w3-1',
    date: '2024-11-04',
    time: '09:00',
    type: 'session',
    status: 'confirmed',
    clientName: 'Isabel Cruz',
    company: 'ConsultPro',
    pillar: 'legal',
    sessionType: 'Virtual'
  },
  {
    id: 'session-w3-2',
    date: '2024-11-04',
    time: '11:00',
    type: 'session',
    status: 'confirmed',
    clientName: 'Nuno Ribeiro',
    company: 'MediaGroup SA',
    pillar: 'psychological',
    sessionType: 'Presencial'
  },
  {
    id: 'session-w3-3',
    date: '2024-11-04',
    time: '14:00',
    type: 'session',
    status: 'confirmed',
    clientName: 'Cristina Lopes',
    company: 'TechCorp Lda',
    pillar: 'physical',
    sessionType: 'Virtual'
  },

  {
    id: 'session-w3-4',
    date: '2024-11-05',
    time: '10:00',
    type: 'session',
    status: 'confirmed',
    clientName: 'Fernando Correia',
    company: 'HealthPlus SA',
    pillar: 'financial',
    sessionType: 'Virtual'
  },
  {
    id: 'session-w3-5',
    date: '2024-11-05',
    time: '13:00',
    type: 'session',
    status: 'confirmed',
    clientName: 'Patrícia Monteiro',
    company: 'InnovateLab',
    pillar: 'legal',
    sessionType: 'Presencial'
  },
  {
    id: 'session-w3-6',
    date: '2024-11-05',
    time: '15:30',
    type: 'session',
    status: 'cancelled',
    clientName: 'Ricardo Vieira',
    company: 'ConsultPro',
    pillar: 'psychological',
    sessionType: 'Virtual'
  },

  {
    id: 'session-w3-7',
    date: '2024-11-06',
    time: '09:30',
    type: 'session',
    status: 'confirmed',
    clientName: 'Sílvia Fernandes',
    company: 'MediaGroup SA',
    pillar: 'physical',
    sessionType: 'Virtual'
  },
  {
    id: 'session-w3-8',
    date: '2024-11-06',
    time: '11:30',
    type: 'session',
    status: 'confirmed',
    clientName: 'Jorge Tavares',
    company: 'TechCorp Lda',
    pillar: 'financial',
    sessionType: 'Presencial'
  },
  { id: 'block-w3-1', date: '2024-11-06', time: '14:00', type: 'blocked' },
  { id: 'block-w3-2', date: '2024-11-06', time: '15:00', type: 'blocked' },

  {
    id: 'session-w3-9',
    date: '2024-11-07',
    time: '10:00',
    type: 'session',
    status: 'confirmed',
    clientName: 'Mónica Simões',
    company: 'HealthPlus SA',
    pillar: 'legal',
    sessionType: 'Virtual'
  },
  {
    id: 'session-w3-10',
    date: '2024-11-07',
    time: '13:30',
    type: 'session',
    status: 'confirmed',
    clientName: 'Bruno Azevedo',
    company: 'InnovateLab',
    pillar: 'psychological',
    sessionType: 'Presencial'
  },
  {
    id: 'session-w3-11',
    date: '2024-11-07',
    time: '16:00',
    type: 'session',
    status: 'confirmed',
    clientName: 'Cláudia Marques',
    company: 'ConsultPro',
    pillar: 'physical',
    sessionType: 'Virtual'
  },

  {
    id: 'session-w3-12',
    date: '2024-11-08',
    time: '09:00',
    type: 'session',
    status: 'confirmed',
    clientName: 'Vasco Henriques',
    company: 'MediaGroup SA',
    pillar: 'financial',
    sessionType: 'Virtual'
  },
  {
    id: 'session-w3-13',
    date: '2024-11-08',
    time: '11:00',
    type: 'session',
    status: 'confirmed',
    clientName: 'Filipa Costa',
    company: 'TechCorp Lda',
    pillar: 'legal',
    sessionType: 'Presencial'
  },
  { id: 'avail-w3-1', date: '2024-11-08', time: '14:00', type: 'available' },
  { id: 'avail-w3-2', date: '2024-11-08', time: '15:00', type: 'available' },

  // Week 4 - November 11-15, 2024
  {
    id: 'session-w4-1',
    date: '2024-11-11',
    time: '09:30',
    type: 'session',
    status: 'confirmed',
    clientName: 'Gonçalo Pires',
    company: 'HealthPlus SA',
    pillar: 'psychological',
    sessionType: 'Virtual'
  },
  {
    id: 'session-w4-2',
    date: '2024-11-11',
    time: '11:30',
    type: 'session',
    status: 'confirmed',
    clientName: 'Marta Guerreiro',
    company: 'InnovateLab',
    pillar: 'physical',
    sessionType: 'Presencial'
  },
  {
    id: 'session-w4-3',
    date: '2024-11-11',
    time: '14:30',
    type: 'session',
    status: 'confirmed',
    clientName: 'Eduardo Batista',
    company: 'ConsultPro',
    pillar: 'financial',
    sessionType: 'Virtual'
  },

  {
    id: 'session-w4-4',
    date: '2024-11-12',
    time: '10:00',
    type: 'session',
    status: 'confirmed',
    clientName: 'Carla Reis',
    company: 'MediaGroup SA',
    pillar: 'legal',
    sessionType: 'Virtual'
  },
  {
    id: 'session-w4-5',
    date: '2024-11-12',
    time: '13:00',
    type: 'session',
    status: 'confirmed',
    clientName: 'Rodrigo Araújo',
    company: 'TechCorp Lda',
    pillar: 'psychological',
    sessionType: 'Presencial'
  },
  {
    id: 'session-w4-6',
    date: '2024-11-12',
    time: '15:00',
    type: 'session',
    status: 'cancelled',
    clientName: 'Susana Machado',
    company: 'HealthPlus SA',
    pillar: 'physical',
    sessionType: 'Virtual'
  },

  {
    id: 'session-w4-7',
    date: '2024-11-13',
    time: '09:00',
    type: 'session',
    status: 'confirmed',
    clientName: 'Duarte Miranda',
    company: 'InnovateLab',
    pillar: 'financial',
    sessionType: 'Presencial'
  },
  { id: 'block-w4-1', date: '2024-11-13', time: '11:00', type: 'blocked' },
  { id: 'block-w4-2', date: '2024-11-13', time: '12:00', type: 'blocked' },
  {
    id: 'session-w4-8',
    date: '2024-11-13',
    time: '14:00',
    type: 'session',
    status: 'confirmed',
    clientName: 'Raquel Guedes',
    company: 'ConsultPro',
    pillar: 'legal',
    sessionType: 'Virtual'
  },

  {
    id: 'session-w4-9',
    date: '2024-11-14',
    time: '10:30',
    type: 'session',
    status: 'confirmed',
    clientName: 'Alexandre Branco',
    company: 'MediaGroup SA',
    pillar: 'psychological',
    sessionType: 'Virtual'
  },
  {
    id: 'session-w4-10',
    date: '2024-11-14',
    time: '13:30',
    type: 'session',
    status: 'confirmed',
    clientName: 'Helena Coelho',
    company: 'TechCorp Lda',
    pillar: 'physical',
    sessionType: 'Presencial'
  },

  {
    id: 'session-w4-11',
    date: '2024-11-15',
    time: '09:00',
    type: 'session',
    status: 'confirmed',
    clientName: 'Manuel Pinto',
    company: 'HealthPlus SA',
    pillar: 'financial',
    sessionType: 'Virtual'
  },
  {
    id: 'session-w4-12',
    date: '2024-11-15',
    time: '11:00',
    type: 'session',
    status: 'confirmed',
    clientName: 'Daniela Rocha',
    company: 'InnovateLab',
    pillar: 'legal',
    sessionType: 'Presencial'
  },
  { id: 'avail-w4-1', date: '2024-11-15', time: '14:00', type: 'available' },
  { id: 'avail-w4-2', date: '2024-11-15', time: '15:00', type: 'available' },
  { id: 'avail-w4-3', date: '2024-11-15', time: '16:00', type: 'available' }
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
