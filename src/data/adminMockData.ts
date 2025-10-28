// Centralized mock data for admin section

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  company: string;
  department?: string;
  companySessions: number;
  personalSessions: number;
  usedCompanySessions: number;
  usedPersonalSessions: number;
  fixedProviders: {
    mentalHealth?: string;
    physicalWellness?: string;
    financialAssistance?: string;
    legalAssistance?: string;
  };
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface AdminProvider {
  id: string;
  name: string;
  email: string;
  specialty: string; // e.g., "Psicólogo Clínico", "Advogado", etc.
  pillar: 'mental-health' | 'physical-wellness' | 'financial-assistance' | 'legal-assistance'; // Only ONE pillar
  costPerSession: number; // in MZN
  sessionType: 'Virtual' | 'Presencial' | 'Ambos';
  availability: string; // "Disponível", "Ocupado", "Indisponível" or for filters: 'active' | 'inactive'
  status: 'Ativo' | 'Ocupado' | 'Inativo';
  satisfaction: number; // rating out of 10
  totalSessions: number;
  sessionsThisMonth: number;
  companiesServed: number;
  avatar?: string;
  bio?: string;
  // For financial calculations
  platformMargin: number; // percentage, e.g., 25
  monthlyPayment: number; // total paid this month in MZN
}

