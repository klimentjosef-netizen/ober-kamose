import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthUser } from "@/types";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: AuthUser, token: string) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      setUser: (user, token) => set({ user, token }),
      clearUser: () => set({ user: null, token: null }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "ober-kamose-auth",
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
