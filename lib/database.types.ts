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
      payment_attempts: {
        Row: {
          id: string
          order_id: string
          status: string
          payment_method: string
          error_message: string | null
          error_code: string | null
          failure_category: string | null
          is_3ds_required: boolean
          is_3ds_successful: boolean | null
          processing_time: number
          ip_address: string | null
          device_info: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          status: string
          payment_method: string
          error_message?: string | null
          error_code?: string | null
          failure_category?: string | null
          is_3ds_required: boolean
          is_3ds_successful?: boolean | null
          processing_time: number
          ip_address?: string | null
          device_info?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          status?: string
          payment_method?: string
          error_message?: string | null
          error_code?: string | null
          failure_category?: string | null
          is_3ds_required?: boolean
          is_3ds_successful?: boolean | null
          processing_time?: number
          ip_address?: string | null
          device_info?: string | null
          created_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          email: string
          phone: string
          name: string
          country: string
          transaction_code: string
          checkout_reference: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          phone: string
          name: string
          country: string
          transaction_code: string
          checkout_reference: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone?: string
          name?: string
          country?: string
          transaction_code?: string
          checkout_reference?: string
          created_at?: string
          updated_at?: string
        }
      }
      tickets: {
        Row: {
          id: number
          created_at: string
          name: string
          email: string
          message: string
          status: string
        }
        Insert: {
          id?: number
          created_at?: string
          name: string
          email: string
          message: string
          status: string
        }
        Update: {
          id?: number
          created_at?: string
          name?: string
          email?: string
          message?: string
          status?: string
        }
      }
      coupons: {
        Row: {
          id: string
          code: string
          discount_type: string
          discount_value: number
          valid_from: string
          valid_until: string
          max_uses: number
          current_uses: number
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          discount_type: string
          discount_value: number
          valid_from: string
          valid_until: string
          max_uses: number
          current_uses?: number
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          discount_type?: string
          discount_value?: number
          valid_from?: string
          valid_until?: string
          max_uses?: number
          current_uses?: number
          created_at?: string
        }
      }
      blocked_countries: {
        Row: {
          id: string
          country_code: string
          country_name: string | null
          blocked_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          country_code: string
          country_name?: string | null
          blocked_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          country_code?: string
          country_name?: string | null
          blocked_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }      
      payment_config: {
        Row: {
          id: number
          is_enabled: boolean
          sumup_merchant_email: string | null
          sumup_key: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          is_enabled: boolean
          sumup_merchant_email?: string | null
          sumup_key?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          is_enabled?: boolean
          sumup_merchant_email?: string | null
          sumup_key?: string | null
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