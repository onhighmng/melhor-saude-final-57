export type UserRole = 'admin' | 'hr' | 'prestador' | 'especialista_geral' | 'user';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company_id: string | null;
  company_name?: string | null;
  department: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  created_by: string | null;
}

export interface OnboardingData {
  id: string;
  user_id: string;
  work_stress_level: number | null;
  pillar_preferences: string[] | null;
  health_goals: string[] | null;
  preferred_session_time: string | null;
  preferred_language: string;
  initial_concerns: string | null;
  referral_source: string | null;
  communication_preferences: any;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}
