export interface SpecialistCallLog {
  id: string;
  chat_session_id: string;
  specialist_id: string;
  user_id: string;
  call_duration: number | null;
  call_status: 'pending' | 'completed' | 'follow_up_needed';
  outcome: 'resolved_by_phone' | 'session_booked' | 'escalated' | null;
  session_booked: boolean;
  booking_id: string | null;
  call_notes: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface ChatSession {
  id: string;
  user_id: string;
  pillar: 'legal' | 'psychological' | 'physical' | 'financial' | null;
  status: 'active' | 'resolved' | 'escalated' | 'phone_escalated' | 'pending';
  ai_resolution: boolean;
  satisfaction_rating: 'satisfied' | 'unsatisfied' | null;
  phone_escalation_reason: string | null;
  phone_contact_made: boolean;
  session_booked_by_specialist: string | null;
  type: 'triage' | 'pre_diagnosis';
  resolved: boolean;
  assigned_specialist_id?: string | null;
  company_id?: string | null;
  created_at: string;
  ended_at: string | null;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface SpecialistAnalytics {
  pillar: string;
  total_chats: number;
  ai_resolved: number;
  phone_escalated: number;
  sessions_booked: number;
  satisfied_users: number;
  unsatisfied_users: number;
  date: string;
}

export interface EscalatedChat extends ChatSession {
  user_name: string;
  user_email: string;
  user_phone?: string;
  company_name?: string;
  company_id?: string;
  messages: ChatMessage[];
  call_log?: SpecialistCallLog;
}

export interface EspecialistaGeral {
  id: string;
  name: string;
  email: string;
  assigned_companies: string[];
  is_active: boolean;
}

export interface CallRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  company_id: string;
  company_name: string;
  pillar: 'legal' | 'psychological' | 'physical' | 'financial' | null;
  status: 'pending' | 'resolved' | 'escalated';
  wait_time: number; // in minutes
  chat_session_id?: string;
  assigned_specialist_id?: string;
  created_at: string;
  resolved_at?: string;
  notes?: string;
}
