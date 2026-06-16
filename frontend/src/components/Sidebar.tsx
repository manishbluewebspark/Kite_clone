import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { sidebarItems, type SidebarItem } from "../config/sidebar";
import { Icons } from "../config/icons";
import { useAuthStore } from "../store/useAuthStore";

export default function Sidebar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();

  // ✅ Get current user role
  const role = useAuthStore((state) => state.role);

  const toggleMenu = (name: string) => {
    setOpenMenu(openMenu === name ? null : name);
  };

  const isChildActive = (children: SidebarItem["children"]) => {
    return children?.some((sub) => location.pathname === sub.path);
  };

  // ✅ Filter sidebar items based on user role
  const filteredSidebarItems = sidebarItems
    .map((section) => ({
      ...section,
      children: section.children?.filter((child) => child.roles?.includes(role)),
    }))
    .filter((section) => section.children && section.children.length > 0);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setOpenMenu(null);
      }}
      className={`h-screen bg-primary text-on-dark flex flex-col p-2 transition-all duration-300
      ${isHovered ? "w-64" : "w-16"}`}
    >
      <nav className="flex flex-col gap-2">
        {filteredSidebarItems.map((item, index) => {
          const Chevron = Icons.chevron;
          const childActive = item.children && isChildActive(item.children);

          return (
            <div key={index}>
              {/* ✅ PARENT */}
              <button
                onClick={() => isHovered && toggleMenu(item.name)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition
                ${childActive
                    ? "text-accent"
                    : "text-on-dark-55 hover:bg-primary-light"
                  }`}
              >
                <div className="flex items-center gap-3">
                  {/* ✅ Show icon when collapsed */}
                  {!isHovered && item.children?.[0]?.icon && (
                    (() => {
                      const FirstIcon = Icons[item.children[0].icon];
                      return <FirstIcon className="text-xl" />;
                    })()
                  )}

                  {/* ✅ Show text when expanded */}
                  {isHovered && <span>{item.name}</span>}
                </div>

                {/* ✅ Chevron */}
                {isHovered && (
                  <Chevron
                    className={`transition-transform ${openMenu === item.name ? "rotate-180" : ""}`}
                  />
                )}
              </button>

              {/* ✅ CHILD MENU */}
              {isHovered && (openMenu === item.name || childActive) && (
                <div className="ml-4 mt-1 flex flex-col gap-1">
                  {item.children?.map((sub, i) => {
                    const SubIcon = Icons[sub.icon];
                    return (
                      <NavLink
                        key={i}
                        to={sub.path!}
                        className={({ isActive }) =>
                          `flex items-center gap-2 text-sm px-2 py-3 rounded transition
                           ${isActive
                            ? "bg-accent text-white"
                            : "text-on-dark-45 hover:bg-primary-light"
                          }`
                        }
                      >
                        <SubIcon className="text-base" />
                        <span>{sub.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}