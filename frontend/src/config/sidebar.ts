export interface SidebarItem {
  name: string;
  path?: string;
  children?: {
    name: string;
    path: string;
    icon: keyof typeof import("./icons").Icons;
    roles?: string[];
  }[];
}

export const sidebarItems: SidebarItem[] = [
  {
    name: "Dashboard",
    children: [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: "dashboard",
        roles: ["admin", "user"]
      }
    ]
  },
    {
    name: "Users",
    children: [
      {
        name: "Users",
        path: "/users",
        icon: "users",
        roles: ["admin"]
      }
    ]
  },
  {
    name: "Orders",
    children: [
      {
        name: "Orders",
        path: "/orders",
        icon: "orders",
        roles: ["admin", "user"]
      }
    ]
  },
  {
    name: "Holdings",
    children: [
      {
        name: "Holdings",
        path: "/holdings",
        icon: "orders",
        roles: ["admin", "user"]
      }
    ]
  },
  {
    name: "Positions",
    children: [
      {
        name: "Positions",
        path: "/positions",
        icon: "orders",
        roles: ["admin", "user"]
      }
    ]
  },
    {
    name: "Bids",
    children: [
      {
        name: "Bids",
        path: "/bids",
        icon: "orders",
        roles: ["admin", "user"]
      }
    ]
  },
  {
    name: "Funds",
    children: [
      {
        name: "Funds",
        path: "/funds",
        icon: "orders",
        roles: ["admin", "user"]
      }
    ]
  },

];