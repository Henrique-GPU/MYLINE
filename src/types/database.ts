export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string | null
          avatar_url: string | null
          line_coins: number
          created_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          avatar_url?: string | null
          line_coins?: number
          created_at?: string
        }
        Update: {
          username?: string | null
          avatar_url?: string | null
          line_coins?: number
        }
        Relationships: []
      }
      championships: {
        Row: {
          id: string
          name: string
          banner_url: string | null
          initial_lc: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          banner_url?: string | null
          initial_lc?: number
          status?: string
          created_at?: string
        }
        Update: {
          name?: string
          banner_url?: string | null
          initial_lc?: number
          status?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          country: string | null
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          country?: string | null
        }
        Update: {
          name?: string
          logo_url?: string | null
          country?: string | null
        }
        Relationships: []
      }
      players: {
        Row: {
          id: string
          nickname: string
          team_id: string | null
          role: string | null
          price_lc: number
          eliminated: boolean
        }
        Insert: {
          id?: string
          nickname: string
          team_id?: string | null
          role?: string | null
          price_lc?: number
          eliminated?: boolean
        }
        Update: {
          nickname?: string
          team_id?: string | null
          role?: string | null
          price_lc?: number
          eliminated?: boolean
        }
        Relationships: []
      }
      rounds: {
        Row: {
          id: string
          championship_id: string
          round_name: string
          status: string
          round_order: number
        }
        Insert: {
          id?: string
          championship_id: string
          round_name: string
          status?: string
          round_order: number
        }
        Update: {
          round_name?: string
          status?: string
          round_order?: number
        }
        Relationships: []
      }
      user_championships: {
        Row: {
          id: string
          user_id: string
          championship_id: string
          lc_balance: number
          total_points: number
        }
        Insert: {
          id?: string
          user_id: string
          championship_id: string
          lc_balance?: number
          total_points?: number
        }
        Update: {
          lc_balance?: number
          total_points?: number
        }
        Relationships: []
      }
      lineups: {
        Row: {
          id: string
          user_id: string
          championship_id: string
          round_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          championship_id: string
          round_id: string
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: []
      }
      lineup_players: {
        Row: {
          id: string
          lineup_id: string
          player_id: string
          is_captain: boolean
          created_at: string
        }
        Insert: {
          id?: string
          lineup_id: string
          player_id: string
          is_captain?: boolean
          created_at?: string
        }
        Update: {
          is_captain?: boolean
        }
        Relationships: []
      }
      player_prices: {
        Row: {
          id: string
          player_id: string
          championship_id: string
          round_id: string
          price: number
          price_change: number
          created_at: string
        }
        Insert: {
          id?: string
          player_id: string
          championship_id: string
          round_id: string
          price: number
          price_change?: number
          created_at?: string
        }
        Update: {
          price?: number
          price_change?: number
        }
        Relationships: []
      }
      player_round_stats: {
        Row: {
          id: string
          player_id: string
          round_id: string
          kills: number
          assists: number
          deaths: number
          rating: number
          adr: number
          clutches: number
          aces: number
          mvps: number
          points: number
          eliminated: boolean
          created_at: string
        }
        Insert: {
          id?: string
          player_id: string
          round_id: string
          kills?: number
          assists?: number
          deaths?: number
          rating?: number
          adr?: number
          clutches?: number
          aces?: number
          mvps?: number
          points?: number
          eliminated?: boolean
          created_at?: string
        }
        Update: {
          kills?: number
          assists?: number
          deaths?: number
          rating?: number
          adr?: number
          clutches?: number
          aces?: number
          mvps?: number
          points?: number
          eliminated?: boolean
        }
        Relationships: []
      }
      player_map_stats: {
        Row: {
          id: string
          player_id: string
          round_id: string
          match_id: string
          map_name: string
          kills: number
          assists: number
          deaths: number
          rating: number
          adr: number
          created_at: string
        }
        Insert: {
          id?: string
          player_id: string
          round_id: string
          match_id: string
          map_name: string
          kills?: number
          assists?: number
          deaths?: number
          rating?: number
          adr?: number
          created_at?: string
        }
        Update: {
          kills?: number
          assists?: number
          deaths?: number
          rating?: number
          adr?: number
        }
        Relationships: []
      }
      rankings: {
        Row: {
          id: string
          user_championship_id: string
          round_id: string
          position: number
          total_points: number
          created_at: string
        }
        Insert: {
          id?: string
          user_championship_id: string
          round_id: string
          position: number
          total_points: number
          created_at?: string
        }
        Update: {
          position?: number
          total_points?: number
        }
        Relationships: []
      }
      matches: {
        Row: {
          id: string
          round_id: string
          team1_id: string
          team2_id: string
          format: 'BO1' | 'BO3' | 'BO5'
          winner_id: string | null
          scheduled_at: string
          created_at: string
        }
        Insert: {
          id?: string
          round_id: string
          team1_id: string
          team2_id: string
          format: 'BO1' | 'BO3' | 'BO5'
          winner_id?: string | null
          scheduled_at: string
          created_at?: string
        }
        Update: {
          winner_id?: string | null
          format?: 'BO1' | 'BO3' | 'BO5'
        }
        Relationships: []
      }
      community_tournaments: {
        Row: {
          id: string
          name: string
          description: string | null
          organizer_id: string
          start_date: string
          end_date: string
          status: 'upcoming' | 'active' | 'finished'
          format: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          organizer_id: string
          start_date: string
          end_date: string
          status?: 'upcoming' | 'active' | 'finished'
          format: string
          created_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          status?: 'upcoming' | 'active' | 'finished'
          end_date?: string
        }
        Relationships: []
      }
      community_teams: {
        Row: {
          id: string
          tournament_id: string
          name: string
          tag: string
          logo_url: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          name: string
          tag: string
          logo_url?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          name?: string
          tag?: string
          logo_url?: string | null
        }
        Relationships: []
      }
      community_player_profile: {
        Row: {
          id: string
          user_id: string
          steam_id: string | null
          nickname: string
          country: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          steam_id?: string | null
          nickname: string
          country?: string | null
          created_at?: string
        }
        Update: {
          steam_id?: string | null
          nickname?: string
          country?: string | null
        }
        Relationships: []
      }
      community_team_members: {
        Row: {
          id: string
          team_id: string
          player_profile_id: string
          role: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          team_id: string
          player_profile_id: string
          role?: string | null
          joined_at?: string
        }
        Update: {
          role?: string | null
        }
        Relationships: []
      }
      community_matches: {
        Row: {
          id: string
          tournament_id: string
          team1_id: string
          team2_id: string
          format: 'BO1' | 'BO3' | 'BO5'
          winner_id: string | null
          scheduled_at: string
          created_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          team1_id: string
          team2_id: string
          format: 'BO1' | 'BO3' | 'BO5'
          winner_id?: string | null
          scheduled_at: string
          created_at?: string
        }
        Update: {
          winner_id?: string | null
        }
        Relationships: []
      }
      community_player_stats: {
        Row: {
          id: string
          match_id: string
          player_profile_id: string
          kills: number
          assists: number
          deaths: number
          rating: number
          adr: number
          created_at: string
        }
        Insert: {
          id?: string
          match_id: string
          player_profile_id: string
          kills?: number
          assists?: number
          deaths?: number
          rating?: number
          adr?: number
          created_at?: string
        }
        Update: {
          kills?: number
          assists?: number
          deaths?: number
          rating?: number
          adr?: number
        }
        Relationships: []
      }
      community_standings: {
        Row: {
          id: string
          tournament_id: string
          team_id: string
          wins: number
          losses: number
          draws: number
          points: number
          position: number
          updated_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          team_id: string
          wins?: number
          losses?: number
          draws?: number
          points?: number
          position?: number
          updated_at?: string
        }
        Update: {
          wins?: number
          losses?: number
          draws?: number
          points?: number
          position?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
