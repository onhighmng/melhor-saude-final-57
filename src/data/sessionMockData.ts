export type SessionStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';

export type Pillar = 'saude_mental' | 'bem_estar_fisico' | 'assistencia_financeira' | 'assistencia_juridica';

export type PayerSource = 'company' | 'personal';

export interface Session {
  id: string;
  userId: string;
  prestadorId: string;
  prestadorName: string;
  date: string;
  time: string;
  status: SessionStatus;
  pillar: Pillar;
  payerSource: PayerSource;
  minutes: number;
  wasDeducted: boolean;
  deductedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Meeting platform integration
  meetingPlatform: 'zoom' | 'google_meet' | 'teams';
  meetingLink?: string;
  meetingId?: string;
  linkSentAt?: string; // When the link was sent (5 minutes before)
  sessionType: 'individual'; // Only individual sessions allowed
}

export interface UserBalance {
  userId: string;
  companyQuota: number;
  personalQuota: number;
  usedCompany: number;
  usedPersonal: number;
  availableCompany: number;
  availablePersonal: number;
}

export interface SessionDeduction {
  sessionId: string;
  deductedAt: string;
  payerSource: PayerSource;
}

// Static sessions data
const staticSessions: Session[] = [
  {
    id: '1',
    userId: 'user123',
    prestadorId: 'prest1',
    prestadorName: 'Dr. Ana Silva',
    date: '2024-01-15',
    time: '14:00',
    status: 'completed',
    pillar: 'saude_mental',
    payerSource: 'company',
    minutes: 60,
    wasDeducted: true,
    deductedAt: '2024-01-15T15:00:00Z',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T15:00:00Z',
    meetingPlatform: 'google_meet',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    meetingId: 'abc-defg-hij',
    linkSentAt: '2024-01-15T13:55:00Z',
    sessionType: 'individual'
  },
  {
    id: '2',
    userId: 'user123',
    prestadorId: 'prest2',
    prestadorName: 'Dr. João Santos',
    date: '2024-01-10',
    time: '10:30',
    status: 'cancelled',
    pillar: 'bem_estar_fisico',
    payerSource: 'company',
    minutes: 45,
    wasDeducted: false,
    createdAt: '2024-01-05T09:00:00Z',
    updatedAt: '2024-01-09T16:30:00Z',
    meetingPlatform: 'zoom',
    meetingLink: 'https://zoom.us/j/123456789',
    meetingId: '123 456 789',
    sessionType: 'individual'
  },
  {
    id: '3',
    userId: 'user123',
    prestadorId: 'prest3',
    prestadorName: 'Dra. Maria Oliveira',
    date: '2024-01-08',
    time: '16:00',
    status: 'no_show',
    pillar: 'assistencia_financeira',
    payerSource: 'personal',
    minutes: 60,
    wasDeducted: false,
    createdAt: '2024-01-03T14:00:00Z',
    updatedAt: '2024-01-08T16:30:00Z',
    meetingPlatform: 'teams',
    meetingLink: 'https://teams.microsoft.com/l/meetup-join/19%3atest',
    meetingId: 'teams-meeting-id',
    linkSentAt: '2024-01-08T15:55:00Z',
    sessionType: 'individual'
  },
  {
    id: '4',
    userId: 'user123',
    prestadorId: 'prest1',
    prestadorName: 'Dr. Ana Silva',
    date: '2024-01-20',
    time: '11:00',
    status: 'scheduled',
    pillar: 'saude_mental',
    payerSource: 'company',
    minutes: 60,
    wasDeducted: false,
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    meetingPlatform: 'google_meet',
    meetingLink: 'https://meet.google.com/xyz-mnop-qrs',
    meetingId: 'xyz-mnop-qrs',
    sessionType: 'individual'
  },
  {
    id: '5',
    userId: 'user123',
    prestadorId: 'prest4',
    prestadorName: 'Dr. Pedro Costa',
    date: '2024-01-05',
    time: '09:00',
    status: 'completed',
    pillar: 'assistencia_juridica',
    payerSource: 'personal',
    minutes: 60,
    wasDeducted: true,
    deductedAt: '2024-01-05T10:00:00Z',
    createdAt: '2024-01-01T15:00:00Z',
    updatedAt: '2024-01-05T10:00:00Z',
    meetingPlatform: 'zoom',
    meetingLink: 'https://zoom.us/j/987654321',
    meetingId: '987 654 321',
    linkSentAt: '2024-01-05T08:55:00Z',
    sessionType: 'individual'
  },
  {
    id: '6',
    userId: 'user123',
    prestadorId: 'prest2',
    prestadorName: 'Dr. João Santos',
    date: '2024-01-12',
    time: '15:30',
    status: 'rescheduled',
    pillar: 'bem_estar_fisico',
    payerSource: 'company',
    minutes: 45,
    wasDeducted: false,
    createdAt: '2024-01-08T11:00:00Z',
    updatedAt: '2024-01-11T13:20:00Z',
    meetingPlatform: 'google_meet',
    meetingLink: 'https://meet.google.com/def-ghi-jkl',
    meetingId: 'def-ghi-jkl',
    sessionType: 'individual'
  }
];

