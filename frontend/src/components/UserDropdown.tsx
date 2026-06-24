// import { useRef, useEffect } from "react";
// import {
//   RiPencilLine,
//   RiShieldUserLine,
//   RiCoinsLine,
//   RiCustomerServiceLine,
//   RiUserAddLine,
//   RiKeyboardLine,
//   RiBookOpenLine,
//   RiLogoutBoxRLine,
// } from "react-icons/ri";
// import { CiCircleQuestion } from "react-icons/ci";

// import { logoutApi } from "../api/authApi";
// import { useAuthStore } from "../store/useAuthStore";
// import { useThemeStore } from "../store/useThemeStore";
// import { AiOutlineEdit } from "react-icons/ai";
// import { HiOutlineSupport } from "react-icons/hi";
// import { GoPersonAdd, GoQuestion } from "react-icons/go";
// import { MdKeyboardCommandKey, MdOutlineLogout } from "react-icons/md";

// interface UserDropdownProps {
//   isOpen: boolean;
//   onToggle: () => void;
//   onClose: () => void;
// }

// export default function UserDropdown({
//   isOpen,
//   onToggle,
//   onClose,
// }: UserDropdownProps) {
//   const dropdownRef = useRef<HTMLDivElement>(null);

//   const { user, logout } = useAuthStore();
//   const { theme, toggleTheme } = useThemeStore();

//   const isDark = theme === "dark";

//   const displayName = user?.name || "Manish Shukla";
//   const displayEmail = user?.email || "bluewebspark@gmail.com";
//   const user_id = user?.user_id;

//   // Extract initials for the purple circle (exactly like image: "MS")
//   const initials = displayName
//     .split(" ")
//     .map((word: string) => word[0])
//     .join("")
//     .slice(0, 2)
//     .toUpperCase();

//   const handleLogout = async () => {
//     try {
//       await logoutApi();
//       logout();
//       window.location.href = "/";
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target as Node)
//       ) {
//         onClose();
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [onClose]);

//   const menuItems = [
//     {
//       icon: <img src="./console.jpg" className="w-3 h-3 ml-0.5" />,
//       label: "Console",
//     },
//     {
//       icon: <img src="./coin.png" className="w-3 h-3 ml-0.5" />,
//       label: "Coin",
//     },
//     {
//       icon: <HiOutlineSupport size={16} />,
//       label: "Support",
//     },
//     {
//       icon: <GoPersonAdd size={16} />,
//       label: "Invite friends",
//     },
//   ];

//   return (
//     <div className="relative" ref={dropdownRef}>
//       {/* Profile Button - EXACTLY LIKE THE IMAGE */}
//       <button
//         onClick={onToggle}
//         className="flex items-center gap-1.5 px-2 hover:opacity-80 transition-opacity"
//       >
//         {/* Purple Circle with Initials */}
//         <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f3e8ff] text-[#7c3aed] text-[9px]">
//           {initials}
//         </div>

//         {/* Text like "JGQ802" */}
//         <span className="text-sm text-gray-700 font-normal hover:text-[#FF5A1F]">
//           {user_id}
//         </span>
//       </button>

//       {/* Dropdown */}
//       {isOpen && (
//         <div
//           className="absolute right-0 top-full w-[280px] overflow-hidden bg-white shadow-xl z-9999"
//           style={{
//             borderColor: "#e5e7eb",
//           }}
//         >
//           {/* Header */}
//           <div className="px-4 pt-4 pb-3">
//             <div className="flex items-start justify-between">
//               <div>
//                 <h3 className="text-[12px] leading-none font-normal text-gray-800">
//                   {displayName}
//                 </h3>

//                 <p className="mt-1 text-sm text-gray-500">
//                   {displayEmail}
//                 </p>
//               </div>

//               <button className="text-gray-500 hover:text-gray-700">
//                 <AiOutlineEdit size={14} />
//               </button>
//             </div>
//           </div>

//           {/* Privacy */}
//           <div className="flex items-center justify-between px-4 py-3">
//             <span className="text-sm text-gray-700">Privacy mode</span>

//             <button className="relative h-4 w-8 rounded-full bg-gray-300">
//               <span className="absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-white" />
//             </button>
//           </div>

//           {/* Theme */}
//           <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
//             <span className="text-sm text-gray-700">
//               Theme ({isDark ? "Dark" : "Light"})
//             </span>

//             <button
//               onClick={toggleTheme}
//               className={`relative h-4 w-8 rounded-full transition-colors ${
//                 isDark ? "bg-green-500" : "bg-gray-300"
//               }`}
//             >
//               <span
//                 className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${
//                   isDark ? "left-[18px]" : "left-0.5"
//                 }`}
//               />
//             </button>
//           </div>

