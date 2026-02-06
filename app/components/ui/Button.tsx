import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "primary-action" | "secondary" | "ghost" | "action" | "danger" | "none";
  size?: "sm" | "md" | "lg" | "icon" | "none";
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const variants = {
      primary: "bg-text-main text-app-bg hover:bg-text-secondary font-bold justify-center",
      "primary-action": "bg-primary text-app-bg hover:bg-primary/90 font-bold justify-center",
      secondary: "bg-selected text-primary hover:bg-border-base font-medium justify-center",
      ghost: "text-text-secondary hover:bg-border-base justify-center",
      action:
        "bg-action-btn-bg border-border-base hover:bg-app-bg border shadow-sm hover:shadow-md justify-center",
      danger: "text-red-500 hover:bg-border-base justify-center",
      none: "",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs rounded-full",
      md: "px-4 py-2 text-sm rounded-full",
      lg: "px-6 py-3 text-base rounded-full",
      icon: "h-10 w-10 rounded-full justify-center",
      none: "",
    };

    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    return (
      <button ref={ref} className={combinedClassName} {...props}>
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
