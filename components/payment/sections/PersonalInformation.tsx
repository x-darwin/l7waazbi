"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isValidEmail, isValidName, isValidPhone } from "../card-validation";

interface Country {
  code: string;
  name: string;
}

interface PersonalInformationProps {
  countries: Country[];
  selectedCountry: string;
  onCountryChange: (value: string) => void;
}

export function PersonalInformation({
  countries,
  selectedCountry,
  onCountryChange,
}: PersonalInformationProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="dark:text-gray-100">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="your@email.com"
          required
          pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
          title="Please enter a valid email address"
          className="dark:bg-slate-900/0 dark:border-gray-700"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name" className="dark:text-gray-100">Full Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="John Doe"
          required
          pattern="[a-zA-Z\s-']+"
          minLength={2}
          title="Please enter your full name (letters, spaces, hyphens, and apostrophes only)"
          className="dark:bg-slate-900/0 dark:border-gray-700"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone" className="dark:text-gray-100">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+1 (234) 567-8900"
          required
          pattern="\+?[\d\s-]{8,}"
          title="Please enter a valid phone number"
          className="dark:bg-slate-900/0 dark:border-gray-700"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="country" className="dark:text-gray-100">Country</Label>
        <Select
          value={selectedCountry}
          onValueChange={onCountryChange}
          required
        >
          <SelectTrigger id="country" className="dark:bg-slate-900/0 dark:border-gray-700">
            <SelectValue placeholder="Select your country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}