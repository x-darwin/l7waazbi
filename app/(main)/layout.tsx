import { PaymentGatewayProvider } from '@/components/payment/payment-gateway-context';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PaymentGatewayProvider>
      {children}
    </PaymentGatewayProvider>
  );
}