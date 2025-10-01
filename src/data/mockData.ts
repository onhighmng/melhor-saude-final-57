// Mock data for all entities to replace network calls

export const mockUser = {
  id: 'mock-user-id',
  name: 'Ana Silva',
  email: 'ana.silva@empresa.co.mz',
  role: 'user' as const,
  company: 'Empresa Exemplo Lda',
  phone: '+258 84 123 4567',
  avatar_url: '/lovable-uploads/02f580a8-2bbc-4675-b164-56288192e5f1.png',
  is_active: true
};

export const mockAdminUser = {
  id: 'mock-admin-id',
  name: 'Carlos Administrador',
  email: 'admin@melhorsaude.co.mz',
  role: 'admin' as const,
  company: 'Melhor Saúde',
  phone: '+258 84 999 8888',
  avatar_url: '/lovable-uploads/537ae6d8-8bad-4984-87ef-5165033fdc1c.png',
  is_active: true
};

export const mockHRUser = {
  id: 'mock-hr-id',
  name: 'Maria RH',
  email: 'rh@empresa.co.mz',
  role: 'hr' as const,
  company: 'Empresa Exemplo Lda',
  phone: '+258 84 555 6666',
  avatar_url: '/lovable-uploads/676d62ef-5d2a-46ab-9c4f-1c94521aabed.png',
  is_active: true
};

export const mockPrestadorUser = {
  id: 'mock-prestador-id',
  name: 'Dr. João Prestador',
  email: 'joao@prestador.co.mz',
  role: 'prestador' as const,
  company: 'Clínica Especializada',
  phone: '+258 84 777 9999',
  avatar_url: '/lovable-uploads/8e2df1aa-a1c7-4f91-b724-fc348e3347ee.png',
  is_active: true
};

export const mockSessionBalance = {
  totalRemaining: 9,
  employerRemaining: 6,
  personalRemaining: 3,
  hasActiveSessions: true,
};

export const mockAnalytics = {
  total_users: 1250,
  active_users: 890,
  total_prestadores: 45,
  active_prestadores: 38,
  total_companies: 25,
  total_bookings: 2340,
  pending_change_requests: 12,
  sessions_allocated: 15000,
  sessions_used: 8750,
  pillarTrends: {
    weekly: [
      { name: 'Saúde Mental', sessions: 45 },
      { name: 'Bem-Estar Físico', sessions: 38 },
      { name: 'Assistência Financeira', sessions: 29 },
      { name: 'Assistência Jurídica', sessions: 22 }
    ],
    monthly: [
      { name: 'Jan', sessions: 180 },
      { name: 'Fev', sessions: 195 },
      { name: 'Mar', sessions: 210 }
    ],
    overall: []
  },
  sessionActivity: [
    { date: '2024-01-01', sessions: 15 },
    { date: '2024-01-02', sessions: 22 },
    { date: '2024-01-03', sessions: 18 }
  ],
  pillarDistribution: [
    { pillar: 'Saúde Mental', count: 450, percentage: 35 },
    { pillar: 'Bem-Estar Físico', count: 380, percentage: 30 },
    { pillar: 'Assistência Financeira', count: 250, percentage: 20 },
    { pillar: 'Assistência Jurídica', count: 190, percentage: 15 }
  ]
};

