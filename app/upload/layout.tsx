"use client";

import { UserRole } from "@/lib/constants";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UploadLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (authStatus === "authenticated" && session?.user?.role !== UserRole.ADMIN) {
      router.push("/");
    }
  }, [authStatus, session, router]);

  if (authStatus === "loading") return null;
  if (!session) {
    router.push("/");
    return null;
  }

  return <>{children}</>;
}
