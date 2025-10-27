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
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
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
          pillar: string | null
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
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
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
          pillar?: string | null
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
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
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
          pillar?: string | null
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
      invoices: {
        Row: {
          amount_due: number
          amount_paid: number | null
          company_id: string
          created_at: string | null
          currency: string | null
          due_date: string
          id: string
          invoice_date: string
          invoice_number: string
          notes: string | null
          paid_at: string | null
          pdf_url: string | null
          status: string | null
          stripe_invoice_id: string | null
          subscription_id: string | null
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          amount_due: number
          amount_paid?: number | null
          company_id: string
          created_at?: string | null
          currency?: string | null
          due_date: string
          id?: string
          invoice_date: string
          invoice_number: string
          notes?: string | null
          paid_at?: string | null
          pdf_url?: string | null
          status?: string | null
          stripe_invoice_id?: string | null
          subscription_id?: string | null
          tax_amount?: number | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          amount_due?: number
          amount_paid?: number | null
          company_id?: string
          created_at?: string | null
          currency?: string | null
          due_date?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          paid_at?: string | null
          pdf_url?: string | null
          status?: string | null
          stripe_invoice_id?: string | null
          subscription_id?: string | null
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
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
      onboarding_data: {
        Row: {
          communication_preferences: Json | null
          completed_at: string | null
          created_at: string | null
          health_goals: string[] | null
          id: string
          initial_concerns: string | null
          pillar_preferences: string[] | null
          preferred_language: string | null
          preferred_session_time: string | null
          referral_source: string | null
          updated_at: string | null
          user_id: string
          work_stress_level: number | null
        }
        Insert: {
          communication_preferences?: Json | null
          completed_at?: string | null
          created_at?: string | null
          health_goals?: string[] | null
          id?: string
          initial_concerns?: string | null
          pillar_preferences?: string[] | null
          preferred_language?: string | null
          preferred_session_time?: string | null
          referral_source?: string | null
          updated_at?: string | null
          user_id: string
          work_stress_level?: number | null
        }
        Update: {
          communication_preferences?: Json | null
          completed_at?: string | null
          created_at?: string | null
          health_goals?: string[] | null
          id?: string
          initial_concerns?: string | null
          pillar_preferences?: string[] | null
          preferred_language?: string | null
          preferred_session_time?: string | null
          referral_source?: string | null
          updated_at?: string | null
          user_id?: string
          work_stress_level?: number | null
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          setting_key: string
          setting_type: string | null
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key: string
          setting_type?: string | null
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key?: string
          setting_type?: string | null
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      prestador_availability: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_recurring: boolean | null
          prestador_id: string
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_recurring?: boolean | null
          prestador_id: string
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_recurring?: boolean | null
          prestador_id?: string
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prestador_availability_prestador_id_fkey"
            columns: ["prestador_id"]
            isOneToOne: false
            referencedRelation: "prestadores"
            referencedColumns: ["id"]
          },
        ]
      }
      prestador_performance: {
        Row: {
          avg_rating: number | null
          cancelled_sessions: number | null
          completed_sessions: number | null
          created_at: string | null
          id: string
          month: string
          no_show_sessions: number | null
          prestador_id: string
          total_hours: number | null
          total_revenue: number | null
          total_sessions: number | null
          updated_at: string | null
        }
        Insert: {
          avg_rating?: number | null
          cancelled_sessions?: number | null
          completed_sessions?: number | null
          created_at?: string | null
          id?: string
          month: string
          no_show_sessions?: number | null
          prestador_id: string
          total_hours?: number | null
          total_revenue?: number | null
          total_sessions?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_rating?: number | null
          cancelled_sessions?: number | null
          completed_sessions?: number | null
          created_at?: string | null
          id?: string
          month?: string
          no_show_sessions?: number | null
          prestador_id?: string
          total_hours?: number | null
          total_revenue?: number | null
          total_sessions?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prestador_performance_prestador_id_fkey"
            columns: ["prestador_id"]
            isOneToOne: false
            referencedRelation: "prestadores"
            referencedColumns: ["id"]
          },
        ]
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
          avatar_url: string | null
          bio: string | null
          company_id: string | null
          company_name: string | null
          created_at: string | null
          department: string | null
          email: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company_id?: string | null
          company_name?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          id: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company_id?: string | null
          company_name?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string | null
          phone?: string | null
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
      resource_access_log: {
        Row: {
          access_type: string | null
          company_id: string | null
          created_at: string | null
          device_type: string | null
          duration_seconds: number | null
          id: string
          ip_address: string | null
          resource_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          access_type?: string | null
          company_id?: string | null
          created_at?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          id?: string
          ip_address?: string | null
          resource_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          access_type?: string | null
          company_id?: string | null
          created_at?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          id?: string
          ip_address?: string | null
          resource_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_access_log_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_access_log_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
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
      session_recordings: {
        Row: {
          booking_id: string
          created_at: string | null
          deleted_at: string | null
          duration_minutes: number | null
          encryption_key_id: string | null
          expires_at: string | null
          file_size_mb: number | null
          id: string
          is_encrypted: boolean | null
          prestador_id: string
          recording_url: string | null
          transcription_url: string | null
          user_id: string
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          deleted_at?: string | null
          duration_minutes?: number | null
          encryption_key_id?: string | null
          expires_at?: string | null
          file_size_mb?: number | null
          id?: string
          is_encrypted?: boolean | null
          prestador_id: string
          recording_url?: string | null
          transcription_url?: string | null
          user_id: string
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          deleted_at?: string | null
          duration_minutes?: number | null
          encryption_key_id?: string | null
          expires_at?: string | null
          file_size_mb?: number | null
          id?: string
          is_encrypted?: boolean | null
          prestador_id?: string
          recording_url?: string | null
          transcription_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_recordings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
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
      specialist_assignments: {
        Row: {
          company_id: string
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          max_hours_per_week: number | null
          notes: string | null
          pillar: string | null
          specialist_id: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          max_hours_per_week?: number | null
          notes?: string | null
          pillar?: string | null
          specialist_id: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          max_hours_per_week?: number | null
          notes?: string | null
          pillar?: string | null
          specialist_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "specialist_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "specialist_call_logs_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "user_profile_with_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_call_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_call_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_cycle: string | null
          cancel_at_period_end: boolean | null
          cancelled_at: string | null
          company_id: string
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          plan_type: string
          price_per_month: number
          seats_included: number | null
          sessions_per_seat: number | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
        }
        Insert: {
          billing_cycle?: string | null
          cancel_at_period_end?: boolean | null
          cancelled_at?: string | null
          company_id: string
          created_at?: string | null
          current_period_end: string
          current_period_start: string
          id?: string
          plan_type: string
          price_per_month: number
          seats_included?: number | null
          sessions_per_seat?: number | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_cycle?: string | null
          cancel_at_period_end?: boolean | null
          cancelled_at?: string | null
          company_id?: string
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_type?: string
          price_per_month?: number
          seats_included?: number | null
          sessions_per_seat?: number | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_messages: {
        Row: {
          created_at: string | null
          id: string
          is_internal: boolean | null
          message: string
          sender_id: string | null
          ticket_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          message: string
          sender_id?: string | null
          ticket_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          message?: string
          sender_id?: string | null
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_ticket_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_profile_with_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string | null
          company_id: string | null
          created_at: string | null
          description: string
          id: string
          priority: string | null
          resolved_at: string | null
          status: string | null
          subject: string
          ticket_number: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          company_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          priority?: string | null
          resolved_at?: string | null
          status?: string | null
          subject: string
          ticket_number: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          company_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          priority?: string | null
          resolved_at?: string | null
          status?: string | null
          subject?: string
          ticket_number?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_profile_with_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          company_id: string
          created_at: string | null
          currency: string | null
          failure_reason: string | null
          id: string
          invoice_id: string | null
          metadata: Json | null
          payment_method: string | null
          refund_amount: number | null
          refunded_at: string | null
          status: string | null
          stripe_charge_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          company_id: string
          created_at?: string | null
          currency?: string | null
          failure_reason?: string | null
          id?: string
          invoice_id?: string | null
          metadata?: Json | null
          payment_method?: string | null
          refund_amount?: number | null
          refunded_at?: string | null
          status?: string | null
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string | null
          currency?: string | null
          failure_reason?: string | null
          id?: string
          invoice_id?: string | null
          metadata?: Json | null
          payment_method?: string | null
          refund_amount?: number | null
          refunded_at?: string | null
          status?: string | null
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      user_milestones: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          milestone_id: string
          milestone_label: string
          points: number | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          milestone_id: string
          milestone_label: string
          points?: number | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          milestone_id?: string
          milestone_label?: string
          points?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_milestones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_milestones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile_with_roles"
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
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile_with_roles"
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
      user_profile_with_roles: {
        Row: {
          company_id: string | null
          company_name: string | null
          created_at: string | null
          department: string | null
          email: string | null
          id: string | null
          is_active: boolean | null
          is_admin: boolean | null
          is_hr: boolean | null
          is_prestador: boolean | null
          is_specialist: boolean | null
          is_user: boolean | null
          name: string | null
          role: string | null
          roles: Database["public"]["Enums"]["app_role"][] | null
          updated_at: string | null
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
      calculate_monthly_performance: {
        Args: { _month: string; _prestador_id: string }
        Returns: undefined
      }
      cancel_booking_with_refund: {
        Args: {
          _booking_id: string
          _cancellation_reason: string
          _company_id: string
          _refund_quota: boolean
          _user_id: string
        }
        Returns: Json
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
      get_company_subscription_status: {
        Args: { _company_id: string }
        Returns: {
          expires_at: string
          is_active: boolean
          plan_type: string
          sessions_remaining: number
        }[]
      }
      get_provider_availability: {
        Args: {
          _date: string
          _end_time: string
          _prestador_id: string
          _start_time: string
        }
        Returns: boolean
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
      get_user_primary_role: { Args: { user_id: string }; Returns: string }
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
