import { AUTH_CONFIG, UI_CONFIG } from "@/config";
import { Menu, Moon, Sun } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslation } from "../i18n/useTranslation";
import { Button } from "./ui/Button";
import { LanguageSelector } from "./ui/LanguageSelector";

interface HeaderProps {
  skippedAuth: boolean;
  onToggleSidebar: () => void;
  isSidebarOpen?: boolean;
  mainContentOffsetClasses: string;
}

export default function Header({
  skippedAuth,
  onToggleSidebar,
  isSidebarOpen,
  mainContentOffsetClasses,
}: HeaderProps) {
  const { data: session } = useSession();
  const { setTheme, resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <header
      className={`sticky top-0 z-10 flex items-center justify-between bg-transparent px-4 py-3 ${mainContentOffsetClasses}`}
    >
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
            className="object-fit h-10 w-10 rounded-full"
            onClick={() => {
              router.push("/");
            }}
          />
          <h1 className="text-text-main font m-0 block max-w-[170px] truncate text-lg font-semibold tracking-tight sm:max-w-md sm:text-xl">
            {UI_CONFIG.HEADER_TITLE}
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-3">
        <div className="flex items-center gap-0 sm:gap-1">
          <LanguageSelector />

          {AUTH_CONFIG.USER_AUTH_ENABLED ? null : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="text-text-muted hover:text-text-main h-9 w-9 transition-colors"
              aria-label={t("common.toggle_theme")}
            >
              {typeof window === "undefined" ? (
                <div className="h-5 w-5" />
              ) : resolvedTheme === "dark" ? (
                <Sun className="h-5 w-5 text-amber-400" />
              ) : (
                <Moon className="h-5 w-5 text-slate-700" />
              )}
            </Button>
          )}
        </div>
        {AUTH_CONFIG.USER_AUTH_ENABLED && !session && skippedAuth ? (
          <Button
            onClick={() => signIn()}
            className="px-3 py-1.5 text-xs leading-none font-bold whitespace-nowrap"
          >
            {t("common.sign_in")}
          </Button>
        ) : null}
      </div>
    </header>
  );
}
