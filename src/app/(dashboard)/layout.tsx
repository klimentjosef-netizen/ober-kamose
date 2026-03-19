"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, token, setUser, setLoading } = useAuthStore();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const ensureAuth = async () => {
      if (user && token) { setReady(true); return; }
      setLoading(true);
      try {
        // Try existing session
        const meRes = await fetch("/api/auth/me", { credentials: "include" });
        if (meRes.ok) {
          const data = await meRes.json();
          setUser(data.user, token ?? "");
          setReady(true);
          return;
        }

        // No session — auto-login as dev user (dev mode only)
        const devRes = await fetch("/api/auth/dev", {
          method: "POST",
          credentials: "include",
        });
        if (devRes.ok) {
          const data = await devRes.json();
          setUser(data.user, data.token);
          setReady(true);
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    ensureAuth();
  }, []);

  if (!ready) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" style={{ width: "32px", height: "32px" }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{
        flex: 1,
        padding: "32px 40px",
        overflowY: "auto",
        maxWidth: "1100px",
      }}>
        {children}
      </main>
    </div>
  );
}
