export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Unified pillar types
export type Pillar = 'saude_mental' | 'bem_estar_fisico' | 'assistencia_financeira' | 'assistencia_juridica'

// Unified role types
export type AppRole = 'admin' | 'user' | 'hr' | 'prestador' | 'specialist'

// Pillar display mapping
export const PILLAR_DISPLAY_NAMES: Record<Pillar, string> = {
  'saude_mental': 'Saúde Mental',
  'bem_estar_fisico': 'Bem-estar Físico',
  'assistencia_financeira': 'Assistência Financeira',
  'assistencia_juridica': 'Assistência Jurídica'
}

// Role display mapping
export const ROLE_DISPLAY_NAMES: Record<AppRole, string> = {
  'admin': 'Administrador',
  'user': 'Utilizador',
  'hr': 'Recursos Humanos',
  'prestador': 'Prestador',
  'specialist': 'Especialista Geral'
}

// Type guards
export function isValidPillar(pillar: string): pillar is Pillar {
  return ['saude_mental', 'bem_estar_fisico', 'assistencia_financeira', 'assistencia_juridica'].includes(pillar)
}

export function isValidRole(role: string): role is AppRole {
  return ['admin', 'user', 'hr', 'prestador', 'specialist'].includes(role)
}

export function getPillarDisplayName(pillar: Pillar): string {
  return PILLAR_DISPLAY_NAMES[pillar]
}

