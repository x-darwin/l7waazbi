"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { XCircle, RotateCcw, MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePostHog } from 'posthog-js/react';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { supabase } from "@/lib/supabase";

export default function FailedPage() {
  const posthog = usePostHog();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');
  const checkoutId = searchParams.get('checkout_id');

  useEffect(() => {
    const updateOrderStatus = async () => {
      if (checkoutId) {
        try {
          const response = await fetch(`/api/sumup/complete-checkout/${checkoutId}`);
          const checkoutData = await response.json();
          
          // Update order status in Supabase
          const { error } = await supabase
            .from('orders')
            .update({ 
              status: 'FAILED',
              description: `Payment failed: ${reason || 'Unknown reason'}`
            })
            .eq('order_id', checkoutData.checkout_reference);

          if (error) {
            console.error("Error updating order status:", error);
          }
        } catch (error) {
          console.error("Error fetching checkout status:", error);
        }
      }
    };

    updateOrderStatus();
    
    posthog.capture('payment_failed', {
      reason: reason,
      checkout_id: checkoutId,
      timestamp: new Date().toISOString()
    });
  }, [posthog, reason, checkoutId]);

  const getFailureMessage = () => {
    switch (reason) {
      case '3ds_failed':
        return "3D Secure verification failed.";
      case '3ds_cancelled':
        return "3D Secure verification was cancelled.";
      case 'payment_failed':
        return "The payment could not be processed.";
      default:
        return "There was an issue with your payment.";
    }
  };

  const handleSupportClick = () => {
    posthog.capture('support_contact_click', {
      source: 'failed_page',
      contact_method: 'whatsapp'
    });
    window.open("https://wa.me/1234567890", "_blank");
  };

  const handleTryAgainClick = () => {
    posthog.capture('retry_payment_click', {
      source: 'failed_page',
      failure_reason: reason
    });
  };

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto">
          <Card className="glassmorphism border-0">
            <CardHeader className="text-center">
              <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h1 className="text-3xl font-bold">Payment Failed</h1>
              <p className="text-muted-foreground">
                {getFailureMessage()}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center space-x-4">
                <Button 
                  asChild 
                  variant="default"
                  onClick={handleTryAgainClick}
                >
                  <Link href="/payment">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Try Again
                  </Link>
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleSupportClick}
                >
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