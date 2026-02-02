"use client";

import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className = "", label, error, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className="space-y-1">
        {label && <label className="text-text-secondary block text-sm font-medium">{label}</label>}
        <div className="relative">
          <input
            ref={ref}
            type={showPassword ? "text" : "password"}
            className={`border-border-base bg-input text-text-main focus:border-primary focus:ring-primary block w-full rounded-xl border p-3 pr-10 transition-all outline-none ${className}`}
            {...props}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="text-text-muted hover:text-text-main absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
