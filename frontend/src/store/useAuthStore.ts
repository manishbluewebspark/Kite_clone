import { create } from "zustand";

interface AuthState {
  user: any;
  role: string;      // <-- add this
  isAuth: boolean;
  setUser: (user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: "user",    
  isAuth: false,

  setUser: (user) =>
    set({
      user,
      role: user.role,  
      isAuth: true,
    }),

  logout: () =>
    set({
      user: null,
      role: "user",
      isAuth: false,
    }),
}));