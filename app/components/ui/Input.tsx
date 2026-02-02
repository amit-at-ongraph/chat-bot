import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && <label className="text-text-secondary block text-sm font-medium">{label}</label>}
        <input
          ref={ref}
          className={`border-border-base bg-input text-text-main focus:border-primary focus:ring-primary block w-full rounded-xl border p-3 transition-all outline-none ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