export function getRoleDisplayName(role: AppRole): string {
  return ROLE_DISPLAY_NAMES[role]
}

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      // Core tables
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          avatar_url: string | null
          role: string // Legacy field - use user_roles table instead
          company_id: string | null
          department: string | null
          position: string | null
          bio: string | null
          is_active: boolean | null
          metadata: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          name: string
          phone?: string | null
          avatar_url?: string | null
          role: string
          company_id?: string | null
          department?: string | null
          position?: string | null
          bio?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string | null
          avatar_url?: string | null
          role?: string
          company_id?: string | null
          department?: string | null
          position?: string | null
          bio?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      
      // Unified role system
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: AppRole
          created_at: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          user_id: string
          role: AppRole
          created_at?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          role?: AppRole
          created_at?: string | null
          created_by?: string | null
        }
      }

      // Companies
      companies: {
        Row: {
          id: string
          name: string
          nuit: string | null
          email: string
          phone: string | null
          logo_url: string | null
          address: string | null
          industry: string | null
          size: 'small' | 'medium' | 'large' | 'enterprise' | null
          number_of_employees: number | null
          sessions_allocated: number | null
          sessions_used: number | null
          sessions_per_employee: number | null
          session_model: 'pool' | 'fixed' | null
          price_per_session: number | null
          hr_contact_person: string | null
          hr_email: string | null
          program_start_date: string | null
          contract_start_date: string | null
          contract_end_date: string | null
          pillars: Pillar[] | null
          is_active: boolean | null
          metadata: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          nuit?: string | null
          email: string
          phone?: string | null
          logo_url?: string | null
          address?: string | null
          industry?: string | null
          size?: 'small' | 'medium' | 'large' | 'enterprise' | null
          number_of_employees?: number | null
          sessions_allocated?: number | null
          sessions_used?: number | null
          sessions_per_employee?: number | null
          session_model?: 'pool' | 'fixed' | null
          price_per_session?: number | null
          hr_contact_person?: string | null
          hr_email?: string | null
          program_start_date?: string | null
          contract_start_date?: string | null
          contract_end_date?: string | null
          pillars?: Pillar[] | null
          is_active?: boolean | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          nuit?: string | null
          email?: string
          phone?: string | null
          logo_url?: string | null
          address?: string | null
          industry?: string | null
          size?: 'small' | 'medium' | 'large' | 'enterprise' | null
          number_of_employees?: number | null
          sessions_allocated?: number | null
          sessions_used?: number | null
          sessions_per_employee?: number | null
          session_model?: 'pool' | 'fixed' | null
          price_per_session?: number | null
          hr_contact_person?: string | null
          hr_email?: string | null
          program_start_date?: string | null
          contract_start_date?: string | null
          contract_end_date?: string | null
          pillars?: Pillar[] | null
          is_active?: boolean | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }

      // Company employees
      company_employees: {
        Row: {
          id: string
          company_id: string
          user_id: string
          department: string | null
          position: string | null
          sessions_quota: number | null
          sessions_used: number | null
          joined_at: string | null
          status: 'active' | 'inactive' | 'pending' | null
          deactivated_at: string | null
          deactivated_by: string | null
        }
        Insert: {
          id?: string
          company_id: string
          user_id: string
          department?: string | null
          position?: string | null
          sessions_quota?: number | null
          sessions_used?: number | null
          joined_at?: string | null
          status?: 'active' | 'inactive' | 'pending' | null
          deactivated_at?: string | null
          deactivated_by?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string
          department?: string | null
          position?: string | null
          sessions_quota?: number | null
          sessions_used?: number | null
          joined_at?: string | null
          status?: 'active' | 'inactive' | 'pending' | null
          deactivated_at?: string | null
          deactivated_by?: string | null
        }
      }

      // Providers
      prestadores: {
        Row: {
          id: string
          user_id: string
          specialty: string | null
          specialization: string[] | null
          pillars: Pillar[]
          bio: string | null
          qualifications: string[] | null
          credentials: string | null
          languages: string[] | null
          video_intro_url: string | null
          hourly_rate: number | null
          cost_per_session: number | null
          rating: number | null
          total_sessions: number | null
          total_ratings: number | null
          experience_years: number | null
          session_type: 'virtual' | 'presential' | 'both' | null
          availability: Json | null
          is_approved: boolean | null
          is_active: boolean | null
          approval_notes: string | null
          approved_by: string | null
          approved_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          specialty?: string | null
          specialization?: string[] | null
          pillars: Pillar[]
          bio?: string | null
          qualifications?: string[] | null
          credentials?: string | null
          languages?: string[] | null
          video_intro_url?: string | null
          hourly_rate?: number | null
          cost_per_session?: number | null
          rating?: number | null
          total_sessions?: number | null
          total_ratings?: number | null
          experience_years?: number | null
          session_type?: 'virtual' | 'presential' | 'both' | null
          availability?: Json | null
          is_approved?: boolean | null
          is_active?: boolean | null
          approval_notes?: string | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          specialty?: string | null
          specialization?: string[] | null
          pillars?: Pillar[]
          bio?: string | null
          qualifications?: string[] | null
          credentials?: string | null
          languages?: string[] | null
          video_intro_url?: string | null
          hourly_rate?: number | null
          cost_per_session?: number | null
          rating?: number | null
          total_sessions?: number | null
          total_ratings?: number | null
          experience_years?: number | null
          session_type?: 'virtual' | 'presential' | 'both' | null
          availability?: Json | null
          is_approved?: boolean | null
          is_active?: boolean | null
          approval_notes?: string | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }

      // Provider availability
      provider_availability: {
        Row: {
          id: string
          prestador_id: string
          day_of_week: number | null
          start_time: string
          end_time: string
          is_available: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          prestador_id: string
          day_of_week?: number | null
          start_time: string
          end_time: string
          is_available?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          prestador_id?: string
          day_of_week?: number | null
          start_time?: string
          end_time?: string
          is_available?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }

      // Bookings
      bookings: {
        Row: {
          id: string
          user_id: string | null
          company_id: string | null
          prestador_id: string | null
          chat_session_id: string | null
          pillar: Pillar
          topic: string | null
          date: string
          start_time: string
          end_time: string
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled' | null
          session_type: 'virtual' | 'phone' | 'presencial' | null
          meeting_type: 'virtual' | 'phone' | null
          quota_type: 'employer' | 'personal' | null
          meeting_link: string | null
          notes: string | null
          cancellation_reason: string | null
          rescheduled_from: string | null
          rating: number | null
          feedback: string | null
          prediagnostic_completed: boolean | null
          prediagnostic_summary: Json | null
          booking_source: 'direct' | 'referral' | 'ai_chat' | null
          referral_notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          company_id?: string | null
          prestador_id?: string | null
          chat_session_id?: string | null
          pillar: Pillar
          topic?: string | null
          date: string
          start_time: string
          end_time: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled' | null
          session_type?: 'virtual' | 'phone' | 'presencial' | null
          meeting_type?: 'virtual' | 'phone' | null
          quota_type?: 'employer' | 'personal' | null
          meeting_link?: string | null
          notes?: string | null
          cancellation_reason?: string | null
          rescheduled_from?: string | null
          rating?: number | null
          feedback?: string | null
          prediagnostic_completed?: boolean | null
          prediagnostic_summary?: Json | null
          booking_source?: 'direct' | 'referral' | 'ai_chat' | null
          referral_notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          company_id?: string | null
          prestador_id?: string | null
          chat_session_id?: string | null
          pillar?: Pillar
          topic?: string | null
          date?: string
          start_time?: string
          end_time?: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled' | null
          session_type?: 'virtual' | 'phone' | 'presencial' | null
          meeting_type?: 'virtual' | 'phone' | null
          quota_type?: 'employer' | 'personal' | null
          meeting_link?: string | null
          notes?: string | null
          cancellation_reason?: string | null
          rescheduled_from?: string | null
          rating?: number | null
          feedback?: string | null
          prediagnostic_completed?: boolean | null
          prediagnostic_summary?: Json | null
          booking_source?: 'direct' | 'referral' | 'ai_chat' | null
          referral_notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }

      // Chat sessions
      chat_sessions: {
        Row: {
          id: string
          user_id: string | null
          pillar: Pillar | null
          status: 'active' | 'resolved' | 'phone_escalated' | 'abandoned' | null
          satisfaction_rating: 'satisfied' | 'unsatisfied' | null
          ai_resolution: boolean | null
          phone_escalation_reason: string | null
          created_at: string | null
          ended_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          pillar?: Pillar | null
          status?: 'active' | 'resolved' | 'phone_escalated' | 'abandoned' | null
          satisfaction_rating?: 'satisfied' | 'unsatisfied' | null
          ai_resolution?: boolean | null
          phone_escalation_reason?: string | null
          created_at?: string | null
          ended_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          pillar?: Pillar | null
          status?: 'active' | 'resolved' | 'phone_escalated' | 'abandoned' | null
          satisfaction_rating?: 'satisfied' | 'unsatisfied' | null
          ai_resolution?: boolean | null
          phone_escalation_reason?: string | null
          created_at?: string | null
          ended_at?: string | null
        }
      }

      // Chat messages
      chat_messages: {
        Row: {
          id: string
          session_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          metadata: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          session_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          metadata?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          session_id?: string
          role?: 'user' | 'assistant' | 'system'
          content?: string
          metadata?: Json | null
          created_at?: string | null
        }
      }

      // User progress
      user_progress: {
        Row: {
          id: string
          user_id: string | null
          pillar: Pillar | null
          action_type: 'session_completed' | 'chat_interaction' | 'resource_viewed' | 'milestone_achieved'
          action_date: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          pillar?: Pillar | null
          action_type: 'session_completed' | 'chat_interaction' | 'resource_viewed' | 'milestone_achieved'
          action_date?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          user_id?: string | null
          pillar?: Pillar | null
          action_type?: 'session_completed' | 'chat_interaction' | 'resource_viewed' | 'milestone_achieved'
          action_date?: string | null
          metadata?: Json | null
        }
      }

      // User goals (new table)
      user_goals: {
        Row: {
          id: string
          user_id: string
          goal_type: string
          target_value: Json | null
          current_value: Json | null
          pillar: Pillar | null
          status: 'active' | 'completed' | 'paused' | 'cancelled' | null
          priority: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          goal_type: string
          target_value?: Json | null
          current_value?: Json | null
          pillar?: Pillar | null
          status?: 'active' | 'completed' | 'paused' | 'cancelled' | null
          priority?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          goal_type?: string
          target_value?: Json | null
          current_value?: Json | null
          pillar?: Pillar | null
          status?: 'active' | 'completed' | 'paused' | 'cancelled' | null
          priority?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }

      // Resources
      resources: {
        Row: {
          id: string
          title: string
          description: string | null
          content: string | null
          type: 'article' | 'video' | 'podcast' | 'guide' | 'exercise' | null
          pillar: Pillar | null
          tags: string[] | null
          thumbnail_url: string | null
          media_url: string | null
          duration: number | null
          difficulty_level: 'beginner' | 'intermediate' | 'advanced' | null
          is_premium: boolean | null
          view_count: number | null
          rating: number | null
          total_ratings: number | null
          is_published: boolean | null
          published_at: string | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          content?: string | null
          type?: 'article' | 'video' | 'podcast' | 'guide' | 'exercise' | null
          pillar?: Pillar | null
          tags?: string[] | null
          thumbnail_url?: string | null
          media_url?: string | null
          duration?: number | null
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | null
          is_premium?: boolean | null
          view_count?: number | null
          rating?: number | null
          total_ratings?: number | null
          is_published?: boolean | null
          published_at?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          content?: string | null
          type?: 'article' | 'video' | 'podcast' | 'guide' | 'exercise' | null
          pillar?: Pillar | null
          tags?: string[] | null
          thumbnail_url?: string | null
          media_url?: string | null
          duration?: number | null
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | null
          is_premium?: boolean | null
          view_count?: number | null
          rating?: number | null
          total_ratings?: number | null
          is_published?: boolean | null
          published_at?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }

      // Invites
      invites: {
        Row: {
          id: string
          invite_code: string
          invited_by: string | null
          company_id: string | null
          email: string | null
          role: 'user' | 'hr' | 'prestador'
          status: 'pending' | 'accepted' | 'expired' | 'revoked' | null
          expires_at: string
          accepted_at: string | null
          accepted_by: string | null
          metadata: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          invite_code: string
          invited_by?: string | null
          company_id?: string | null
          email?: string | null
          role: 'user' | 'hr' | 'prestador'
          status?: 'pending' | 'accepted' | 'expired' | 'revoked' | null
          expires_at: string
          accepted_at?: string | null
          accepted_by?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          invite_code?: string
          invited_by?: string | null
          company_id?: string | null
          email?: string | null
          role?: 'user' | 'hr' | 'prestador'
          status?: 'pending' | 'accepted' | 'expired' | 'revoked' | null
          expires_at?: string
          accepted_at?: string | null
          accepted_by?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
      }

      // Admin logs
      admin_logs: {
        Row: {
          id: string
          admin_id: string
          action: string
          entity_type: string
          entity_id: string | null
          changes: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          admin_id: string
          action: string
          entity_type: string
          entity_id?: string | null
          changes?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          admin_id?: string
          action?: string
          entity_type?: string
          entity_id?: string | null
          changes?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string | null
        }
      }

      // Specialist call logs
      specialist_call_logs: {
        Row: {
          id: string
          chat_session_id: string | null
          user_id: string | null
          specialist_id: string | null
          call_status: 'pending' | 'completed' | 'missed' | 'scheduled' | null
          call_notes: string | null
          session_booked: boolean | null
          booking_id: string | null
          created_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          chat_session_id?: string | null
          user_id?: string | null
          specialist_id?: string | null
          call_status?: 'pending' | 'completed' | 'missed' | 'scheduled' | null
          call_notes?: string | null
          session_booked?: boolean | null
          booking_id?: string | null
          created_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          chat_session_id?: string | null
          user_id?: string | null
          specialist_id?: string | null
          call_status?: 'pending' | 'completed' | 'missed' | 'scheduled' | null
          call_notes?: string | null
          session_booked?: boolean | null
          booking_id?: string | null
          created_at?: string | null
          completed_at?: string | null
        }
      }

      // Onboarding data (legacy table)
      onboarding_data: {
        Row: {
          id: string
          user_id: string | null
          wellbeing_score: number | null
          difficulty_areas: string[] | null
          main_goals: string[] | null
          improvement_signs: string[] | null
          frequency: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          wellbeing_score?: number | null
          difficulty_areas?: string[] | null
          main_goals?: string[] | null
          improvement_signs?: string[] | null
          frequency?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          wellbeing_score?: number | null
          difficulty_areas?: string[] | null
          main_goals?: string[] | null
          improvement_signs?: string[] | null
          frequency?: string | null
          completed_at?: string | null
        }
      }
    }
    Views: {
      pillar_mapping: {
        Row: {
          portuguese: string
          english_old: string
          english_new: string
          display_name: string
        }
      }
    }
    Functions: {
      get_pillar_display_name: {
        Args: {
          pillar_name: string
        }
        Returns: string
      }
      is_valid_pillar: {
        Args: {
          pillar_name: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: AppRole
    }
  }
}

// Helper types for common operations
export type ProfileWithRoles = Database['public']['Tables']['profiles']['Row'] & {
  roles: AppRole[]
  primary_role: AppRole
}

export type BookingWithDetails = Database['public']['Tables']['bookings']['Row'] & {
  user: Database['public']['Tables']['profiles']['Row']
  prestador: Database['public']['Tables']['prestadores']['Row']
  company: Database['public']['Tables']['companies']['Row']
}

export type ChatSessionWithMessages = Database['public']['Tables']['chat_sessions']['Row'] & {
  messages: Database['public']['Tables']['chat_messages']['Row'][]
  user: Database['public']['Tables']['profiles']['Row']
}

export type UserGoalWithPillar = Database['public']['Tables']['user_goals']['Row'] & {
  pillar_display_name: string
}

// Utility types for form handling
export type CreateBookingData = Database['public']['Tables']['bookings']['Insert']
export type UpdateBookingData = Database['public']['Tables']['bookings']['Update']
export type CreateUserGoalData = Database['public']['Tables']['user_goals']['Insert']
export type UpdateUserGoalData = Database['public']['Tables']['user_goals']['Update']
export type CreateChatSessionData = Database['public']['Tables']['chat_sessions']['Insert']
export type UpdateChatSessionData = Database['public']['Tables']['chat_sessions']['Update']
