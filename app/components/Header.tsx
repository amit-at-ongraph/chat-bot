import { UI_CONFIG } from "@/config";
import { Menu, Moon, Sun } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useTranslation } from "../i18n/useTranslation";
import { Button } from "./ui/Button";
import { LanguageSelector } from "./ui/LanguageSelector";

interface HeaderProps {
  skippedAuth: boolean;
  onToggleSidebar: () => void;
  isSidebarOpen?: boolean;
  mainContentOffsetClasses: string;
}

export default function Header({ skippedAuth, onToggleSidebar, isSidebarOpen, mainContentOffsetClasses }: HeaderProps) {
  const { data: session } = useSession();
  const { setTheme, resolvedTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <header className={`sticky top-0 z-10 flex items-center justify-between bg-transparent px-4 py-3 ${mainContentOffsetClasses}`}>
      <div className="flex items-center gap-3">
        {(session || skippedAuth) && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className={`w-fit transition-opacity lg:hidden ${isSidebarOpen ? "pointer-events-none opacity-0" : ""}`}
            aria-label={t("common.toggle_sidebar")}
          >
            <Menu className="h-6 w-6" />
          </Button>
        )}
        <div className="flex items-center gap-2">
          <Image
            src="/PAXIS.jpg"
            alt="Logo"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          <h1 className="text-text-main m-0 block text-xl font-bold tracking-tight truncate max-w-[150px] sm:max-w-md">
            {UI_CONFIG.HEADER_TITLE}
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <LanguageSelector />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="text-text-muted hover:text-text-main h-9 w-9 transition-colors"
            aria-label={t("common.toggle_theme")}
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
        {!session && skippedAuth ? (
          <Button onClick={() => signIn()} className="px-3 py-1.5 text-xs font-bold">
            {t("common.sign_in")}
          </Button>
        ) : null}
      </div>
    </header>
  );
}