//           {/* Main Menu */}
//           <div className="py-1">
//             {menuItems.map((item) => (
//               <button
//                 key={item.label}
//                 className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
//               >
//                 {item.icon}
//                 <span>{item.label}</span>
//               </button>
//             ))}
//           </div>

//           <div className="border-t border-gray-200" />

//           {/* Bottom Menu */}
//           <div className="py-1">
//             <button className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
//               <MdKeyboardCommandKey size={16} />
//               <span>Keyboard shortcuts</span>
//             </button>

//             <button className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
//               <GoQuestion size={16} />
//               <span>User manual</span>
//             </button>

//             <button
//               onClick={handleLogout}
//               className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
//             >
//               <MdOutlineLogout size={16} />
//               <span>Logout</span>
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useRef, useEffect } from "react";
import {
  RiPencilLine,
  RiShieldUserLine,
  RiCoinsLine,
  RiCustomerServiceLine,
  RiUserAddLine,
  RiKeyboardLine,
  RiBookOpenLine,
  RiLogoutBoxRLine,
} from "react-icons/ri";
import { CiCircleQuestion } from "react-icons/ci";

import { logoutApi } from "../api/authApi";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { AiOutlineEdit } from "react-icons/ai";
import { HiOutlineSupport } from "react-icons/hi";
import { GoPersonAdd, GoQuestion } from "react-icons/go";
import { MdKeyboardCommandKey, MdOutlineLogout } from "react-icons/md";
import { useKiteStatus } from "../hooks/useKiteStatus"; // ⬅️ naya

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
  const { connected: kiteConnected, connectKite } = useKiteStatus(); // ⬅️ naya

  const isDark = theme === "dark";

  const displayName = user?.name || "Manish Shukla";
  const displayEmail = user?.email || "bluewebspark@gmail.com";
  const user_id = user?.user_id;

  const initials = displayName
    .split(" ")
    .map((word: string) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const menuItems = [
    {
      icon: <img src="./console.jpg" className="w-3 h-3 ml-0.5" />,
      label: "Console",
    },
    {
      icon: <img src="./coin.png" className="w-3 h-3 ml-0.5" />,
      label: "Coin",
    },
    {
      icon: <HiOutlineSupport size={16} />,
      label: "Support",
    },
    {
      icon: <GoPersonAdd size={16} />,
      label: "Invite friends",
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 px-2 hover:opacity-80 transition-opacity"
      >
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f3e8ff] text-[#7c3aed] text-[9px]">
          {initials}
        </div>
        <span className="text-sm text-gray-700 font-normal hover:text-[#FF5A1F]">
          {user_id}
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 top-full w-[280px] overflow-hidden bg-white shadow-xl z-9999"
          style={{ borderColor: "#e5e7eb" }}
        >
          {/* Header */}
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[12px] leading-none font-normal text-gray-800">
                  {displayName}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{displayEmail}</p>
              </div>
              <button className="text-gray-500 hover:text-gray-700">
                <AiOutlineEdit size={14} />
              </button>
            </div>
          </div>

          {/* Privacy */}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-gray-700">Privacy mode</span>
            <button className="relative h-4 w-8 rounded-full bg-gray-300">
              <span className="absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-white" />
            </button>
          </div>

          {/* Theme */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
            <span className="text-sm text-gray-700">
              Theme ({isDark ? "Dark" : "Light"})
            </span>
            <button
              onClick={toggleTheme}
              className={`relative h-4 w-8 rounded-full transition-colors ${
                isDark ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${
                  isDark ? "left-[18px]" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {/* ── Kite Connection ── */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              {/* Kite/Zerodha logo */}
              <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
                <path d="M6 26L16 4L26 26H6Z" fill="#387ED1" />
                <path d="M6 26L16 16L26 26H6Z" fill="#1A5FA8" />
              </svg>
              <span className="text-sm text-gray-700">Kite</span>
            </div>

            {kiteConnected ? (
              // Connected state — green indicator
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-green-600 font-medium">Connected</span>
              </div>
            ) : (
              // Not connected — login button
              <button
                onClick={() => {
                  onClose(); // dropdown band karo
                  connectKite(); // Zerodha login page pe redirect
                }}
                className="text-xs font-semibold px-2.5 py-1 rounded transition-all hover:opacity-80"
                style={{
                  backgroundColor: "rgba(56,126,209,0.12)",
                  color: "#387ed1",
                  border: "1px solid rgba(56,126,209,0.25)",
                }}
              >
                Connect
              </button>
            )}
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
              <MdKeyboardCommandKey size={16} />
              <span>Keyboard shortcuts</span>
            </button>

            <button className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
              <GoQuestion size={16} />
              <span>User manual</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <MdOutlineLogout size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}