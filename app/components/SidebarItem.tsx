import { Edit2, MoreVertical, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "../i18n/useTranslation";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

export default function SidebarItem({
  icon: _Icon,
  label,
  active = false,
  loading = false,
  isCollapsed = false,
  onClick,
  onRename,
  onDelete,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  loading?: boolean;
  isCollapsed?: boolean;
  onClick?: () => void;
  onRename?: (newTitle: string) => void;
  onDelete?: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [editValue, setEditValue] = useState(label);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

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
      label: t("common.rename"),
      icon: Edit2,
      action: () => {
        setIsRenaming(true);
        // Don't close menu immediately, let renaming finish
      },
    },
    {
      label: t("common.delete"),
      icon: Trash2,
      danger: true,
      action: () => {
        if (confirm(t("upload.delete_confirm"))) {
          onDelete?.();
        }
        setShowMenu(false);
      },
    },
  ];

  if (isRenaming) {
    return (
      <form onSubmit={handleRenameSubmit} className="px-2 py-1">
        <Input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleRenameSubmit}
        />
      </form>
    );
  }

  return (
    <div className="group relative flex items-center justify-start px-2 text-[14px]">
      <button
        onClick={onClick}
        title={isCollapsed ? label : ""}
        className={`group-hover:bg-border-base flex w-full items-center gap-3 truncate rounded-[10px] py-2 pr-7 pl-2 font-medium transition-colors hover:cursor-pointer ${
          active ? "bg-selected text-primary" : "text-text-secondary"
        }`}
      >
        {/* <Icon className="h-5 w-5 shrink-0" /> */}
        {!isCollapsed && <span className="truncate font-normal">{label}</span>}
        {loading && !isCollapsed && (
          <span className="ml-2 inline-flex items-center">
            <div className="border-primary inline-block h-3 w-3 animate-spin rounded-full border-b-2" />
          </span>
        )}
      </button>

      {onRename && onDelete && !isCollapsed && (
        <div className="absolute right-3" ref={menuRef}>
          <Button
            variant="none"
            size="none"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="text-text-muted hover:text-text-main p-1 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>

          {showMenu && (
            <div className="bg-app-bg border-border-light absolute top-full right-0 z-50 mt-1 w-32 overflow-hidden rounded-lg border shadow-lg ring-1 ring-black/5">
              {menuItems.map((item) => (
                <Button
                  key={item.label}
                  variant="none"
                  size="none"
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
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
