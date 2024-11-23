import { useEffect, useState } from 'react';
import { Elements } from '@stripe/stripe-js';
import { getClientStripe } from '@/lib/client-stripe';
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
  const [stripe, setStripe] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const initStripe = async () => {
      try {
        const stripeInstance = await getClientStripe(publishableKey);
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

  return (
    <Elements
      stripe={stripe}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#0091FF',
            colorBackground: '#ffffff',
            colorText: '#1a1a1a',
          },
        },
      }}
    >
      {children}
    </Elements>
  );
}