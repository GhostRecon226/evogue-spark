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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      academy_settings: {
        Row: {
          academy_name: string
          contact_email: string | null
          id: string
          location: string | null
          logo_url: string | null
          paystack_public_key: string | null
          resend_api_key: string | null
          updated_at: string
          updated_by: string | null
          whatsapp_number: string | null
        }
        Insert: {
          academy_name?: string
          contact_email?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          paystack_public_key?: string | null
          resend_api_key?: string | null
          updated_at?: string
          updated_by?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          academy_name?: string
          contact_email?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          paystack_public_key?: string | null
          resend_api_key?: string | null
          updated_at?: string
          updated_by?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          cohort_id: string
          created_at: string
          created_by: string | null
          id: string
          message: string
          title: string
        }
        Insert: {
          cohort_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          message: string
          title: string
        }
        Update: {
          cohort_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          message?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          country: string | null
          course_slug: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          message: string | null
          status: string
          whatsapp: string | null
        }
        Insert: {
          country?: string | null
          course_slug?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          message?: string | null
          status?: string
          whatsapp?: string | null
        }
        Update: {
          country?: string | null
          course_slug?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          status?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      capstone_submissions: {
        Row: {
          admin_feedback: string | null
          cohort_id: string | null
          course_id: string
          created_at: string
          file_url: string | null
          id: string
          instructor_note: string | null
          instructor_recommendation: boolean
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["capstone_status"]
          student_id: string
          submission_text: string
          submission_url: string | null
          submitted_at: string
        }
        Insert: {
          admin_feedback?: string | null
          cohort_id?: string | null
          course_id: string
          created_at?: string
          file_url?: string | null
          id?: string
          instructor_note?: string | null
          instructor_recommendation?: boolean
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["capstone_status"]
          student_id: string
          submission_text: string
          submission_url?: string | null
          submitted_at?: string
        }
        Update: {
          admin_feedback?: string | null
          cohort_id?: string | null
          course_id?: string
          created_at?: string
          file_url?: string | null
          id?: string
          instructor_note?: string | null
          instructor_recommendation?: boolean
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["capstone_status"]
          student_id?: string
          submission_text?: string
          submission_url?: string | null
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "capstone_submissions_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          cert_id: string | null
          certificate_url: string | null
          cohort_id: string | null
          course_id: string
          id: string
          issued_at: string
          registration_number: string | null
          student_id: string
        }
        Insert: {
          cert_id?: string | null
          certificate_url?: string | null
          cohort_id?: string | null
          course_id: string
          id?: string
          issued_at?: string
          registration_number?: string | null
          student_id: string
        }
        Update: {
          cert_id?: string | null
          certificate_url?: string | null
          cohort_id?: string | null
          course_id?: string
          id?: string
          issued_at?: string
          registration_number?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cohorts: {
        Row: {
          capstone_brief_text: string | null
          capstone_brief_url: string | null
          capstone_released: boolean
          course_id: string
          created_at: string
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string
        }
        Insert: {
          capstone_brief_text?: string | null
          capstone_brief_url?: string | null
          capstone_released?: boolean
          course_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string
        }
        Update: {
          capstone_brief_text?: string | null
          capstone_brief_url?: string | null
          capstone_released?: boolean
          course_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "cohorts_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
        }
        Relationships: []
      }
      coupon_codes: {
        Row: {
          active: boolean
          applicable_courses: string[] | null
          code: string
          created_at: string
          description: string | null
          discount_percentage: number | null
          discount_type: string
          discount_value: number
          expiry_date: string | null
          id: string
          times_used: number
          updated_at: string
          usage_limit: number | null
        }
        Insert: {
          active?: boolean
          applicable_courses?: string[] | null
          code: string
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          discount_type?: string
          discount_value: number
          expiry_date?: string | null
          id?: string
          times_used?: number
          updated_at?: string
          usage_limit?: number | null
        }
        Update: {
          active?: boolean
          applicable_courses?: string[] | null
          code?: string
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          discount_type?: string
          discount_value?: number
          expiry_date?: string | null
          id?: string
          times_used?: number
          updated_at?: string
          usage_limit?: number | null
        }
        Relationships: []
      }
      coupon_redemptions: {
        Row: {
          applied_at: string
          coupon_code: string
          coupon_id: string | null
          course_slug: string | null
          discount_applied: number | null
          discount_type: string
          discount_value: number
          final_amount: number | null
          id: string
          original_amount: number | null
          student_email: string | null
          student_id: string
        }
        Insert: {
          applied_at?: string
          coupon_code: string
          coupon_id?: string | null
          course_slug?: string | null
          discount_applied?: number | null
          discount_type: string
          discount_value: number
          final_amount?: number | null
          id?: string
          original_amount?: number | null
          student_email?: string | null
          student_id: string
        }
        Update: {
          applied_at?: string
          coupon_code?: string
          coupon_id?: string | null
          course_slug?: string | null
          discount_applied?: number | null
          discount_type?: string
          discount_value?: number
          final_amount?: number | null
          id?: string
          original_amount?: number | null
          student_email?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupon_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_redemptions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_instructors: {
        Row: {
          course_id: string
          created_at: string
          id: string
          instructor_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          instructor_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          instructor_id?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          capstone_brief: string | null
          capstone_brief_url: string | null
          capstone_released: boolean
          category: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          duration: string | null
          id: string
          instructor_id: string | null
          is_active: boolean
          is_published: boolean
          level: string | null
          price: string | null
          price_ngn: number | null
          price_usd: number | null
          slug: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          capstone_brief?: string | null
          capstone_brief_url?: string | null
          capstone_released?: boolean
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          instructor_id?: string | null
          is_active?: boolean
          is_published?: boolean
          level?: string | null
          price?: string | null
          price_ngn?: number | null
          price_usd?: number | null
          slug: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          capstone_brief?: string | null
          capstone_brief_url?: string | null
          capstone_released?: boolean
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          instructor_id?: string | null
          is_active?: boolean
          is_published?: boolean
          level?: string | null
          price?: string | null
          price_ngn?: number | null
          price_usd?: number | null
          slug?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      enrollment_inquiries: {
        Row: {
          course: string
          created_at: string
          email: string
          full_name: string
          id: string
          whatsapp: string
        }
        Insert: {
          course: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          whatsapp: string
        }
        Update: {
          course?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          whatsapp?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          cohort_id: string | null
          course_id: string
          enrolled_at: string
          enrolled_by: string | null
          id: string
          paid_at: string | null
          payment_reference: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          status: string
          student_id: string
        }
        Insert: {
          cohort_id?: string | null
          course_id: string
          enrolled_at?: string
          enrolled_by?: string | null
          id?: string
          paid_at?: string | null
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          status?: string
          student_id: string
        }
        Update: {
          cohort_id?: string | null
          course_id?: string
          enrolled_at?: string
          enrolled_by?: string | null
          id?: string
          paid_at?: string | null
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enrolment_requests: {
        Row: {
          country: string
          course: string
          created_at: string
          email: string
          full_name: string
          id: string
          message: string | null
          status: string
          whatsapp: string
        }
        Insert: {
          country: string
          course: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          message?: string | null
          status?: string
          whatsapp: string
        }
        Update: {
          country?: string
          course?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          status?: string
          whatsapp?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          course_interest: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_read: boolean
          message: string
          source: string
          type: string
          whatsapp_number: string | null
        }
        Insert: {
          course_interest?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_read?: boolean
          message: string
          source?: string
          type?: string
          whatsapp_number?: string | null
        }
        Update: {
          course_interest?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_read?: boolean
          message?: string
          source?: string
          type?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          course_id: string
          created_at: string
          id: string
          lesson_id: string
          student_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          course_id: string
          created_at?: string
          id?: string
          lesson_id: string
          student_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          course_id?: string
          created_at?: string
          id?: string
          lesson_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          cohort_id: string | null
          course_id: string
          created_at: string
          id: string
          is_published: boolean
          lesson_date: string | null
          lesson_number: number
          pdf_url: string | null
          title: string
          updated_at: string
          uploaded_by: string | null
          zoom_link: string | null
          zoom_live_link: string | null
          zoom_recording_link: string | null
        }
        Insert: {
          cohort_id?: string | null
          course_id: string
          created_at?: string
          id?: string
          is_published?: boolean
          lesson_date?: string | null
          lesson_number: number
          pdf_url?: string | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
          zoom_link?: string | null
          zoom_live_link?: string | null
          zoom_recording_link?: string | null
        }
        Update: {
          cohort_id?: string | null
          course_id?: string
          created_at?: string
          id?: string
          is_published?: boolean
          lesson_date?: string | null
          lesson_number?: number
          pdf_url?: string | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
          zoom_link?: string | null
          zoom_live_link?: string | null
          zoom_recording_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          student_id: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          student_id: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          student_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          coupon_id: string | null
          course_id: string
          created_at: string
          currency: string
          discount_applied: number
          flutterwave_tx_id: string | null
          id: string
          original_amount: number | null
          paid_at: string | null
          payment_method: string | null
          payment_status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          coupon_id?: string | null
          course_id: string
          created_at?: string
          currency: string
          discount_applied?: number
          flutterwave_tx_id?: string | null
          id?: string
          original_amount?: number | null
          paid_at?: string | null
          payment_method?: string | null
          payment_status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          coupon_id?: string | null
          course_id?: string
          created_at?: string
          currency?: string
          discount_applied?: number
          flutterwave_tx_id?: string | null
          id?: string
          original_amount?: number | null
          paid_at?: string | null
          payment_method?: string | null
          payment_status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupon_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          applied_coupon_at: string | null
          applied_coupon_code: string | null
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          registration_number: string | null
          role: string
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          applied_coupon_at?: string | null
          applied_coupon_code?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          registration_number?: string | null
          role?: string
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          applied_coupon_at?: string | null
          applied_coupon_code?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          registration_number?: string | null
          role?: string
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      registration_counters: {
        Row: {
          last_seq: number
          year: number
        }
        Insert: {
          last_seq?: number
          year: number
        }
        Update: {
          last_seq?: number
          year?: number
        }
        Relationships: []
      }
      role_change_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          from_role: Database["public"]["Enums"]["app_role"]
          id: string
          reason: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          to_role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          from_role: Database["public"]["Enums"]["app_role"]
          id?: string
          reason: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          to_role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          from_role?: Database["public"]["Enums"]["app_role"]
          id?: string
          reason?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          to_role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      student_notes: {
        Row: {
          created_at: string
          id: string
          lesson_id: string
          note_text: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id: string
          note_text?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string
          note_text?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_notes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      academy_settings_public: {
        Row: {
          academy_name: string | null
          contact_email: string | null
          id: string | null
          location: string | null
          logo_url: string | null
          updated_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          academy_name?: string | null
          contact_email?: string | null
          id?: string | null
          location?: string | null
          logo_url?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          academy_name?: string | null
          contact_email?: string | null
          id?: string | null
          location?: string | null
          logo_url?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      generate_registration_number: { Args: never; Returns: string }
      get_coupon_preview: {
        Args: { _code: string }
        Returns: {
          code: string
          discount_type: string
          discount_value: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_course_instructor: {
        Args: { _course_id: string; _user_id: string }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      redeem_coupon: {
        Args: { _code: string }
        Returns: {
          code: string
          discount_type: string
          discount_value: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "instructor" | "student"
      capstone_status: "pending" | "recommended" | "approved" | "rejected"
      payment_status: "pending" | "paid" | "unpaid"
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
      app_role: ["admin", "instructor", "student"],
      capstone_status: ["pending", "recommended", "approved", "rejected"],
      payment_status: ["pending", "paid", "unpaid"],
    },
  },
} as const
