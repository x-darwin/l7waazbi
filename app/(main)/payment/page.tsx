"use client";

import { Suspense, lazy } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PaymentCardIcons } from "@/components/payment/payment-card-icons";
import { useRouter, useSearchParams } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';

// Optimized dynamic import with proper chunking
const PaymentForm = lazy(() => 
  import("@/components/payment/payment-form")
    .then(mod => ({ default: mod.PaymentForm }))
);

// Loading fallback component
const PaymentFormSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-[200px] bg-muted rounded-lg" />
    <div className="h-[150px] bg-muted rounded-lg" />
  </div>
);

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get('plan');
  const router = useRouter();
  const posthog = usePostHog();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    posthog?.capture('payment_form_submitted', {
      plan: selectedPlan
    });
  };

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto space-y-8">
          <Card className="glassmorphism border-0">
            <CardHeader>
              <h2 className="text-3xl font-bold text-center">
                <span className="relative">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">
                    Complete Your Order
                  </span>
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 blur-2xl -z-10" />
                </span>
              </h2>
              <p className="text-muted-foreground text-center">
                Enter your payment details to continue
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <PaymentCardIcons />
              <Suspense fallback={<PaymentFormSkeleton />}>
                <PaymentForm 
                  initialPackage={selectedPlan === '2-year-plan' ? '2year' : '1year'}
                  onSubmit={handleSubmit}
                />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}