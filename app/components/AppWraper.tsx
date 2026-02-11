"use client";

import { useSession } from "next-auth/react";
import AppShell from "./AppShell";
import Spinner from "./Spinner";

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
