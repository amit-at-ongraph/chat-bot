import { NextRequest, NextResponse } from "next/server";

// Cloudflare Turnstile error codes
type TurnstileErrorCode =
  | "missing-input-secret"
  | "invalid-input-secret"
  | "missing-input-response"
  | "invalid-input-response"
  | "bad-request"
  | "timeout-or-duplicate"
  | "internal-error";

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: TurnstileErrorCode[];
  challenge_ts?: string;
  hostname?: string;
}

interface VerifyHumanRequest {
  token: string;
}

interface VerifyHumanSuccessResponse {
  success: true;
}

interface VerifyHumanErrorResponse {
  success: false;
  error: string;
  errorCodes?: TurnstileErrorCode[];
}

type VerifyHumanResponse = VerifyHumanSuccessResponse | VerifyHumanErrorResponse;

const TURNSTILE_ERROR_MESSAGES: Record<TurnstileErrorCode, string> = {
  "missing-input-secret": "Server configuration error. Please contact support.",
  "invalid-input-secret": "Server configuration error. Please contact support.",
  "missing-input-response": "Verification token is missing. Please try again.",
  "invalid-input-response": "Invalid verification response. Please try again.",
  "bad-request": "Invalid request. Please try again.",
  "timeout-or-duplicate": "Verification expired or already used. Please try again.",
  "internal-error": "Verification service error. Please try again later.",
};

function getErrorMessage(errorCodes: TurnstileErrorCode[]): string {
  // Return the first error message, or a default message
  if (errorCodes.length > 0) {
    const firstError = errorCodes[0];
    return TURNSTILE_ERROR_MESSAGES[firstError] || "Human verification failed. Please try again.";
  }
  return "Human verification failed. Please try again.";
}

export async function POST(req: NextRequest): Promise<NextResponse<VerifyHumanResponse>> {
  try {
    const body: VerifyHumanRequest = await req.json();
    const { token } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Verification token is required. Please try again.",
        },
        { status: 400 }
      );
    }

    if (!process.env.TURNSTILE_SECRET_KEY) {
      console.error("TURNSTILE_SECRET_KEY is not configured");
      return NextResponse.json(
        {
          success: false,
          error: "Server configuration error. Please contact support.",
        },
        { status: 500 }
      );
    }

    let res: Response;
    try {
      res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: token,
        }),
      });
    } catch (fetchError) {
      const error = fetchError instanceof Error ? fetchError : new Error("Unknown fetch error");
      console.error("Failed to reach Cloudflare Turnstile:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Unable to reach verification service. Please check your connection and try again.",
        },
        { status: 503 }
      );
    }

    if (!res.ok) {
      console.error("Cloudflare Turnstile API error:", res.status, res.statusText);
      return NextResponse.json(
        {
          success: false,
          error: "Verification service error. Please try again later.",
        },
        { status: 502 }
      );
    }

    const data: TurnstileVerifyResponse = await res.json();

    if (data.success) {
      // Set cookie with 1 year expiration
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

      const response = NextResponse.json<VerifyHumanSuccessResponse>({ success: true });

      // Set cookie accessible to JavaScript (not httpOnly) since it's just a boolean flag
      // This allows client-side checks for UI state
      response.cookies.set("anonymous_user", "true", {
        httpOnly: false, // Allow JavaScript access for client-side checks
        secure: process.env.NODE_ENV === "production", // Use secure in production
        sameSite: "lax",
        path: "/",
        expires: oneYearFromNow,
      });

      console.log("Anonymous user cookie set successfully after verification");

      return response;
    } else {
      // Cloudflare Turnstile returns error codes in data["error-codes"]
      const errorCodes: TurnstileErrorCode[] = data["error-codes"] || [];
      const errorMessage = getErrorMessage(errorCodes);

      // Log error codes for debugging
      if (errorCodes.length > 0) {
        console.error("Turnstile error codes:", errorCodes);
      }

      return NextResponse.json<VerifyHumanErrorResponse>(
        {
          success: false,
          error: errorMessage,
          errorCodes: errorCodes.length > 0 ? errorCodes : undefined,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";
    console.error("Verify human error:", error);
    return NextResponse.json<VerifyHumanErrorResponse>(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

