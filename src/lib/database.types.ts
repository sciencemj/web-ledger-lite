
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string
          user_id: string
          type: string
          category: string
          description: string | null
          amount: number
          date: string // timestamp with time zone
          sourceFixedCostId: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          category: string
          description?: string | null
          amount: number
          date: string // timestamp with time zone
          sourceFixedCostId?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          category?: string
          description?: string | null
          amount?: number
          date?: string // timestamp with time zone
          sourceFixedCostId?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      fixed_costs: {
        Row: {
          id: string
          user_id: string
          category: string
          description: string
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: string
          description: string
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: string
          description?: string
          amount?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fixed_costs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
