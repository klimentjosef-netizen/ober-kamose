"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, token, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      if (user && token) return; // already logged in
      setLoading(true);
      try {
        // Try existing session first
        const meRes = await fetch("/api/auth/me", { credentials: "include" });
        if (meRes.ok) {
          const data = await meRes.json();
          setUser(data.user, token ?? "");
          setLoading(false);
          return;
        }

        // No session — auto-login as dev user
        const devRes = await fetch("/api/auth/dev", {
          method: "POST",
          credentials: "include",
        });
        if (devRes.ok) {
          const data = await devRes.json();
          setUser(data.user, data.token);
        }
      } catch (err) {
        console.error("[auth]", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  return <>{children}</>;
}
