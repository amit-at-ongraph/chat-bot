import * as React from "react";

import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  bordered?: boolean;
  children?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, bordered = true, children, ...props }, ref) => {
    if (children) {
      return (
        <div className="flex items-center gap-2">
          <input
            type={type}
            ref={ref}
            data-slot="input"
            className={cn(
              "file:text-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 h-9 w-full min-w-0 rounded-md bg-transparent px-3 py-1 text-base text-black transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-black disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:text-white dark:placeholder:text-white",
              bordered
                ? "border border-solid border-neutral-200 dark:border-neutral-600"
                : "border-none",
              "focus-visible:border-primary/50 focus-visible:ring-primary/10 focus-visible:ring-2 dark:focus-visible:ring-white/60",
              "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
              className,
            )}
            {...props}
          />
          {children}
        </div>
      );
    }

    return (
      <input
        type={type}
        ref={ref}
        data-slot="input"
        className={cn(
          "file:text-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 h-9 w-full min-w-0 rounded-md bg-transparent px-3 py-1 text-base text-black transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-black disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:text-white dark:placeholder:text-white",
          bordered
            ? "border border-solid border-neutral-200 dark:border-neutral-600"
            : "border-none",
          "focus-visible:border-primary/50 focus-visible:ring-primary/10 focus-visible:ring-2 dark:focus-visible:ring-white/60",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input };
