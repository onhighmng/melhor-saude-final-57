import { Provider, ProviderMetrics, ProviderHistoryItem, CalendarSlot } from '@/types/adminProvider';

export const mockProviders: Provider[] = [
  {
    id: '1',
    name: 'Dr. Ana Silva',
    email: 'ana.silva@exemplo.com',
    specialty: 'Psicologia Clínica',
    pillar: 'mental_health',
    costPerSession: 350,
    avgSatisfaction: 9.2,
    totalSessions: 142,
    status: 'active',
    sessionType: 'both',
    availability: 'Seg-Sex 9h-17h',
    photoUrl: '/lovable-uploads/therapy-session.png'
  },
  {
    id: '2',
    name: 'Dr. Carlos Mendes',
    email: 'carlos.mendes@exemplo.com',
    specialty: 'Psiquiatria',
    pillar: 'mental_health',
    costPerSession: 450,
    avgSatisfaction: 9.5,
    totalSessions: 98,
    status: 'active',
    sessionType: 'virtual',
    availability: 'Seg-Qui 10h-18h',
    photoUrl: '/lovable-uploads/therapy-session.png'
  },
  {
    id: '3',
    name: 'Dr. Maria Santos',
    email: 'maria.santos@exemplo.com',
    specialty: 'Nutricionista',
    pillar: 'physical_wellness',
    costPerSession: 300,
    avgSatisfaction: 8.9,
    totalSessions: 156,
    status: 'active',
    sessionType: 'both',
    availability: 'Ter-Sáb 8h-16h',
    photoUrl: '/lovable-uploads/therapy-session.png'
  },
  {
    id: '4',
    name: 'Dr. João Costa',
    email: 'joao.costa@exemplo.com',
    specialty: 'Personal Trainer',
    pillar: 'physical_wellness',
    costPerSession: 280,
    avgSatisfaction: 9.1,
    totalSessions: 203,
    status: 'busy',
    sessionType: 'presential',
    availability: 'Seg-Sex 6h-14h',
    photoUrl: '/lovable-uploads/therapy-session.png'
  },
  {
    id: '5',
    name: 'Dra. Teresa Oliveira',
    email: 'teresa.oliveira@exemplo.com',
    specialty: 'Fisioterapeuta',
    pillar: 'physical_wellness',
    costPerSession: 320,
    avgSatisfaction: 9.3,
    totalSessions: 187,
    status: 'active',
    sessionType: 'presential',
    availability: 'Seg-Sex 9h-18h',
    photoUrl: '/lovable-uploads/therapy-session.png'
  },
  {
    id: '6',
    name: 'Dr. Paulo Ferreira',
    email: 'paulo.ferreira@exemplo.com',
    specialty: 'Consultor Financeiro',
    pillar: 'financial_assistance',
    costPerSession: 400,
    avgSatisfaction: 9.0,
    totalSessions: 124,
    status: 'active',
    sessionType: 'both',
    availability: 'Seg-Sex 9h-17h',
    photoUrl: '/lovable-uploads/financial-planning.png'
  },
  {
    id: '7',
    name: 'Dra. Beatriz Rodrigues',
    email: 'beatriz.rodrigues@exemplo.com',
    specialty: 'Planeamento Financeiro',
    pillar: 'financial_assistance',
    costPerSession: 380,
    avgSatisfaction: 8.8,
    totalSessions: 95,
    status: 'active',
    sessionType: 'virtual',
    availability: 'Ter-Sáb 10h-18h',
    photoUrl: '/lovable-uploads/financial-planning.png'
  },
  {
    id: '8',
    name: 'Dr. Miguel Sousa',
    email: 'miguel.sousa@exemplo.com',
    specialty: 'Advogado Trabalhista',
    pillar: 'legal_assistance',
    costPerSession: 500,
    avgSatisfaction: 9.4,
    totalSessions: 78,
    status: 'active',
    sessionType: 'both',
    availability: 'Seg-Sex 9h-17h',
    photoUrl: '/lovable-uploads/business-meeting.png'
  },
  {
    id: '9',
    name: 'Dra. Sofia Almeida',
    email: 'sofia.almeida@exemplo.com',
    specialty: 'Advogada Familiar',
    pillar: 'legal_assistance',
    costPerSession: 480,
    avgSatisfaction: 9.2,
    totalSessions: 102,
    status: 'active',
    sessionType: 'virtual',
    availability: 'Seg-Qui 10h-18h',
    photoUrl: '/lovable-uploads/business-meeting.png'
  },
  {
    id: '10',
    name: 'Dr. Ricardo Pereira',
    email: 'ricardo.pereira@exemplo.com',
    specialty: 'Psicólogo Organizacional',
    pillar: 'mental_health',
    costPerSession: 370,
    avgSatisfaction: 8.7,
    totalSessions: 89,
    status: 'inactive',
    sessionType: 'both',
    availability: 'Indisponível',
    photoUrl: '/lovable-uploads/therapy-session.png'
  }
];

