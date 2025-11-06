import { SessionStatus, Pillar, MeetingPlatform } from './session';

export interface Booking {
  id: string;
  user_id: string;
  prestador_id: string | null;
  date: string;
  start_time: string | null;
  end_time: string | null;
  status: SessionStatus;
  pillar: Pillar;
  session_type: string | null;
  pillar_specialties: string[] | null;
  topic: string | null;
  meeting_type: string | null;
  meeting_link: string | null;
  meeting_platform: string | null;
  notes: string | null;
  rating: number | null;
  company_id: string | null;
  chat_session_id: string | null;
  prediagnostic_completed: boolean;
  prediagnostic_summary: any;
  booking_source: string;
  cancelled_at: string | null;
  cancelled_by: string | null;
  cancellation_reason: string | null;
  rescheduled_from: string | null;
  rescheduled_at: string | null;
  created_at: string;
  updated_at: string;
}
