"use client";

import { memo } from 'react';

interface PaymentSummaryProps {
  subtotal: number;
  total: number;
}

export const PaymentSummary = memo(function PaymentSummary({ subtotal, total }: PaymentSummaryProps) {
  return (
    <div className="pt-4 border-t dark:border-gray-700">
      <div className="flex justify-between text-lg font-semibold dark:text-gray-100">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  );
});