export const mockProviders = [
  {
    id: 'prov-1',
    name: 'Dra. Ana Silva',
    specialty: 'Psicologia Clínica',
    pillar: 'saude_mental',
    avatar_url: '/lovable-uploads/02f580a8-2bbc-4675-b164-56288192e5f1.png',
    rating: 4.8,
    experience: '8 anos',
    availability: 'Segunda a Sexta, 9h-17h'
  },
  {
    id: 'prov-2',
    name: 'Dr. Carlos Santos',
    specialty: 'Nutrição e Fitness',
    pillar: 'bem_estar_fisico',
    avatar_url: '/lovable-uploads/537ae6d8-8bad-4984-87ef-5165033fdc1c.png',
    rating: 4.9,
    experience: '12 anos',
    availability: 'Segunda a Sábado, 7h-19h'
  },
  {
    id: 'prov-3',
    name: 'Dra. Maria Costa',
    specialty: 'Consultoria Financeira',
    pillar: 'assistencia_financeira',
    avatar_url: '/lovable-uploads/676d62ef-5d2a-46ab-9c4f-1c94521aabed.png',
    rating: 4.7,
    experience: '15 anos',
    availability: 'Segunda a Sexta, 8h-16h'
  },
  {
    id: 'prov-4',
    name: 'Dr. João Ferreira',
    specialty: 'Direito Laboral',
    pillar: 'assistencia_juridica',
    avatar_url: '/lovable-uploads/8e2df1aa-a1c7-4f91-b724-fc348e3347ee.png',
    rating: 4.6,
    experience: '20 anos',
    availability: 'Segunda a Sexta, 9h-18h'
  }
];

export const mockBookings = [
  // Upcoming confirmed session - Today
  {
    id: 'book-today',
    provider_name: 'Dra. Ana Silva',
    provider_avatar: '/lovable-uploads/02f580a8-2bbc-4675-b164-56288192e5f1.png',
    pillar: 'saude_mental',
    date: new Date().toISOString().split('T')[0],
    time: '14:30',
    status: 'confirmed',
    session_type: 'individual',
    notes: 'Sessão de acompanhamento psicológico',
    booking_date: new Date().toISOString(),
    meeting_link: 'https://meet.google.com/abc-defg-hij',
    meeting_platform: 'Google Meet',
    prestadores: {
      name: 'Dra. Ana Silva',
      pillar: 'saude_mental',
      avatar_url: '/lovable-uploads/02f580a8-2bbc-4675-b164-56288192e5f1.png'
    }
  },
  // Upcoming confirmed session - Tomorrow
  {
    id: 'book-tomorrow',
    provider_name: 'Dr. Carlos Santos',
    provider_avatar: '/lovable-uploads/537ae6d8-8bad-4984-87ef-5165033fdc1c.png',
    pillar: 'bem_estar_fisico',
    date: new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0],
    time: '10:00',
    status: 'confirmed',
    session_type: 'individual',
    notes: 'Consulta nutricional e plano de exercícios',
    booking_date: new Date(Date.now() + 24*60*60*1000).toISOString(),
    meeting_link: 'https://zoom.us/j/123456789',
    meeting_platform: 'Zoom',
    prestadores: {
      name: 'Dr. Carlos Santos',
      pillar: 'bem_estar_fisico',
      avatar_url: '/lovable-uploads/537ae6d8-8bad-4984-87ef-5165033fdc1c.png'
    }
  },
  // Upcoming confirmed session - 3 days from now
  {
    id: 'book-3days',
    provider_name: 'Dra. Maria Costa',
    provider_avatar: '/lovable-uploads/676d62ef-5d2a-46ab-9c4f-1c94521aabed.png',
    pillar: 'assistencia_financeira',
    date: new Date(Date.now() + 3*24*60*60*1000).toISOString().split('T')[0],
    time: '15:00',
    status: 'confirmed',
    session_type: 'individual',
    notes: 'Planejamento financeiro pessoal',
    booking_date: new Date(Date.now() + 3*24*60*60*1000).toISOString(),
    meeting_link: '',
    meeting_platform: '',
    prestadores: {
      name: 'Dra. Maria Costa',
      pillar: 'assistencia_financeira',
      avatar_url: '/lovable-uploads/676d62ef-5d2a-46ab-9c4f-1c94521aabed.png'
    }
  },
  // Completed sessions for history
  {
    id: 'book-completed-1',
    provider_name: 'Dra. Ana Silva',
    provider_avatar: '/lovable-uploads/02f580a8-2bbc-4675-b164-56288192e5f1.png',
    pillar: 'saude_mental',
    date: new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0],
    time: '14:30',
    status: 'completed',
    session_type: 'individual',
    notes: 'Gestão de stress no trabalho',
    booking_date: new Date(Date.now() - 7*24*60*60*1000).toISOString(),
    meeting_link: 'https://meet.google.com/past-session',
    meeting_platform: 'Google Meet',
    prestadores: {
      name: 'Dra. Ana Silva',
      pillar: 'saude_mental',
      avatar_url: '/lovable-uploads/02f580a8-2bbc-4675-b164-56288192e5f1.png'
    }
  },
  {
    id: 'book-completed-2',
    provider_name: 'Dr. Carlos Santos',
    provider_avatar: '/lovable-uploads/537ae6d8-8bad-4984-87ef-5165033fdc1c.png',
    pillar: 'bem_estar_fisico',
    date: new Date(Date.now() - 14*24*60*60*1000).toISOString().split('T')[0],
    time: '09:00',
    status: 'completed',
    session_type: 'individual',
    notes: 'Avaliação física e plano de treino',
    booking_date: new Date(Date.now() - 14*24*60*60*1000).toISOString(),
    prestadores: {
      name: 'Dr. Carlos Santos',
      pillar: 'bem_estar_fisico',
      avatar_url: '/lovable-uploads/537ae6d8-8bad-4984-87ef-5165033fdc1c.png'
    }
  },
  {
    id: 'book-completed-3',
    provider_name: 'Dr. João Ferreira',
    provider_avatar: '/lovable-uploads/8e2df1aa-a1c7-4f91-b724-fc348e3347ee.png',
    pillar: 'assistencia_juridica',
    date: new Date(Date.now() - 21*24*60*60*1000).toISOString().split('T')[0],
    time: '11:00',
    status: 'completed',
    session_type: 'individual',
    notes: 'Consultoria sobre direito laboral',
    booking_date: new Date(Date.now() - 21*24*60*60*1000).toISOString(),
    prestadores: {
      name: 'Dr. João Ferreira',
      pillar: 'assistencia_juridica',
      avatar_url: '/lovable-uploads/8e2df1aa-a1c7-4f91-b724-fc348e3347ee.png'
    }
  },
  {
    id: 'book-completed-4',
    provider_name: 'Dra. Maria Costa',
    provider_avatar: '/lovable-uploads/676d62ef-5d2a-46ab-9c4f-1c94521aabed.png',
    pillar: 'assistencia_financeira',
    date: new Date(Date.now() - 28*24*60*60*1000).toISOString().split('T')[0],
    time: '16:00',
    status: 'completed',
    session_type: 'individual',
    notes: 'Análise de investimentos',
    booking_date: new Date(Date.now() - 28*24*60*60*1000).toISOString(),
    prestadores: {
      name: 'Dra. Maria Costa',
      pillar: 'assistencia_financeira',
      avatar_url: '/lovable-uploads/676d62ef-5d2a-46ab-9c4f-1c94521aabed.png'
    }
  }
];

