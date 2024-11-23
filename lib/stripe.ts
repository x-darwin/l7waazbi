import Stripe from 'stripe';
import { getPaymentConfig } from './payment-config';

let stripeInstance: Stripe | null = null;

export async function getStripe(): Promise<Stripe> {
  if (!stripeInstance) {
    const config = await getPaymentConfig();
    
    if (!config.stripeSecretKey) {
      throw new Error('Stripe secret key not configured');
    }

    stripeInstance = new Stripe(config.stripeSecretKey, {
      apiVersion: '2023-10-16',
      typescript: true,
    });
  }

  return stripeInstance;
}