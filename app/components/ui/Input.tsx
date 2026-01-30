import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`border-primary bg-app-bg focus:ring-primary w-full rounded-md border px-2 py-1 text-sm transition-all outline-none focus:ring-1 ${className}`}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
