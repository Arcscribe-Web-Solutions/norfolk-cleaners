"use client";

import React, { forwardRef } from "react";
import PhoneInputLib from "react-phone-number-input";
import type { E164Number } from "libphonenumber-js";
import "react-phone-number-input/style.css";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
}

/**
 * International phone input with country flag selector.
 * Wraps react-phone-number-input with project styling.
 */
export default function PhoneInput({
  value,
  onChange,
  label = "Phone number",
  required = false,
  placeholder = "7342 416166",
}: PhoneInputProps) {
  const id = "phone_number";

  return (
    <div className="phone-input-wrapper">
      {label && (
        <label
          htmlFor={id}
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}
      <PhoneInputLib
        international
        countryCallingCodeEditable={false}
        defaultCountry="GB"
        value={(value as E164Number) || undefined}
        onChange={(val) => onChange(val ?? "")}
        placeholder={placeholder}
        numberInputProps={{
          id,
          required,
          className:
            "phone-input-field w-full rounded-lg border-0 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none",
        }}
      />
    </div>
  );
}
