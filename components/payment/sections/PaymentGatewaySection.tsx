import { usePaymentGateway } from '../payment-gateway-context';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface PaymentGatewaySectionProps {
  selectedGateway: 'sumup' | 'stripe';
  onGatewayChange: (gateway: 'sumup' | 'stripe') => void;
}

export function PaymentGatewaySection({
  selectedGateway,
  onGatewayChange,
}: PaymentGatewaySectionProps) {
  const { activeGateway } = usePaymentGateway();

  // If only one gateway is configured, don't show the selection
  if (!activeGateway) return null;

  return (
    <div className="space-y-4">
      <Label>Payment Method</Label>
      <RadioGroup
        value={selectedGateway}
        onValueChange={(value: 'sumup' | 'stripe') => onGatewayChange(value)}
        className="flex flex-col space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="sumup" id="payment-sumup" />
          <Label htmlFor="payment-sumup">Credit/Debit Card (SumUp)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="stripe" id="payment-stripe" />
          <Label htmlFor="payment-stripe">Credit/Debit Card (Stripe)</Label>
        </div>
      </RadioGroup>
    </div>
  );
}