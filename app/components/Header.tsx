"use client";

import { Globe, Menu, Moon, Sun, User } from "lucide-react";
import { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import Image from "next/image";

interface HeaderProps {
  session: Session | null;
  skippedAuth: boolean;
  onToggleSidebar: () => void;
}

export default function Header({ session, skippedAuth, onToggleSidebar }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="bg-header-bg border-border-dark sticky top-0 z-10 flex items-center justify-between border-b px-4 py-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="text-text-secondary hover:bg-border-base active:bg-border-dark flex h-10 w-10 items-center justify-center rounded-full transition-all hover:cursor-pointer"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2">
          <div className="border-border-base bg-app-bg flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border shadow-sm">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt="logo"
                className="h-full w-full object-cover"
                width={24}
                height={24}
              />
            ) : (
              <User className="text-text-main h-5 w-5" />
            )}
          </div>
          <h1 className="text-text-main text-xl font-bold tracking-tight">
            Immigration Action Guide
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-text-secondary hover:bg-border-base flex h-9 w-9 items-center justify-center rounded-full transition-all"
        >
          <Sun className="absolute h-5 w-5 scale-100 transition-transform dark:scale-0" />
          <Moon className="absolute h-5 w-5 scale-0 transition-transform dark:scale-100" />
        </button>
        {session ? (
          <button
            onClick={() => signOut({ redirect: true })}
            className="text-text-muted hover:text-error text-xs font-bold transition-colors"
          >
            Sign Out
          </button>
        ) : skippedAuth ? (
          <button
            type="button"
            onClick={() => signIn("google")}
            className="bg-text-main text-app-bg hover:bg-text-secondary rounded-full px-3 py-1.5 text-xs font-bold transition-all active:scale-95"
          >
            Sign In
          </button>
        ) : null}
        <Globe className="text-text-secondary h-6 w-6 cursor-pointer" />
      </div>
    </header>
  );
}
