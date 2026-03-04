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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      challenges: {
        Row: {
          action_type: string | null
          created_at: string
          description: string
          id: string
          is_active: boolean
          points: number
          title: string
          type: string
        }
        Insert: {
          action_type?: string | null
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          points?: number
          title: string
          type?: string
        }
        Update: {
          action_type?: string | null
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          points?: number
          title?: string
          type?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
          user_name: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
          user_name: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
          user_name?: string
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
      letter_templates: {
        Row: {
          category: string
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
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
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments: number | null
          content: string
          created_at: string | null
          id: string
          is_liked: boolean | null
          likes: number | null
          media_type: string | null
          media_url: string | null
          media_urls: Json | null
          shares: number | null
          tags: string[] | null
          user_id: string
          user_name: string
        }
        Insert: {
          comments?: number | null
          content: string
          created_at?: string | null
          id?: string
          is_liked?: boolean | null
          likes?: number | null
          media_type?: string | null
          media_url?: string | null
          media_urls?: Json | null
          shares?: number | null
          tags?: string[] | null
          user_id: string
          user_name: string
        }
        Update: {
          comments?: number | null
          content?: string
          created_at?: string | null
          id?: string
          is_liked?: boolean | null
          likes?: number | null
          media_type?: string | null
          media_url?: string | null
          media_urls?: Json | null
          shares?: number | null
          tags?: string[] | null
          user_id?: string
          user_name?: string
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
          eco_points: number | null
          email: string
          id: string
          last_active_at: string | null
          letters_sent: number | null
          location: string | null
          name: string
          phone: string | null
          posts_created: number | null
          sex: string | null
          streak: number | null
          swarms_joined: number | null
          top_concern: string | null
          trees_planted: number | null
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
          eco_points?: number | null
          email: string
          id?: string
          last_active_at?: string | null
          letters_sent?: number | null
          location?: string | null
          name: string
          phone?: string | null
          posts_created?: number | null
          sex?: string | null
          streak?: number | null
          swarms_joined?: number | null
          top_concern?: string | null
          trees_planted?: number | null
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
          eco_points?: number | null
          email?: string
          id?: string
          last_active_at?: string | null
          letters_sent?: number | null
          location?: string | null
          name?: string
          phone?: string | null
          posts_created?: number | null
          sex?: string | null
          streak?: number | null
          swarms_joined?: number | null
          top_concern?: string | null
          trees_planted?: number | null
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
      recipients: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          id: string
          is_active: boolean
          name: string
          organization: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          id?: string
          is_active?: boolean
          name: string
          organization: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          is_active?: boolean
          name?: string
          organization?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      swarm_memberships: {
        Row: {
          id: string
          joined_at: string
          swarm_id: string
          user_id: string
          votes: number
        }
        Insert: {
          id?: string
          joined_at?: string
          swarm_id: string
          user_id: string
          votes?: number
        }
        Update: {
          id?: string
          joined_at?: string
          swarm_id?: string
          user_id?: string
          votes?: number
        }
        Relationships: [
          {
            foreignKeyName: "swarm_memberships_swarm_id_fkey"
            columns: ["swarm_id"]
            isOneToOne: false
            referencedRelation: "public_swarms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swarm_memberships_swarm_id_fkey"
            columns: ["swarm_id"]
            isOneToOne: false
            referencedRelation: "swarms"
            referencedColumns: ["id"]
          },
        ]
      }
      swarms: {
        Row: {
          category: string
          created_at: string
          created_by: string
          current_signatures: number
          description: string
          goal: string
          id: string
          image_url: string | null
          name: string
          org_name: string | null
          participants: number
          phone: string | null
          social_links: string | null
          target_signatures: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by: string
          current_signatures?: number
          description: string
          goal: string
          id?: string
          image_url?: string | null
          name: string
          org_name?: string | null
          participants?: number
          phone?: string | null
          social_links?: string | null
          target_signatures?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          current_signatures?: number
          description?: string
          goal?: string
          id?: string
          image_url?: string | null
          name?: string
          org_name?: string | null
          participants?: number
          phone?: string | null
          social_links?: string | null
          target_signatures?: number
          updated_at?: string
        }
        Relationships: []
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
      user_challenges: {
        Row: {
          challenge_id: string
          completed_at: string
          id: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string
          id?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
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
      leaderboard: {
        Row: {
          avatar_url: string | null
          eco_points: number | null
          id: string | null
          name: string | null
          rank: number | null
          role: string | null
          streak: number | null
          user_id: string | null
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          county: string | null
          courses_completed: number | null
          eco_points: number | null
          letters_sent: number | null
          location: string | null
          name: string | null
          posts_created: number | null
          streak: number | null
          swarms_joined: number | null
          top_concern: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          county?: string | null
          courses_completed?: number | null
          eco_points?: number | null
          letters_sent?: number | null
          location?: string | null
          name?: string | null
          posts_created?: number | null
          streak?: number | null
          swarms_joined?: number | null
          top_concern?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          county?: string | null
          courses_completed?: number | null
          eco_points?: number | null
          letters_sent?: number | null
          location?: string | null
          name?: string | null
          posts_created?: number | null
          streak?: number | null
          swarms_joined?: number | null
          top_concern?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      public_swarms: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          current_signatures: number | null
          description: string | null
          goal: string | null
          id: string | null
          image_url: string | null
          name: string | null
          org_name: string | null
          participants: number | null
          social_links: string | null
          target_signatures: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          current_signatures?: number | null
          description?: string | null
          goal?: string | null
          id?: string | null
          image_url?: string | null
          name?: string | null
          org_name?: string | null
          participants?: number | null
          social_links?: string | null
          target_signatures?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          current_signatures?: number | null
          description?: string | null
          goal?: string | null
          id?: string | null
          image_url?: string | null
          name?: string | null
          org_name?: string | null
          participants?: number | null
          social_links?: string | null
          target_signatures?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_likes: { Args: { p_post_ids: string[] }; Returns: string[] }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      join_swarm: {
        Args: { p_swarm_id: string; p_votes?: number }
        Returns: Json
      }
      toggle_post_like: { Args: { p_post_id: string }; Returns: Json }
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
      app_role: ["ecowarrior", "ecodeveloper", "admin"],
    },
  },
} as const