// Mock Users Data
export const mockUsers: AdminUser[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@techcorp.pt',
    company: 'TechCorp Lda',
    department: 'Tecnologia',
    companySessions: 12,
    personalSessions: 3,
    usedCompanySessions: 8,
    usedPersonalSessions: 1,
    fixedProviders: {
      mentalHealth: 'Dra. Maria Santos',
      physicalWellness: 'Prof. Ana Rodrigues'
    },
    status: 'active',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    email: 'maria@healthplus.pt',
    company: 'HealthPlus SA',
    department: 'Recursos Humanos',
    companySessions: 8,
    personalSessions: 5,
    usedCompanySessions: 3,
    usedPersonalSessions: 2,
    fixedProviders: {
      mentalHealth: 'Dr. Paulo Reis',
      legalAssistance: 'Dra. Sofia Alves'
    },
    status: 'active',
    createdAt: '2024-02-01'
  },
  {
    id: '3',
    name: 'Carlos Santos',
    email: 'carlos@innovatelab.pt',
    company: 'InnovateLab',
    department: 'Marketing',
    companySessions: 0,
    personalSessions: 8,
    usedCompanySessions: 0,
    usedPersonalSessions: 5,
    fixedProviders: {
      financialAssistance: 'Dr. Fernando Alves'
    },
    status: 'inactive',
    createdAt: '2024-01-28'
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana.costa@startup.pt',
    company: 'StartupHub',
    department: 'Vendas',
    companySessions: 15,
    personalSessions: 0,
    usedCompanySessions: 10,
    usedPersonalSessions: 0,
    fixedProviders: {
      mentalHealth: 'Dra. Maria Santos',
      financialAssistance: 'Dr. Fernando Alves'
    },
    status: 'active',
    createdAt: '2024-03-10'
  },
  {
    id: '5',
    name: 'Pedro Ferreira',
    email: 'pedro@consulting.pt',
    company: 'ConsultPro',
    department: 'Operações',
    companySessions: 20,
    personalSessions: 5,
    usedCompanySessions: 15,
    usedPersonalSessions: 3,
    fixedProviders: {
      mentalHealth: 'Dr. Paulo Reis',
      physicalWellness: 'Prof. Ana Rodrigues',
      legalAssistance: 'Dra. Sofia Alves'
    },
    status: 'active',
    createdAt: '2024-02-20'
  },
  {
    id: '6',
    name: 'Rita Mendes',
    email: 'rita@techcorp.pt',
    company: 'TechCorp Lda',
    department: 'Design',
    companySessions: 12,
    personalSessions: 2,
    usedCompanySessions: 5,
    usedPersonalSessions: 0,
    fixedProviders: {
      physicalWellness: 'Prof. Ana Rodrigues'
    },
    status: 'active',
    createdAt: '2024-03-05'
  },
  {
    id: '7',
    name: 'Tiago Pereira',
    email: 'tiago@mediagroup.pt',
    company: 'MediaGroup SA',
    department: 'Produção',
    companySessions: 10,
    personalSessions: 4,
    usedCompanySessions: 2,
    usedPersonalSessions: 1,
    fixedProviders: {
      mentalHealth: 'Dra. Maria Santos'
    },
    status: 'active',
    createdAt: '2024-01-22'
  },
  {
    id: '8',
    name: 'Luísa Rodrigues',
    email: 'luisa@healthplus.pt',
    company: 'HealthPlus SA',
    department: 'Financeiro',
    companySessions: 8,
    personalSessions: 6,
    usedCompanySessions: 8,
    usedPersonalSessions: 4,
    fixedProviders: {
      mentalHealth: 'Dr. Paulo Reis',
      financialAssistance: 'Dr. Fernando Alves',
      legalAssistance: 'Dra. Sofia Alves'
    },
    status: 'inactive',
    createdAt: '2024-02-15'
  },
  {
    id: '9',
    name: 'Miguel Alves',
    email: 'miguel@innovatelab.pt',
    company: 'InnovateLab',
    department: 'Investigação',
    companySessions: 0,
    personalSessions: 10,
    usedCompanySessions: 0,
    usedPersonalSessions: 7,
    fixedProviders: {
      physicalWellness: 'Prof. Ana Rodrigues',
      financialAssistance: 'Dr. Fernando Alves'
    },
    status: 'active',
    createdAt: '2024-03-01'
  },
  {
    id: '10',
    name: 'Sofia Martins',
    email: 'sofia@consulting.pt',
    company: 'ConsultPro',
    department: 'Legal',
    companySessions: 20,
    personalSessions: 0,
    usedCompanySessions: 12,
    usedPersonalSessions: 0,
    fixedProviders: {
      mentalHealth: 'Dra. Maria Santos',
      legalAssistance: 'Dra. Sofia Alves'
    },
    status: 'active',
    createdAt: '2024-02-25'
  },
  {
    id: '11',
    name: 'Bruno Sousa',
    email: 'bruno@startup.pt',
    company: 'StartupHub',
    department: 'Produto',
    companySessions: 15,
    personalSessions: 3,
    usedCompanySessions: 6,
    usedPersonalSessions: 2,
    fixedProviders: {
      financialAssistance: 'Dr. Fernando Alves'
    },
    status: 'active',
    createdAt: '2024-03-12'
  },
  {
    id: '12',
    name: 'Cláudia Lopes',
    email: 'claudia@mediagroup.pt',
    company: 'MediaGroup SA',
    department: 'Comunicação',
    companySessions: 10,
    personalSessions: 5,
    usedCompanySessions: 9,
    usedPersonalSessions: 3,
    fixedProviders: {
      mentalHealth: 'Dr. Paulo Reis',
      physicalWellness: 'Prof. Ana Rodrigues'
    },
    status: 'inactive',
    createdAt: '2024-01-30'
  }
];

