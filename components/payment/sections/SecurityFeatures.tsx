"use client";

import { Shield, Lock, RotateCcw } from "lucide-react";

const securityFeatures = [
  {
    icon: Shield,
    title: "Secure Payment",
    description: "256-bit SSL encryption",
  },
  {
    icon: Lock,
    title: "Card Security",
    description: "All major cards accepted",
  },
  {
    icon: RotateCcw,
    title: "Money Back",
    description: "30-day guarantee",
  },
];

export function SecurityFeatures() {
  return (
    <div className="grid grid-cols-3 gap-4 pt-4">
      {securityFeatures.map((feature) => (
        <div key={feature.title} className="text-center space-y-2">
          <feature.icon className="h-6 w-6 mx-auto text-muted-foreground" />
          <div className="space-y-1">
            <h4 className="text-sm font-medium dark:text-gray-100">{feature.title}</h4>
            <p className="text-xs text-muted-foreground">{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}