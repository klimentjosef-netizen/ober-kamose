"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { GroupWithMembers } from "@/types";

interface DashboardData {
  groups: GroupWithMembers[];
  recentGames: any[];
  totalDebt: number;
  totalOwed: number;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [groupsRes] = await Promise.all([
          fetch("/api/groups", { credentials: "include" }),
        ]);
        const { groups } = await groupsRes.json();

        // Calculate debt totals across all groups
        let totalDebt = 0;
        let totalOwed = 0;

        for (const group of groups ?? []) {
          try {
            const debtRes = await fetch(`/api/groups/${group.id}/debts`, { credentials: "include" });
            if (debtRes.ok) {
              const { members } = await debtRes.json();
              const me = members?.find((m: any) => m.userId === user?.id);
              if (me) {
                totalDebt += me.owes ?? 0;
                totalOwed += me.owed ?? 0;
              }
            }
          } catch { /* skip */ }
        }

        setData({ groups: groups ?? [], recentGames: [], totalDebt, totalOwed });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px" }}>
      <div className="spinner" style={{ width: "28px", height: "28px" }} />
    </div>
  );

  const net = (data?.totalOwed ?? 0) - (data?.totalDebt ?? 0);

  return (
    <div className="fade-in">

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "28px", fontWeight: "800",
          marginBottom: "6px",
        }}>
          Vítej zpět, {user?.username} 👋
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
          Přehled tvých sázek, skupin a dluhů
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "32px" }}>
        <div className="stat-card">
          <div className="stat-label">Skupiny</div>
          <div className="stat-value">{data?.groups.length ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Dluhuji celkem</div>
          <div className="stat-value" style={{ color: data?.totalDebt ? "#f87171" : "var(--text-primary)" }}>
            {data?.totalDebt ?? 0} Kč
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Dluhují mi</div>
          <div className="stat-value stat-value-green">
            {data?.totalOwed ?? 0} Kč
          </div>
        </div>
      </div>

      {/* Net balance */}
      {(data?.totalDebt ?? 0) + (data?.totalOwed ?? 0) > 0 && (
        <div style={{
          background: net >= 0 ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)",
          border: `1px solid ${net >= 0 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"}`,
          borderRadius: "12px",
          padding: "16px 20px",
          marginBottom: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Celková bilance
            </div>
            <div style={{
              fontFamily: "var(--font-display)",
              fontSize: "22px", fontWeight: "700",
              color: net >= 0 ? "var(--green)" : "#f87171",
            }}>
              {net >= 0 ? "+" : ""}{net} Kč
            </div>
          </div>
          <div style={{ fontSize: "28px" }}>{net >= 0 ? "📈" : "📉"}</div>
        </div>
      )}

      {/* Groups */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "700" }}>
            Tvoje skupiny
          </h2>
          <Link href="/dashboard/groups" className="btn btn-ghost btn-sm">
            Všechny →
          </Link>
        </div>

        {data?.groups.length === 0 ? (
          <div className="card" style={{ padding: "40px", textAlign: "center" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>🏆</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>
              Zatím žádná skupina
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "20px" }}>
              Vytvoř skupinu a pozvi kamarády
            </p>
            <Link href="/dashboard/groups" className="btn btn-primary">
              Vytvořit skupinu
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
            {data?.groups.slice(0, 4).map((group) => (
              <Link
                key={group.id}
                href={`/dashboard/groups/${group.id}`}
                style={{ textDecoration: "none" }}
              >
                <div className="card card-hover" style={{ padding: "20px", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                    <div
                      className="avatar avatar-md"
                      style={{ background: group.avatarColor, color: "#000", fontWeight: "700", fontSize: "14px" }}
                    >
                      {group.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: "700", fontSize: "15px" }}>
                        {group.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {group.members.length} členů · {group._count.games} her
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {group.members.slice(0, 5).map((m) => (
                      <div
                        key={m.user.id}
                        className="avatar avatar-sm"
                        title={m.user.username}
                        style={{ background: m.user.avatarColor, color: "#000", fontWeight: "700" }}
                      >
                        {m.user.username.slice(0, 2).toUpperCase()}
                      </div>
                    ))}
                    {group.members.length > 5 && (
                      <div className="avatar avatar-sm" style={{ background: "var(--surface-3)", color: "var(--text-secondary)" }}>
                        +{group.members.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "700", marginBottom: "16px" }}>
          Rychlé akce
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
          {[
            { href: "/game/new", label: "Nová hra", icon: "⚽", desc: "Vytvoř místnost" },
            { href: "/game/join", label: "Připojit se", icon: "🔗", desc: "Zadej kód místnosti" },
            { href: "/dashboard/groups", label: "Skupiny", icon: "👥", desc: "Spravuj party" },
            { href: "/dashboard/stats", label: "Statistiky", icon: "📊", desc: "Tvoje výkonnost" },
          ].map((action) => (
            <Link key={action.href} href={action.href} style={{ textDecoration: "none" }}>
              <div className="card card-hover" style={{ padding: "16px", cursor: "pointer" }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>{action.icon}</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: "700", fontSize: "14px", marginBottom: "2px" }}>
                  {action.label}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{action.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
