import type { ReactNode } from "react";

interface ActionButtonProps {
  color?: string;
  label?: string;
  icon?: ReactNode;
  outlined?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function ActionButton({
  color,
  label,
  icon,
  onClick,
  className = "",
}: ActionButtonProps) {
  // B / S buttons
  if (label) {
    return (
      <button
        onClick={onClick}
        className={`flex items-center justify-center px-3 py-1.5 text-[12px] text-white leading-none ${className}`}
        style={{ backgroundColor: color }}
      >
        {label}
      </button>
    );
  }

  // Other icon buttons
  return (
    <button
      onClick={onClick}
      className={`flex items-center  justify-center w-10 h-6 rounded-sm! border border-gray-300 transition-colors duration-200 hover:bg-gray-400 hover:text-white cursor-pointer  ${className}`}
    >
      {icon}
    </button>
  );
}