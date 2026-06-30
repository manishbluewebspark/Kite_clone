import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { useMarketStore } from "../store/useMarketstore";
import { sidebarItems } from "../config/sidebar";
import { RiNotification3Line } from "react-icons/ri";
import NotificationModal from "./modal/NotificationModal";
import UserDropdown from "./UserDropdown";
import { socket } from "../lib/socket";
import { BsCart2 } from "react-icons/bs";

const MARKET_POLL_INTERVAL = 15_000;

export default function Header() {
  const { role } = useAuthStore();
  const { theme } = useThemeStore();
  const { indices, initSocketListeners } = useMarketStore();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    initSocketListeners();
    return () => {
      socket.off("market:update");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  const navLinks = sidebarItems
    .flatMap((section) => section.children ?? [])
    .filter((item) => item.roles?.includes(role));

  const headerTicker = indices.filter((idx) =>
    ["NIFTY 50", "SENSEX"].includes(idx.name)
  );

  return (
    <header
      className="shrink-0 relative z-50 border-b shadow-xs"
      style={{
        backgroundColor: "var(--color-primary)",
        borderBottomColor: "var(--border-overlay-12)",
      }}
    >
      <div className="max-w-full px-20 mx-auto w-full flex items-center justify-between py-1 ">
        {/* LEFT SIDE: Market Ticker + Logo + Toggle UI */}
        <div className="flex items-center gap-3 shrink-0 px-2">

          {/* INVISIBLE placeholder — layout space hold karta hai */}
          <div className="invisible flex items-center gap-3">
            {["NIFTY 50", "SENSEX"].map((name) => (
              <div key={name} className="flex items-center gap-2">
                <span className="text-[11px] font-semibold">{name}</span>
                <span className="text-[11px] font-bold">00,000.00</span>
                <span className="text-[11px]">+000.00 (+0.00%)</span>
              </div>
            ))}
          </div>

          {/* ABSOLUTE — actual visible ticker */}
          <div
            className="absolute flex items-center gap-3"
            style={{ top: "50%", transform: "translateY(-50%)", zIndex: 10 }}
          >
            {headerTicker.length > 0
              ? headerTicker.map((item) => {
                  const color = item.isUp ? "#22c55e" : "#ef4444";
                  return (
                    <div key={item.name} className="flex items-center gap-2">
                      <span
                        className="text-[11px] font-semibold"
                        style={{ color: "var(--text-on-dark-80)" }}
                      >
                        {item.name}
                      </span>
                      <span className="text-[11px] font-bold" style={{ color }}>
                        {item.last.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      <span
                        className="text-[11px] font-medium text-gray-400!"
                        style={{ color }}
                      >
                        {item.isUp ? "+" : ""}
                        {item.change.toFixed(2)} ({item.isUp ? "+" : ""}
                        {item.changePct.toFixed(2)}%)
                      </span>
                    </div>
                  );
                })
              : ["NIFTY 50", "SENSEX"].map((name) => (
                  <div key={name} className="flex items-center gap-2">
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: "var(--text-on-dark-80)" }}
                    >
                      {name}
                    </span>
                    <span
                      className="text-[11px] animate-pulse"
                      style={{ color: "var(--text-on-dark-40)" }}
                    >
                      ——
                    </span>
                  </div>
                ))}
          </div>

          {/* Separator */}
          <div
            className="w-px h-6"
            style={{ backgroundColor: "var(--border-overlay-20)" }}
          />

          {/* Logo */}
          <img
            src="/logo.png"
            alt="Logo"
            className="h-4 w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />

          {/* NEW UI Toggle */}
          <div
            className="flex items-center rounded-sm border overflow-hidden"
            style={{ borderColor: "#e5e5e5", height: "28px" }}
          >
            <div className="flex items-center gap-4 px-1">
              <span className="text-[11px] font-medium text-gray-700">
                Default
              </span>
              <button
                className="px-2 py-0.5 rounded-sm text-[8px]"
                style={{ backgroundColor: "#F8E5DC", color: "#FF5A1F" }}
              >
                NEW
              </button>
              <svg
                className="w-3 h-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            <div className="w-px h-6 bg-gray-200" />
            <button className="w-8 flex items-center justify-center bg-gray-100">
              <svg
                width="15"
                height="27"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="6" height="6" rx="1" />
                <rect x="3" y="15" width="6" height="6" rx="1" />
                <rect x="15" y="15" width="6" height="6" rx="1" />
                <rect
                  x="15"
                  y="3"
                  width="6"
                  height="6"
                  rx="1"
                  transform="rotate(45 18 6)"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* SPACER */}
        <div className="flex-1" />

        {/* RIGHT SIDE: NavLinks + Notification + User Dropdown */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-1">
            {navLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `whitespace-nowrap px-3 py-1.5 rounded-lg text-[12px] transition-all duration-150 no-underline  ${
                    isActive
                      ? "text-[var(--color-accent)]"
                      : "text-gray-500 hover:text-[#FF5A1F]"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>

          <div
            className="w-px h-6"
            style={{ backgroundColor: "var(--border-overlay-20)" }}
          />

          <div className="flex items-center relative z-[9999]">
            <button className="relative rounded-lg p-2 transition-colors hover:text-[#FF5A1F]">
              <BsCart2 className="text-sm" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowNotification(!showNotification)}
                className="relative rounded-lg p-2 transition-colors hover:text-[#FF5A1F]"
              >
                <RiNotification3Line className="text-sm" />
              </button>
              {showNotification && <NotificationModal />}
            </div>

            <UserDropdown
              isOpen={dropdownOpen}
              onToggle={() => setDropdownOpen(!dropdownOpen)}
              onClose={() => setDropdownOpen(false)}
            />
          </div>
        </div>
      </div>
    </header>
  );
}