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
      leads: {
        Row: {
          id: string
          created_at: string
          updated_at: string | null
          name: string
          email: string
          phone: string | null
          service_interest: string | null
          website: string | null
          budget: string | null
          message: string | null
          details: Json
          status: string | null
        }
        Insert: {
          id: string // primary key without default
          created_at?: string
          updated_at?: string | null
          name: string
          email: string
          phone?: string | null
          service_interest?: string | null
          website?: string | null
          budget?: string | null
          message?: string | null
          details?: Json
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string | null
          name?: string
          email?: string
          phone?: string | null
          service_interest?: string | null
          website?: string | null
          budget?: string | null
          message?: string | null
          details?: Json
          status?: string
        }
        Relationships: []
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
