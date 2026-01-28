"use client";

import { AlertCircle, X } from "lucide-react";

interface ErrorToastProps {
  error: string;
  onRetry: () => void;
  onClear: () => void;
}

export default function ErrorToast({ error, onRetry, onClear }: ErrorToastProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex max-w-md items-center gap-5 rounded-lg border border-red-500/20 bg-red-700 p-2 text-white shadow-lg">
      <AlertCircle className="h-5 w-5" />
      <span className="flex-1 text-sm break-all">{error}</span>

      <div className="flex items-center gap-3">
        <button
          onClick={onRetry}
          className="cursor-pointer text-xs font-semibold underline transition-colors hover:text-red-200"
        >
          Retry
        </button>
        <button
          onClick={onClear}
          className="absolute top-2 right-2 cursor-pointer rounded-full p-1 transition-colors hover:bg-red-900/30"
          aria-label="Close alert"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
