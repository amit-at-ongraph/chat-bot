"use client";

import { useEffect, useState } from "react";
import { getCookie } from "../utils";

export function useHasAnonymousCookie() {
  const [hasAnonymousUser, setHasAnonymousUser] = useState<boolean | null>(null);

  useEffect(() => {
    const checkCookie = () => {
      const cookie = getCookie("anonymous_user");
      setHasAnonymousUser(cookie === "true");
    };
    // Initial check
    checkCookie();

    // Check when tab gets focus
    window.addEventListener("focus", checkCookie);

    // Check when tab becomes visible
    document.addEventListener("visibilitychange", checkCookie);

    // Sync across tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "anonymous_user_updated") {
        checkCookie();
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("focus", checkCookie);
      document.removeEventListener("visibilitychange", checkCookie);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return hasAnonymousUser;
}
