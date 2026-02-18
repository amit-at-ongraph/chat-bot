import { UI_CONFIG } from "@/config";
import { Menu, Moon, Sun } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useTranslation } from "../i18n/useTranslation";
import { Button } from "./ui/Button";
import { LanguageSelector } from "./ui/LanguageSelector";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

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
            className="h-10 w-10 object-fit rounded-full"
            onClick={() => {
              router.push("/");
            }}
          />
          <h1 className="text-text-main m-0 block text-lg font tracking-tight truncate max-w-[170px] sm:text-xl font-semibold sm:max-w-md">
            {UI_CONFIG.HEADER_TITLE}
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-3">
        <div className="flex items-center gap-0 sm:gap-1">
          <LanguageSelector />

          {(!session && skippedAuth) ? null : (
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
        {!session && skippedAuth ? (
          <Button
            onClick={() => signIn()}
            className="whitespace-nowrap px-3 py-1.5 text-xs font-bold leading-none"
          >
            {t("common.sign_in")}
          </Button>
        ) : null}
      </div>
    </header>
  );
}
