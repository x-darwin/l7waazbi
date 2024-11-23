"use client";

import { Suspense, useState, useCallback, memo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { usePostHog } from 'posthog-js/react';
import dynamic from 'next/dynamic';
import { usePaymentGateway } from './payment-gateway-context';
import { StripePaymentProvider } from './stripe-payment-provider';

// Lazy load heavy components
const ThreeDSDialog = dynamic(() => import("./ThreeDSDialog").then(mod => ({ default: mod.ThreeDSDialog })), {
  ssr: false
});

import { PackageSelection } from "./sections/PackageSelection";
import { PaymentSummary } from "./sections/PaymentSummary";
import { AdditionalFeatures } from "./sections/AdditionalFeatures";
import { CouponSection } from "./sections/CouponSection";
import { PersonalInformation } from "./sections/PersonalInformation";
import { CardDetails } from "./sections/CardDetails";
import { SecurityFeatures } from "./sections/SecurityFeatures";
import { PaymentGatewaySection } from "./sections/PaymentGatewaySection";
import { isValidCardNumber, isValidExpiryDate, isValidCVV, isValidEmail, isValidPhone, isValidName } from "./card-validation";

// ... (keep all your existing interfaces and constants)

export const PaymentForm = memo(function PaymentForm({ onSubmit, initialPackage }: PaymentFormProps) {
  // ... (keep all your existing state)
  const [selectedGateway, setSelectedGateway] = useState<'sumup' | 'stripe'>('sumup');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { activeGateway, stripePublishableKey } = usePaymentGateway();

  useEffect(() => {
    setSelectedGateway(activeGateway);
  }, [activeGateway]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(e);
    setIsProcessing(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      const { isValid, errors } = validateForm(formData);
      
      if (!isValid) {
        toast({
          title: "Validation Error",
          description: errors.join("\n"),
          variant: "destructive",
        });
        return;
      }

      const lastAttempt = localStorage.getItem('lastPaymentAttempt');
      const now = Date.now();
      if (lastAttempt && (now - parseInt(lastAttempt)) < 30000) {
        toast({
          title: "Too Many Attempts",
          description: "Please wait before trying again",
          variant: "destructive",
        });
        return;
      }
      localStorage.setItem('lastPaymentAttempt', now.toString());

      if (selectedGateway === 'stripe') {
        await handleStripePayment(formData);
      } else {
        await handleSumUpPayment(formData);
      }

    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
      
      posthog.capture('checkout_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        gateway: selectedGateway
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStripePayment = async (formData: FormData) => {
    const total = calculateTotal();
    if (total < 1) {
      throw new Error("Order amount must be at least 1 EUR");
    }

    const clientData = {
      email: formData.get("email"),
      phone: formData.get("phone"),
      name: formData.get("name"),
      country: selectedCountry,
    };

    const response = await fetch("/api/stripe/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: total,
        currency: "eur",
        clientData,
        selectedPackage,
        selectedFeatures,
        couponCode: couponDiscount ? couponCode : undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create payment intent");
    }

    const { clientSecret, checkout_reference } = await response.json();
    setClientSecret(clientSecret);

    if (checkout_reference) {
      localStorage.setItem('lastOrderReference', checkout_reference);
    }

    // The actual payment will be handled by the Stripe Elements component
  };

  const handleSumUpPayment = async (formData: FormData) => {
    const checkoutId = await createCheckout(formData);

    posthog.capture('checkout_initiated', {
      package: selectedPackageId,
      features: selectedFeatures,
      total: calculateTotal(),
      gateway: 'sumup'
    });

    const cardData = {
      name: formData.get("name"),
      number: (formData.get("card") as string).replace(/\s/g, ''),
      expiry_month: formData.get("expiry")?.toString().split("/")[0],
      expiry_year: "20" + formData.get("expiry")?.toString().split("/")[1],
      cvv: formData.get("cvv"),
    };

    await completeCheckout(checkoutId, {
      payment_type: "card",
      card: cardData,
    });
  };

  // ... (keep all your existing helper functions)

  const paymentForm = (
    <div className="max-w-3xl mx-auto space-y-8">
      <Suspense fallback={<ComponentSkeleton />}>
        <PackageSelection
          packages={packages}
          selectedPackageId={selectedPackageId}
          onPackageSelect={setSelectedPackageId}
        />
      </Suspense>

      <AdditionalFeatures
        features={additionalFeatures}
        selectedFeatures={selectedFeatures}
        onFeatureToggle={handleFeatureToggle}
      />

      <CouponSection
        couponCode={couponCode}
        onCouponChange={setCouponCode}
        onValidateCoupon={validateCoupon}
        onRemoveCoupon={removeCoupon}
        isValidating={isValidatingCoupon}
        couponDiscount={couponDiscount}
      />

      <Suspense fallback={<ComponentSkeleton />}>
        <PaymentSummary
          subtotal={calculateSubtotal()}
          total={calculateTotal()}
        />
      </Suspense>

      <PaymentGatewaySection
        selectedGateway={selectedGateway}
        onGatewayChange={setSelectedGateway}
      />

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2 dark:text-gray-100">Payment Details</h2>
          <p className="text-muted-foreground">Enter your payment information securely</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <PersonalInformation
            countries={countries}
            selectedCountry={selectedCountry}
            onCountryChange={setSelectedCountry}
          />

          <CardDetails />

          <SecurityFeatures />

          <div className="flex flex-col space-y-4 pt-6">
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : `Pay ${calculateTotal()} EUR Now`}
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => window.open("https://wa.me/1234567890", "_blank")}
              className="w-full dark:border-gray-700"
            >
              <Icons.whatsapp className="mr-2 h-4 w-4" />
              Need help? Contact Support
            </Button>
          </div>
        </form>
      </section>

      {threeDSData && (
        <Suspense fallback={<ComponentSkeleton />}>
          <ThreeDSDialog
            isOpen={show3DSDialog}
            onClose={() => {
              setShow3DSDialog(false);
              posthog.capture('checkout_failed', {
                reason: '3ds_cancelled',
                gateway: selectedGateway
              });
              router.push("/failed?reason=3ds_cancelled");
            }}
            url={threeDSData.url}
            method={threeDSData.method}
            payload={threeDSData.payload}
          />
        </Suspense>
      )}
    </div>
  );

  // Wrap with Stripe Elements if using Stripe and we have a client secret
  if (selectedGateway === 'stripe' && clientSecret && stripePublishableKey) {
    return (
      <StripePaymentProvider
        publishableKey={stripePublishableKey}
        clientSecret={clientSecret}
      >
        {paymentForm}
      </StripePaymentProvider>
    );
  }

  return paymentForm;
});