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

// ── Polling interval: 15 seconds ─────────────────────────────────────────────
const MARKET_POLL_INTERVAL = 15_000;

export default function Header() {
  const { role } = useAuthStore();
  const { theme } = useThemeStore();
const { indices, initSocketListeners } = useMarketStore();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // ── Live market polling ───────────────────────────────────────────────────
 useEffect(() => {
  initSocketListeners();
  return () => {
    socket.off("market:update");
    socket.off("connect");
    socket.off("disconnect");
  };
}, []);

  // DYNAMIC nav links
  const navLinks = sidebarItems
    .flatMap((section) => section.children ?? [])
    .filter((item) => item.roles?.includes(role));

  // Only show NIFTY 50 and SENSEX in header ticker
  const headerTicker = indices.filter((idx) =>
    ["NIFTY 50", "SENSEX"].includes(idx.name)
  );

  return (
    <header
      className="shrink-0 relative z-50 h-16 flex items-center justify-between px-40 border-b"
      style={{
        backgroundColor: "var(--color-primary)",
        borderBottomColor: "var(--border-overlay-12)",
      }}
    >
      {/* LEFT SIDE: Market Ticker + Logo + Toggle UI */}
      <div className="flex items-center gap-2 shrink-0 px-2">

        {/* ── Live Market Ticker ─────────────────────────────────────────── */}
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
                    className="text-[11px] font-medium"
                    style={{ color }}
                  >
                    {item.isUp ? "+" : ""}
                    {item.change.toFixed(2)} ({item.isUp ? "+" : ""}
                    {item.changePct.toFixed(2)}%)
                  </span>
                  {/* Mock indicator — dev mein dikhega */}
                  {/* {isMock && (
                    <span className="text-[9px] text-yellow-400 opacity-60">
                      (mock)
                    </span>
                  )} */}
                </div>
              );
            })
          : /* Skeleton jab data load ho raha ho */
            ["NIFTY 50", "SENSEX"].map((name) => (
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

        {/* Separator */}
        <div
          className="w-px h-6"
          style={{ backgroundColor: "var(--border-overlay-20)" }}
        />

        {/* Logo */}
        <img
          src="/logo.png"
          alt="Logo"
          className="h-8 w-auto object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />

        {/* NEW UI Toggle */}
        <div
          className="flex items-center rounded-md border overflow-hidden"
          style={{ borderColor: "#e5e5e5", height: "35px" }}
        >
          {/* Left Section */}
          <div className="flex items-center gap-4 px-4">
            <span className="text-[11px] font-medium text-gray-700">
              Default
            </span>
            <button
              className="px-4 py-1 rounded-md text-[11px] font-medium"
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

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200" />

          {/* Right Section */}
          <button className="w-10 flex items-center justify-center">
            <svg
              width="15"
              height="15"
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
        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {navLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `whitespace-nowrap px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 no-underline ${
                  isActive
                    ? "text-[var(--color-accent)]"
                    : "text-[var(--text-on-dark-55)] hover:text-[var(--text-on-dark-80)]"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>

        {/* Separator */}
        <div
          className="w-px h-6"
          style={{ backgroundColor: "var(--border-overlay-20)" }}
        />

        {/* Notification Icon */}
        <div className="relative z-9999">
          <button
            onClick={() => setShowNotification(!showNotification)}
            className="relative rounded-lg p-2 transition-colors hover:bg-[var(--bg-overlay-10)]"
          >
            <RiNotification3Line
              className="text-sm"
              style={{ color: "var(--text-on-dark-60)" }}
            />
          </button>
          {showNotification && <NotificationModal />}
        </div>

        {/* User Dropdown */}
        <UserDropdown
          isOpen={dropdownOpen}
          onToggle={() => setDropdownOpen(!dropdownOpen)}
          onClose={() => setDropdownOpen(false)}
        />
      </div>
    </header>
  );
}