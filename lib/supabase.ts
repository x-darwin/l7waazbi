import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Enable session persistence
    autoRefreshToken: true,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
    }
  }
});

export type OrderStatus = 
  | 'pending'
  | 'checkout_created'
  | 'processing'
  | '3ds_required'
  | '3ds_completed'
  | '3ds_failed'
  | 'paid'
  | 'failed'
  | 'expired'
  | 'refunded'
  | 'partially_refunded';

export type PaymentFailureCategory = 
  | 'card_declined'
  | 'insufficient_funds'
  | 'card_expired'
  | 'invalid_card'
  | '3ds_failed'
  | '3ds_timeout'
  | 'processing_error'
  | 'network_error'
  | 'fraud_suspected'
  | 'other';

export type Order = {
  id: string;
  checkout_reference: string;
  original_amount: number;
  final_amount: number;
  currency: string;
  status: OrderStatus;
  transaction_code?: string;
  transaction_id?: string;
  payment_date?: string;
  client_email: string;
  client_name: string;
  client_phone?: string;
  client_country?: string;
  description?: string;
  payment_type?: string;
  payment_method?: string;
  card_last4?: string;
  card_brand?: string;
  sumup_checkout_id?: string;
  coupon_code?: string;
  coupon_discount?: number;
  error_message?: string;
  error_code?: string;
  refund_amount?: number;
  refund_date?: string;
  refund_reason?: string;
  payment_attempts: number;
  last_attempt_date?: string;
  failure_category?: PaymentFailureCategory;
  risk_score?: number;
  ip_address?: string;
  device_info?: string;
  browser_info?: string;
  is_3ds_required?: boolean;
  is_3ds_successful?: boolean;
  processing_time?: number;
  created_at: string;
  updated_at: string;
};

export type PaymentAttempt = {
  id: string;
  order_id: string;
  attempt_number: number;
  status: 'pending' | 'success' | 'failed';
  payment_method: string;
  amount: number;
  currency: string;
  error_message?: string;
  error_code?: string;
  failure_category?: PaymentFailureCategory;
  is_3ds_required: boolean;
  is_3ds_successful?: boolean;
  processing_time: number;
  ip_address?: string;
  device_info?: string;
  browser_info?: string;
  created_at: string;
};

export type Client = {
  id: string;
  email: string;
  phone: string;
  name: string;
  country: string;
  transaction_code: string;
  checkout_reference: string;
  created_at: string;
  updated_at: string;
};

export type Ticket = {
  id: number;
  created_at: string;
  name: string;
  email: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
};

export type Coupon = {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  valid_from: string;
  valid_until: string;
  max_uses: number;
  current_uses: number;
  created_at: string;
};