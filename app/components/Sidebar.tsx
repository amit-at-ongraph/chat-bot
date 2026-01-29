"use client";

import { DBChat } from "@/types/chat";
import { AnimatePresence, motion } from "framer-motion";
import { Edit, Edit2, MessageSquare, MoreVertical, Settings, Trash2, User, X } from "lucide-react";
import { Session } from "next-auth";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chats: DBChat[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  isLoadingChats?: boolean;
  selectedChatLoading?: boolean;
  session: Session | null;
}

export default function Sidebar({
  isOpen,
  onClose,
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  isLoadingChats,
  selectedChatLoading,
  session,
}: SidebarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`bg-header-bg border-border-dark fixed top-0 bottom-0 left-0 z-50 w-72 transform border-r`}
          >
            <div className="flex h-full w-72 flex-col overflow-hidden">
              {/* Sidebar Header - Aligned with main Header */}
              <div className="border-border-base flex h-16.25 items-center justify-between border-b px-6 py-3">
                <h2 className="text-text-main font-bold">Menu</h2>
                <div className="flex items-center gap-3">
                  {isLoadingChats && (
                    <div className="inline-flex items-center justify-center">
                      <div className="border-primary inline-block h-4 w-4 animate-spin rounded-full border-b-2" />
                    </div>
                  )}
                  <button
                    onClick={onClose}
                    className="text-text-muted hover:text-text-main lg:hidden"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* New Chat Button */}
              <div className="p-4">
                <button
                  onClick={() => {
                    onNewChat();
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                  className="flex cursor-pointer items-center gap-2 text-[14px]"
                >
                  <Edit className="h-4 w-4" />
                  New Conversation
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 space-y-1 overflow-y-auto px-3">
                <div className="text-text-muted px-3 py-2 text-[14px]">Recent Chats</div>
                {chats.map((chat) => (
                  <SidebarItem
                    key={chat.id}
                    icon={MessageSquare}
                    label={chat.title || "Untitled Chat"}
                    active={currentChatId === chat.id}
                    loading={selectedChatLoading && currentChatId === chat.id}
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
                {chats.length === 0 && (
                  <div className="text-text-muted px-3 py-4 text-sm italic">No recent chats</div>
                )}
                {/* <div className="border-border-base my-2 border-t" /> */}
                {/* <SidebarItem icon={Settings} label="Settings" /> */}
              </nav>

              {/* Sidebar Footer */}
              <div className="border-border-base relative flex h-[60px] items-center justify-start border-t px-6">
                <AnimatePresence>
                  {isUserMenuOpen && session && (
                    <motion.div
                      ref={userMenuRef}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="border-border-base absolute bottom-full left-6 z-50 mb-1 w-60 overflow-hidden rounded-2xl border bg-white p-2 text-[14px]"
                    >
                      <button
                        className="text-text-main hover:bg-border-light flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-colors"
                        onClick={() => {
                          // Settings action
                          setIsUserMenuOpen(false);
                        }}
                      >
                        <Settings className="h-5 w-5" />
                        Settings
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div
                  className="hover:bg-border-light flex w-full cursor-pointer items-center gap-2 rounded-xl p-2 transition-colors"
                  onClick={() => session && setIsUserMenuOpen(!isUserMenuOpen)}
                >
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
                  <div className="text-text-main text-[14px]">
                    {session?.user?.name || "Guest User"}
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarItem({
  icon: Icon,
  label,
  active = false,
  loading = false,
  onClick,
  onRename,
  onDelete,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  loading?: boolean;
  onClick?: () => void;
  onRename?: (newTitle: string) => void;
  onDelete?: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [editValue, setEditValue] = useState(label);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isRenaming) {
      inputRef.current?.focus();
    }
  }, [isRenaming]);

  const handleRenameSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (editValue.trim() && onRename) {
      onRename(editValue);
      setIsRenaming(false);
      setShowMenu(false);
    }
  };

  const menuItems = [
    {
      label: "Rename",
      icon: Edit2,
      action: () => {
        setIsRenaming(true);
        // Don't close menu immediately, let renaming finish
      },
    },
    {
      label: "Delete",
      icon: Trash2,
      danger: true,
      action: () => {
        if (confirm("Are you sure you want to delete this chat?")) {
          onDelete?.();
        }
        setShowMenu(false);
      },
    },
  ];

  if (isRenaming) {
    return (
      <form onSubmit={handleRenameSubmit} className="px-2 py-1">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleRenameSubmit}
          className="border-primary bg-app-bg w-full rounded-md border px-2 py-1 text-sm outline-none"
        />
      </form>
    );
  }

  return (
    <div className="group relative flex items-center text-[14px]">
      <button
        onClick={onClick}
        className={`hover:bg-border-base flex w-full items-center gap-3 truncate rounded-xl px-3 py-2 pr-8 font-medium transition-colors hover:cursor-pointer ${
          active ? "bg-border-light text-primary" : "text-text-secondary"
        }`}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <span className="truncate">{label}</span>
        {loading && (
          <span className="ml-2 inline-flex items-center">
            <div className="border-primary inline-block h-3 w-3 animate-spin rounded-full border-b-2" />
          </span>
        )}
      </button>

      {onRename && onDelete && (
        <div className="absolute right-1" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="text-text-muted hover:text-text-main cursor-pointer p-1 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {showMenu && (
            <div className="bg-app-bg border-border-light absolute top-full right-0 z-50 mt-1 w-32 overflow-hidden rounded-lg border shadow-lg ring-1 ring-black/5">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={(e) => {
                    e.stopPropagation();
                    item.action();
                  }}
                  className={`hover:bg-border-base flex w-full items-center gap-2 px-3 py-2 text-xs transition-colors ${
                    item.danger ? "text-red-500" : "text-text-main"
                  }`}
                >
                  <item.icon className="h-3 w-3" />
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