export const mockProviderMetrics: Record<string, ProviderMetrics> = {
  '1': {
    sessionsCompleted: 142,
    avgSatisfaction: 9.2,
    sessionsThisMonth: 18,
    companiesServed: 4,
    costPerSession: 350,
    platformMargin: 87.5,
    netToProvider: 262.5,
    totalPaidThisMonth: 4725
  },
  '2': {
    sessionsCompleted: 98,
    avgSatisfaction: 9.5,
    sessionsThisMonth: 12,
    companiesServed: 3,
    costPerSession: 450,
    platformMargin: 112.5,
    netToProvider: 337.5,
    totalPaidThisMonth: 4050
  },
  '3': {
    sessionsCompleted: 156,
    avgSatisfaction: 8.9,
    sessionsThisMonth: 22,
    companiesServed: 5,
    costPerSession: 300,
    platformMargin: 75,
    netToProvider: 225,
    totalPaidThisMonth: 4950
  },
  '4': {
    sessionsCompleted: 203,
    avgSatisfaction: 9.1,
    sessionsThisMonth: 28,
    companiesServed: 6,
    costPerSession: 280,
    platformMargin: 70,
    netToProvider: 210,
    totalPaidThisMonth: 5880
  },
  '5': {
    sessionsCompleted: 187,
    avgSatisfaction: 9.3,
    sessionsThisMonth: 24,
    companiesServed: 5,
    costPerSession: 320,
    platformMargin: 80,
    netToProvider: 240,
    totalPaidThisMonth: 5760
  },
  '6': {
    sessionsCompleted: 124,
    avgSatisfaction: 9.0,
    sessionsThisMonth: 16,
    companiesServed: 4,
    costPerSession: 400,
    platformMargin: 100,
    netToProvider: 300,
    totalPaidThisMonth: 4800
  },
  '7': {
    sessionsCompleted: 95,
    avgSatisfaction: 8.8,
    sessionsThisMonth: 14,
    companiesServed: 3,
    costPerSession: 380,
    platformMargin: 95,
    netToProvider: 285,
    totalPaidThisMonth: 3990
  },
  '8': {
    sessionsCompleted: 78,
    avgSatisfaction: 9.4,
    sessionsThisMonth: 10,
    companiesServed: 2,
    costPerSession: 500,
    platformMargin: 125,
    netToProvider: 375,
    totalPaidThisMonth: 3750
  },
  '9': {
    sessionsCompleted: 102,
    avgSatisfaction: 9.2,
    sessionsThisMonth: 13,
    companiesServed: 3,
    costPerSession: 480,
    platformMargin: 120,
    netToProvider: 360,
    totalPaidThisMonth: 4680
  },
  '10': {
    sessionsCompleted: 89,
    avgSatisfaction: 8.7,
    sessionsThisMonth: 0,
    companiesServed: 2,
    costPerSession: 370,
    platformMargin: 92.5,
    netToProvider: 277.5,
    totalPaidThisMonth: 0
  }
};

