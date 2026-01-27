"use client";

import { APP_CONFIG } from "@/lib/constants";
import { History, MessageSquare, Plus, Settings, X } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
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
            <button className="border-border-base bg-app-bg text-text-main hover:bg-border-light flex w-full items-center justify-center gap-2 rounded-full border py-3 font-normal shadow-sm transition-all active:scale-95">
              <Plus className="h-5 w-5" />
              New Conversation
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3">
            <SidebarItem icon={MessageSquare} label="Recent Chats" active />
            <SidebarItem icon={History} label="History" />
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
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`hover:bg-border-light flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium transition-colors ${
        active ? "bg-border-light text-primary" : "text-text-secondary"
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}
