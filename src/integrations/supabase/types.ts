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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      admin_actions: {
        Row: {
          action_type: string
          admin_user_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          target_id: string | null
          target_type: string
          user_agent: string | null
        }
        Insert: {
          action_type: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          target_id?: string | null
          target_type: string
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          target_id?: string | null
          target_type?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string
          updated_at: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invitation_token: string
          invited_by: string
          updated_at?: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string
          updated_at?: string
          used_at?: string | null
        }
        Relationships: []
      }
      availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean
          prestador_id: string
          start_time: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean
          prestador_id: string
          start_time: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean
          prestador_id?: string
          start_time?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_prestador_id_fkey"
            columns: ["prestador_id"]
            isOneToOne: false
            referencedRelation: "prestadores"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_notifications: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          notification_type: string
          recipient_id: string
          recipient_type: string
          retry_count: number
          sent_at: string | null
          status: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          notification_type: string
          recipient_id: string
          recipient_type: string
          retry_count?: number
          sent_at?: string | null
          status?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          notification_type?: string
          recipient_id?: string
          recipient_type?: string
          retry_count?: number
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_notifications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_date: string
          calendar_event_id: string | null
          calendly_event_id: string | null
          cancellation_reason: string | null
          created_at: string
          duration: number
          id: string
          meeting_id: string | null
          meeting_link: string | null
          notes: string | null
          pillar_specialty_id: string | null
          prestador_id: string
          prestador_notes: string | null
          reminder_sent: boolean
          rescheduled_from: string | null
          session_type: string
          session_usage_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_date: string
          calendar_event_id?: string | null
          calendly_event_id?: string | null
          cancellation_reason?: string | null
          created_at?: string
          duration?: number
          id?: string
          meeting_id?: string | null
          meeting_link?: string | null
          notes?: string | null
          pillar_specialty_id?: string | null
          prestador_id: string
          prestador_notes?: string | null
          reminder_sent?: boolean
          rescheduled_from?: string | null
          session_type?: string
          session_usage_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_date?: string
          calendar_event_id?: string | null
          calendly_event_id?: string | null
          cancellation_reason?: string | null
          created_at?: string
          duration?: number
          id?: string
          meeting_id?: string | null
          meeting_link?: string | null
          notes?: string | null
          pillar_specialty_id?: string | null
          prestador_id?: string
          prestador_notes?: string | null
          reminder_sent?: boolean
          rescheduled_from?: string | null
          session_type?: string
          session_usage_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_pillar_specialty_id_fkey"
            columns: ["pillar_specialty_id"]
            isOneToOne: false
            referencedRelation: "pillar_specialties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_prestador_id_fkey"
            columns: ["prestador_id"]
            isOneToOne: false
            referencedRelation: "prestadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_rescheduled_from_fkey"
            columns: ["rescheduled_from"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_session_usage_id_fkey"
            columns: ["session_usage_id"]
            isOneToOne: false
            referencedRelation: "session_usage"
            referencedColumns: ["id"]
          },
        ]
      }
      calendly_events: {
        Row: {
          attendee_email: string | null
          attendee_name: string | null
          booking_id: string | null
          calendly_event_id: string
          calendly_event_uri: string
          created_at: string
          end_time: string
          event_type_uri: string | null
          id: string
          meeting_link: string | null
          prestador_id: string
          start_time: string
          status: string
          sync_status: string
          updated_at: string
        }
        Insert: {
          attendee_email?: string | null
          attendee_name?: string | null
          booking_id?: string | null
          calendly_event_id: string
          calendly_event_uri: string
          created_at?: string
          end_time: string
          event_type_uri?: string | null
          id?: string
          meeting_link?: string | null
          prestador_id: string
          start_time: string
          status?: string
          sync_status?: string
          updated_at?: string
        }
        Update: {
          attendee_email?: string | null
          attendee_name?: string | null
          booking_id?: string | null
          calendly_event_id?: string
          calendly_event_uri?: string
          created_at?: string
          end_time?: string
          event_type_uri?: string | null
          id?: string
          meeting_link?: string | null
          prestador_id?: string
          start_time?: string
          status?: string
          sync_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      calendly_integrations: {
        Row: {
          access_token: string
          calendly_user_uri: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          organization_uri: string | null
          prestador_id: string
          refresh_token: string | null
          updated_at: string
          user_email: string | null
          user_name: string | null
          webhook_signing_key: string | null
          webhook_url: string | null
        }
        Insert: {
          access_token: string
          calendly_user_uri: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          organization_uri?: string | null
          prestador_id: string
          refresh_token?: string | null
          updated_at?: string
          user_email?: string | null
          user_name?: string | null
          webhook_signing_key?: string | null
          webhook_url?: string | null
        }
        Update: {
          access_token?: string
          calendly_user_uri?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          organization_uri?: string | null
          prestador_id?: string
          refresh_token?: string | null
          updated_at?: string
          user_email?: string | null
          user_name?: string | null
          webhook_signing_key?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      change_requests: {
        Row: {
          created_at: string
          current_value: string
          field: string
          field_label: string
          id: string
          prestador_id: string
          prestador_name: string
          reason: string | null
          requested_value: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          current_value: string
          field: string
          field_label: string
          id?: string
          prestador_id: string
          prestador_name: string
          reason?: string | null
          requested_value: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          current_value?: string
          field?: string
          field_label?: string
          id?: string
          prestador_id?: string
          prestador_name?: string
          reason?: string | null
          requested_value?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: []
      }
      company_organizations: {
        Row: {
          active_users: number | null
          billing_contact: string | null
          company_name: string
          contact_email: string
          contact_phone: string | null
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string
          final_notes: string | null
          id: string
          is_active: boolean
          monthly_budget: number | null
          plan_type: string
          sessions_allocated: number | null
          sessions_used: number | null
          settings: Json | null
          total_employees: number | null
          updated_at: string
        }
        Insert: {
          active_users?: number | null
          billing_contact?: string | null
          company_name: string
          contact_email: string
          contact_phone?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          final_notes?: string | null
          id?: string
          is_active?: boolean
          monthly_budget?: number | null
          plan_type?: string
          sessions_allocated?: number | null
          sessions_used?: number | null
          settings?: Json | null
          total_employees?: number | null
          updated_at?: string
        }
        Update: {
          active_users?: number | null
          billing_contact?: string | null
          company_name?: string
          contact_email?: string
          contact_phone?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          final_notes?: string | null
          id?: string
          is_active?: boolean
          monthly_budget?: number | null
          plan_type?: string
          sessions_allocated?: number | null
          sessions_used?: number | null
          settings?: Json | null
          total_employees?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      company_plans: {
        Row: {
          billing_cycle: string
          company_name: string
          created_at: string
          id: string
          is_active: boolean
          plan_type: string
          price_per_session: number | null
          sessions_per_user: number
          total_sessions: number
          updated_at: string
        }
        Insert: {
          billing_cycle?: string
          company_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          plan_type?: string
          price_per_session?: number | null
          sessions_per_user?: number
          total_sessions?: number
          updated_at?: string
        }
        Update: {
          billing_cycle?: string
          company_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          plan_type?: string
          price_per_session?: number | null
          sessions_per_user?: number
          total_sessions?: number
          updated_at?: string
        }
        Relationships: []
      }
      content_analytics: {
        Row: {
          accessed_at: string
          content_id: string
          id: string
          ip_address: unknown | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          accessed_at?: string
          content_id: string
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          accessed_at?: string
          content_id?: string
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_analytics_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "self_help_content"
            referencedColumns: ["id"]
          },
        ]
      }
      extra_services: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          is_active: boolean
          name: string
          price: string | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          is_active?: boolean
          name: string
          price?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          is_active?: boolean
          name?: string
          price?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          is_anonymous: boolean
          prestador_id: string
          rating: number
          session_date: string
          session_usage_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          is_anonymous?: boolean
          prestador_id: string
          rating: number
          session_date: string
          session_usage_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          is_anonymous?: boolean
          prestador_id?: string
          rating?: number
          session_date?: string
          session_usage_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      file_uploads: {
        Row: {
          access_count: number | null
          bucket_name: string
          created_at: string
          expires_at: string | null
          file_category: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          is_processed: boolean | null
          is_public: boolean
          last_accessed_at: string | null
          metadata: Json | null
          original_filename: string
          processing_status: string | null
          public_url: string | null
          stored_filename: string
          updated_at: string
          upload_source: string | null
          user_id: string
        }
        Insert: {
          access_count?: number | null
          bucket_name: string
          created_at?: string
          expires_at?: string | null
          file_category: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          is_processed?: boolean | null
          is_public?: boolean
          last_accessed_at?: string | null
          metadata?: Json | null
          original_filename: string
          processing_status?: string | null
          public_url?: string | null
          stored_filename: string
          updated_at?: string
          upload_source?: string | null
          user_id: string
        }
        Update: {
          access_count?: number | null
          bucket_name?: string
          created_at?: string
          expires_at?: string | null
          file_category?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          is_processed?: boolean | null
          is_public?: boolean
          last_accessed_at?: string | null
          metadata?: Json | null
          original_filename?: string
          processing_status?: string | null
          public_url?: string | null
          stored_filename?: string
          updated_at?: string
          upload_source?: string | null
          user_id?: string
        }
        Relationships: []
      }
      health_checkins: {
        Row: {
          created_at: string
          energy_level: number
          id: string
          mood_rating: number
          notes: string | null
          sleep_quality: number
          stress_level: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          energy_level: number
          id?: string
          mood_rating: number
          notes?: string | null
          sleep_quality: number
          stress_level: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          energy_level?: number
          id?: string
          mood_rating?: number
          notes?: string | null
          sleep_quality?: number
          stress_level?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          booking_id: string | null
          created_at: string
          data: Json | null
          id: string
          read_at: string | null
          sent_at: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          booking_id?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          read_at?: string | null
          sent_at?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          booking_id?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          read_at?: string | null
          sent_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      password_resets: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          token: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payment_history: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          payment_date: string
          payment_method: string
          receipt_url: string | null
          reference_id: string | null
          reference_number: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          payment_date: string
          payment_method: string
          receipt_url?: string | null
          reference_id?: string | null
          reference_number: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          payment_date?: string
          payment_method?: string
          receipt_url?: string | null
          reference_id?: string | null
          reference_number?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_references: {
        Row: {
          amount: number
          created_at: string
          description: string
          expires_at: string
          id: string
          reference_number: string
          service_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          expires_at: string
          id?: string
          reference_number: string
          service_type: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          expires_at?: string
          id?: string
          reference_number?: string
          service_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pillar_specialties: {
        Row: {
          color_code: string | null
          created_at: string
          description: string | null
          icon_name: string | null
          id: string
          is_active: boolean
          pillar_name: string
          specialty_name: string
          updated_at: string
        }
        Insert: {
          color_code?: string | null
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean
          pillar_name: string
          specialty_name: string
          updated_at?: string
        }
        Update: {
          color_code?: string | null
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean
          pillar_name?: string
          specialty_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      prestador_booking_assignments: {
        Row: {
          assignment_count: number | null
          created_at: string | null
          id: string
          last_assigned_at: string | null
          pillar: string
          prestador_id: string
          updated_at: string | null
        }
        Insert: {
          assignment_count?: number | null
          created_at?: string | null
          id?: string
          last_assigned_at?: string | null
          pillar: string
          prestador_id: string
          updated_at?: string | null
        }
        Update: {
          assignment_count?: number | null
          created_at?: string | null
          id?: string
          last_assigned_at?: string | null
          pillar?: string
          prestador_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prestador_booking_assignments_prestador_id_fkey"
            columns: ["prestador_id"]
            isOneToOne: false
            referencedRelation: "prestadores"
            referencedColumns: ["id"]
          },
        ]
      }
      prestador_cases: {
        Row: {
          anonymized_notes: string | null
          case_description: string | null
          case_status: string
          case_title: string
          created_at: string
          difficulty_level: string | null
          end_date: string | null
          id: string
          outcome_summary: string | null
          prestador_id: string
          session_count: number | null
          specialty_area: string | null
          start_date: string
          updated_at: string
        }
        Insert: {
          anonymized_notes?: string | null
          case_description?: string | null
          case_status?: string
          case_title: string
          created_at?: string
          difficulty_level?: string | null
          end_date?: string | null
          id?: string
          outcome_summary?: string | null
          prestador_id: string
          session_count?: number | null
          specialty_area?: string | null
          start_date: string
          updated_at?: string
        }
        Update: {
          anonymized_notes?: string | null
          case_description?: string | null
          case_status?: string
          case_title?: string
          created_at?: string
          difficulty_level?: string | null
          end_date?: string | null
          id?: string
          outcome_summary?: string | null
          prestador_id?: string
          session_count?: number | null
          specialty_area?: string | null
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prestador_cases_prestador_id_fkey"
            columns: ["prestador_id"]
            isOneToOne: false
            referencedRelation: "prestadores"
            referencedColumns: ["id"]
          },
        ]
      }
      prestadores: {
        Row: {
          bio: string | null
          calendly_link: string | null
          certifications: string[] | null
          created_at: string
          email: string
          google_calendar_id: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean
          is_approved: boolean
          languages: string[] | null
          name: string
          phone: string | null
          pillar: string | null
          profile_photo_url: string | null
          session_duration: number | null
          specialties: string[] | null
          updated_at: string
          user_id: string | null
          video_url: string | null
          zoom_meeting_id: string | null
        }
        Insert: {
          bio?: string | null
          calendly_link?: string | null
          certifications?: string[] | null
          created_at?: string
          email: string
          google_calendar_id?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean
          is_approved?: boolean
          languages?: string[] | null
          name: string
          phone?: string | null
          pillar?: string | null
          profile_photo_url?: string | null
          session_duration?: number | null
          specialties?: string[] | null
          updated_at?: string
          user_id?: string | null
          video_url?: string | null
          zoom_meeting_id?: string | null
        }
        Update: {
          bio?: string | null
          calendly_link?: string | null
          certifications?: string[] | null
          created_at?: string
          email?: string
          google_calendar_id?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean
          is_approved?: boolean
          languages?: string[] | null
          name?: string
          phone?: string | null
          pillar?: string | null
          profile_photo_url?: string | null
          session_duration?: number | null
          specialties?: string[] | null
          updated_at?: string
          user_id?: string | null
          video_url?: string | null
          zoom_meeting_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      psychological_tests: {
        Row: {
          created_at: string
          description: string
          id: string
          interpretation_guide: Json
          is_active: boolean
          name: string
          questions: Json
          scoring_rules: Json
          test_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          interpretation_guide: Json
          is_active?: boolean
          name: string
          questions: Json
          scoring_rules: Json
          test_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          interpretation_guide?: Json
          is_active?: boolean
          name?: string
          questions?: Json
          scoring_rules?: Json
          test_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      self_help_content: {
        Row: {
          author: string
          category: Database["public"]["Enums"]["content_category"]
          content_body: string | null
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string
          created_by: string | null
          id: string
          is_published: boolean
          published_at: string | null
          summary: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author: string
          category: Database["public"]["Enums"]["content_category"]
          content_body?: string | null
          content_type: Database["public"]["Enums"]["content_type"]
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          summary?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author?: string
          category?: Database["public"]["Enums"]["content_category"]
          content_body?: string | null
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          summary?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          message: string | null
          service_id: string
          status: string
          updated_at: string
          user_email: string
          user_id: string
          user_name: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          message?: string | null
          service_id: string
          status?: string
          updated_at?: string
          user_email: string
          user_id: string
          user_name: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          message?: string | null
          service_id?: string
          status?: string
          updated_at?: string
          user_email?: string
          user_id?: string
          user_name?: string
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
      session_allocations: {
        Row: {
          allocated_by: string | null
          allocation_type: string
          company_plan_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          reason: string | null
          sessions_allocated: number
          sessions_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          allocated_by?: string | null
          allocation_type?: string
          company_plan_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          reason?: string | null
          sessions_allocated?: number
          sessions_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          allocated_by?: string | null
          allocation_type?: string
          company_plan_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          reason?: string | null
          sessions_allocated?: number
          sessions_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_allocations_company_plan_id_fkey"
            columns: ["company_plan_id"]
            isOneToOne: false
            referencedRelation: "company_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      session_usage: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          prestador_id: string | null
          session_allocation_id: string
          session_date: string
          session_duration: number | null
          session_status: string
          session_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          prestador_id?: string | null
          session_allocation_id: string
          session_date: string
          session_duration?: number | null
          session_status?: string
          session_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          prestador_id?: string | null
          session_allocation_id?: string
          session_date?: string
          session_duration?: number | null
          session_status?: string
          session_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_usage_prestador_id_fkey"
            columns: ["prestador_id"]
            isOneToOne: false
            referencedRelation: "prestadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_usage_session_allocation_id_fkey"
            columns: ["session_allocation_id"]
            isOneToOne: false
            referencedRelation: "session_allocations"
            referencedColumns: ["id"]
          },
        ]
      }
      test_results: {
        Row: {
          answers: Json
          completed_at: string
          consent_given: boolean
          id: string
          interpretation: string
          is_anonymous: boolean
          score: number
          test_id: string
          user_id: string | null
        }
        Insert: {
          answers: Json
          completed_at?: string
          consent_given?: boolean
          id?: string
          interpretation: string
          is_anonymous?: boolean
          score: number
          test_id: string
          user_id?: string | null
        }
        Update: {
          answers?: Json
          completed_at?: string
          consent_given?: boolean
          id?: string
          interpretation?: string
          is_anonymous?: boolean
          score?: number
          test_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_results_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "psychological_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_description: string | null
          achievement_title: string
          achievement_type: string
          earned_at: string
          icon_name: string | null
          id: string
          is_milestone: boolean
          user_id: string
        }
        Insert: {
          achievement_description?: string | null
          achievement_title: string
          achievement_type: string
          earned_at?: string
          icon_name?: string | null
          id?: string
          is_milestone?: boolean
          user_id: string
        }
        Update: {
          achievement_description?: string | null
          achievement_title?: string
          achievement_type?: string
          earned_at?: string
          icon_name?: string | null
          id?: string
          is_milestone?: boolean
          user_id?: string
        }
        Relationships: []
      }
      user_activity_log: {
        Row: {
          activity_description: string
          activity_type: string
          created_at: string
          id: string
          metadata: Json | null
          related_id: string | null
          user_id: string
        }
        Insert: {
          activity_description: string
          activity_type: string
          created_at?: string
          id?: string
          metadata?: Json | null
          related_id?: string | null
          user_id: string
        }
        Update: {
          activity_description?: string
          activity_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          related_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_fcm_tokens: {
        Row: {
          created_at: string
          device_info: Json | null
          id: string
          is_active: boolean
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          id?: string
          is_active?: boolean
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          id?: string
          is_active?: boolean
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          company_name: string | null
          company_sessions: number
          created_at: string
          expires_at: string | null
          id: string
          personal_sessions: number
          plan_type: string | null
          total_sessions: number
          updated_at: string
          used_company_sessions: number
          used_personal_sessions: number
          used_sessions: number
          user_id: string
        }
        Insert: {
          company_name?: string | null
          company_sessions?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          personal_sessions?: number
          plan_type?: string | null
          total_sessions?: number
          updated_at?: string
          used_company_sessions?: number
          used_personal_sessions?: number
          used_sessions?: number
          user_id: string
        }
        Update: {
          company_name?: string | null
          company_sessions?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          personal_sessions?: number
          plan_type?: string | null
          total_sessions?: number
          updated_at?: string
          used_company_sessions?: number
          used_personal_sessions?: number
          used_sessions?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_achievement: {
        Args: {
          p_achievement_description?: string
          p_achievement_title: string
          p_achievement_type: string
          p_icon_name?: string
          p_is_milestone?: boolean
          p_user_id: string
        }
        Returns: string
      }
      calculate_user_session_balance: {
        Args: { p_user_id: string }
        Returns: {
          company_allocated: number
          company_remaining: number
          company_used: number
          personal_allocated: number
          personal_remaining: number
          personal_used: number
          total_allocated: number
          total_remaining: number
          total_used: number
        }[]
      }
      check_booking_availability: {
        Args: {
          p_booking_date: string
          p_duration: number
          p_exclude_booking_id?: string
          p_prestador_id: string
        }
        Returns: boolean
      }
      cleanup_expired_files: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_admin_analytics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_available_slots: {
        Args: { p_date: string; p_duration?: number; p_prestador_id: string }
        Returns: {
          is_available: boolean
          slot_time: string
        }[]
      }
      get_content_analytics: {
        Args: Record<PropertyKey, never>
        Returns: {
          category: string
          content_id: string
          daily_views: number
          monthly_views: number
          title: string
          total_views: number
          weekly_views: number
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_content_view_count: {
        Args: { content_id: string; user_id_param?: string }
        Returns: undefined
      }
      log_admin_action: {
        Args: {
          p_action_type: string
          p_admin_user_id: string
          p_details?: Json
          p_metadata?: Json
          p_target_id?: string
          p_target_type: string
        }
        Returns: string
      }
      log_user_activity: {
        Args: {
          p_activity_description: string
          p_activity_type: string
          p_metadata?: Json
          p_related_id?: string
          p_user_id: string
        }
        Returns: string
      }
      track_file_access: {
        Args: { p_file_id: string }
        Returns: undefined
      }
      use_session: {
        Args: {
          p_allocation_type?: string
          p_notes?: string
          p_prestador_id?: string
          p_session_date?: string
          p_session_type?: string
          p_user_id: string
        }
        Returns: string
      }
      use_session_with_validation: {
        Args: {
          p_allocation_type?: string
          p_notes?: string
          p_prestador_id?: string
          p_session_date?: string
          p_session_type?: string
          p_user_id: string
        }
        Returns: string
      }
      validate_password_strength: {
        Args: { password_text: string }
        Returns: Json
      }
    }
    Enums: {
      content_category: "psicologica" | "juridica" | "medica"
      content_type: "article"
      user_role: "admin" | "hr" | "user" | "prestador"
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
      content_category: ["psicologica", "juridica", "medica"],
      content_type: ["article"],
      user_role: ["admin", "hr", "user", "prestador"],
    },
  },
} as const
