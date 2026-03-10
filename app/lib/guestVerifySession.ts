"use client";

import { signIn } from "next-auth/react";

export async function getUserLocationOrDenied(): Promise<string> {
  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
    });
    return `${position.coords.latitude}, ${position.coords.longitude}`;
  } catch {
    console.warn("Location access denied or timed out");
    return "Denied";
  }
}

type CreateGuestVerifySessionResult = { ok: true } | { ok: false; error?: string };

export async function createGuestVerifySession(
  options: { includeLocation?: boolean } = {},
): Promise<CreateGuestVerifySessionResult> {
  const includeLocation = options.includeLocation ?? true;
  const location = includeLocation ? await getUserLocationOrDenied() : "Denied";

  const result = await signIn("guest-verify", {
    isGuest: "true",
    location,
    redirect: false,
  });

  if (result?.error) return { ok: false, error: result.error };
  return { ok: true };
}

