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
      orders: {
        Row: {
          id: string
          checkout_reference: string
          original_amount: number
          final_amount: number
          currency: string
          status: string
          transaction_code: string | null
          transaction_id: string | null
          payment_date: string | null
          client_email: string
          client_name: string
          client_phone: string | null
          client_country: string | null
          description: string | null
          payment_type: string | null
          payment_method: string | null
          card_last4: string | null
          card_brand: string | null
          sumup_checkout_id: string | null
          coupon_code: string | null
          coupon_discount: number | null
          error_message: string | null
          error_code: string | null
          refund_amount: number | null
          refund_date: string | null
          refund_reason: string | null
          payment_attempts: number
          last_attempt_date: string | null
          failure_category: string | null
          risk_score: number | null
          ip_address: string | null
          device_info: string | null
          browser_info: string | null
          is_3ds_required: boolean | null
          is_3ds_successful: boolean | null
          processing_time: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          checkout_reference: string
          original_amount: number
          final_amount: number
          currency: string
          status: string
          transaction_code?: string | null
          transaction_id?: string | null
          payment_date?: string | null
          client_email: string
          client_name: string
          client_phone?: string | null
          client_country?: string | null
          description?: string | null
          payment_type?: string | null
          payment_method?: string | null
          card_last4?: string | null
          card_brand?: string | null
          sumup_checkout_id?: string | null
          coupon_code?: string | null
          coupon_discount?: number | null
          error_message?: string | null
          error_code?: string | null
          refund_amount?: number | null
          refund_date?: string | null
          refund_reason?: string | null
          payment_attempts?: number
          last_attempt_date?: string | null
          failure_category?: string | null
          risk_score?: number | null
          ip_address?: string | null
          device_info?: string | null
          browser_info?: string | null
          is_3ds_required?: boolean | null
          is_3ds_successful?: boolean | null
          processing_time?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          checkout_reference?: string
          original_amount?: number
          final_amount?: number
          currency?: string
          status?: string
          transaction_code?: string | null
          transaction_id?: string | null
          payment_date?: string | null
          client_email?: string
          client_name?: string
          client_phone?: string | null
          client_country?: string | null
          description?: string | null
          payment_type?: string | null
          payment_method?: string | null
          card_last4?: string | null
          card_brand?: string | null
          sumup_checkout_id?: string | null
          coupon_code?: string | null
          coupon_discount?: number | null
          error_message?: string | null
          error_code?: string | null
          refund_amount?: number | null
          refund_date?: string | null
          refund_reason?: string | null
          payment_attempts?: number
          last_attempt_date?: string | null
          failure_category?: string | null
          risk_score?: number | null
          ip_address?: string | null
          device_info?: string | null
          browser_info?: string | null
          is_3ds_required?: boolean | null
          is_3ds_successful?: boolean | null
          processing_time?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      payment_config: {
        Row: {
          id: number
          is_enabled: boolean
          active_gateway: 'sumup' | 'stripe'
          sumup_merchant_email: string | null
          sumup_key: string | null
          stripe_publishable_key: string | null
          stripe_secret_key: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          is_enabled: boolean
          active_gateway: 'sumup' | 'stripe'
          sumup_merchant_email?: string | null
          sumup_key?: string | null
          stripe_publishable_key?: string | null
          stripe_secret_key?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          is_enabled?: boolean
          active_gateway?: 'sumup' | 'stripe'
          sumup_merchant_email?: string | null
          sumup_key?: string | null
          stripe_publishable_key?: string | null
          stripe_secret_key?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // ... rest of the tables remain the same
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