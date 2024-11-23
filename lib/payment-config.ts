import { supabase } from './supabase';
import type { Database } from './database.types';

export type PaymentConfig = {
  id?: number;
  isEnabled: boolean;
  sumupMerchantEmail?: string | null;
  sumupKey?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export const getPaymentConfig = async (): Promise<PaymentConfig> => {
  const { data, error } = await supabase
    .from('payment_config')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No config exists, return default config
      return {
        isEnabled: false,
        sumupMerchantEmail: null,
        sumupKey: null,
      };
    }
    throw error;
  }

  return {
    id: data.id,
    isEnabled: data.is_enabled,
    sumupMerchantEmail: data.sumup_merchant_email,
    sumupKey: data.sumup_key,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

export const updatePaymentConfig = async (config: Partial<PaymentConfig>): Promise<PaymentConfig> => {
  const { data: existing } = await supabase
    .from('payment_config')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const updates = {
    is_enabled: config.isEnabled ?? existing?.is_enabled ?? false,
    sumup_merchant_email: config.sumupMerchantEmail ?? existing?.sumup_merchant_email ?? null,
    sumup_key: config.sumupKey ?? existing?.sumup_key ?? null,
    updated_at: new Date().toISOString()
  };

  let query;
  if (existing) {
    query = supabase
      .from('payment_config')
      .update(updates)
      .eq('id', existing.id);
  } else {
    query = supabase
      .from('payment_config')
      .insert(updates);
  }

  const { data, error } = await query.select().single();

  if (error) throw error;

  return {
    id: data.id,
    isEnabled: data.is_enabled,
    sumupMerchantEmail: data.sumup_merchant_email,
    sumupKey: data.sumup_key,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};
