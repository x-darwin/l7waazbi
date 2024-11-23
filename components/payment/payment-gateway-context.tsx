import { createContext, useContext, useState, useEffect } from 'react';

interface PaymentGatewayContextType {
  activeGateway: 'sumup' | 'stripe';
  stripePublishableKey: string | null;
  isEnabled: boolean;
  isLoading: boolean;
}

const PaymentGatewayContext = createContext<PaymentGatewayContextType>({
  activeGateway: 'sumup',
  stripePublishableKey: null,
  isEnabled: false,
  isLoading: true,
});

export function PaymentGatewayProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<PaymentGatewayContextType>({
    activeGateway: 'sumup',
    stripePublishableKey: null,
    isEnabled: false,
    isLoading: true,
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/payment/config/public');
        const data = await response.json();
        
        setConfig({
          activeGateway: data.activeGateway,
          stripePublishableKey: data.stripePublishableKey,
          isEnabled: data.isEnabled,
          isLoading: false,
        });
      } catch (error) {
        console.error('Failed to fetch payment config:', error);
        setConfig(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchConfig();
  }, []);

  return (
    <PaymentGatewayContext.Provider value={config}>
      {children}
    </PaymentGatewayContext.Provider>
  );
}

export const usePaymentGateway = () => useContext(PaymentGatewayContext);