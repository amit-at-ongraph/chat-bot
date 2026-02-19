"use client";

import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Turnstile from "react-turnstile";
import { toast } from "sonner";
import { useHasAnonymousCookie } from "../hooks/useHasAnonymousCookie";
import { useTheme } from "next-themes";

interface VerifyHumanSuccessResponse {
  success: true;
}

interface VerifyHumanErrorResponse {
  success: false;
  error: string;
  errorCodes?: string[];
}

type VerifyHumanResponse = VerifyHumanSuccessResponse | VerifyHumanErrorResponse;

export default function VerifyHumanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const hasAnonymousCookie = useHasAnonymousCookie();
  const { theme } = useTheme()

  // Show loading state while checking cookie
  if (hasAnonymousCookie === null) {
    return null;
  }

  // Redirect if user already has anonymous cookie
  if (hasAnonymousCookie) {
    router.push("/");
  }

  const handleVerify = async (token: string): Promise<void> => {
    setLoading(true);
    const verifyToast = toast.loading("Verifying...", { id: "verify-toast" });

    try {
      const response = await axios.post<VerifyHumanResponse>("/api/verify-human", { token });
      const data = response.data;

      if (data.success) {
        toast.success("Verification successful! Welcome!", { id: verifyToast });
        router.push("/");
        router.refresh();
      } else {
        // Verification failed - could be bot detection, expired token, etc.
        const errorResponse = data as VerifyHumanErrorResponse;
        const errorMessage = errorResponse.error || "Human verification failed";
        toast.error(errorMessage, { id: verifyToast, duration: 5000 });
        setLoading(false);
        // Reset Turnstile to allow retry
        setTurnstileKey((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Verification error:", error);

      let errorMessage = "Verification failed. Please try again.";

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<VerifyHumanErrorResponse>;

        if (axiosError.response) {
          // Server responded with error
          const status = axiosError.response.status;
          const responseData = axiosError.response.data;

          if (status === 400 && responseData?.error) {
            errorMessage = responseData.error;
          } else if (status === 500) {
            errorMessage = "Server error. Please try again later.";
          } else if (status === 502 || status === 503) {
            errorMessage =
              responseData?.error || "Verification service unavailable. Please try again later.";
          } else if (status === 429) {
            errorMessage = "Too many attempts. Please wait a moment and try again.";
          } else if (responseData?.error) {
            errorMessage = responseData.error;
          }
        } else if (axiosError.request) {
          // Request made but no response (network error)
          errorMessage = "Network error. Please check your connection and try again.";
        } else {
          // Something else happened
          errorMessage = axiosError.message || "An unexpected error occurred. Please try again.";
        }
      } else if (error instanceof Error) {
        errorMessage = error.message || "An unexpected error occurred. Please try again.";
      }

      toast.error(errorMessage, { id: verifyToast, duration: 5000 });
      setLoading(false);

      // Reset Turnstile to allow retry
      setTurnstileKey((prev) => prev + 1);
    }
  };

  return (
    <div className="bg-transparent flex h-full flex-col items-center justify-center gap-4">

      <Turnstile
        key={turnstileKey}
        sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onVerify={handleVerify}
        theme={['light', 'white'].includes(theme) ? "light" : "dark"}
      />

      {loading && <p>Verifying...</p>}
    </div>
  );
}
