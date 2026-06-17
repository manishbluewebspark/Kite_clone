import type { ReactNode } from "react";

interface ActionButtonProps {
  color?: string;       // background color for a colored letter button (B / S)
  label?: string;        // single-letter label, e.g. "B" or "S"
  icon?: ReactNode;       // icon for outline-style buttons
  outlined?: boolean;     // kept for API compatibility with existing call sites
  onClick?: () => void;
  className?: string;    // lets the parent control rounding when grouping buttons
}

export default function ActionButton({
  color,
  label,
  icon,
  onClick,
  className = "",
}: ActionButtonProps) {
  // Colored "B" / "S" style button
  if (label) {
    return (
      <button
        onClick={onClick}
        className={`flex items-center justify-center w-7 h-7 text-[12px] font-bold text-white leading-none ${className}`}
        style={{ backgroundColor: color }}
      >
        {label}
      </button>
    );
  }

  // Neutral outlined icon button (lines, chart, trash, more)
  return (
<button
  onClick={onClick}
  className={`flex items-center justify-center w-10 h-7 rounded-md border border-gray-300

    ${className}`}
>
  {icon}
</button>
  );
}