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
      admin_invitations: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string
          expires_at: string
          id: string
          name: string | null
          used_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email: string
          expires_at: string
          id?: string
          name?: string | null
          used_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string
          expires_at?: string
          id?: string
          name?: string | null
          used_at?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_date: string
          created_at: string | null
          id: string
          meeting_link: string | null
          meeting_platform: string | null
          notes: string | null
          pillar_specialties: string[] | null
          prestador_id: string | null
          session_type: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_date: string
          created_at?: string | null
          id?: string
          meeting_link?: string | null
          meeting_platform?: string | null
          notes?: string | null
          pillar_specialties?: string[] | null
          prestador_id?: string | null
          session_type?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_date?: string
          created_at?: string | null
          id?: string
          meeting_link?: string | null
          meeting_platform?: string | null
          notes?: string | null
          pillar_specialties?: string[] | null
          prestador_id?: string | null
          session_type?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
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
          current_value: string | null
          field: string
          field_label: string
          id: string
          prestador_id: string | null
          reason: string | null
          requested_value: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          current_value?: string | null
          field: string
          field_label: string
          id?: string
          prestador_id?: string | null
          reason?: string | null
          requested_value: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          current_value?: string | null
          field?: string
          field_label?: string
          id?: string
          prestador_id?: string | null
          reason?: string | null
          requested_value?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
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
      extra_services: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
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
      service_requests: {
        Row: {
          created_at: string | null
          id: string
          service_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          service_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          service_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "extra_services"
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
    }
    Views: {
      [_ in never]: never
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
