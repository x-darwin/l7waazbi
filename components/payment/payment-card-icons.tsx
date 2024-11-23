"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

const paymentMethods = [
  { name: "Visa", logo: "images/payment/visa.svg" },
  { name: "Mastercard", logo: "images/payment/master.svg" },
  { name: "American Express", logo: "images/payment/amex.svg" }
];

export function PaymentCardIcons() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex justify-center items-center space-x-4 py-2">
        {paymentMethods.map((method) => (
          <div
            key={method.name}
            className="relative w-12 h-12 flex-shrink-0"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center space-x-4 py-2">
      {paymentMethods.map((method) => (
        <div
          key={method.name}
          className="relative w-12 h-12 flex-shrink-0"
        >
          <Image
            src={method.logo}
            alt={method.name}
            fill
            className={`object-contain transition-all duration-200 ${
              resolvedTheme === "dark" ? "brightness-0 invert" : "brightness-100"
            }`}
            priority
          />
        </div>
      ))}
    </div>
  );
}

export default PaymentCardIcons;