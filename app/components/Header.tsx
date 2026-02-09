import { UI_CONFIG } from "@/config";
import { Menu, Moon, Sun } from "lucide-react";
import { signIn, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useSessionContext } from "../contexts";
import { useTranslation } from "../i18n/useTranslation";
import { Button } from "./ui/Button";
import { LanguageSelector } from "./ui/LanguageSelector";

interface HeaderProps {
  skippedAuth: boolean;
  onToggleSidebar: () => void;
  isSidebarOpen?: boolean;
}

export default function Header({ skippedAuth, onToggleSidebar, isSidebarOpen }: HeaderProps) {
  const { session } = useSessionContext();
  const { setTheme, resolvedTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-transparent px-4 py-3">
      <div className="flex items-center gap-3">
        {session && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className={`transition-opacity lg:hidden ${isSidebarOpen ? "pointer-events-none opacity-0" : ""}`}
            aria-label={t("common.toggle_sidebar")}
          >
            <Menu className="h-6 w-6" />
          </Button>
        )}
        <div className="flex items-center gap-2">
          <h1 className="text-text-main m-0 hidden text-xl font-bold tracking-tight sm:block sm:truncate md:max-w-md">
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
        {session ? (
          <Button
            variant="ghost"
            onClick={() => {
              signOut({ redirect: true });
            }}
            className="text-text-muted px-2 py-1 text-xs font-bold transition-colors hover:text-red-400"
          >
            {t("common.sign_out")}
          </Button>
        ) : skippedAuth ? (
          <Button onClick={() => signIn()} className="px-3 py-1.5 text-xs font-bold">
            {t("common.sign_in")}
          </Button>
        ) : null}
      </div>
    </header>
  );
}
