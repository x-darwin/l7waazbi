"use client";

import { memo } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaymentCardIcons } from "../payment-card-icons";
import { formatCardNumber, formatExpiryDate } from "../card-formatting";

export const CardDetails = memo(function CardDetails() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="card" className="dark:text-gray-100">Card Number</Label>
        <Input
          id="card"
          name="card"
          placeholder="4242 4242 4242 4242"
          required
          onChange={(e) => {
            e.target.value = formatCardNumber(e.target.value);
          }}
          maxLength={19}
          pattern="\d{4}\s\d{4}\s\d{4}\s\d{4}"
          title="Please enter a valid 16-digit card number"
          className="dark:bg-slate-900/0 dark:border-gray-700"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiry" className="dark:text-gray-100">Expiry Date</Label>
          <Input
            id="expiry"
            name="expiry"
            placeholder="MM/YY"
            maxLength={5}
            onChange={(e) => {
              e.target.value = formatExpiryDate(e.target.value);
            }}
            inputMode="numeric"
            required
            pattern="\d{2}/\d{2}"
            title="Please enter a valid expiry date (MM/YY)"
            className="dark:bg-slate-900/0 dark:border-gray-700"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cvv" className="dark:text-gray-100">CVV</Label>
          <Input
            id="cvv"
            name="cvv"
            type="password"
            maxLength={4}
            placeholder="123"
            required
            pattern="\d{3,4}"
            title="Please enter a valid CVV (3 or 4 digits)"
            className="dark:bg-slate-900/0 dark:border-gray-700"
          />
        </div>
      </div>

      <div className="pt-4">
        <PaymentCardIcons />
      </div>
    </div>
  );
});