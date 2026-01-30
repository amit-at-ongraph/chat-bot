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
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-transparent px-4 py-3">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className={`transition-opacity lg:hidden ${isSidebarOpen ? "pointer-events-none opacity-0" : ""}`}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <div className="flex items-center gap-2">
          <h1 className="text-text-main hidden text-xl font-bold tracking-tight sm:block sm:truncate md:max-w-md">
            Immigration Action Guide
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9 w-9"
        >
          <Sun className="absolute h-5 w-5 scale-100 transition-transform dark:scale-0" />
          <Moon className="absolute h-5 w-5 scale-0 transition-transform dark:scale-100" />
        </Button>
        {session ? (
          <Button
            variant="ghost"
            onClick={() => signOut({ redirect: true })}
            className="text-text-muted hover:text-error px-0 py-0 text-xs font-bold"
          >
            Sign Out
          </Button>
        ) : skippedAuth ? (
          <Button onClick={() => signIn("google")} className="px-3 py-1.5 text-xs font-bold">
            Sign In
          </Button>
        ) : null}
      </div>
    </header>
  );
}
