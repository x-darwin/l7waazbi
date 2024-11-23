'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { PaymentConfig as TPaymentConfig } from '@/lib/payment-config';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function PaymentConfig() {
  const [config, setConfig] = useState<TPaymentConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sumupKey, setSumupKey] = useState('');
  const [sumupMerchantEmail, setSumupMerchantEmail] = useState('');
  const [stripePublishableKey, setStripePublishableKey] = useState('');
  const [stripeSecretKey, setStripeSecretKey] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [activeGateway, setActiveGateway] = useState<'sumup' | 'stripe'>('sumup');
  const { toast } = useToast();

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/payment/config', {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Invalid response' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response type');
      }

      const data = await response.json();
      setConfig(data);
      setSumupKey(data.sumupKey || '');
      setSumupMerchantEmail(data.sumupMerchantEmail || '');
      setStripePublishableKey(data.stripePublishableKey || '');
      setStripeSecretKey(data.stripeSecretKey || '');
      setIsEnabled(data.isEnabled);
      setActiveGateway(data.activeGateway);
    } catch (error) {
      console.error('Failed to load config:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load payment configuration',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleToggleChange = async (checked: boolean) => {
    try {
      setIsSaving(true);

      const response = await fetch('/api/payment/config', {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isEnabled: checked,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Invalid response' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response type');
      }

      const updatedConfig = await response.json();
      setConfig(updatedConfig);
      setIsEnabled(updatedConfig.isEnabled);

      toast({
        title: 'Success',
        description: `Payment processing ${checked ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error) {
      console.error('Toggle error:', error);
      setIsEnabled(!checked); // Revert the toggle
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update payment configuration',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const saveConfig = async () => {
    if (!isEnabled) {
      toast({
        title: 'Error',
        description: 'Enable payment processing to update the configuration',
        variant: 'destructive',
      });
      return;
    }

    const validateGatewayConfig = () => {
      if (activeGateway === 'sumup' && (!sumupKey.trim() || !sumupMerchantEmail.trim())) {
        throw new Error('SumUp API key and merchant email are required');
      }
      if (activeGateway === 'stripe' && (!stripePublishableKey.trim() || !stripeSecretKey.trim())) {
        throw new Error('Stripe publishable key and secret key are required');
      }
    };

    try {
      setIsSaving(true);
      validateGatewayConfig();

      const updates = {
        isEnabled,
        activeGateway,
        sumupKey: sumupKey.trim(),
        sumupMerchantEmail: sumupMerchantEmail.trim(),
        stripePublishableKey: stripePublishableKey.trim(),
        stripeSecretKey: stripeSecretKey.trim(),
      };

      const response = await fetch('/api/payment/config', {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Invalid response' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response type');
      }

      const updatedConfig = await response.json();
      setConfig(updatedConfig);
      setSumupKey(updatedConfig.sumupKey || '');
      setSumupMerchantEmail(updatedConfig.sumupMerchantEmail || '');
      setStripePublishableKey(updatedConfig.stripePublishableKey || '');
      setStripeSecretKey(updatedConfig.stripeSecretKey || '');

      toast({
        title: 'Success',
        description: 'Payment configuration saved successfully',
      });
    } catch (error) {
      console.error('Save config error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save payment configuration',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Payment Gateway Configuration</h2>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Payment Processing</h3>
            <p className="text-sm text-muted-foreground">
              Enable or disable payment processing
            </p>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={handleToggleChange}
            disabled={isSaving}
          />
        </div>

        <div className="space-y-4 pt-6 border-t">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Active Payment Gateway</Label>
              <RadioGroup
                value={activeGateway}
                onValueChange={(value: 'sumup' | 'stripe') => setActiveGateway(value)}
                disabled={!isEnabled || isSaving}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sumup" id="sumup" />
                  <Label htmlFor="sumup">SumUp</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="stripe" id="stripe" />
                  <Label htmlFor="stripe">Stripe</Label>
                </div>
              </RadioGroup>
            </div>

            {activeGateway === 'sumup' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sumup-key">SumUp API Key</Label>
                  <Input
                    id="sumup-key"
                    type="password"
                    value={sumupKey}
                    onChange={(e) => setSumupKey(e.target.value)}
                    placeholder="Enter SumUp API key"
                    disabled={!isEnabled || isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sumup-merchant-email">SumUp Merchant Email</Label>
                  <Input
                    id="sumup-merchant-email"
                    type="email"
                    value={sumupMerchantEmail}
                    onChange={(e) => setSumupMerchantEmail(e.target.value)}
                    placeholder="merchant@example.com"
                    disabled={!isEnabled || isSaving}
                  />
                </div>
              </div>
            )}

            {activeGateway === 'stripe' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stripe-publishable-key">Stripe Publishable Key</Label>
                  <Input
                    id="stripe-publishable-key"
                    type="password"
                    value={stripePublishableKey}
                    onChange={(e) => setStripePublishableKey(e.target.value)}
                    placeholder="pk_test_..."
                    disabled={!isEnabled || isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stripe-secret-key">Stripe Secret Key</Label>
                  <Input
                    id="stripe-secret-key"
                    type="password"
                    value={stripeSecretKey}
                    onChange={(e) => setStripeSecretKey(e.target.value)}
                    placeholder="sk_test_..."
                    disabled={!isEnabled || isSaving}
                  />
                </div>
              </div>
            )}

            <Button 
              onClick={saveConfig} 
              className="w-full"
              disabled={!isEnabled || isSaving}
            >
              {isSaving ? 'Saving...' : (config ? 'Update Configuration' : 'Create Configuration')}
            </Button>
          </div>
        </div>

        {config && (
          <div className="pt-6 border-t">
            <h3 className="text-lg font-medium mb-2">Current Configuration</h3>
            <div className="space-y-2">
              <p>
                Active Gateway:{' '}
                <span className="font-medium capitalize">{config.activeGateway}</span>
              </p>
              <p>
                Status:{' '}
                <span
                  className={`font-medium ${
                    config.isEnabled ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {config.isEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}