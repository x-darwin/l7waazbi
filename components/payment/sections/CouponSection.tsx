"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface CouponSectionProps {
  couponCode: string;
  onCouponChange: (code: string) => void;
  onValidateCoupon: () => Promise<void>;
  onRemoveCoupon: () => void;
  isValidating: boolean;
  couponDiscount: { type: 'percentage' | 'fixed'; value: number; } | null;
}

export function CouponSection({
  couponCode,
  onCouponChange,
  onValidateCoupon,
  onRemoveCoupon,
  isValidating,
  couponDiscount,
}: CouponSectionProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="coupon" className="dark:text-gray-100">Coupon Code</Label>
      <div className="flex space-x-2">
        <Input
          id="coupon"
          value={couponCode}
          onChange={(e) => onCouponChange(e.target.value)}
          placeholder="Enter coupon code"
          disabled={isValidating || couponDiscount !== null}
          className="bg-white/5 backdrop-blur-sm border-white/10 focus:border-white/20 focus:ring-white/20"
        />
        {couponDiscount ? (
          <Button 
            variant="outline" 
            onClick={onRemoveCoupon}
            className="border-white/10 hover:bg-white/10 backdrop-blur-sm"
          >
            Remove
          </Button>
        ) : (
          <Button 
            variant="outline" 
            onClick={onValidateCoupon}
            disabled={!couponCode || isValidating}
            className="border-white/10 hover:bg-white/10 backdrop-blur-sm"
          >
            {isValidating ? "Validating..." : "Apply"}
          </Button>
        )}
      </div>
      {couponDiscount && (
        <p className="text-sm text-green-500">
          Discount of {couponDiscount.value}{couponDiscount.type === 'percentage' ? '%' : '€'} applied
        </p>
      )}
    </div>
  );
}