"use client";

import { useEffect, useCallback } from 'react';
import { CheckCircle, MessageCircle, Copy, Camera } from "lucide-react";
import { usePostHog } from 'posthog-js/react';
import { useSearchParams } from 'next/navigation';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

function OrderIdSection() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');

  const handleCopy = () => {
    if (reference) {
      navigator.clipboard.writeText(reference);
      toast({
        title: "Copied!",
        description: "Order ID copied to clipboard",
      });
    }
  };

  if (!reference) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">Your Order ID:</p>
      <div className="flex items-center gap-2">
        <code className="flex-1 p-3 bg-gray-100 rounded-lg text-center font-mono text-lg">
          {reference}
        </code>
        <Button
          variant="outline"
          size="icon"
          onClick={handleCopy}
          title="Copy Order ID"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  const posthog = usePostHog();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  const checkoutId = searchParams.get('checkout_id');
  const reference = searchParams.get('reference');

  const updateOrderStatus = useCallback(async () => {
    if (!checkoutId) return;
    
    try {
      const response = await fetch(`/api/sumup/complete-checkout/${checkoutId}`);
      const checkoutData = await response.json();
      
      if (checkoutData.status === "PAID") {
        const { error } = await supabase
          .from('orders')
          .update({ status: 'PAID' })
          .eq('order_id', checkoutData.checkout_reference);

        if (error) {
          console.error("Error updating order status:", error);
        }
      }
    } catch (error) {
      console.error("Error fetching checkout status:", error);
    }
  }, [checkoutId]);

  const captureAnalytics = useCallback(() => {
    posthog.capture('purchase_success', {
      plan,
      checkout_id: checkoutId,
      order_reference: reference,
      success: true,
      timestamp: new Date().toISOString()
    });
  }, [posthog, plan, checkoutId, reference]);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (!mounted) return;
      await updateOrderStatus();
      captureAnalytics();
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [updateOrderStatus, captureAnalytics]);

  const handleSupportClick = () => {
    posthog.capture('support_contact_click', {
      source: 'success_page',
      contact_method: 'whatsapp',
      order_reference: reference
    });
    window.open("https://wa.me/1234567890", "_blank");
  };

  const handleHomeClick = () => {
    posthog.capture('return_home_click', {
      source: 'success_page',
      order_reference: reference
    });
  };

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto">
          <Card className="glassmorphism border-0">
            <CardHeader className="text-center">
              <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
              <h1 className="text-3xl font-bold">Payment Successful!</h1>
              <p className="text-muted-foreground">
                Thank you for your purchase. You will receive an email confirmation shortly.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <OrderIdSection />

              <Alert>
                <AlertDescription className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  We recommend taking a screenshot of your order ID for future reference.
                </AlertDescription>
              </Alert>

              <div className="flex justify-center space-x-4">
                <Button 
                  asChild 
                  variant="outline"
                  onClick={handleHomeClick}
                >
                  <Link href="/">Return Home</Link>
                </Button>
                <Button onClick={handleSupportClick}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}