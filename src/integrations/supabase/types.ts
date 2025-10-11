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
      bookings: {
        Row: {
          booking_date: string
          booking_source: string | null
          chat_session_id: string | null
          created_at: string | null
          id: string
          meeting_link: string | null
          meeting_platform: string | null
          meeting_type: string | null
          notes: string | null
          pillar_specialties: string[] | null
          prediagnostic_completed: boolean | null
          prediagnostic_summary: Json | null
          prestador_id: string | null
          session_type: string | null
          status: string | null
          topic: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_date: string
          booking_source?: string | null
          chat_session_id?: string | null
          created_at?: string | null
          id?: string
          meeting_link?: string | null
          meeting_platform?: string | null
          meeting_type?: string | null
          notes?: string | null
          pillar_specialties?: string[] | null
          prediagnostic_completed?: boolean | null
          prediagnostic_summary?: Json | null
          prestador_id?: string | null
          session_type?: string | null
          status?: string | null
          topic?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_date?: string
          booking_source?: string | null
          chat_session_id?: string | null
          created_at?: string | null
          id?: string
          meeting_link?: string | null
          meeting_platform?: string | null
          meeting_type?: string | null
          notes?: string | null
          pillar_specialties?: string[] | null
          prediagnostic_completed?: boolean | null
          prediagnostic_summary?: Json | null
          prestador_id?: string | null
          session_type?: string | null
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
            foreignKeyName: "bookings_prestador_id_fkey"
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
        Relationships: []
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
