export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      app_admins: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      club_settings: {
        Row: {
          about_text: string
          bio: string
          club_name: string
          created_at: string
          id: boolean
          instagram_url: string
          locality: string
          primary_field_id: string | null
          updated_at: string
        }
        Insert: {
          about_text?: string
          bio?: string
          club_name?: string
          created_at?: string
          id?: boolean
          instagram_url?: string
          locality?: string
          primary_field_id?: string | null
          updated_at?: string
        }
        Update: {
          about_text?: string
          bio?: string
          club_name?: string
          created_at?: string
          id?: boolean
          instagram_url?: string
          locality?: string
          primary_field_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_settings_primary_field_id_fkey"
            columns: ["primary_field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      fields: {
        Row: {
          address: string
          created_at: string
          id: string
          is_active: boolean
          is_primary: boolean
          maps_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          maps_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          maps_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      match_events: {
        Row: {
          assist_player_id: string | null
          beneficiary: string
          client_event_id: string
          created_at: string
          deleted_at: string | null
          event_type: string
          id: string
          is_own_goal: boolean
          match_id: string
          minute_snapshot: number
          occurred_at: string
          scorer_player_id: string | null
          updated_at: string
        }
        Insert: {
          assist_player_id?: string | null
          beneficiary: string
          client_event_id: string
          created_at?: string
          deleted_at?: string | null
          event_type?: string
          id?: string
          is_own_goal?: boolean
          match_id: string
          minute_snapshot: number
          occurred_at?: string
          scorer_player_id?: string | null
          updated_at?: string
        }
        Update: {
          assist_player_id?: string | null
          beneficiary?: string
          client_event_id?: string
          created_at?: string
          deleted_at?: string | null
          event_type?: string
          id?: string
          is_own_goal?: boolean
          match_id?: string
          minute_snapshot?: number
          occurred_at?: string
          scorer_player_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_events_assist_player_id_fkey"
            columns: ["assist_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_scorer_player_id_fkey"
            columns: ["scorer_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          ended_at: string | null
          field_id: string
          id: string
          is_home: boolean
          notes: string | null
          opponent_id: string
          scheduled_at: string
          score_opponent: number | null
          score_unidos: number | null
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          field_id: string
          id?: string
          is_home?: boolean
          notes?: string | null
          opponent_id: string
          scheduled_at: string
          score_opponent?: number | null
          score_unidos?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          field_id?: string
          id?: string
          is_home?: boolean
          notes?: string | null
          opponent_id?: string
          scheduled_at?: string
          score_opponent?: number | null
          score_unidos?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_opponent_id_fkey"
            columns: ["opponent_id"]
            isOneToOne: false
            referencedRelation: "opponents"
            referencedColumns: ["id"]
          },
        ]
      }
      opponents: {
        Row: {
          created_at: string
          crest_url: string | null
          id: string
          is_active: boolean
          is_primary_rival: boolean
          is_rival: boolean
          name: string
          rival_description: string | null
          rival_title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          crest_url?: string | null
          id?: string
          is_active?: boolean
          is_primary_rival?: boolean
          is_rival?: boolean
          name: string
          rival_description?: string | null
          rival_title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          crest_url?: string | null
          id?: string
          is_active?: boolean
          is_primary_rival?: boolean
          is_rival?: boolean
          name?: string
          rival_description?: string | null
          rival_title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      players: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          nickname: string | null
          photo_url: string | null
          position: string
          shirt_number: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          nickname?: string | null
          photo_url?: string | null
          position: string
          shirt_number: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          nickname?: string | null
          photo_url?: string | null
          position?: string
          shirt_number?: number
          updated_at?: string
        }
        Relationships: []
      }
      stat_adjustments: {
        Row: {
          created_at: string
          delta: number
          id: string
          metric: string
          player_id: string | null
          reason: string
          scope: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          delta: number
          id?: string
          metric: string
          player_id?: string | null
          reason: string
          scope: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          delta?: number
          id?: string
          metric?: string
          player_id?: string | null
          reason?: string
          scope?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stat_adjustments_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      finish_match: {
        Args: { p_match_id: string }
        Returns: {
          created_at: string
          ended_at: string | null
          field_id: string
          id: string
          is_home: boolean
          notes: string | null
          opponent_id: string
          scheduled_at: string
          score_opponent: number | null
          score_unidos: number | null
          started_at: string | null
          status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "matches"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      is_app_admin: { Args: never; Returns: boolean }
      start_match: {
        Args: { p_match_id: string }
        Returns: {
          created_at: string
          ended_at: string | null
          field_id: string
          id: string
          is_home: boolean
          notes: string | null
          opponent_id: string
          scheduled_at: string
          score_opponent: number | null
          score_unidos: number | null
          started_at: string | null
          status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "matches"
          isOneToOne: true
          isSetofReturn: false
        }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

