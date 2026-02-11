import { cn } from "@/lib/utils";
import React from "react";

export const FormField = ({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("flex flex-col gap-1.5", className)}>
    <label className="text-text-main text-xs font-medium">{label}</label>
    <div className="relative">{children}</div>
  </div>
);
