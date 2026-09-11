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
      ab_assignments: {
        Row: {
          converted: boolean
          created_at: string
          experiment_id: string
          id: string
          user_id: string
          variant: string
        }
        Insert: {
          converted?: boolean
          created_at?: string
          experiment_id: string
          id?: string
          user_id: string
          variant: string
        }
        Update: {
          converted?: boolean
          created_at?: string
          experiment_id?: string
          id?: string
          user_id?: string
          variant?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_assignments_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "ab_experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_experiments: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string | null
          id: string
          is_active: boolean
          name: string
          starts_at: string | null
          target_pages: string[] | null
          updated_at: string
          variants: Json
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          name: string
          starts_at?: string | null
          target_pages?: string[] | null
          updated_at?: string
          variants?: Json
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          starts_at?: string | null
          target_pages?: string[] | null
          updated_at?: string
          variants?: Json
        }
        Relationships: []
      }
      co2_matrix: {
        Row: {
          action_type: string
          co2_kg_per_action: number
          created_at: string
          description: string | null
          id: string
        }
        Insert: {
          action_type: string
          co2_kg_per_action?: number
          created_at?: string
          description?: string | null
          id?: string
        }
        Update: {
          action_type?: string
          co2_kg_per_action?: number
          created_at?: string
          description?: string | null
          id?: string
        }
        Relationships: []
      }
      coupon_redemptions: {
        Row: {
          coupon_id: string
          created_at: string
          discount_amount: number
          id: string
          product_id: string | null
          user_id: string
        }
        Insert: {
          coupon_id: string
          created_at?: string
          discount_amount?: number
          id?: string
          product_id?: string | null
          user_id: string
        }
        Update: {
          coupon_id?: string
          created_at?: string
          discount_amount?: number
          id?: string
          product_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          discount_type: string
          discount_value: number
          ends_at: string | null
          id: string
          is_active: boolean
          max_redemptions: number | null
          starts_at: string
          times_used: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          ends_at?: string | null
          id?: string
          is_active?: boolean
          max_redemptions?: number | null
          starts_at?: string
          times_used?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          ends_at?: string | null
          id?: string
          is_active?: boolean
          max_redemptions?: number | null
          starts_at?: string
          times_used?: number
          updated_at?: string
        }
        Relationships: []
      }
      course_completions: {
        Row: {
          completed_at: string | null
          id: string
          module_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          module_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          module_id?: string
          user_id?: string
        }
        Relationships: []
      }
      course_questions: {
        Row: {
          correct_index: number
          course_id: string
          created_at: string
          id: string
          options: string[]
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          correct_index?: number
          course_id: string
          created_at?: string
          id?: string
          options?: string[]
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          correct_index?: number
          course_id?: string
          created_at?: string
          id?: string
          options?: string[]
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_questions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_sections: {
        Row: {
          content: string
          course_id: string
          created_at: string
          id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          course_id: string
          created_at?: string
          id?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          course_id?: string
          created_at?: string
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_sections_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_sponsorships: {
        Row: {
          admin_notes: string | null
          course_id: string
          created_at: string
          id: string
          message: string | null
          sponsor_logo_url: string | null
          sponsor_name: string
          sponsor_user_id: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          course_id: string
          created_at?: string
          id?: string
          message?: string | null
          sponsor_logo_url?: string | null
          sponsor_name: string
          sponsor_user_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          course_id?: string
          created_at?: string
          id?: string
          message?: string | null
          sponsor_logo_url?: string | null
          sponsor_name?: string
          sponsor_user_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_sponsorships_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string
          duration: string
          id: string
          is_active: boolean
          points: number
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description: string
          duration?: string
          id?: string
          is_active?: boolean
          points?: number
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          duration?: string
          id?: string
          is_active?: boolean
          points?: number
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      merch_orders: {
        Row: {
          created_at: string
          id: string
          merch_id: string
          phone: string | null
          points_used: number
          quantity: number
          shipping_address: string | null
          status: string
          total_price: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          merch_id: string
          phone?: string | null
          points_used?: number
          quantity?: number
          shipping_address?: string | null
          status?: string
          total_price?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          merch_id?: string
          phone?: string | null
          points_used?: number
          quantity?: number
          shipping_address?: string | null
          status?: string
          total_price?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "merch_orders_merch_id_fkey"
            columns: ["merch_id"]
            isOneToOne: false
            referencedRelation: "merch_products"
            referencedColumns: ["id"]
          },
        ]
      }
      merch_products: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price: number
          stock: number
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price?: number
          stock?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price?: number
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          product_id: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          product_id?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          product_id?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          reference_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          reference_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          reference_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      org_profiles: {
        Row: {
          certifications_url: string | null
          company_name: string
          company_type: string
          created_at: string
          description_of_work: string | null
          id: string
          main_products_services: string[] | null
          social_facebook: string | null
          social_instagram: string | null
          social_linkedin: string | null
          social_twitter: string | null
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          certifications_url?: string | null
          company_name: string
          company_type?: string
          created_at?: string
          description_of_work?: string | null
          id?: string
          main_products_services?: string[] | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          social_twitter?: string | null
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          certifications_url?: string | null
          company_name?: string
          company_type?: string
          created_at?: string
          description_of_work?: string | null
          id?: string
          main_products_services?: string[] | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          social_twitter?: string | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      platform_analytics: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          page: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          page?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          page?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      platform_commissions: {
        Row: {
          buyer_id: string
          commission_amount: number
          commission_rate: number
          created_at: string
          id: string
          sale_amount: number
          seller_id: string
          transaction_id: string
        }
        Insert: {
          buyer_id: string
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          id?: string
          sale_amount?: number
          seller_id: string
          transaction_id: string
        }
        Update: {
          buyer_id?: string
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          id?: string
          sale_amount?: number
          seller_id?: string
          transaction_id?: string
        }
        Relationships: []
      }
      poll_responses: {
        Row: {
          created_at: string
          feedback_text: string | null
          id: string
          poll_id: string
          selected_option: number
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          poll_id: string
          selected_option: number
          user_id: string
        }
        Update: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          poll_id?: string
          selected_option?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_responses_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          ends_at: string | null
          id: string
          is_active: boolean
          options: Json
          poll_type: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          options?: Json
          poll_type?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          options?: Json
          poll_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_type: string
          location: string | null
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_type: string
          location?: string | null
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interaction_type?: string
          location?: string | null
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_interactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          badges: string[] | null
          category: string
          contact_phone: string
          created_at: string
          description: string
          id: string
          location: string | null
          media_type: string | null
          media_url: string | null
          media_urls: Json | null
          org_name: string
          price: number
          product_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          badges?: string[] | null
          category: string
          contact_phone: string
          created_at?: string
          description: string
          id?: string
          location?: string | null
          media_type?: string | null
          media_url?: string | null
          media_urls?: Json | null
          org_name: string
          price?: number
          product_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          badges?: string[] | null
          category?: string
          contact_phone?: string
          created_at?: string
          description?: string
          id?: string
          location?: string | null
          media_type?: string | null
          media_url?: string | null
          media_urls?: Json | null
          org_name?: string
          price?: number
          product_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          bio: string | null
          co2_saved: number | null
          county: string | null
          courses_completed: number | null
          created_at: string
          email: string
          id: string
          last_active_at: string | null
          location: string | null
          name: string
          notify_new_content: boolean
          phone: string | null
          sex: string | null
          top_concern: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          co2_saved?: number | null
          county?: string | null
          courses_completed?: number | null
          created_at?: string
          email: string
          id?: string
          last_active_at?: string | null
          location?: string | null
          name: string
          notify_new_content?: boolean
          phone?: string | null
          sex?: string | null
          top_concern?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          co2_saved?: number | null
          county?: string | null
          courses_completed?: number | null
          created_at?: string
          email?: string
          id?: string
          last_active_at?: string | null
          location?: string | null
          name?: string
          notify_new_content?: boolean
          phone?: string | null
          sex?: string | null
          top_concern?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      seller_payouts: {
        Row: {
          amount: number
          created_at: string
          id: string
          mpesa_phone: string | null
          mpesa_receipt: string | null
          processed_at: string | null
          seller_id: string
          status: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          mpesa_phone?: string | null
          mpesa_receipt?: string | null
          processed_at?: string | null
          seller_id: string
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          mpesa_phone?: string | null
          mpesa_receipt?: string | null
          processed_at?: string | null
          seller_id?: string
          status?: string
        }
        Relationships: []
      }
      seller_ratings: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          rating: number
          review: string | null
          seller_id: string
          transaction_id: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          rating: number
          review?: string | null
          seller_id: string
          transaction_id: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          rating?: number
          review?: string | null
          seller_id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_ratings_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string
          expires_at: string
          id: string
          mpesa_phone: string | null
          mpesa_receipt: string | null
          payment_method: string | null
          plan: string
          starts_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          expires_at?: string
          id?: string
          mpesa_phone?: string | null
          mpesa_receipt?: string | null
          payment_method?: string | null
          plan?: string
          starts_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          expires_at?: string
          id?: string
          mpesa_phone?: string | null
          mpesa_receipt?: string | null
          payment_method?: string | null
          plan?: string
          starts_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transaction_disputes: {
        Row: {
          created_at: string
          id: string
          raised_by: string
          reason: string
          resolution: string | null
          resolved_at: string | null
          status: string
          transaction_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          raised_by: string
          reason: string
          resolution?: string | null
          resolved_at?: string | null
          status?: string
          transaction_id: string
        }
        Update: {
          created_at?: string
          id?: string
          raised_by?: string
          reason?: string
          resolution?: string | null
          resolved_at?: string | null
          status?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_disputes_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          bonus_points: number
          buyer_id: string
          cash_paid: number
          created_at: string
          id: string
          mpesa_checkout_id: string | null
          mpesa_receipt: string | null
          payment_method: string | null
          points_used: number
          product_id: string | null
          product_name: string
          seller_id: string
          status: string
          total_price: number
          verification_status: string | null
          verified_at: string | null
        }
        Insert: {
          bonus_points?: number
          buyer_id: string
          cash_paid?: number
          created_at?: string
          id?: string
          mpesa_checkout_id?: string | null
          mpesa_receipt?: string | null
          payment_method?: string | null
          points_used?: number
          product_id?: string | null
          product_name: string
          seller_id: string
          status?: string
          total_price?: number
          verification_status?: string | null
          verified_at?: string | null
        }
        Update: {
          bonus_points?: number
          buyer_id?: string
          cash_paid?: number
          created_at?: string
          id?: string
          mpesa_checkout_id?: string | null
          mpesa_receipt?: string | null
          payment_method?: string | null
          points_used?: number
          product_id?: string | null
          product_name?: string
          seller_id?: string
          status?: string
          total_price?: number
          verification_status?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
      my_course_sponsorships: {
        Row: {
          course_id: string | null
          created_at: string | null
          id: string | null
          message: string | null
          sponsor_logo_url: string | null
          sponsor_name: string | null
          sponsor_user_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          id?: string | null
          message?: string | null
          sponsor_logo_url?: string | null
          sponsor_name?: string | null
          sponsor_user_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          id?: string | null
          message?: string | null
          sponsor_logo_url?: string | null
          sponsor_name?: string | null
          sponsor_user_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_sponsorships_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          county: string | null
          courses_completed: number | null
          location: string | null
          name: string | null
          top_concern: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          county?: string | null
          courses_completed?: number | null
          location?: string | null
          name?: string | null
          top_concern?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          county?: string | null
          courses_completed?: number | null
          location?: string | null
          name?: string | null
          top_concern?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      award_co2: {
        Args: {
          p_action_type: string
          p_multiplier?: number
          p_user_id: string
        }
        Returns: number
      }
      count_recent_actions: {
        Args: {
          p_table_name: string
          p_user_id: string
          p_window_minutes?: number
        }
        Returns: number
      }
      decrement_merch_stock: {
        Args: { p_merch_id: string; p_quantity: number }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_premium: { Args: { p_user_id: string }; Returns: boolean }
      normalize_rich_text: { Args: { p_input: string }; Returns: string }
      validate_coupon: {
        Args: { p_amount: number; p_code: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "ecowarrior" | "ecodeveloper" | "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["ecowarrior", "ecodeveloper", "admin"],
    },
  },
} as const
