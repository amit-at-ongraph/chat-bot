interface ChatActionButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  color?: string;
}

export const ChatActionButton = ({
  icon: Icon,
  label,
  onClick,
  color = "",
}: ChatActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="bg-action-btn-bg border-border-base hover:bg-app-bg flex cursor-pointer items-center gap-3 rounded-full border px-4 py-3 text-left shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]"
    >
      <Icon className={`h-4 w-4 shrink-0 ${color}`} />
      <span className="text-text-secondary overflow-hidden text-[12px] font-medium text-ellipsis whitespace-nowrap">
        {label}
      </span>
    </button>
  );
};
