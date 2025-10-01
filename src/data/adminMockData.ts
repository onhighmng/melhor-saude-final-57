// Centralized mock data for admin section

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  company: string;
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
  pillars: ('mental-health' | 'physical-wellness' | 'financial-assistance' | 'legal-assistance')[];
  availability: 'active' | 'inactive';
  licenseStatus: 'valid' | 'expired' | 'pending';
  capacity: number;
  defaultSlot: number;
  licenseExpiry?: string;
  avatar?: string;
  bio?: string;
  languages: string[];
}

// Mock Users Data
export const mockUsers: AdminUser[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@techcorp.pt',
    company: 'TechCorp Lda',
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
    pillars: ['mental-health', 'physical-wellness'],
    availability: 'active',
    licenseStatus: 'valid',
    capacity: 20,
    defaultSlot: 50,
    licenseExpiry: '2025-12-31',
    languages: ['PT', 'EN'],
    bio: 'Psicóloga clínica com mais de 10 anos de experiência em terapia cognitivo-comportamental e mindfulness.'
  },
  {
    id: '2',
    name: 'Dr. Paulo Reis',
    email: 'paulo.reis@financial.pt',
    pillars: ['financial-assistance'],
    availability: 'active',
    licenseStatus: 'pending',
    capacity: 15,
    defaultSlot: 45,
    languages: ['PT'],
    bio: 'Consultor financeiro especializado em planeamento financeiro pessoal e gestão de dívidas.'
  },
  {
    id: '3',
    name: 'Dra. Sofia Alves',
    email: 'sofia.alves@legal.pt',
    pillars: ['legal-assistance'],
    availability: 'inactive',
    licenseStatus: 'expired',
    capacity: 12,
    defaultSlot: 60,
    licenseExpiry: '2024-01-15',
    languages: ['PT', 'ES'],
    bio: 'Advogada especializada em direito do trabalho e direito da família.'
  },
  {
    id: '4',
    name: 'Prof. Ana Rodrigues',
    email: 'ana.rodrigues@wellness.pt',
    pillars: ['physical-wellness', 'mental-health'],
    availability: 'active',
    licenseStatus: 'valid',
    capacity: 25,
    defaultSlot: 30,
    licenseExpiry: '2026-06-30',
    languages: ['PT', 'EN', 'FR'],
    bio: 'Personal trainer e coach de wellness com certificação em nutrição desportiva.'
  },
  {
    id: '5',
    name: 'Dr. Fernando Alves',
    email: 'fernando.alves@finance.pt',
    pillars: ['financial-assistance'],
    availability: 'active',
    licenseStatus: 'valid',
    capacity: 18,
    defaultSlot: 50,
    licenseExpiry: '2026-03-15',
    languages: ['PT', 'EN'],
    bio: 'Economista e consultor financeiro com foco em investimentos e planeamento de reformas.'
  },
  {
    id: '6',
    name: 'Dra. Beatriz Silva',
    email: 'beatriz.silva@mental.pt',
    pillars: ['mental-health'],
    availability: 'active',
    licenseStatus: 'valid',
    capacity: 22,
    defaultSlot: 60,
    licenseExpiry: '2025-09-20',
    languages: ['PT'],
    bio: 'Psiquiatra especializada em perturbações de ansiedade e depressão.'
  },
  {
    id: '7',
    name: 'Dr. Ricardo Costa',
    email: 'ricardo.costa@legal.pt',
    pillars: ['legal-assistance'],
    availability: 'active',
    licenseStatus: 'valid',
    capacity: 16,
    defaultSlot: 45,
    licenseExpiry: '2025-11-30',
    languages: ['PT', 'EN'],
    bio: 'Advogado com experiência em direito empresarial e contratos.'
  },
  {
    id: '8',
    name: 'Prof. Joana Martins',
    email: 'joana.martins@fitness.pt',
    pillars: ['physical-wellness'],
    availability: 'active',
    licenseStatus: 'valid',
    capacity: 30,
    defaultSlot: 30,
    licenseExpiry: '2026-08-15',
    languages: ['PT', 'EN'],
    bio: 'Professora de educação física e instrutora de pilates e yoga.'
  },
  {
    id: '9',
    name: 'Dr. Nuno Pereira',
    email: 'nuno.pereira@psych.pt',
    pillars: ['mental-health'],
    availability: 'inactive',
    licenseStatus: 'pending',
    capacity: 15,
    defaultSlot: 55,
    languages: ['PT'],
    bio: 'Psicólogo clínico com especialização em terapia de casal e família.'
  },
  {
    id: '10',
    name: 'Dra. Carla Fernandes',
    email: 'carla.fernandes@wellness.pt',
    pillars: ['physical-wellness', 'mental-health'],
    availability: 'active',
    licenseStatus: 'valid',
    capacity: 20,
    defaultSlot: 45,
    licenseExpiry: '2026-01-10',
    languages: ['PT', 'EN', 'ES'],
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
    department: ['Tecnologia', 'Recursos Humanos', 'Vendas', 'Marketing', 'Operações'][Math.floor(Math.random() * 5)],
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
  
  const specialtiesMapped = provider.pillars.map(p => {
    const names = {
      'mental-health': 'Saúde Mental',
      'physical-wellness': 'Bem-Estar Físico',
      'financial-assistance': 'Assistência Financeira',
      'legal-assistance': 'Assistência Jurídica'
    };
    return names[p];
  });
  
  return {
    ...provider,
    phone: '+351 ' + Math.floor(900000000 + Math.random() * 100000000),
    rating: parseFloat((4 + Math.random()).toFixed(1)),
    totalSessions: Math.floor(50 + Math.random() * 200),
    completedSessions: Math.floor(45 + Math.random() * 180),
    experience: 5 + Math.floor(Math.random() * 15),
    location: 'Lisboa, Portugal',
    website: 'https://provider-site.pt',
    licenseNumber: 'LIC-' + Math.floor(10000 + Math.random() * 90000),
    upcomingBookings: generateUpcomingBookings(provider),
    sessionHistory: generateProviderSessionHistory(provider),
    monthlyStats: generateProviderMonthlyStats(),
    education: educationMapped,
    specialties: specialtiesMapped
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
      pillar: provider.pillars[Math.floor(Math.random() * provider.pillars.length)],
      status: (i % 2 === 0 ? 'confirmed' : 'scheduled') as 'confirmed' | 'scheduled'
    });
  }
  
  return bookings;
}

function generateProviderSessionHistory(provider: AdminProvider) {
  const history = [];
  const users = ['João Silva', 'Maria Oliveira', 'Ana Costa', 'Pedro Ferreira', 'Carlos Santos'];
  const statuses = ['completed', 'cancelled', 'no-show'];
  
  for (let i = 0; i < 15; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (i * 3 + Math.floor(Math.random() * 3)));
    
    history.push({
      id: `session-${i}`,
      date: date.toISOString().split('T')[0],
      patient: users[Math.floor(Math.random() * users.length)],
      pillar: provider.pillars[Math.floor(Math.random() * provider.pillars.length)],
      duration: provider.defaultSlot,
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
