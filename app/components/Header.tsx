"use client";

import { Menu, Moon, Sun } from "lucide-react";
import { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Button } from "./ui/Button";

interface HeaderProps {
  session: Session | null;
  skippedAuth: boolean;
  onToggleSidebar: () => void;
  isSidebarOpen?: boolean;
}

export default function Header({
  session,
  skippedAuth,
  onToggleSidebar,
  isSidebarOpen,
}: HeaderProps) {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-transparent px-4 py-3">
      <div className="flex items-center gap-3">
        {session && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className={`transition-opacity lg:hidden ${isSidebarOpen ? "pointer-events-none opacity-0" : ""}`}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-6 w-6" />
          </Button>
        )}
        <div className="flex items-center gap-2">
          <h1 className="text-text-main hidden text-xl font-bold tracking-tight sm:block sm:truncate md:max-w-md">
            Immigration Action Guide
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="text-text-muted hover:text-text-main h-9 w-9 transition-colors"
            aria-label="Toggle theme"
          >
            {!typeof window ? (
              <div className="h-5 w-5" />
            ) : resolvedTheme === "dark" ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5 text-slate-700" />
            )}
          </Button>
        </div>
        {session ? (
          <Button
            variant="ghost"
            onClick={() => signOut({ redirect: true })}
            className="text-text-muted px-2 py-1 text-xs font-bold transition-colors hover:text-red-400"
          >
            Sign Out
          </Button>
        ) : skippedAuth ? (
          <Button onClick={() => signIn()} className="px-3 py-1.5 text-xs font-bold">
            Sign In
          </Button>
        ) : null}
      </div>
    </header>
  );
}
