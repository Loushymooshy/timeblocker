import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      blocks: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          color?: string
          created_at?: string
        }
      }
      schedule_blocks: {
        Row: {
          id: string
          user_id: string
          block_id: string
          day: string
          start_hour: number
          duration: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          block_id: string
          day: string
          start_hour: number
          duration: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          block_id?: string
          day?: string
          start_hour?: number
          duration?: number
          created_at?: string
        }
      }
    }
  }
} 