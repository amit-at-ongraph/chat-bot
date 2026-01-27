"use client";

import { APP_CONFIG } from "@/lib/constants";
import { DBChat } from "@/types/chat";
import { Edit2, MessageSquare, MoreVertical, Plus, Settings, Trash2, X } from "lucide-react";
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
}: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-header-bg border-border-dark fixed top-0 bottom-0 left-0 z-50 w-72 transform border-r transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full w-72 flex-col overflow-hidden">
          {/* Sidebar Header - Aligned with main Header */}
          <div className="border-border-base flex h-[65px] items-center justify-between border-b px-6 py-3">
            <h2 className="text-text-main font-bold">Menu</h2>
            <button onClick={onClose} className="text-text-muted hover:text-text-main lg:hidden">
              <X className="h-6 w-6" />
            </button>
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
              className="border-border-base bg-app-bg text-text-main hover:bg-border-light flex w-full items-center justify-center gap-2 rounded-full border py-3 font-normal shadow-sm transition-all active:scale-95"
            >
              <Plus className="h-5 w-5" />
              New Conversation
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3">
            <div className="text-text-muted px-3 py-2 text-xs font-semibold tracking-wider uppercase">
              Recent Chats
            </div>
            {chats.map((chat) => (
              <SidebarItem
                key={chat.id}
                icon={MessageSquare}
                label={chat.title || "Untitled Chat"}
                active={currentChatId === chat.id}
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
            <div className="border-border-base my-2 border-t" />
            <SidebarItem icon={Settings} label="Settings" />
          </nav>

          {/* Sidebar Footer - Aligned with Chat Input Area */}
          <div className="border-border-base flex h-[95px] items-center border-t px-6">
            <p className="text-text-muted text-xs">© 2026 {APP_CONFIG.name}</p>
          </div>
        </div>
      </aside>
    </>
  );
}

function SidebarItem({
  icon: Icon,
  label,
  active = false,
  onClick,
  onRename,
  onDelete,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
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
    <div className="group relative flex items-center">
      <button
        onClick={onClick}
        className={`hover:bg-border-base flex w-full items-center gap-3 truncate rounded-xl px-3 py-2 pr-8 text-[15px] font-medium transition-colors hover:cursor-pointer ${
          active ? "bg-border-light text-primary" : "text-text-secondary"
        }`}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <span className="truncate">{label}</span>
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
                  className={`flex w-full items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-gray-100 ${
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