// Mock Providers Data
export const mockProviders: AdminProvider[] = [
  {
    id: '1',
    name: 'Dra. Maria Santos',
    email: 'maria.santos@clinic.pt',
    specialty: 'Psicóloga Clínica',
    pillar: 'mental-health',
    costPerSession: 350,
    sessionType: 'Ambos',
    availability: 'active',
    status: 'Ativo',
    satisfaction: 9.2,
    totalSessions: 142,
    sessionsThisMonth: 18,
    companiesServed: 4,
    platformMargin: 25,
    monthlyPayment: 4725,
    bio: 'Psicóloga clínica com mais de 10 anos de experiência em terapia cognitivo-comportamental e mindfulness.'
  },
  {
    id: '2',
    name: 'Dr. Paulo Reis',
    email: 'paulo.reis@financial.pt',
    specialty: 'Consultor Financeiro',
    pillar: 'financial-assistance',
    costPerSession: 300,
    sessionType: 'Virtual',
    availability: 'active',
    status: 'Ativo',
    satisfaction: 8.9,
    totalSessions: 98,
    sessionsThisMonth: 12,
    companiesServed: 3,
    platformMargin: 25,
    monthlyPayment: 2700,
    bio: 'Consultor financeiro especializado em planeamento financeiro pessoal e gestão de dívidas.'
  },
  {
    id: '3',
    name: 'Dra. Sofia Alves',
    email: 'sofia.alves@legal.pt',
    specialty: 'Advogada',
    pillar: 'legal-assistance',
    costPerSession: 400,
    sessionType: 'Presencial',
    availability: 'inactive',
    status: 'Inativo',
    satisfaction: 9.5,
    totalSessions: 76,
    sessionsThisMonth: 0,
    companiesServed: 2,
    platformMargin: 25,
    monthlyPayment: 0,
    bio: 'Advogada especializada em direito do trabalho e direito da família.'
  },
  {
    id: '4',
    name: 'Prof. Ana Rodrigues',
    email: 'ana.rodrigues@wellness.pt',
    specialty: 'Personal Trainer',
    pillar: 'physical-wellness',
    costPerSession: 250,
    sessionType: 'Ambos',
    availability: 'active',
    status: 'Ativo',
    satisfaction: 9.1,
    totalSessions: 203,
    sessionsThisMonth: 25,
    companiesServed: 5,
    platformMargin: 25,
    monthlyPayment: 4687.5,
    bio: 'Personal trainer e coach de wellness com certificação em nutrição desportiva.'
  },
  {
    id: '5',
    name: 'Dr. Fernando Alves',
    email: 'fernando.alves@finance.pt',
    specialty: 'Economista',
    pillar: 'financial-assistance',
    costPerSession: 320,
    sessionType: 'Virtual',
    availability: 'active',
    status: 'Ocupado',
    satisfaction: 9.3,
    totalSessions: 165,
    sessionsThisMonth: 20,
    companiesServed: 4,
    platformMargin: 25,
    monthlyPayment: 4800,
    bio: 'Economista e consultor financeiro com foco em investimentos e planeamento de reformas.'
  },
  {
    id: '6',
    name: 'Dra. Beatriz Silva',
    email: 'beatriz.silva@mental.pt',
    specialty: 'Psiquiatra',
    pillar: 'mental-health',
    costPerSession: 450,
    sessionType: 'Ambos',
    availability: 'active',
    status: 'Ativo',
    satisfaction: 9.7,
    totalSessions: 187,
    sessionsThisMonth: 22,
    companiesServed: 6,
    platformMargin: 25,
    monthlyPayment: 7425,
    bio: 'Psiquiatra especializada em perturbações de ansiedade e depressão.'
  },
  {
    id: '7',
    name: 'Dr. Ricardo Costa',
    email: 'ricardo.costa@legal.pt',
    specialty: 'Advogado',
    pillar: 'legal-assistance',
    costPerSession: 380,
    sessionType: 'Ambos',
    availability: 'active',
    status: 'Ativo',
    satisfaction: 8.8,
    totalSessions: 112,
    sessionsThisMonth: 14,
    companiesServed: 3,
    platformMargin: 25,
    monthlyPayment: 3990,
    bio: 'Advogado com experiência em direito empresarial e contratos.'
  },
  {
    id: '8',
    name: 'Prof. Joana Martins',
    email: 'joana.martins@fitness.pt',
    specialty: 'Instrutora de Fitness',
    pillar: 'physical-wellness',
    costPerSession: 200,
    sessionType: 'Presencial',
    availability: 'active',
    status: 'Ativo',
    satisfaction: 9.4,
    totalSessions: 256,
    sessionsThisMonth: 30,
    companiesServed: 7,
    platformMargin: 25,
    monthlyPayment: 4500,
    bio: 'Professora de educação física e instrutora de pilates e yoga.'
  },
  {
    id: '9',
    name: 'Dr. Nuno Pereira',
    email: 'nuno.pereira@psych.pt',
    specialty: 'Psicólogo Clínico',
    pillar: 'mental-health',
    costPerSession: 340,
    sessionType: 'Virtual',
    availability: 'inactive',
    status: 'Inativo',
    satisfaction: 8.6,
    totalSessions: 89,
    sessionsThisMonth: 0,
    companiesServed: 2,
    platformMargin: 25,
    monthlyPayment: 0,
    bio: 'Psicólogo clínico com especialização em terapia de casal e família.'
  },
  {
    id: '10',
    name: 'Dra. Carla Fernandes',
    email: 'carla.fernandes@wellness.pt',
    specialty: 'Nutricionista',
    pillar: 'physical-wellness',
    costPerSession: 280,
    sessionType: 'Ambos',
    availability: 'active',
    status: 'Ativo',
    satisfaction: 9.0,
    totalSessions: 134,
    sessionsThisMonth: 16,
    companiesServed: 4,
    platformMargin: 25,
    monthlyPayment: 3360,
    bio: 'Nutricionista e coach de bem-estar holístico.'
  }
];

