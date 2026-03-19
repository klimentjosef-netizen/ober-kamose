"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, token, setUser, clearUser, setLoading } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      if (user && token) return; // already logged in
      setLoading(true);
      try {
        // Check existing session only — no auto-login
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user, token ?? "");
        }
        // If not logged in, do nothing — user stays on public page
      } catch {
        // No session, that's fine
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  return <>{children}</>;
}
