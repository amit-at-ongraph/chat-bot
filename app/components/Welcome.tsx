"use client";

import { APP_NAME } from "@/config";
import { Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/Button";

interface WelcomeProps {
  onSkip: () => void;
}

export default function Welcome({ onSkip }: WelcomeProps) {
  return (
    <div className="bg-app-bg/80 absolute inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
      <div className="border-border-light bg-app-bg w-full max-w-sm space-y-6 rounded-3xl border p-8 text-center shadow-2xl">
        <div>
          <h2 className="text-text-main text-2xl font-bold">Welcome</h2>
          <p className="text-text-muted mt-2">Please sign in to access the {APP_NAME}.</p>
        </div>
        <div className="space-y-3">
          <Button
            onClick={() => signIn("google")}
            className="flex w-full items-center justify-center gap-3 py-4 font-bold"
          >
            <Image
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="h-5 w-5"
              width={24}
              height={24}
            />
            Sign in with Google
          </Button>

          <Link href="/login" className="block">
            <Button
              variant="ghost"
              className="border-border-base text-text-main flex w-full items-center justify-center gap-3 border py-4 font-bold"
            >
              <Mail className="h-5 w-5" />
              Sign in with Email
            </Button>
          </Link>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="border-border-light w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-app-bg text-text-muted px-2 tracking-wider uppercase">
                New here?
              </span>
            </div>
          </div>

          <Link href="/register" className="block">
            <Button
              variant="ghost"
              className="text-primary hover:bg-primary/10 w-full py-3 font-bold"
            >
              Create an account
            </Button>
          </Link>

          <Button
            variant="ghost"
            onClick={onSkip}
            className="bg-border-light text-text-secondary hover:bg-border-base w-full py-3 font-semibold"
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
}
