"use client";

import axios, { AxiosError } from "axios";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Turnstile from "react-turnstile";
import { toast } from "sonner";
import { useHasAnonymousCookie } from "../hooks/useHasAnonymousCookie";
import { createGuestVerifySession } from "../lib/guestVerifySession";

interface VerifyHumanSuccessResponse {
  success: true;
}

interface VerifyHumanErrorResponse {
  success: false;
  error: string;
  errorCodes?: string[];
}

type VerifyHumanResponse = VerifyHumanSuccessResponse | VerifyHumanErrorResponse;

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

function isVerifyHumanErrorResponse(data: VerifyHumanResponse): data is VerifyHumanErrorResponse {
  return data.success === false;
}

function getVerifyHumanErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error
      ? error.message || "An unexpected error occurred. Please try again."
      : "Verification failed. Please try again.";
  }

  const axiosError = error as AxiosError<VerifyHumanErrorResponse>;

  if (axiosError.response) {
    const status = axiosError.response.status;
    const responseData = axiosError.response.data;

    if (status === 400 && responseData?.error) return responseData.error;
    if (status === 429) return "Too many attempts. Please wait a moment and try again.";
    if (status === 500) return "Server error. Please try again later.";
    if (status === 502 || status === 503)
      return responseData?.error || "Verification service unavailable. Please try again later.";
    if (responseData?.error) return responseData.error;

    return "Verification failed. Please try again.";
  }

  if (axiosError.request) {
    return "Network error. Please check your connection and try again.";
  }

  return axiosError.message || "An unexpected error occurred. Please try again.";
}

export default function VerifyHumanPage() {
  const router = useRouter();
  const [isTurnstileLoading, setIsTurnstileLoading] = useState(true);
  const [turnstileKey, setTurnstileKey] = useState(0); // re-mount to allow retry
  const hasAnonymousCookie = useHasAnonymousCookie();
  const { theme } = useTheme();

  useEffect(() => {
    if (!SITE_KEY) {
      toast.error("No SITE KEY found. Please configure it.");
    }
  }, []);

  // Redirect if user already has anonymous cookie
  useEffect(() => {
    if (hasAnonymousCookie) {
      router.push("/");
    }
  }, [hasAnonymousCookie, router]);

  const turnstileTheme = useMemo(
    () => (["light", "white"].includes(theme) ? "light" : "dark"),
    [theme],
  );

  const resetTurnstile = useCallback(() => {
    setTurnstileKey((prev) => prev + 1);
  }, []);

  const handleVerify = useCallback(
    async (token: string): Promise<void> => {
      try {
        const { data } = await axios.post<VerifyHumanResponse>("/api/verify-human", { token });

        if (isVerifyHumanErrorResponse(data)) {
          toast.error(data.error || "Human verification failed", { duration: 5000 });
          resetTurnstile();
          return;
        }

        const sessionResult = await createGuestVerifySession();
        if (!sessionResult.ok) {
          toast.error("Failed to create session");
          return;
        }

        router.push("/");
        router.refresh();
      } catch (error) {
        console.error("Verification error:", error);
        toast.error(getVerifyHumanErrorMessage(error), { duration: 5000 });
        resetTurnstile();
      }
    },
    [resetTurnstile, router],
  );

  if (!SITE_KEY || hasAnonymousCookie === null) {
    return null;
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-transparent">
      <Turnstile
        key={turnstileKey}
        sitekey={SITE_KEY}
        onVerify={handleVerify}
        theme={turnstileTheme}
        onLoad={() => {
          setIsTurnstileLoading(false);
        }}
      />

      {isTurnstileLoading && <p>Loading...</p>}
    </div>
  );
}
