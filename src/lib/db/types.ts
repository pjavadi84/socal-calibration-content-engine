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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          body_html: string | null
          category_id: string
          created_at: string
          fact_density_breakdown: Json | null
          fact_density_score: number | null
          faq: Json | null
          generation_batch_id: string | null
          h2_structure: Json | null
          id: string
          json_ld: Json | null
          knowledge_sources: string[] | null
          location_id: string | null
          long_tail_keywords: string[] | null
          meta_description: string | null
          meta_title: string | null
          pillar_id: string
          practitioner_notes_added: boolean | null
          primary_keyword: string | null
          published_at: string | null
          seo_breakdown: Json | null
          seo_keywords: string[] | null
          seo_score: number | null
          slug: string | null
          slug_candidates: string[] | null
          status: string
          title: string | null
          updated_at: string
          word_count: number | null
          wp_post_id: number | null
          wp_post_url: string | null
        }
        Insert: {
          body_html?: string | null
          category_id: string
          created_at?: string
          fact_density_breakdown?: Json | null
          fact_density_score?: number | null
          faq?: Json | null
          generation_batch_id?: string | null
          h2_structure?: Json | null
          id?: string
          json_ld?: Json | null
          knowledge_sources?: string[] | null
          location_id?: string | null
          long_tail_keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          pillar_id: string
          practitioner_notes_added?: boolean | null
          primary_keyword?: string | null
          published_at?: string | null
          seo_breakdown?: Json | null
          seo_keywords?: string[] | null
          seo_score?: number | null
          slug?: string | null
          slug_candidates?: string[] | null
          status?: string
          title?: string | null
          updated_at?: string
          word_count?: number | null
          wp_post_id?: number | null
          wp_post_url?: string | null
        }
        Update: {
          body_html?: string | null
          category_id?: string
          created_at?: string
          fact_density_breakdown?: Json | null
          fact_density_score?: number | null
          faq?: Json | null
          generation_batch_id?: string | null
          h2_structure?: Json | null
          id?: string
          json_ld?: Json | null
          knowledge_sources?: string[] | null
          location_id?: string | null
          long_tail_keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          pillar_id?: string
          practitioner_notes_added?: boolean | null
          primary_keyword?: string | null
          published_at?: string | null
          seo_breakdown?: Json | null
          seo_keywords?: string[] | null
          seo_score?: number | null
          slug?: string | null
          slug_candidates?: string[] | null
          status?: string
          title?: string | null
          updated_at?: string
          word_count?: number | null
          wp_post_id?: number | null
          wp_post_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_generation_batch_id_fkey"
            columns: ["generation_batch_id"]
            isOneToOne: false
            referencedRelation: "generation_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_pillar_id_fkey"
            columns: ["pillar_id"]
            isOneToOne: false
            referencedRelation: "content_pillars"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          name: string
          pillar_id: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          pillar_id: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          pillar_id?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_pillar_id_fkey"
            columns: ["pillar_id"]
            isOneToOne: false
            referencedRelation: "content_pillars"
            referencedColumns: ["id"]
          },
        ]
      }
      content_pillars: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      generation_batches: {
        Row: {
          completed_at: string | null
          completed_items: number
          created_at: string
          failed_items: number
          id: string
          status: string
          total_items: number
        }
        Insert: {
          completed_at?: string | null
          completed_items?: number
          created_at?: string
          failed_items?: number
          id?: string
          status?: string
          total_items?: number
        }
        Update: {
          completed_at?: string | null
          completed_items?: number
          created_at?: string
          failed_items?: number
          id?: string
          status?: string
          total_items?: number
        }
        Relationships: []
      }
      internal_links: {
        Row: {
          anchor_text: string
          created_at: string
          id: string
          is_active: boolean
          page_type: string
          url: string
        }
        Insert: {
          anchor_text: string
          created_at?: string
          id?: string
          is_active?: boolean
          page_type?: string
          url: string
        }
        Update: {
          anchor_text?: string
          created_at?: string
          id?: string
          is_active?: boolean
          page_type?: string
          url?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          city: string
          county: string | null
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          state: string
          updated_at: string
        }
        Insert: {
          city: string
          county?: string | null
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean
          state?: string
          updated_at?: string
        }
        Update: {
          city?: string
          county?: string | null
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          id: string
          wp_site_url: string | null
          wp_username: string | null
          wp_app_password: string | null
          auto_push_on_approve: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          wp_site_url?: string | null
          wp_username?: string | null
          wp_app_password?: string | null
          auto_push_on_approve?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          wp_site_url?: string | null
          wp_username?: string | null
          wp_app_password?: string | null
          auto_push_on_approve?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          article_id: string
          call_to_action: string | null
          content: string
          created_at: string
          hashtags: string[] | null
          id: string
          is_selected: boolean
          platform: string
          variant: string
        }
        Insert: {
          article_id: string
          call_to_action?: string | null
          content: string
          created_at?: string
          hashtags?: string[] | null
          id?: string
          is_selected?: boolean
          platform?: string
          variant: string
        }
        Update: {
          article_id?: string
          call_to_action?: string | null
          content?: string
          created_at?: string
          hashtags?: string[] | null
          id?: string
          is_selected?: boolean
          platform?: string
          variant?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
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

// ─── Settings type ───────────────────────────────────────────────────
export interface Settings {
  id: string;
  wp_site_url: string | null;
  wp_username: string | null;
  wp_app_password: string | null;
  auto_push_on_approve: boolean;
  updated_at: string;
}

export const Constants = {
  public: {
    Enums: {},
  },
} as const
