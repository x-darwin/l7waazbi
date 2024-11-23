'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CountryBlockingConfig } from '@/app/admin/settings/components/CountryBlockingConfig';
import { PaymentConfig } from '@/app/admin/settings/components/PaymentConfig';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CreditCard } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings and configurations.
        </p>
      </div>

      <Tabs defaultValue="blocking" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="blocking" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Access Control
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blocking" className="space-y-4">
          <CountryBlockingConfig />
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <PaymentConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
}