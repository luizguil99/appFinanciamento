import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          is_admin: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          is_admin?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          is_admin?: boolean
          created_at?: string
        }
      }
      simulations: {
        Row: {
          id: string
          user_id: string
          user_email: string
          property_value: string
          down_payment: number
          down_payment_percentage: number
          financed_amount: number
          monthly_payment: number
          total_amount: number
          total_interest: number
          term_years: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_email: string
          property_value: string
          down_payment: number
          down_payment_percentage: number
          financed_amount: number
          monthly_payment: number
          total_amount: number
          total_interest: number
          term_years: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          user_email?: string
          property_value?: string
          down_payment?: number
          down_payment_percentage?: number
          financed_amount?: number
          monthly_payment?: number
          total_amount?: number
          total_interest?: number
          term_years?: number
          created_at?: string
        }
      }
      financing_submissions: {
        Row: {
          id: string
          user_id: string
          user_email: string
          user_name: string
          user_cpf: string
          property_value: string
          down_payment: number
          down_payment_percentage: number
          financed_amount: number
          monthly_payment: number
          total_amount: number
          total_interest: number
          term_years: number
          signature_data: string
          created_at: string
          status: string
        }
        Insert: {
          id?: string
          user_id: string
          user_email: string
          user_name: string
          user_cpf: string
          property_value: string
          down_payment: number
          down_payment_percentage: number
          financed_amount: number
          monthly_payment: number
          total_amount: number
          total_interest: number
          term_years: number
          signature_data?: string
          created_at?: string
          status?: string
        }
        Update: {
          id?: string
          user_id?: string
          user_email?: string
          user_name?: string
          user_cpf?: string
          property_value?: string
          down_payment?: number
          down_payment_percentage?: number
          financed_amount?: number
          monthly_payment?: number
          total_amount?: number
          total_interest?: number
          term_years?: number
          signature_data?: string
          created_at?: string
          status?: string
        }
      }
    }
  }
}

// Tipos auxiliares para o frontend
export type Simulation = Database['public']['Tables']['simulations']['Row']
export type FinancingSubmission = Database['public']['Tables']['financing_submissions']['Row']
export type User = Database['public']['Tables']['users']['Row'] 