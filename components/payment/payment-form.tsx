"use client";

import { Suspense, useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { usePostHog } from 'posthog-js/react';
import dynamic from 'next/dynamic';

// Lazy load heavy components
const ThreeDSDialog = dynamic(() => import("./ThreeDSDialog").then(mod => ({ default: mod.ThreeDSDialog })), {
  ssr: false // Since it's a modal, we don't need SSR
});
import { PackageSelection } from "./sections/PackageSelection";
import { PaymentSummary } from "./sections/PaymentSummary";
import { AdditionalFeatures } from "./sections/AdditionalFeatures";
import { CouponSection } from "./sections/CouponSection";
import { PersonalInformation } from "./sections/PersonalInformation";
import { CardDetails } from "./sections/CardDetails";
import { SecurityFeatures } from "./sections/SecurityFeatures";
import { isValidCardNumber, isValidExpiryDate, isValidCVV, isValidEmail, isValidPhone, isValidName } from "./card-validation";

const ComponentSkeleton = () => <Skeleton className="h-32 w-full" />;

interface PaymentFormProps {
  initialPackage?: string;
  onSubmit: (e: React.FormEvent) => void;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  popular?: boolean;
}

export interface Feature {
  id: string;
  label: string;
  price: number;
}

export interface Country {
  code: string;
  name: string;
}

const packages: Package[] = [
  {
    id: "1year",
    name: "1-Year Plan",
    price: 29.99,
    period: "year",
    description: "Best value for serious streamers",
  },
  {
    id: "2year",
    name: "2-Year Plan",
    price: 49.99,
    period: "2 years",
    description: "Extended entertainment package",
    popular: true,
  },
];

const additionalFeatures: Feature[] = [
  { id: "nude", label: "+18 Package", price: 4.99 },
];

const countries: Country[] = [
  { code: "NL", name: "Netherlands" },
  { code: "IT", name: "Italy" },
  { code: "BE", name: "Belgium" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "ES", name: "Spain" },
  { code: "PT", name: "Portugal" },
];

export const PaymentForm = memo(function PaymentForm({ onSubmit, initialPackage }: PaymentFormProps) {
  const [selectedPackageId, setSelectedPackageId] = useState(initialPackage || "2year");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState<{
    type: 'percentage' | 'fixed';
    value: number;
  } | null>(null);
  const [show3DSDialog, setShow3DSDialog] = useState(false);
  const [threeDSData, setThreeDSData] = useState<{
    url: string;
    method: string;
    payload: Record<string, string>;
  } | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const { toast } = useToast();
  const router = useRouter();
  const posthog = usePostHog();

  const selectedPackage = packages.find((pkg) => pkg.id === selectedPackageId);

  const removeCoupon = useCallback(() => {
    setCouponCode('');
    setCouponDiscount(null);
    toast({
      title: "Coupon Removed",
      description: "The discount has been removed from your order",
    });
  }, [toast]);

  const validateCoupon = useCallback(async () => {
    if (!couponCode) return;
    
    setIsValidatingCoupon(true);
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: couponCode }),
      });

      const data = await response.json();

      if (response.ok) {
        const currentTotal = calculateSubtotal();
        let discountedAmount = currentTotal;
        
        if (data.discount_type === 'percentage') {
          discountedAmount = currentTotal * (1 - data.discount_value / 100);
        } else {
          discountedAmount = Math.max(0, currentTotal - data.discount_value);
        }

        if (discountedAmount < 1) {
          toast({
            title: "Invalid Coupon",
            description: "This coupon cannot be applied to the current order amount",
            variant: "destructive",
          });
          setCouponDiscount(null);
          return;
        }

        setCouponDiscount({
          type: data.discount_type,
          value: data.discount_value,
        });
        toast({
          title: "Coupon Applied",
          description: `Discount of ${data.discount_value}${data.discount_type === 'percentage' ? '%' : '€'} applied`,
        });
      } else {
        toast({
          title: "Invalid Coupon",
          description: data.error,
          variant: "destructive",
        });
        setCouponDiscount(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate coupon",
        variant: "destructive",
      });
    } finally {
      setIsValidatingCoupon(false);
    }
  }, [couponCode, toast]);

  const calculateSubtotal = useCallback(() => {
    if (!selectedPackage) return 0;
    
    let total = selectedPackage.price;
    
    selectedFeatures.forEach((feature) => {
      const additionalFeature = additionalFeatures.find((f) => f.id === feature);
      if (additionalFeature) {
        total += additionalFeature.price;
      }
    });

    return Number(total.toFixed(2));
  }, [selectedPackage, selectedFeatures]);

  const calculateTotal = useCallback(() => {
    let total = calculateSubtotal();

    if (couponDiscount) {
      if (couponDiscount.type === 'percentage') {
        total = total * (1 - couponDiscount.value / 100);
      } else {
        total = Math.max(1, total - couponDiscount.value);
      }
    }

    return Number(total.toFixed(2));
  }, [calculateSubtotal, couponDiscount]);

  const handleFeatureToggle = useCallback((featureId: string, checked: boolean) => {
    setSelectedFeatures(prev =>
      checked
        ? [...prev, featureId]
        : prev.filter((id) => id !== featureId)
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(e); // Call the provided onSubmit handler
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

      const checkoutId = await createCheckout(formData);

      posthog.capture('checkout_initiated', {
        package: selectedPackageId,
        features: selectedFeatures,
        total: calculateTotal()
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
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
      
      posthog.capture('checkout_failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const validateForm = (formData: FormData): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    const email = formData.get("email") as string;
    if (!isValidEmail(email)) {
      errors.push("Please enter a valid email address");
    }

    const name = formData.get("name") as string;
    if (!isValidName(name)) {
      errors.push("Please enter a valid full name");
    }

    const phone = formData.get("phone") as string;
    if (!isValidPhone(phone)) {
      errors.push("Please enter a valid phone number");
    }

    if (!selectedCountry) {
      errors.push("Please select your country");
    }

    const cardNumber = formData.get("card") as string;
    if (!isValidCardNumber(cardNumber)) {
      errors.push("Please enter a valid card number");
    }

    const expiry = formData.get("expiry") as string;
    if (!isValidExpiryDate(expiry)) {
      errors.push("Please enter a valid expiry date");
    }

    const cvv = formData.get("cvv") as string;
    if (!isValidCVV(cvv)) {
      errors.push("Please enter a valid CVV");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const createCheckout = async (formData: FormData) => {
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

    const response = await fetch("/api/sumup/create-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: calculateSubtotal(),
        currency: "EUR",
        checkout_reference: `ORDER-${Date.now()}`,
        description: `StreamVault ${selectedPackage?.name}`,
        couponCode: couponDiscount ? couponCode : undefined,
        clientData,
        selectedPackage,
        selectedFeatures
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create checkout");
    }

    const checkout = await response.json();
    
    if (checkout.client_reference_id) {
      localStorage.setItem('lastOrderReference', checkout.client_reference_id);
    }
    
    return checkout.id;
  };

  const completeCheckout = async (checkoutId: string, data: any) => {
    try {
      const response = await fetch(`/api/sumup/complete-checkout/${checkoutId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Payment failed");
      }

      const result = await response.json();

      if (result.next_step) {
        const { url, method, payload } = result.next_step;
        setThreeDSData({ url, method, payload });
        setShow3DSDialog(true);
        pollPaymentStatus(checkoutId);
        return;
      }

      if (result.status === "PAID") {
        posthog.capture('checkout_completed', {
          package: selectedPackageId,
          features: selectedFeatures,
          total: calculateTotal()
        });
        router.push("/success");
      } else if (result.status === "FAILED") {
        posthog.capture('checkout_failed', {
          reason: 'payment_failed'
        });
        router.push("/failed?reason=payment_failed");
      }

      return result;
    } catch (error) {
      console.error("Error completing checkout:", error);
      posthog.capture('checkout_failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      router.push("/failed?reason=payment_failed");
      throw error;
    }
  };

  const pollPaymentStatus = async (checkoutId: string) => {
    const maxAttempts = 30;
    let attempts = 0;

    const checkStatus = async () => {
      if (attempts >= maxAttempts) {
        setShow3DSDialog(false);
        posthog.capture('checkout_failed', {
          reason: '3ds_timeout'
        });
        router.push("/failed?reason=3ds_timeout");
        return;
      }

      try {
        const response = await fetch(`/api/sumup/complete-checkout/${checkoutId}`, {
          method: 'GET',
        });
        const result = await response.json();

        if (result.status === 'PAID') {
          setShow3DSDialog(false);
          posthog.capture('checkout_completed', {
            package: selectedPackageId,
            features: selectedFeatures,
            total: calculateTotal(),
            payment_method: '3ds'
          });
          router.push("/success");
          return;
        } else if (result.status === 'FAILED') {
          setShow3DSDialog(false);
          posthog.capture('checkout_failed', {
            reason: 'payment_failed',
            payment_method: '3ds'
          });
          router.push("/failed?reason=payment_failed");
          return;
        }

        attempts++;
        setTimeout(checkStatus, 2000);
      } catch (error) {
        console.error('Error polling payment status:', error);
        setShow3DSDialog(false);
        posthog.capture('checkout_failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          payment_method: '3ds'
        });
        router.push("/failed?reason=payment_failed");
      }
    };

    checkStatus();
  };

  return (
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
                reason: '3ds_cancelled'
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
});