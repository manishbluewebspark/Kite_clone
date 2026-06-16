import { useRef, useEffect } from "react";
import {
  RiArrowDownSLine,
  RiPencilLine,
  RiShieldUserLine,
  RiCoinsLine,
  RiCustomerServiceLine,
  RiUserAddLine,
  RiKeyboardLine,
  RiBookOpenLine,
  RiLogoutBoxRLine,
} from "react-icons/ri";

import { logoutApi } from "../api/authApi";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";

interface UserDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export default function UserDropdown({
  isOpen,
  onToggle,
  onClose,
}: UserDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const isDark = theme === "dark";

  const displayName = user?.name || "Manish Shukla";
  const displayEmail = user?.email || "bluewebspark@gmail.com";

  const handleLogout = async () => {
    try {
      await logoutApi();
      logout();
      window.location.href = "/";
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const menuItems = [
    {
      icon: <RiShieldUserLine size={16} />,
      label: "Console",
    },
    {
      icon: <RiCoinsLine size={16} />,
      label: "Coin",
    },
    {
      icon: <RiCustomerServiceLine size={16} />,
      label: "Support",
    },
    {
      icon: <RiUserAddLine size={16} />,
      label: "Invite friends",
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={onToggle}
        className="flex items-center gap-2  px-2 py-1.5 hover:bg-[var(--bg-overlay-10)] transition-colors"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white text-sm font-semibold">
          {displayName
            .split(" ")
            .map((word: any[]) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>

        <RiArrowDownSLine
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          size={18}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-[250px] overflow-hidden bg-white shadow-xl z-9999"
          style={{
            borderColor: "#e5e7eb",
          }}
        >
          {/* Header */}
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[22px] leading-none font-normal text-gray-800">
                  {displayName}
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  {displayEmail}
                </p>
              </div>

              <button className="text-gray-500 hover:text-gray-700">
                <RiPencilLine size={14} />
              </button>
            </div>
          </div>

          {/* Privacy */}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-gray-700">Privacy mode</span>

            <button className="relative h-5 w-9 rounded-full bg-gray-300">
              <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white" />
            </button>
          </div>

          {/* Theme */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <span className="text-sm text-gray-700">
              Theme ({isDark ? "Dark" : "Light"})
            </span>

            <button
              onClick={toggleTheme}
              className={`relative h-5 w-9 rounded-full transition-colors ${
                isDark ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
                  isDark ? "left-[18px]" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {/* Main Menu */}
          <div className="py-1">
            {menuItems.map((item) => (
              <button
                key={item.label}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-gray-200" />

          {/* Bottom Menu */}
          <div className="py-1">
            <button className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
              <RiKeyboardLine size={16} />
              <span>Keyboard shortcuts</span>
            </button>

            <button className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
              <RiBookOpenLine size={16} />
              <span>User manual</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <RiLogoutBoxRLine size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}