// Helper to create session that's always 5 minutes from current time
const createUpcomingSession = (): Session => {
  const now = new Date();
  const sessionTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
  
  return {
    id: 'upcoming-demo',
    userId: 'user123',
    prestadorId: 'prest1',
    prestadorName: 'Dra. Maria Costa',
    date: sessionTime.toISOString().split('T')[0],
    time: sessionTime.toTimeString().slice(0, 5),
    status: 'confirmed',
    pillar: 'saude_mental',
    payerSource: 'company',
    minutes: 60,
    wasDeducted: false,
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    meetingPlatform: 'google_meet',
    meetingLink: 'https://meet.google.com/demo-session-link',
    meetingId: 'demo-session-link',
    linkSentAt: now.toISOString(), // Link already sent (since it's <5 min away)
    sessionType: 'individual'
  };
};

// Export function to get sessions with dynamically updated upcoming session
export const getMockSessions = (): Session[] => {
  return [createUpcomingSession(), ...staticSessions];
};

// Export static array for backward compatibility (but includes dynamic session)
export const mockSessions: Session[] = getMockSessions();

// Mock user balance
export const mockUserBalance: UserBalance = {
  userId: 'user123',
  companyQuota: 12,
  personalQuota: 6,
  usedCompany: 1, // Only from completed sessions
  usedPersonal: 1, // Only from completed sessions
  availableCompany: 11,
  availablePersonal: 5
};

// Mock session deductions
export const mockSessionDeductions: SessionDeduction[] = [
  {
    sessionId: '1',
    deductedAt: '2024-01-15T15:00:00Z',
    payerSource: 'company'
  },
  {
    sessionId: '5',
    deductedAt: '2024-01-05T10:00:00Z',
    payerSource: 'personal'
  }
];

// Helper functions
export const getStatusLabel = (status: SessionStatus): string => {
  const labels: Record<SessionStatus, string> = {
    scheduled: 'Agendada',
    confirmed: 'Confirmada',
    in_progress: 'Em Curso',
    completed: 'Concluída',
    cancelled: 'Cancelada',
    no_show: 'Falta',
    rescheduled: 'Reagendada'
  };
  return labels[status];
};

export const getPillarLabel = (pillar: Pillar): string => {
  const labels: Record<Pillar, string> = {
    saude_mental: 'Saúde Mental',
    bem_estar_fisico: 'Bem-Estar Físico',
    assistencia_financeira: 'Assistência Financeira',
    assistencia_juridica: 'Assistência Jurídica'
  };
  return labels[pillar];
};

export const getPayerSourceLabel = (source: PayerSource): string => {
  return source === 'company' ? 'Empresa' : 'Pessoal';
};

export const isSessionDeductible = (status: SessionStatus): boolean => {
  return status === 'completed';
};

export const getDeductedSessions = (sessions: Session[]): Session[] => {
  return sessions.filter(session => session.wasDeducted);
};

export const getNonDeductedSessions = (sessions: Session[]): Session[] => {
  return sessions.filter(session => !session.wasDeducted);
};

// Meeting platform helper functions
export const getMeetingPlatformLabel = (platform: 'zoom' | 'google_meet' | 'teams'): string => {
  const labels = {
    zoom: 'Zoom',
    google_meet: 'Google Meet',
    teams: 'Microsoft Teams'
  };
  return labels[platform];
};

export const shouldSendMeetingLink = (sessionDate: string, sessionTime: string): boolean => {
  const sessionDateTime = new Date(`${sessionDate}T${sessionTime}`);
  const now = new Date();
  const fiveMinutesBefore = new Date(sessionDateTime.getTime() - 5 * 60 * 1000);
  
  return now >= fiveMinutesBefore && now < sessionDateTime;
};

export const getTimeUntilLinkSent = (sessionDate: string, sessionTime: string): string => {
  const sessionDateTime = new Date(`${sessionDate}T${sessionTime}`);
  const fiveMinutesBefore = new Date(sessionDateTime.getTime() - 5 * 60 * 1000);
  const now = new Date();
  
  if (now >= fiveMinutesBefore) {
    return 'Link enviado';
  }
  
  const diffMs = fiveMinutesBefore.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffHours > 0) {
    return `Link será enviado em ${diffHours}h ${diffMinutes}m`;
  }
  return `Link será enviado em ${diffMinutes}m`;
};