export const mockSelfHelpContent = [
  {
    id: 'content-1',
    title: 'Como Gerir o Stress no Trabalho',
    description: 'Técnicas práticas para reduzir o stress e melhorar o bem-estar laboral',
    summary: 'Aprenda técnicas simples e eficazes para gerir o stress diário no ambiente de trabalho',
    category: 'psicologica' as const,
    pillar: 'saude_mental',
    type: 'article',
    content_type: 'article' as const,
    thumbnail: '/lovable-uploads/5d2071d4-8909-4e5f-b30d-cf52091ffba9.png',
    views: 1250,
    likes: 89,
    view_count: 1250,
    author: 'Dra. Ana Silva',
    tags: ['stress', 'trabalho', 'bem-estar'],
    duration: '8 min leitura',
    is_published: true,
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z'
  },
  {
    id: 'content-2',
    title: 'Exercícios Simples para o Escritório',
    description: 'Movimentos que pode fazer na sua mesa de trabalho',
    summary: 'Exercícios rápidos e discretos que pode fazer sem sair do seu local de trabalho',
    category: 'medica' as const,
    pillar: 'bem_estar_fisico',
    type: 'video',
    content_type: 'article' as const,
    thumbnail: '/lovable-uploads/922a13c5-6f7f-427b-8497-e5ca6c19e48e.png',
    views: 890,
    likes: 67,
    view_count: 890,
    author: 'Dr. Carlos Santos',
    tags: ['exercício', 'escritório', 'postura'],
    duration: '12 min',
    is_published: true,
    created_at: '2024-01-08T15:30:00Z',
    updated_at: '2024-01-08T15:30:00Z'
  }
];

