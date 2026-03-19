"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Logo from "@/components/Logo";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Přehled", icon: "▦" },
  { href: "/dashboard/groups", label: "Skupiny", icon: "◈" },
  { href: "/dashboard/bets", label: "Sázky", icon: "🎲" },
  { href: "/dashboard/games", label: "Hry", icon: "⬡" },
  { href: "/dashboard/stats", label: "Statistiky", icon: "◎" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const initials = (user?.username ?? "??").slice(0, 2).toUpperCase();

  return (
    <aside style={{
      width: "220px",
      minHeight: "100vh",
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      padding: "24px 0",
      flexShrink: 0,
      position: "sticky",
      top: 0,
      height: "100vh",
    }}>

      {/* Logo */}
      <div style={{ padding: "0 20px 28px" }}>
        <Logo size="sm" />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0 12px", display: "flex", flexDirection: "column", gap: "2px" }}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: active ? "600" : "400",
                fontFamily: active ? "var(--font-display)" : "var(--font-body)",
                color: active ? "var(--text-primary)" : "var(--text-secondary)",
                background: active ? "var(--surface-3)" : "transparent",
                transition: "all 0.15s",
                letterSpacing: active ? "0.01em" : "0",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                }
              }}
            >
              <span style={{
                fontSize: "16px",
                color: active ? "var(--gold)" : "inherit",
                lineHeight: 1,
              }}>{item.icon}</span>
              {item.label}
              {active && (
                <span style={{
                  marginLeft: "auto",
                  width: "4px", height: "4px",
                  borderRadius: "50%",
                  background: "var(--gold)",
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* New game button */}
      <div style={{ padding: "0 12px 16px" }}>
        <Link
          href="/game/new"
          className="btn btn-primary"
          style={{ width: "100%", justifyContent: "center" }}
        >
          + Nová hra
        </Link>
      </div>

      <div style={{ height: "1px", background: "var(--border)", margin: "0 12px 16px" }} />

      {/* User */}
      <div style={{ padding: "0 12px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "10px 12px",
          borderRadius: "8px",
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
        }}>
          <div
            className="avatar avatar-sm"
            style={{ background: user?.avatarColor ?? "var(--green)", color: "#000", fontWeight: "700" }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.username ?? "..."}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.email ?? ""}
            </div>
          </div>
          <span className="badge badge-green" style={{ fontSize: "9px" }}>DEV</span>
        </div>
      </div>

    </aside>
  );
}
