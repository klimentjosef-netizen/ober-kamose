"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter, usePathname } from "next/navigation";

const PUBLIC_ROUTES = ["/login", "/register"];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, token, setUser, clearUser, setLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user, token ?? "");
        } else {
          clearUser();
          if (!PUBLIC_ROUTES.includes(pathname)) {
            router.push("/login");
          }
        }
      } catch {
        clearUser();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return <>{children}</>;
}
