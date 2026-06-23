import { Layers } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  AiOutlineInfoCircle,
  AiOutlineBell,
  AiOutlineShoppingCart,
  AiOutlineAlignCenter,
} from "react-icons/ai";
import { FiTrendingUp } from "react-icons/fi";
import { LuExternalLink } from "react-icons/lu";

interface RowContextMenuProps {
  onInfo?: () => void;
  onAdd?: () => void;
  onChart?: () => void;
  onOptionChain?: () => void;
  onCreateAlert?: () => void;
  onMarketDepth?: () => void;
  onMarketwatch?: () => void;
  onBasket?: () => void;
  onTechnicals?: () => void;
  onItemClick?: () => void;
}

function OptionChainIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="5" height="1.5" rx="0.75" fill={color} />
      <rect x="2" y="8" width="9" height="1.5" rx="0.75" fill={color} />
      <rect x="1" y="12" width="18" height="1.5" rx="0.75" fill={color} />
      <rect x="10" y="16" width="9" height="1.5" rx="0.75" fill={color} />
      <rect x="13" y="20" width="5" height="1.5" rx="0.75" fill={color} />
    </svg>
  );
}

export function RowContextMenu({
  onInfo,
  onAdd,
  onChart,
  onOptionChain,
  onCreateAlert,
  onMarketDepth,
  onMarketwatch,
  onBasket,
  onTechnicals,
  onItemClick,
}: RowContextMenuProps) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper: schedule close with delay
  const scheduleClose = () => {
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
    }, 120); // 120ms delay — enough to cross the gap between trigger and menu
  };

  // Helper: cancel scheduled close
  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => cancelClose();
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on scroll
  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    window.addEventListener("scroll", handler, true);
    return () => window.removeEventListener("scroll", handler, true);
  }, [open]);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    cancelClose();
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 4,
      left: rect.right - 220,
    });
    setOpen((p) => !p);
  };

  const handleMenuAction = (action?: () => void) => {
    action?.();
    setOpen(false);
  };

  const menuItems = [
    {
      icon: <FiTrendingUp size={15} />,
      label: <span>Chart</span>,
      action: onChart,
      external: true,
    },
    {
      icon: <OptionChainIcon size={15} />,
      label: <span>Option chain</span>,
      action: onOptionChain,
      external: true,
    },
    {
      icon: <AiOutlineBell size={15} />,
      label: (
        <span>
          Create alert{" "}
          <span className="text-gray-400 font-normal">/ ATO</span>
        </span>
      ),
      action: onCreateAlert,
      external: false,
    },
    {
      icon: <AiOutlineAlignCenter size={15} style={{ rotate: "180deg" }} />,
      label: <span>Market depth</span>,
      action: onMarketDepth,
      external: false,
    },
    {
      icon: <Layers size={15} />,
      label: <span>Add to marketwatch</span>,
      action: onMarketwatch,
      external: false,
    },
    {
      icon: <AiOutlineShoppingCart size={15} />,
      label: <span>Add to basket</span>,
      action: onBasket,
      external: false,
    },
    {
      icon: (
        <img
          src="./technicals.avif"
          alt="Technicals"
          className="w-4 h-4 object-contain"
        />
      ),
      label: <span className="text-gray-800 font-medium">Technicals</span>,
      action: onTechnicals,
      external: false,
      hasTopBorder: true,
    },
  ];

  return (
    <>
      {/* 3-dot trigger */}
      <button
        ref={triggerRef}
        onClick={handleOpen}
        onMouseLeave={scheduleClose}   // schedule close jab cursor bahar jaaye
        onMouseEnter={cancelClose}     // cancel karo agar cursor wapas aaye
        className={`p-1 rounded hover:bg-gray-100 text-gray-500 transition-opacity ${
          open ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        aria-label="More options"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="3" r="1.3" />
          <circle cx="8" cy="8" r="1.3" />
          <circle cx="8" cy="13" r="1.3" />
        </svg>
      </button>

      {/* Portal menu */}
      {open &&
        createPortal(
          <div
            ref={menuRef}
            onMouseEnter={cancelClose}   // cursor menu mein aaya — close cancel karo
            onMouseLeave={scheduleClose} // cursor menu se gaya — schedule close
            style={{
              position: "fixed",
              top: menuPos.top,
              left: menuPos.left,
              zIndex: 99999,
              width: "220px",
            }}
            className="bg-white border border-gray-200 shadow-lg text-[13px]"
          >
            {/* Info + Add top row */}
            <div className="flex items-stretch border-b border-gray-100">
              <button
                onClick={() => handleMenuAction(onInfo)}
                className="flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-blue-600 flex-1 py-2 hover:bg-blue-50 transition-colors"
              >
                <AiOutlineInfoCircle size={20} />
                <span className="text-[12px] text-gray-500">Info</span>
              </button>
              <div className="w-px bg-gray-100 my-2" />
              <button
                onClick={() => handleMenuAction(onAdd)}
                className="flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-blue-600 flex-1 py-2 hover:bg-blue-50 transition-colors"
              >
                <span className="text-[20px] leading-none font-light">+</span>
                <span className="text-[12px] text-gray-500">Add</span>
              </button>
            </div>

            {/* Menu items */}
            {menuItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleMenuAction(item.action)}
                className={`w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 text-gray-700 text-left transition-colors ${
                  item.hasTopBorder ? "border-t border-gray-100 mt-1" : ""
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-gray-500">{item.icon}</span>
                  <span className="text-[13px]">{item.label}</span>
                </span>
                {item.external && (
                  <span className="flex items-center justify-center w-[22px] h-[22px] rounded-md bg-blue-50">
                    <LuExternalLink size={11} className="text-blue-400" />
                  </span>
                )}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}