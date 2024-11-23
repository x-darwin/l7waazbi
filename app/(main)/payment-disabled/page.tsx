"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AlertCircle, MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePostHog } from 'posthog-js/react';

export default function PaymentDisabledPage() {
  const posthog = usePostHog();

  const handleSupportClick = () => {
    posthog.capture('support_contact_click', {
      source: 'payment_disabled_page',
      contact_method: 'whatsapp'
    });
    window.open("https://wa.me/1234567890", "_blank");
  };

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto">
          <Card className="glassmorphism border-0">
            <CardHeader className="text-center">
              <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold">Payment System Unavailable</h1>
              <p className="text-muted-foreground mt-2">
                Our payment system is temporarily unavailable. However, you can still purchase your subscription through our WhatsApp support.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center space-x-4">
                <Button 
                  variant="default"
                  onClick={handleSupportClick}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact via WhatsApp
                </Button>
                <Button 
                  variant="outline"
                  asChild
                >
                  <Link href="/">
                    Return Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}