// Utility functions
export const getUserById = (id: string): AdminUser | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getProviderById = (id: string): AdminProvider | undefined => {
  return mockProviders.find(provider => provider.id === id);
};

// Generate mock data for user detail page
export const generateMockUserDetail = (user: AdminUser) => {
  const baseDate = new Date(user.createdAt);
  
  // Map fixedProviders to the expected format
  const mappedFixedProviders: any = {};
  if (user.fixedProviders.mentalHealth) {
    mappedFixedProviders.mentalHealth = { name: user.fixedProviders.mentalHealth, id: '1' };
  }
  if (user.fixedProviders.physicalWellness) {
    mappedFixedProviders.physicalWellness = { name: user.fixedProviders.physicalWellness, id: '4' };
  }
  if (user.fixedProviders.financialAssistance) {
    mappedFixedProviders.financialAssistance = { name: user.fixedProviders.financialAssistance, id: '2' };
  }
  if (user.fixedProviders.legalAssistance) {
    mappedFixedProviders.legalAssistance = { name: user.fixedProviders.legalAssistance, id: '3' };
  }
  
  return {
    ...user,
    phone: '+351 ' + Math.floor(900000000 + Math.random() * 100000000),
    dateOfBirth: new Date(1980 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
    fixedProviders: mappedFixedProviders,
    changeRequests: generateChangeRequests(user.id),
    sessionHistory: generateSessionHistory(user),
    sessionUsageData: generateMonthlyUsage()
  };
};

// Generate mock data for provider detail page
export const generateMockProviderDetail = (provider: AdminProvider) => {
  // Map education to expected format
  const educationMapped = [
    { degree: 'Mestrado em Psicologia Clínica', institution: 'Universidade de Lisboa', year: '2012' },
    { degree: 'Licenciatura em Psicologia', institution: 'Universidade do Porto', year: '2010' }
  ];
  
  const pillarName = {
    'mental-health': 'Saúde Mental',
    'physical-wellness': 'Bem-Estar Físico',
    'financial-assistance': 'Assistência Financeira',
    'legal-assistance': 'Assistência Jurídica'
  }[provider.pillar];
  
  return {
    ...provider,
    phone: '+351 ' + Math.floor(900000000 + Math.random() * 100000000),
    rating: provider.satisfaction,
    completedSessions: provider.totalSessions,
    experience: 5 + Math.floor(Math.random() * 15),
    location: 'Lisboa, Portugal',
    website: 'https://provider-site.pt',
    licenseNumber: 'LIC-' + Math.floor(10000 + Math.random() * 90000),
    upcomingBookings: generateUpcomingBookings(provider),
    sessionHistory: generateProviderSessionHistory(provider),
    monthlyStats: generateProviderMonthlyStats(),
    education: educationMapped,
    specialties: [pillarName]
  };
};

// Helper functions for generating dynamic data
function generateChangeRequests(userId: string) {
  const requests = [
    {
      id: '1',
      pillar: 'Saúde Mental',
      currentProvider: 'Dra. Maria Santos',
      requestedProvider: 'Dr. Paulo Reis',
      reason: 'Preferência por terapeuta do género masculino',
      status: 'pending' as const,
      createdAt: '2024-03-15'
    }
  ];
  
  return userId === '1' || userId === '2' ? requests : [];
}

function generateSessionHistory(user: AdminUser) {
  const history = [];
  const providers = ['Dra. Maria Santos', 'Dr. Paulo Reis', 'Prof. Ana Rodrigues', 'Dra. Sofia Alves'];
  const types = ['online', 'presencial'];
  const statuses = ['completed', 'cancelled', 'no-show'];
  const pillars = ['Saúde Mental', 'Bem-Estar Físico', 'Assistência Financeira', 'Assistência Jurídica'];
  
  const totalSessions = user.usedCompanySessions + user.usedPersonalSessions;
  
  for (let i = 0; i < totalSessions; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (i * 7 + Math.floor(Math.random() * 5)));
    
    history.push({
      id: `session-${i}`,
      date: date.toISOString().split('T')[0],
      pillar: pillars[Math.floor(Math.random() * pillars.length)],
      provider: providers[Math.floor(Math.random() * providers.length)],
      type: types[Math.floor(Math.random() * types.length)],
      status: i < totalSessions - 2 ? 'completed' : statuses[Math.floor(Math.random() * statuses.length)],
      duration: '50 min',
      source: i < user.usedCompanySessions ? 'company' : 'personal'
    });
  }
  
  return history;
}

