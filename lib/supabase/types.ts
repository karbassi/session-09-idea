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
      services: {
        Row: {
          id: string
          name: string
          description: string
          duration: number
          price: number
          image_url: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          duration: number
          price: number
          image_url?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          duration?: number
          price?: number
          image_url?: string | null
          active?: boolean
          created_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          address: string
          hair_info: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          address: string
          hair_info?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          address?: string
          hair_info?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          client_id: string
          service_id: string
          date: string
          start_time: string
          end_time: string
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          deposit_receipt_url: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          service_id: string
          date: string
          start_time: string
          end_time: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          deposit_receipt_url?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          service_id?: string
          date?: string
          start_time?: string
          end_time?: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          deposit_receipt_url?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      blocked_times: {
        Row: {
          id: string
          date: string
          start_time: string
          end_time: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          start_time: string
          end_time: string
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          start_time?: string
          end_time?: string
          reason?: string | null
          created_at?: string
        }
      }
      admin_settings: {
        Row: {
          id: string
          zelle_info: string | null
          business_hours: Json | null
          notification_email: string | null
          notification_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          zelle_info?: string | null
          business_hours?: Json | null
          notification_email?: string | null
          notification_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          zelle_info?: string | null
          business_hours?: Json | null
          notification_email?: string | null
          notification_phone?: string | null
          created_at?: string
          updated_at?: string
        }
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
  }
}
