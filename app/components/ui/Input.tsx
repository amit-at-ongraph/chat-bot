import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`border-primary bg-app-bg focus:ring-primary w-full rounded-full border px-4 py-2 text-sm transition-all outline-none focus:ring-1 ${className}`}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
