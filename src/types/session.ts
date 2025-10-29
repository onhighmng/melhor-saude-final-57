export type SessionStatus = 
  | 'scheduled' 
  | 'confirmed' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'no_show' 
  | 'rescheduled';

export type Pillar = 
  | 'saude_mental' 
  | 'bem_estar_fisico' 
  | 'assistencia_financeira' 
  | 'assistencia_juridica';

export type PayerSource = 'company' | 'personal';

export type MeetingPlatform = 'zoom' | 'google_meet' | 'teams' | 'whatsapp';

export interface UserBalance {
  company_sessions_allocated: number;
  company_sessions_used: number;
  company_sessions_remaining: number;
  company_name: string | null;
  has_company_quota: boolean;
}

export interface Session {
  id: string;
  user_id: string;
  prestador_id: string | null;
  booking_date: string;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  status: SessionStatus;
  pillar: Pillar;
  session_type: string | null;
  meeting_link?: string | null;
  meeting_platform?: string | null;
  rating?: number | null;
  notes?: string | null;
  topic?: string | null;
  pillar_specialties?: string[] | null;
  created_at?: string;
  updated_at?: string;
}

export interface SessionDeduction {
  id: string;
  session_id: string;
  user_id: string;
  deducted_from: PayerSource;
  deducted_at: string;
  session_date: string;
}

export interface EmployerQuota {
  totalSessions: number;
  usedSessions: number;
  companyName: string;
}

export interface PersonalPlan {
  totalSessions: number;
  usedSessions: number;
  planType: string;
}

export interface UserSessionData {
  userId: string;
  employerQuota: EmployerQuota | null;
  personalPlan: PersonalPlan | null;
}

export interface SessionBalance {
  totalRemaining: number;
  employerRemaining: number;
  personalRemaining: number;
  hasActiveSessions: boolean;
}
