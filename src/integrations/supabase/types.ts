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
          entity_type: string | null
          id: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_date: string | null
          booking_source: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          chat_session_id: string | null
          company_id: string | null
          created_at: string | null
          end_time: string | null
          feedback: string | null
          id: string
          meeting_link: string | null
          meeting_type: string | null
          notes: string | null
          pillar: string | null
          pillar_specialties: string[] | null
          prediagnostic_completed: boolean | null
          prediagnostic_summary: Json | null
          prestador_id: string | null
          rating: number | null
          rescheduled_at: string | null
          rescheduled_from: string | null
          scheduled_at: string
          session_type: string | null
          start_time: string | null
          status: string | null
          topic: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          booking_date?: string | null
          booking_source?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          chat_session_id?: string | null
          company_id?: string | null
          created_at?: string | null
          end_time?: string | null
          feedback?: string | null
          id?: string
          meeting_link?: string | null
          meeting_type?: string | null
          notes?: string | null
          pillar?: string | null
          pillar_specialties?: string[] | null
          prediagnostic_completed?: boolean | null
          prediagnostic_summary?: Json | null
          prestador_id?: string | null
          rating?: number | null
          rescheduled_at?: string | null
          rescheduled_from?: string | null
          scheduled_at: string
          session_type?: string | null
          start_time?: string | null
          status?: string | null
          topic?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          booking_date?: string | null
          booking_source?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          chat_session_id?: string | null
          company_id?: string | null
          created_at?: string | null
          end_time?: string | null
          feedback?: string | null
          id?: string
          meeting_link?: string | null
          meeting_type?: string | null
          notes?: string | null
          pillar?: string | null
          pillar_specialties?: string[] | null
          prediagnostic_completed?: boolean | null
          prediagnostic_summary?: Json | null
          prestador_id?: string | null
          rating?: number | null
          rescheduled_at?: string | null
          rescheduled_from?: string | null
          scheduled_at?: string
          session_type?: string | null
          start_time?: string | null
          status?: string | null
          topic?: string | null
          updated_at?: string | null
          user_id?: string | null
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
          {
            foreignKeyName: "bookings_rescheduled_from_fkey"
            columns: ["rescheduled_from"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      change_requests: {
        Row: {
          created_at: string | null
          current_data: Json | null
          id: string
          prestador_id: string | null
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
          prestador_id?: string | null
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
          prestador_id?: string | null
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
          {
            foreignKeyName: "change_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          role: string | null
          sender_id: string | null
          sender_role: string | null
          session_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string | null
          sender_id?: string | null
          sender_role?: string | null
          session_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string | null
          sender_id?: string | null
          sender_role?: string | null
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
          provider_id: string | null
          satisfaction_rating: string | null
          session_booked_by_specialist: string | null
          status: string | null
          title: string | null
          updated_at: string | null
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
          provider_id?: string | null
          satisfaction_rating?: string | null
          session_booked_by_specialist?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
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
          provider_id?: string | null
          satisfaction_rating?: string | null
          session_booked_by_specialist?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          email: string
          final_notes: string | null
          id: string
          industry: string | null
          is_active: boolean | null
          logo_url: string | null
          name: string
          nuit: string | null
          phone: string | null
          plan_type: string | null
          sessions_allocated: number | null
          sessions_used: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          email: string
          final_notes?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          nuit?: string | null
          phone?: string | null
          plan_type?: string | null
          sessions_allocated?: number | null
          sessions_used?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          email?: string
          final_notes?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          nuit?: string | null
          phone?: string | null
          plan_type?: string | null
          sessions_allocated?: number | null
          sessions_used?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      company_employees: {
        Row: {
          company_id: string | null
          id: string
          joined_at: string | null
          sessions_allocated: number | null
          sessions_used: number | null
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          id?: string
          joined_at?: string | null
          sessions_allocated?: number | null
          sessions_used?: number | null
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          id?: string
          joined_at?: string | null
          sessions_allocated?: number | null
          sessions_used?: number | null
          user_id?: string | null
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
          created_at: string | null
          domain: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          domain?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          domain?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      content_views: {
        Row: {
          content_id: string | null
          duration_seconds: number | null
          id: string
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          content_id?: string | null
          duration_seconds?: number | null
          id?: string
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          content_id?: string | null
          duration_seconds?: number | null
          id?: string
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_views_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "self_help_content"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          rating: number | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          accepted_at: string | null
          company_id: string | null
          created_at: string | null
          email: string | null
          expires_at: string | null
          id: string
          invite_code: string
          invited_by: string | null
          role: string | null
          sent_at: string | null
          sessions_allocated: number | null
          status: string
          user_type: string | null
        }
        Insert: {
          accepted_at?: string | null
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          invite_code: string
          invited_by?: string | null
          role?: string | null
          sent_at?: string | null
          sessions_allocated?: number | null
          status?: string
          user_type?: string | null
        }
        Update: {
          accepted_at?: string | null
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          invite_code?: string
          invited_by?: string | null
          role?: string | null
          sent_at?: string | null
          sessions_allocated?: number | null
          status?: string
          user_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invites_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          priority: string | null
          read_at: string | null
          related_booking_id: string | null
          title: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          priority?: string | null
          read_at?: string | null
          related_booking_id?: string | null
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          priority?: string | null
          read_at?: string | null
          related_booking_id?: string | null
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_booking_id_fkey"
            columns: ["related_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
          work_stress_level?: number | null
        }
        Relationships: []
      }
      prestadores: {
        Row: {
          biography: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          languages: string[] | null
          name: string | null
          photo_url: string | null
          pillar_specialties: string[] | null
          session_duration: number | null
          specialties: string[] | null
          specialty: string | null
          user_id: string | null
          video_url: string | null
        }
        Insert: {
          biography?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          languages?: string[] | null
          name?: string | null
          photo_url?: string | null
          pillar_specialties?: string[] | null
          session_duration?: number | null
          specialties?: string[] | null
          specialty?: string | null
          user_id?: string | null
          video_url?: string | null
        }
        Update: {
          biography?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          languages?: string[] | null
          name?: string | null
          photo_url?: string | null
          pillar_specialties?: string[] | null
          session_duration?: number | null
          specialties?: string[] | null
          specialty?: string | null
          user_id?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prestadores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          has_completed_onboarding: boolean | null
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
          has_completed_onboarding?: boolean | null
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
          has_completed_onboarding?: boolean | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      psychological_tests: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          interpretation_guide: Json
          is_active: boolean | null
          name: string
          questions: Json
          scoring_rules: Json
          test_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          interpretation_guide: Json
          is_active?: boolean | null
          name: string
          questions: Json
          scoring_rules: Json
          test_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          interpretation_guide?: Json
          is_active?: boolean | null
          name?: string
          questions?: Json
          scoring_rules?: Json
          test_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          content: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
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
          description?: string | null
          id?: string
          is_active?: boolean | null
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
          description?: string | null
          id?: string
          is_active?: boolean | null
          pillar?: string | null
          resource_type?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      self_help_content: {
        Row: {
          author: string | null
          category: string | null
          content_body: string | null
          content_type: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          summary: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author?: string | null
          category?: string | null
          content_body?: string | null
          content_type?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          summary?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author?: string | null
          category?: string | null
          content_body?: string | null
          content_type?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          summary?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "self_help_content_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      session_notes: {
        Row: {
          booking_id: string | null
          created_at: string | null
          id: string
          is_private: boolean | null
          notes: string
          prestador_id: string | null
          updated_at: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          notes: string
          prestador_id?: string | null
          updated_at?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          notes?: string
          prestador_id?: string | null
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
      specialist_analytics: {
        Row: {
          ai_resolved: number | null
          created_at: string | null
          date: string
          id: string
          phone_escalated: number | null
          pillar: string | null
          satisfied_users: number | null
          sessions_booked: number | null
          total_chats: number | null
          unsatisfied_users: number | null
        }
        Insert: {
          ai_resolved?: number | null
          created_at?: string | null
          date: string
          id?: string
          phone_escalated?: number | null
          pillar?: string | null
          satisfied_users?: number | null
          sessions_booked?: number | null
          total_chats?: number | null
          unsatisfied_users?: number | null
        }
        Update: {
          ai_resolved?: number | null
          created_at?: string | null
          date?: string
          id?: string
          phone_escalated?: number | null
          pillar?: string | null
          satisfied_users?: number | null
          sessions_booked?: number | null
          total_chats?: number | null
          unsatisfied_users?: number | null
        }
        Relationships: []
      }
      specialist_assignments: {
        Row: {
          assigned_by: string | null
          company_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          pillars: string[] | null
          specialist_id: string
        }
        Insert: {
          assigned_by?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          pillars?: string[] | null
          specialist_id: string
        }
        Update: {
          assigned_by?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          pillars?: string[] | null
          specialist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialist_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialist_assignments_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      test_results: {
        Row: {
          answers: Json
          completed_at: string | null
          consent_given: boolean | null
          id: string
          interpretation: string | null
          is_anonymous: boolean | null
          score: number | null
          test_id: string | null
          user_id: string | null
        }
        Insert: {
          answers: Json
          completed_at?: string | null
          consent_given?: boolean | null
          id?: string
          interpretation?: string | null
          is_anonymous?: boolean | null
          score?: number | null
          test_id?: string | null
          user_id?: string | null
        }
        Update: {
          answers?: Json
          completed_at?: string | null
          consent_given?: boolean | null
          id?: string
          interpretation?: string | null
          is_anonymous?: boolean | null
          score?: number | null
          test_id?: string | null
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
      user_milestones: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          milestone_id: string
          milestone_label: string
          points: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          milestone_id: string
          milestone_label: string
          points?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          milestone_id?: string
          milestone_label?: string
          points?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          action_date: string | null
          action_type: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          pillar: string | null
          resource_id: string | null
          user_id: string
        }
        Insert: {
          action_date?: string | null
          action_type?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          pillar?: string | null
          resource_id?: string | null
          user_id: string
        }
        Update: {
          action_date?: string | null
          action_type?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          pillar?: string | null
          resource_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_analytics: {
        Row: {
          active_prestadores: number | null
          active_resources: number | null
          avg_rating: number | null
          pending_bookings: number | null
          sessions_allocated: number | null
          sessions_used: number | null
          total_admins: number | null
          total_bookings: number | null
          total_companies: number | null
          total_prestadores: number | null
          total_users: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      assign_employee_sessions: {
        Args: { _employee_id: string; _quota: number }
        Returns: boolean
      }
      assign_role_to_user: {
        Args: { p_email: string; p_role: string }
        Returns: string
      }
      book_session_with_quota_check: {
        Args: {
          _booking_date: string
          _end_time: string
          _meeting_type?: string
          _pillar_specialties: string[]
          _prestador_id: string
          _session_type: string
          _start_time: string
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
          _refund_quota?: boolean
          _user_id: string
        }
        Returns: Json
      }
      create_invite_code: { Args: { user_type: string }; Returns: Json }
      create_notification: {
        Args: {
          p_action_url?: string
          p_message?: string
          p_metadata?: Json
          p_title?: string
          p_type?: string
          p_user_id: string
        }
        Returns: string
      }
      generate_goals_from_onboarding: {
        Args: { p_user_id: string }
        Returns: undefined
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
      get_platform_utilization: {
        Args: never
        Returns: {
          active_companies: number
          platform_utilization_rate: number
          total_sessions: number
          total_users: number
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
      get_user_primary_role: { Args: { p_user_id: string }; Returns: string }
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
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      increment_content_views: {
        Args: { content_id: string }
        Returns: undefined
      }
      initialize_user_milestones: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      promote_to_admin: { Args: { user_email: string }; Returns: Json }
      validate_access_code: {
        Args: { p_code: string }
        Returns: {
          company_id: string
          company_name: string
          expires_at: string
          invite_id: string
          status: string
          user_type: string
        }[]
      }
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
