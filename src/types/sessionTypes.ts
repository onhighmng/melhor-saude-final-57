/**
 * Session and User Balance Type Definitions
 * Replaces mock data with proper TypeScript interfaces
 */

import { SessionStatus, Pillar, PayerSource, MeetingPlatform } from './session';

export interface Session {
  id: string;
  user_id: string;
  prestador_id: string | null;
  prestadorName: string;
  booking_date: string;
  date: string;
  time: string;
  minutes: number;
  status: SessionStatus;
  pillar: Pillar;
  session_type: string | null;
  payerSource: PayerSource;
  wasDeducted: boolean;
  deductedAt?: string;
  meetingLink?: string;
  meetingPlatform?: MeetingPlatform;
  rating?: number;
  notes?: string;
  topic?: string;
}

export interface UserBalance {
  companyQuota: number;
  usedCompany: number;
  availableCompany: number;
  personalQuota: number;
  usedPersonal: number;
  availablePersonal: number;
}

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
  return labels[status] || status;
};

export const getPillarLabel = (pillar: Pillar | string): string => {
  const labels: Record<string, string> = {
    saude_mental: 'Saúde Mental',
    bem_estar_fisico: 'Bem-Estar Físico',
    assistencia_financeira: 'Assistência Financeira',
    assistencia_juridica: 'Assistência Jurídica',
    psychological: 'Saúde Mental',
    physical: 'Bem-Estar Físico',
    financial: 'Assistência Financeira',
    legal: 'Assistência Jurídica'
  };
  return labels[pillar] || pillar;
};

export const getPayerSourceLabel = (source: PayerSource): string => {
  return source === 'company' ? 'Empresa' : 'Pessoal';
};

// Re-export types for compatibility
export type { SessionStatus, Pillar, PayerSource, MeetingPlatform };
