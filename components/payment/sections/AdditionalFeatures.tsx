"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface Feature {
  id: string;
  label: string;
  price: number;
}

interface AdditionalFeaturesProps {
  features: Feature[];
  selectedFeatures: string[];
  onFeatureToggle: (featureId: string, checked: boolean) => void;
}

export function AdditionalFeatures({
  features,
  selectedFeatures,
  onFeatureToggle,
}: AdditionalFeaturesProps) {
  return (
    <div className="space-y-4">
      <Label className="dark:text-gray-100">Additional Features</Label>
      {features.map((feature) => (
        <div key={feature.id} className="flex items-center justify-between p-4 rounded-lg border dark:border-gray-700 bg-background/50 dark:bg-gray-800/50">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={feature.id}
              checked={selectedFeatures.includes(feature.id)}
              onCheckedChange={(checked) => onFeatureToggle(feature.id, checked as boolean)}
            />
            <label htmlFor={feature.id} className="text-sm cursor-pointer dark:text-gray-200">
              {feature.label}
            </label>
          </div>
          <span className="text-sm font-semibold dark:text-gray-200">+${feature.price}</span>
        </div>
      ))}
    </div>
  );
}