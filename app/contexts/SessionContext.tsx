"use client";

import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { createContext, ReactNode, useContext } from "react";

interface SessionContextType {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  return <SessionContext.Provider value={{ session, status }}>{children}</SessionContext.Provider>;
}

export function useSessionContext() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSessionContext must be used within a SessionProvider");
  }
  return context;
}