export const mockPrestadorSessions = [
  // Today's sessions
  {
    id: 'sess-today-1',
    user_name: 'Ana M.',
    user_id: 'user-1',
    pillar: 'saude_mental',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    location: 'online',
    status: 'confirmada',
    type: 'individual',
    notes: 'Sessão de acompanhamento - gestão de stress',
    meetingPlatform: 'google_meet' as const,
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    meetingId: 'abc-defg-hij'
  },
  {
    id: 'sess-today-2',
    user_name: 'Carlos S.',
    user_id: 'user-2',
    pillar: 'bem_estar_fisico',
    date: new Date().toISOString().split('T')[0],
    time: '10:30',
    location: 'online',
    status: 'confirmada',
    type: 'individual',
    notes: 'Consulta de nutrição - plano alimentar',
    meetingPlatform: 'zoom' as const,
    meetingLink: 'https://zoom.us/j/123456789',
    meetingId: '123 456 789'
  },
  {
    id: 'sess-today-3',
    user_name: 'Maria F.',
    user_id: 'user-3',
    pillar: 'assistencia_financeira',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    location: 'online',
    status: 'agendada',
    type: 'individual',
    notes: 'Planejamento de orçamento familiar',
    meetingPlatform: 'teams' as const,
    meetingLink: 'https://teams.microsoft.com/l/meetup-join/19%3atest',
    meetingId: 'teams-meeting-id'
  },
  {
    id: 'sess-today-4',
    user_name: 'João P.',
    user_id: 'user-4',
    pillar: 'assistencia_juridica',
    date: new Date().toISOString().split('T')[0],
    time: '16:30',
    location: 'online',
    status: 'confirmada',
    type: 'individual',
    notes: 'Revisão de contrato de trabalho',
    meetingPlatform: 'google_meet' as const,
    meetingLink: 'https://meet.google.com/xyz-mnop-qrs',
    meetingId: 'xyz-mnop-qrs'
  },
  
  // Tomorrow's sessions
  {
    id: 'sess-tomorrow-1',
    user_name: 'Sofia R.',
    user_id: 'user-5',
    pillar: 'saude_mental',
    date: new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0],
    time: '08:30',
    location: 'online',
    status: 'confirmada',
    type: 'individual',
    notes: 'Primeira consulta - burnout profissional',
    meetingPlatform: 'google_meet' as const,
    meetingLink: 'https://meet.google.com/def-ghij-klm',
    meetingId: 'def-ghij-klm'
  },
  {
    id: 'sess-tomorrow-2',
    user_name: 'Pedro M.',
    user_id: 'user-6',
    pillar: 'bem_estar_fisico',
    date: new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0],
    time: '11:00',
    location: 'online',
    status: 'confirmada',
    type: 'individual',
    notes: 'Avaliação física - programa de exercícios',
    meetingPlatform: 'zoom' as const,
    meetingLink: 'https://zoom.us/j/987654321',
    meetingId: '987 654 321'
  },
  {
    id: 'sess-tomorrow-3',
    user_name: 'Luísa C.',
    user_id: 'user-7',
    pillar: 'assistencia_financeira',
    date: new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0],
    time: '15:30',
    location: 'online',
    status: 'agendada',
    type: 'individual',
    notes: 'Consultoria de investimentos - carteira conservadora',
    meetingPlatform: 'teams' as const,
    meetingLink: 'https://teams.microsoft.com/l/meetup-join/19%3atest2',
    meetingId: 'teams-meeting-id-2'
  },
  
  // Day after tomorrow's sessions
  {
    id: 'sess-day3-1',
    user_name: 'Roberto A.',
    user_id: 'user-8',
    pillar: 'assistencia_juridica',
    date: new Date(Date.now() + 2*24*60*60*1000).toISOString().split('T')[0],
    time: '09:30',
    location: 'online',
    status: 'confirmada',
    type: 'individual',
    notes: 'Questões de direito do consumidor',
    meetingPlatform: 'google_meet' as const,
    meetingLink: 'https://meet.google.com/nop-qrst-uvw',
    meetingId: 'nop-qrst-uvw'
  },
  {
    id: 'sess-day3-2',
    user_name: 'Helena V.',
    user_id: 'user-9',
    pillar: 'saude_mental',
    date: new Date(Date.now() + 2*24*60*60*1000).toISOString().split('T')[0],
    time: '13:00',
    location: 'online',
    status: 'confirmada',
    type: 'individual',
    notes: 'Terapia cognitivo-comportamental - ansiedade social',
    meetingPlatform: 'zoom' as const,
    meetingLink: 'https://zoom.us/j/456789123',
    meetingId: '456 789 123'
  },
  
  // Day 4 sessions
  {
    id: 'sess-day4-1',
    user_name: 'Miguel T.',
    user_id: 'user-10',
    pillar: 'bem_estar_fisico',
    date: new Date(Date.now() + 3*24*60*60*1000).toISOString().split('T')[0],
    time: '10:00',
    location: 'online',
    status: 'agendada',
    type: 'individual',
    notes: 'Consulta de fisioterapia - dores nas costas',
    meetingPlatform: 'teams' as const,
    meetingLink: 'https://teams.microsoft.com/l/meetup-join/19%3atest3',
    meetingId: 'teams-meeting-id-3'
  },
  {
    id: 'sess-day4-2',
    user_name: 'Carla D.',
    user_id: 'user-11',
    pillar: 'assistencia_financeira',
    date: new Date(Date.now() + 3*24*60*60*1000).toISOString().split('T')[0],
    time: '14:30',
    location: 'online',
    status: 'confirmada',
    type: 'individual',
    notes: 'Planeamento de reforma - previdência',
    meetingPlatform: 'google_meet' as const,
    meetingLink: 'https://meet.google.com/xyz-abc-def',
    meetingId: 'xyz-abc-def'
  },
  
  // Day 5 sessions
  {
    id: 'sess-day5-1',
    user_name: 'Fernando L.',
    user_id: 'user-12',
    pillar: 'assistencia_juridica',
    date: new Date(Date.now() + 4*24*60*60*1000).toISOString().split('T')[0],
    time: '11:30',
    location: 'online',
    status: 'confirmada',
    type: 'individual',
    notes: 'Direito familiar - questões de pensão',
    meetingPlatform: 'zoom' as const,
    meetingLink: 'https://zoom.us/j/789123456',
    meetingId: '789 123 456'
  },
  {
    id: 'sess-day5-2',
    user_name: 'Beatriz S.',
    user_id: 'user-13',
    pillar: 'saude_mental',
    date: new Date(Date.now() + 4*24*60*60*1000).toISOString().split('T')[0],
    time: '16:00',
    location: 'online',
    status: 'agendada',
    type: 'individual',
    notes: 'Gestão de conflitos no trabalho',
    meetingPlatform: 'teams' as const,
    meetingLink: 'https://teams.microsoft.com/l/meetup-join/19%3atest4',
    meetingId: 'teams-meeting-id-4'
  },
  
  // Weekend sessions (Day 6 and 7)
  {
    id: 'sess-day6-1',
    user_name: 'Ricardo N.',
    user_id: 'user-14',
    pillar: 'bem_estar_fisico',
    date: new Date(Date.now() + 5*24*60*60*1000).toISOString().split('T')[0],
    time: '09:00',
    location: 'online',
    status: 'confirmada',
    type: 'individual',
    notes: 'Consulta nutricional - perda de peso',
    meetingPlatform: 'google_meet' as const,
    meetingLink: 'https://meet.google.com/ghi-jkl-mno',
    meetingId: 'ghi-jkl-mno'
  },
  {
    id: 'sess-day7-1',
    user_name: 'Patrícia O.',
    user_id: 'user-15',
    pillar: 'saude_mental',
    date: new Date(Date.now() + 6*24*60*60*1000).toISOString().split('T')[0],
    time: '10:30',
    location: 'online',
    status: 'confirmada',
    type: 'individual',
    notes: 'Mindfulness e técnicas de relaxamento',
    meetingPlatform: 'zoom' as const,
    meetingLink: 'https://zoom.us/j/321654987',
    meetingId: '321 654 987'
  },
  
  // Original sessions (keeping for historical data)
  {
    id: 'sess-1',
    user_name: 'Ana M.',
    user_id: 'user-1',
    pillar: 'saude_mental',
    date: '2024-01-15',
    time: '14:30',
    location: 'online',
    status: 'confirmada',
    type: 'individual',
    notes: 'Primeira consulta - ansiedade laboral',
    meetingPlatform: 'google_meet' as const,
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    meetingId: 'abc-defg-hij',
    linkSentAt: '2024-01-15T14:25:00Z'
  },
  {
    id: 'sess-2', 
    user_name: 'Carlos S.',
    user_id: 'user-2',
    pillar: 'bem_estar_fisico',
    date: '2024-01-15',
    time: '16:00',
    location: 'online',
    status: 'agendada',
    type: 'individual',
    notes: 'Avaliação física de rotina',
    meetingPlatform: 'zoom' as const,
    meetingLink: 'https://zoom.us/j/123456789',
    meetingId: '123 456 789'
  },
  {
    id: 'sess-3',
    user_name: 'Maria F.',
    user_id: 'user-3', 
    pillar: 'assistencia_financeira',
    date: '2024-01-16',
    time: '09:00',
    location: 'online',
    status: 'em_curso',
    type: 'individual',
    notes: 'Consultoria de investimentos',
    meetingPlatform: 'teams' as const,
    meetingLink: 'https://teams.microsoft.com/l/meetup-join/19%3atest',
    meetingId: 'teams-meeting-id',
    linkSentAt: '2024-01-16T08:55:00Z'
  },
  {
    id: 'sess-4',
    user_name: 'João P.',
    user_id: 'user-4',
    pillar: 'assistencia_juridica', 
    date: '2024-01-16',
    time: '11:30',
    location: 'online',
    status: 'concluida',
    type: 'individual',
    notes: 'Questões contratuais',
    meetingPlatform: 'google_meet' as const,
    meetingLink: 'https://meet.google.com/xyz-mnop-qrs',
    meetingId: 'xyz-mnop-qrs',
    linkSentAt: '2024-01-16T11:25:00Z'
  },
  {
    id: 'sess-5',
    user_name: 'Sofia R.',
    user_id: 'user-5',
    pillar: 'saude_mental',
    date: '2024-01-17',
    time: '15:00', 
    location: 'online',
    status: 'falta',
    type: 'individual',
    notes: 'Não compareceu à sessão',
    meetingPlatform: 'zoom' as const,
    meetingLink: 'https://zoom.us/j/987654321',
    meetingId: '987 654 321',
    linkSentAt: '2024-01-17T14:55:00Z'
  }
];

export const mockPrestadorMetrics = {
  weekMetrics: {
    sessoesConcluidas: 12,
    sessoesCanceladas: 2,
    faltasRegistadas: 1,
    utilizadoresAtendidos: 8
  },
  monthMetrics: {
    totalSessoes: 45,
    satisfacao: 4.8,
    tempoMedio: 55 // minutos
  }
};