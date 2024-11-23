'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { PaymentConfig as TPaymentConfig } from '@/lib/payment-config';

export function PaymentConfig() {
  const [config, setConfig] = useState<TPaymentConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sumupKey, setSumupKey] = useState('');
  const [sumupMerchantEmail, setSumupMerchantEmail] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
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
      setIsEnabled(data.isEnabled);
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

    if (!sumupKey.trim() || !sumupMerchantEmail.trim()) {
      toast({
        title: 'Error',
        description: 'SumUp API key and merchant email are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);
      const updates = {
        isEnabled,
        sumupKey: sumupKey.trim(),
        sumupMerchantEmail: sumupMerchantEmail.trim(),
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
                Provider: <span className="font-medium">SumUp</span>
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