export const mockProviderHistory: Record<string, ProviderHistoryItem[]> = {
  '1': [
    { id: 'h1', date: '2024-10-05', collaborator: 'João Silva', rating: 9.5, sessionType: 'virtual' },
    { id: 'h2', date: '2024-10-03', collaborator: 'Maria Santos', rating: 9.0, sessionType: 'presential' },
    { id: 'h3', date: '2024-10-01', collaborator: 'Pedro Costa', rating: 9.2, sessionType: 'virtual' },
    { id: 'h4', date: '2024-09-28', collaborator: 'Ana Ferreira', rating: 9.3, sessionType: 'presential' },
    { id: 'h5', date: '2024-09-25', collaborator: 'Carlos Mendes', rating: 9.1, sessionType: 'virtual' }
  ],
  '2': [
    { id: 'h6', date: '2024-10-06', collaborator: 'Teresa Oliveira', rating: 9.8, sessionType: 'virtual' },
    { id: 'h7', date: '2024-10-04', collaborator: 'Paulo Rodrigues', rating: 9.5, sessionType: 'virtual' },
    { id: 'h8', date: '2024-10-02', collaborator: 'Sofia Almeida', rating: 9.4, sessionType: 'virtual' }
  ],
  '3': [
    { id: 'h9', date: '2024-10-07', collaborator: 'Miguel Pereira', rating: 9.0, sessionType: 'presential' },
    { id: 'h10', date: '2024-10-05', collaborator: 'Beatriz Costa', rating: 8.8, sessionType: 'virtual' },
    { id: 'h11', date: '2024-10-03', collaborator: 'Ricardo Santos', rating: 9.1, sessionType: 'presential' }
  ]
};

export const mockCollaborators = [
  { id: 'c1', name: 'João Silva', email: 'joao.silva@empresa.com', company: 'TechCorp' },
  { id: 'c2', name: 'Maria Santos', email: 'maria.santos@empresa.com', company: 'FinanceHub' },
  { id: 'c3', name: 'Pedro Costa', email: 'pedro.costa@empresa.com', company: 'TechCorp' },
  { id: 'c4', name: 'Ana Ferreira', email: 'ana.ferreira@empresa.com', company: 'HealthPlus' },
  { id: 'c5', name: 'Carlos Mendes', email: 'carlos.mendes@empresa.com', company: 'TechCorp' },
  { id: 'c6', name: 'Teresa Oliveira', email: 'teresa.oliveira@empresa.com', company: 'FinanceHub' },
  { id: 'c7', name: 'Paulo Rodrigues', email: 'paulo.rodrigues@empresa.com', company: 'HealthPlus' },
  { id: 'c8', name: 'Sofia Almeida', email: 'sofia.almeida@empresa.com', company: 'LegalCo' }
];

// Generate calendar slots for a provider
export const generateCalendarSlots = (providerId: string, startDate: Date): CalendarSlot[] => {
  const slots: CalendarSlot[] = [];
  const provider = mockProviders.find(p => p.id === providerId);
  
  if (!provider) return slots;

  // Generate slots for 14 days
  for (let day = 0; day < 14; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + day);
    
    // Skip weekends for most providers
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    // Generate 8 time slots per day (9h-17h)
    for (let hour = 9; hour < 17; hour++) {
      const slotDate = new Date(currentDate);
      slotDate.setHours(hour, 0, 0, 0);

      // Randomly mark some slots as booked (~30% occupancy)
      const isBooked = Math.random() < 0.3;
      const collaborator = isBooked ? mockCollaborators[Math.floor(Math.random() * mockCollaborators.length)] : null;

      slots.push({
        id: `slot-${providerId}-${day}-${hour}`,
        date: slotDate,
        isAvailable: !isBooked,
        ...(isBooked && collaborator ? {
          bookingId: `booking-${Math.random().toString(36).substr(2, 9)}`,
          collaboratorName: collaborator.name,
          company: collaborator.company,
          sessionType: Math.random() > 0.5 ? 'virtual' : 'presential'
        } : {})
      });
    }
  }

  return slots;
};
