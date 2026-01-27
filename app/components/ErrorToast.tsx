"use client";

import { AlertCircle, X } from "lucide-react";

interface ErrorToastProps {
  error: string;
  onRetry: () => void;
  onClear: () => void;
}

export default function ErrorToast({ error, onRetry, onClear }: ErrorToastProps) {
  return (
    <div className="border-error/20 bg-error-bg text-error-text fixed top-4 right-4 z-50 flex max-w-md items-center gap-3 rounded-lg border px-4 py-3 shadow-lg">
      <AlertCircle className="h-5 w-5" />
      <span className="flex-1 text-sm">{error}</span>

      <div className="flex items-center gap-3">
        <button
          onClick={onRetry}
          className="hover:text-error cursor-pointer text-xs font-semibold underline transition-colors"
        >
          Retry
        </button>
        <button
          onClick={onClear}
          className="hover:bg-error/10 absolute top-2 right-2 cursor-pointer rounded-full p-1 transition-colors"
          aria-label="Close alert"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
