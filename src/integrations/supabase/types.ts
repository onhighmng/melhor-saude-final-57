export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_date: string
          booking_source: string | null
          chat_session_id: string | null
          company_id: string | null
          created_at: string | null
          date: string | null
          end_time: string | null
          id: string
          meeting_link: string | null
          meeting_platform: string | null
          meeting_type: string | null
          notes: string | null
          pillar_specialties: string[] | null
          prediagnostic_completed: boolean | null
          prediagnostic_summary: Json | null
          prestador_id: string | null
          rating: number | null
          session_type: string | null
          start_time: string | null
          status: string | null
          topic: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_date: string
          booking_source?: string | null
          chat_session_id?: string | null
          company_id?: string | null
          created_at?: string | null
          date?: string | null
          end_time?: string | null
          id?: string
          meeting_link?: string | null
          meeting_platform?: string | null
          meeting_type?: string | null
          notes?: string | null
          pillar_specialties?: string[] | null
          prediagnostic_completed?: boolean | null
          prediagnostic_summary?: Json | null
          prestador_id?: string | null
          rating?: number | null
          session_type?: string | null
          start_time?: string | null
          status?: string | null
          topic?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_date?: string
          booking_source?: string | null
          chat_session_id?: string | null
          company_id?: string | null
          created_at?: string | null
          date?: string | null
          end_time?: string | null
          id?: string
          meeting_link?: string | null
          meeting_platform?: string | null
          meeting_type?: string | null
          notes?: string | null
          pillar_specialties?: string[] | null
          prediagnostic_completed?: boolean | null
          prediagnostic_summary?: Json | null
          prestador_id?: string | null
          rating?: number | null
          session_type?: string | null
          start_time?: string | null
          status?: string | null
          topic?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_chat_session_id_fkey"
            columns: ["chat_session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_prestador_id_fkey"
            columns: ["prestador_id"]
            isOneToOne: false
            referencedRelation: "prestadores"
            referencedColumns: ["id"]
          },
        ]
      }
      change_requests: {
        Row: {
          created_at: string | null
          current_data: Json | null
          id: string
          prestador_id: string
          reason: string | null
          request_type: string
          requested_data: Json
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_data?: Json | null
          id?: string
          prestador_id: string
          reason?: string | null
          request_type: string
          requested_data: Json
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_data?: Json | null
          id?: string
          prestador_id?: string
          reason?: string | null
          request_type?: string
          requested_data?: Json
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "change_requests_prestador_id_fkey"
            columns: ["prestador_id"]
            isOneToOne: false
            referencedRelation: "prestadores"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          role: string
          session_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role: string
          session_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          ai_resolution: boolean | null
          created_at: string | null
          ended_at: string | null
          id: string
          phone_contact_made: boolean | null
          phone_escalation_reason: string | null
          pillar: string | null
          satisfaction_rating: string | null
          session_booked_by_specialist: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          ai_resolution?: boolean | null
          created_at?: string | null
          ended_at?: string | null
          id?: string
          phone_contact_made?: boolean | null
          phone_escalation_reason?: string | null
          pillar?: string | null
          satisfaction_rating?: string | null
          session_booked_by_specialist?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          ai_resolution?: boolean | null
          created_at?: string | null
          ended_at?: string | null
          id?: string
          phone_contact_made?: boolean | null
          phone_escalation_reason?: string | null
          pillar?: string | null
          satisfaction_rating?: string | null
          session_booked_by_specialist?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          company_name: string
          contact_email: string
          contact_phone: string | null
          created_at: string | null
          final_notes: string | null
          id: string
          is_active: boolean | null
          plan_type: string | null
          sessions_allocated: number | null
          sessions_used: number | null
          updated_at: string | null
        }
        Insert: {
          company_name: string
          contact_email: string
          contact_phone?: string | null
          created_at?: string | null
          final_notes?: string | null
          id?: string
          is_active?: boolean | null
          plan_type?: string | null
          sessions_allocated?: number | null
          sessions_used?: number | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string
          contact_email?: string
          contact_phone?: string | null
          created_at?: string | null
          final_notes?: string | null
          id?: string
          is_active?: boolean | null
          plan_type?: string | null
          sessions_allocated?: number | null
          sessions_used?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      company_employees: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          joined_at: string | null
          sessions_allocated: number | null
          sessions_used: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          sessions_allocated?: number | null
          sessions_used?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          sessions_allocated?: number | null
          sessions_used?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_organizations: {
        Row: {
          company_name: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          final_notes: string | null
          id: string
          is_active: boolean | null
          plan_type: string | null
          sessions_allocated: number | null
          sessions_used: number | null
          updated_at: string | null
        }
        Insert: {
          company_name: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          final_notes?: string | null
          id?: string
          is_active?: boolean | null
          plan_type?: string | null
          sessions_allocated?: number | null
          sessions_used?: number | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          final_notes?: string | null
          id?: string
          is_active?: boolean | null
          plan_type?: string | null
          sessions_allocated?: number | null
          sessions_used?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          category: string | null
          comment: string | null
          created_at: string | null
          id: string
          rating: number | null
          user_id: string
        }
        Insert: {
          category?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          user_id: string
        }
        Update: {
          category?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          user_id?: string
        }
        Relationships: []
      }
      invites: {
        Row: {
          accepted_at: string | null
          company_id: string
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          invite_code: string
          invited_by: string | null
          sessions_allocated: number | null
          status: string | null
        }
        Insert: {
          accepted_at?: string | null
          company_id: string
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invite_code: string
          invited_by?: string | null
          sessions_allocated?: number | null
          status?: string | null
        }
        Update: {
          accepted_at?: string | null
          company_id?: string
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invite_code?: string
          invited_by?: string | null
          sessions_allocated?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invites_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      prestador_schedule: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean | null
          prestador_id: string
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean | null
          prestador_id: string
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean | null
          prestador_id?: string
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prestador_schedule_prestador_id_fkey"
            columns: ["prestador_id"]
            isOneToOne: false
            referencedRelation: "prestadores"
            referencedColumns: ["id"]
          },
        ]
      }
      prestadores: {
        Row: {
          biography: string | null
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          languages: string[] | null
          name: string
          photo_url: string | null
          pillar_specialties: string[] | null
          session_duration: number | null
          specialties: string[] | null
          updated_at: string | null
          user_id: string | null
          video_url: string | null
        }
        Insert: {
          biography?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          languages?: string[] | null
          name: string
          photo_url?: string | null
          pillar_specialties?: string[] | null
          session_duration?: number | null
          specialties?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          video_url?: string | null
        }
        Update: {
          biography?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          languages?: string[] | null
          name?: string
          photo_url?: string | null
          pillar_specialties?: string[] | null
          session_duration?: number | null
          specialties?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_id: string | null
          company_name: string | null
          created_at: string | null
          department: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          company_name?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          id: string
          is_active?: boolean | null
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          company_name?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          content: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          pillar: string | null
          resource_type: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          pillar?: string | null
          resource_type?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          pillar?: string | null
          resource_type?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      session_notes: {
        Row: {
          booking_id: string
          created_at: string | null
          id: string
          is_private: boolean | null
          notes: string
          prestador_id: string
          updated_at: string | null
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          notes: string
          prestador_id: string
          updated_at?: string | null
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          notes?: string
          prestador_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_notes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_notes_prestador_id_fkey"
            columns: ["prestador_id"]
            isOneToOne: false
            referencedRelation: "prestadores"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string | null
          id: string
          prestador_id: string | null
          session_date: string | null
          session_type: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          prestador_id?: string | null
          session_date?: string | null
          session_type?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          prestador_id?: string | null
          session_date?: string | null
          session_type?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      specialist_call_logs: {
        Row: {
          booking_id: string | null
          call_notes: string | null
          call_status: string | null
          chat_session_id: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          session_booked: boolean | null
          specialist_id: string | null
          user_id: string | null
        }
        Insert: {
          booking_id?: string | null
          call_notes?: string | null
          call_status?: string | null
          chat_session_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          session_booked?: boolean | null
          specialist_id?: string | null
          user_id?: string | null
        }
        Update: {
          booking_id?: string | null
          call_notes?: string | null
          call_status?: string | null
          chat_session_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          session_booked?: boolean | null
          specialist_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "specialist_call_logs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_call_logs_chat_session_id_fkey"
            columns: ["chat_session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_call_logs_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_call_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          action_date: string | null
          action_type: string
          id: string
          metadata: Json | null
          pillar: string | null
          user_id: string | null
        }
        Insert: {
          action_date?: string | null
          action_type: string
          id?: string
          metadata?: Json | null
          pillar?: string | null
          user_id?: string | null
        }
        Update: {
          action_date?: string | null
          action_type?: string
          id?: string
          metadata?: Json | null
          pillar?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      specialist_analytics: {
        Row: {
          ai_resolved: number | null
          date: string | null
          phone_escalated: number | null
          pillar: string | null
          satisfied_users: number | null
          sessions_booked: number | null
          total_chats: number | null
          unsatisfied_users: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      assign_employee_sessions: {
        Args: { _employee_id: string; _quota: number }
        Returns: boolean
      }
      book_session_with_quota_check: {
        Args: {
          _booking_date: string
          _end_time?: string
          _meeting_type?: string
          _pillar_specialties: string[]
          _prestador_id: string
          _session_type: string
          _start_time?: string
          _topic?: string
          _user_id: string
        }
        Returns: string
      }
      get_company_analytics: {
        Args: { _company_id: string }
        Returns: {
          active_employees: number
          avg_rating: number
          cancelled_bookings: number
          completed_bookings: number
          sessions_allocated: number
          sessions_remaining: number
          sessions_used: number
          total_bookings: number
          total_employees: number
          utilization_rate: number
        }[]
      }
      get_provider_performance: {
        Args: { _prestador_id: string }
        Returns: {
          avg_rating: number
          cancelled_sessions: number
          completed_sessions: number
          completion_rate: number
          sessions_this_month: number
          sessions_this_week: number
          total_hours: number
          total_sessions: number
        }[]
      }
      get_user_session_balance: {
        Args: { _user_id: string }
        Returns: {
          company_name: string
          company_sessions_allocated: number
          company_sessions_remaining: number
          company_sessions_used: number
          has_company_quota: boolean
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "hr" | "prestador" | "specialist"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "hr", "prestador", "specialist"],
    },
  },
} as const
