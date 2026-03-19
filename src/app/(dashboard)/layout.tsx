"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>
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
