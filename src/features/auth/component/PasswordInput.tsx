"use client";

import React, { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  autoComplete?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
};

const PasswordInput = ({
  label,
  value,
  onChange,
  placeholder = "Enter your password",
  id,
  autoComplete,
  helperText,
  error,
  required = false,
}: PasswordInputProps) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={inputId}
          className="text-sm font-medium tracking-[0.01em] text-[#4f3422]"
        >
          {label}
        </label>
        {helperText ? (
          <span className="text-xs text-[#967663]">{helperText}</span>
        ) : null}
      </div>

      <div className="relative">
        <input
          id={inputId}
          type={isVisible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full rounded-2xl border bg-white px-4 py-3.5 pr-14 text-sm text-[#4f3422] shadow-[0_1px_2px_rgba(79,52,34,0.04)] transition focus:border-[#f59c47] focus:bg-[#fffdfb] focus:outline-none focus:ring-4 focus:ring-[#f59c47]/15 ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
              : "border-[#e8d6c5]"
          }`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          required={required}
        />
        <button
          type="button"
          onClick={() => setIsVisible((current) => !current)}
          className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#8f6a54] transition hover:bg-[#fff3e8] hover:text-[#d96d2d] focus:outline-none focus:ring-2 focus:ring-[#f59c47]/30"
          aria-label={`${isVisible ? "Hide" : "Show"} ${label.toLowerCase()}`}
        >
          {isVisible ? (
            <EyeOff className="h-[18px] w-[18px]" />
          ) : (
            <Eye className="h-[18px] w-[18px]" />
          )}
        </button>
      </div>

      {error ? (
        <p id={errorId} className="text-sm text-red-600">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs leading-5 text-[#967663]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

export default PasswordInput;