function generateUpcomingBookings(provider: AdminProvider) {
  const bookings = [];
  const users = ['João Silva', 'Maria Oliveira', 'Ana Costa', 'Pedro Ferreira'];
  
  for (let i = 0; i < 5; i++) {
    const date = new Date();
    date.setDate(date.getDate() + (i + 1));
    
    bookings.push({
      id: `booking-${i}`,
      date: date.toISOString().split('T')[0],
      time: `${9 + i * 2}:00`,
      patient: users[Math.floor(Math.random() * users.length)],
      pillar: provider.pillar,
      status: (i % 2 === 0 ? 'confirmed' : 'scheduled') as 'confirmed' | 'scheduled'
    });
  }
  
  return bookings;
}

function generateProviderSessionHistory(provider: AdminProvider) {
  const history = [];
  const users = ['João Silva', 'Maria Oliveira', 'Ana Costa', 'Pedro Ferreira', 'Carlos Santos'];
  const statuses = ['completed', 'cancelled', 'no-show'];
  const ratings = [8.5, 9.0, 9.2, 9.5, 9.8, 8.8, 9.3];
  
  for (let i = 0; i < 15; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (i * 3 + Math.floor(Math.random() * 3)));
    
    history.push({
      id: `session-${i}`,
      date: date.toISOString().split('T')[0],
      patient: users[Math.floor(Math.random() * users.length)],
      pillar: provider.pillar,
      duration: 50,
      rating: i < 12 ? ratings[Math.floor(Math.random() * ratings.length)] : undefined,
      status: i < 12 ? 'completed' : statuses[Math.floor(Math.random() * statuses.length)]
    });
  }
  
  return history;
}

function generateMonthlyUsage() {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
  return months.map(month => ({
    month,
    company: Math.floor(5 + Math.random() * 15),
    personal: Math.floor(Math.random() * 8)
  }));
}

function generateProviderMonthlyStats() {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
  return months.map(month => ({
    month,
    sessions: Math.floor(20 + Math.random() * 40),
    revenue: Math.floor(1000 + Math.random() * 3000)
  }));
}
