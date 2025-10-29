export interface Provider {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  specialties: string[] | null;
  languages: string[] | null;
  pillar_specialties: string[] | null;
  biography: string | null;
  video_url: string | null;
  photo_url: string | null;
  is_active: boolean;
  session_duration: number;
  created_at: string;
  updated_at: string;
  // Legacy properties for backward compatibility
  photo?: string | null;
  specialization?: string | null;
  shortBio?: string | null;
}

export interface ProviderAvailability {
  id: string;
  prestador_id: string;
  day_of_week: number; // 0=Sunday, 6=Saturday
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProviderPerformance {
  id: string;
  prestador_id: string;
  month: string;
  total_sessions: number;
  completed_sessions: number;
  cancelled_sessions: number;
  no_show_sessions: number;
  avg_rating: number | null;
  total_hours: number | null;
  total_revenue: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProviderPricing {
  id: string;
  prestador_id: string;
  session_price: number;
  platform_commission_rate: number;
  currency: string;
  created_at: string;
  updated_at: string;
}
