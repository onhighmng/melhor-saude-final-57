import { SessionStatus, Pillar, PayerSource, MeetingPlatform } from '@/types/session';

/**
 * Get translated label for session status
 */
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
  return labels[status] || status;
};

/**
 * Get translated label for wellness pillar
 */
export const getPillarLabel = (pillar: Pillar | string): string => {
  const labels: Record<string, string> = {
    saude_mental: 'Saúde Mental',
    bem_estar_fisico: 'Bem-Estar Físico',
    assistencia_financeira: 'Assistência Financeira',
    assistencia_juridica: 'Assistência Jurídica',
    // English variants
    psychological: 'Saúde Mental',
    physical: 'Bem-Estar Físico',
    financial: 'Assistência Financeira',
    legal: 'Assistência Jurídica'
  };
  return labels[pillar] || pillar;
};

/**
 * Get translated label for payer source
 */
export const getPayerSourceLabel = (source: PayerSource): string => {
  return source === 'company' ? 'Empresa' : 'Pessoal';
};

/**
 * Check if session status allows for quota deduction
 */
export const isSessionDeductible = (status: SessionStatus): boolean => {
  return status === 'completed';
};

/**
 * Get translated label for meeting platform
 */
export const getMeetingPlatformLabel = (platform: MeetingPlatform | string): string => {
  const labels: Record<string, string> = {
    zoom: 'Zoom',
    google_meet: 'Google Meet',
    teams: 'Microsoft Teams',
    whatsapp: 'WhatsApp'
  };
  return labels[platform] || platform;
};

/**
 * Check if meeting link should be sent based on session time
 * Link is sent 5 minutes before session starts
 */
export const shouldSendMeetingLink = (sessionDate: string, sessionTime: string): boolean => {
  const sessionDateTime = new Date(`${sessionDate}T${sessionTime}`);
  const now = new Date();
  const fiveMinutesBefore = new Date(sessionDateTime.getTime() - 5 * 60 * 1000);
  
  return now >= fiveMinutesBefore && now < sessionDateTime;
};

/**
 * Get time remaining until meeting link is sent
 */
export const getTimeUntilLinkSent = (sessionDate: string, sessionTime: string): string => {
  const sessionDateTime = new Date(`${sessionDate}T${sessionTime}`);
  const now = new Date();
  const fiveMinutesBefore = new Date(sessionDateTime.getTime() - 5 * 60 * 1000);
  
  if (now >= fiveMinutesBefore) {
    return 'Link disponível';
  }
  
  const diffMs = fiveMinutesBefore.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `Link em ${diffDays}d ${diffHours % 24}h`;
  } else if (diffHours > 0) {
    return `Link em ${diffHours}h ${diffMinutes % 60}m`;
  } else {
    return `Link em ${diffMinutes}m`;
  }
};

/**
 * Get status badge variant based on session status
 */
export const getStatusBadgeVariant = (status: SessionStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'completed':
      return 'default';
    case 'confirmed':
    case 'scheduled':
      return 'secondary';
    case 'cancelled':
    case 'no_show':
      return 'destructive';
    default:
      return 'outline';
  }
};
