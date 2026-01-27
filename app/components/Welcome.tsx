"use client";

import { Globe } from "lucide-react";
import { signIn } from "next-auth/react";

interface WelcomeProps {
  onSkip: () => void;
}

export default function Welcome({ onSkip }: WelcomeProps) {
  return (
    <div className="bg-app-bg/80 absolute inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
      <div className="border-border-light bg-app-bg w-full max-w-sm space-y-6 rounded-3xl border p-8 text-center shadow-2xl">
        <div className="bg-primary/10 mx-auto flex h-20 w-20 items-center justify-center rounded-full">
          <Globe className="text-primary h-10 w-10" />
        </div>
        <div>
          <h2 className="text-text-main text-2xl font-bold">Welcome</h2>
          <p className="text-text-muted mt-2">
            Please sign in to access the Immigration Action Guide.
          </p>
        </div>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => signIn("google")}
            className="bg-text-main text-app-bg hover:bg-text-secondary flex w-full items-center justify-center gap-3 rounded-full py-4 font-bold transition-all active:scale-95"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="h-5 w-5"
            />
            Sign in with Google
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="bg-border-light text-text-secondary hover:bg-border-base w-full rounded-full py-3 font-semibold transition-all active:scale-95"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
