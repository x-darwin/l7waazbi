import { useEffect, useState } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { useToast } from '@/hooks/use-toast';

interface StripePaymentProviderProps {
  children: React.ReactNode;
  publishableKey: string;
  clientSecret: string;
}

export function StripePaymentProvider({
  children,
  publishableKey,
  clientSecret,
}: StripePaymentProviderProps) {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initStripe = async () => {
      try {
        const stripeInstance = await loadStripe(publishableKey);
        setStripe(stripeInstance);
      } catch (error) {
        console.error('Failed to initialize Stripe:', error);
        toast({
          title: 'Error',
          description: 'Failed to initialize payment system',
          variant: 'destructive',
        });
      }
    };

    initStripe();
  }, [publishableKey, toast]);

  if (!stripe || !clientSecret) {
    return null;
  }

  // Note: We're not using Stripe Elements directly in this component
  // Instead, we're passing the stripe instance to child components
  return children;
}