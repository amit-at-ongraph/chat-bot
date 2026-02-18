"use client";

import { UserRole } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { DBChat } from "@/types/chat";
import { AnimatePresence, motion } from "framer-motion";
import {
  Database,
  Edit,
  Info,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  User,
  X,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "../i18n/useTranslation";
import HowToUse from "./HowToUse";
import { Button } from "./ui/Button";
import SidebarItem from "./SidebarItem";

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  isDesktop: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
  chats: DBChat[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  isLoadingChats?: boolean;
  selectedChatLoading?: boolean;
}

export default function Sidebar({
  isOpen,
  isCollapsed,
  isDesktop,
  onToggleCollapse,
  onClose,
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  isLoadingChats,
  selectedChatLoading,
}: SidebarProps) {
  const { data: session } = useSession();
  const [activeView, setActiveView] = useState<"main" | "how-to">("main");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { t } = useTranslation();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const effectivelyCollapsed = isCollapsed && isDesktop;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0, width: effectivelyCollapsed ? 64 : 288 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-header-bg border-border-dark fixed top-0 bottom-0 left-0 z-50 transform border-r"
          >
            <AnimatePresence mode="wait">
              {activeView === "main" ? (
                <motion.div
                  key="main"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex h-full w-full flex-col overflow-hidden"
                >
                  {/* Sidebar Header */}
                  <div className="flex h-16.25 items-center justify-start gap-4 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="none"
                        size="none"
                        onClick={onToggleCollapse}
                        className="text-text-muted hidden shrink-0 cursor-pointer max-lg:hidden lg:block"
                      >
                        <Menu className="h-6 w-6" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
                        <X className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>

                  {/* New Chat Button */}
                  <div className="flex flex-col justify-start gap-4 p-4 px-4">
                    <Button
                      variant="none"
                      size="none"
                      onClick={() => {
                        onNewChat();
                        if (window.innerWidth < 1024) {
                          onClose();
                        }
                      }}
                      className="w-full gap-3 text-[14px]"
                      title={effectivelyCollapsed ? t("common.new_chat") : ""}
                    >
                      <Edit className="h-4 w-4 shrink-0" />
                      {!effectivelyCollapsed && (
                        <span className="whitespace-nowrap">{t("common.new_chat")}</span>
                      )}
                    </Button>

                    <Button
                      variant="none"
                      size="none"
                      onClick={() => {
                        if (effectivelyCollapsed) {
                          onToggleCollapse();
                        }
                        setActiveView("how-to");
                      }}
                      className="w-full gap-3 text-[14px]"
                      title={effectivelyCollapsed ? t("common.how_to_use") : ""}
                    >
                      <Info className="h-4 w-4 shrink-0" />
                      {!effectivelyCollapsed && (
                        <span className="flex-1 text-left whitespace-nowrap">
                          {t("common.how_to_use")}
                        </span>
                      )}
                    </Button>

                    {session?.user?.role === UserRole.ADMIN && (
                      <Link
                        href="/upload"
                        className={cn("w-full", pathname === "/upload" ? "text-primary" : "")}
                        onClick={() => window.innerWidth < 1024 && onClose()}
                      >
                        <Button
                          variant="none"
                          size="none"
                          className="w-full gap-3 text-[14px]"
                          title={effectivelyCollapsed ? t("common.upload") : ""}
                        >
                          <Database className="h-4 w-4 shrink-0" />
                          {!effectivelyCollapsed && (
                            <span className="whitespace-nowrap">{t("common.upload")}</span>
                          )}
                        </Button>
                      </Link>
                    )}
                  </div>

                  {/* Navigation Items */}
                  <nav className="flex-1 space-y-1 overflow-y-auto">
                    {!effectivelyCollapsed && (
                      <div className="text-text-muted px-4 py-2 text-[14px]">
                        {t("common.recent_chats")}
                      </div>
                    )}
                    {isLoadingChats ? (
                      <div className="space-y-2 px-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className="bg-selected border-foreground/5 h-9 w-full animate-pulse rounded-[10px] border dark:border-white/5 dark:bg-white/5"
                          />
                        ))}
                      </div>
                    ) : (
                      <>
                        {!isCollapsed &&
                          chats.map((chat) => (
                            <SidebarItem
                              key={chat.id}
                              icon={MessageSquare}
                              label={chat.title || t("common.untitled_chat")}
                              active={currentChatId === chat.id}
                              loading={selectedChatLoading && currentChatId === chat.id}
                              isCollapsed={effectivelyCollapsed}
                              onClick={() => {
                                onSelectChat(chat.id);
                                if (window.innerWidth < 1024) {
                                  onClose();
                                }
                              }}
                              onRename={(newTitle) => onRenameChat(chat.id, newTitle)}
                              onDelete={() => onDeleteChat(chat.id)}
                            />
                          ))}
                        {chats.length === 0 && !effectivelyCollapsed && (
                          <div className="text-text-muted px-4 py-4 text-sm italic">
                            {t("common.no_recent_chats")}
                          </div>
                        )}
                      </>
                    )}
                  </nav>

                  {/* Sidebar Footer */}
                  <div className="border-border-base relative flex h-15 items-center justify-start border-t px-2">
                    <AnimatePresence>
                      {isUserMenuOpen && session && (
                        <motion.div
                          ref={userMenuRef}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className={`border-border-base bg-app-bg absolute bottom-full z-50 mb-1 w-[90%] overflow-hidden rounded-2xl border p-1 text-[14px] shadow-lg ${
                            effectivelyCollapsed ? "left-1/2 -translate-x-1/2" : "left-4"
                          }`}
                        >
                          <Button
                            variant="ghost"
                            className="text-text-main hover:bg-border-light w-full justify-start gap-3 rounded-xl px-2 py-2 font-medium"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                            }}
                          >
                            <Settings className="h-5 w-5" />
                            {t("common.settings")}
                          </Button>
                          <Button
                            variant="ghost"
                            className="text-text-main hover:bg-border-light w-full justify-start gap-3 rounded-xl px-2 py-2 font-medium hover:text-red-500"
                            onClick={() => {
                              signOut({ redirect: true, callbackUrl: "/" });
                            }}
                          >
                            <LogOut className="h-5 w-5" />
                            {t("common.sign_out")}
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div
                      className="hover:bg-border-light flex w-full cursor-pointer items-center gap-4 rounded-[10px] px-2 py-2 transition-colors"
                      onClick={() => session && setIsUserMenuOpen(!isUserMenuOpen)}
                    >
                      <div className="border-border-base bg-app-bg flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border shadow-sm">
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
                      {!effectivelyCollapsed && (
                        <div className="text-text-main max-w-37.5 truncate text-[14px]">
                          {session?.user?.name || t("common.guest_user")}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="how-to"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="h-full w-full overflow-hidden"
                >
                  <HowToUse onBack={() => setActiveView("main")} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

