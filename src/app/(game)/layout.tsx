"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useSocket } from "@/hooks/useSocket";

export default function GameLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  useSocket();

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading]);

  if (isLoading || !user) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="spinner" style={{ width: "32px", height: "32px" }} />
    </div>
  );

  return <>{children}</>;
}
