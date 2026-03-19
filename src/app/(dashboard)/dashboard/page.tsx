"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [groups, setGroups] = useState<any[]>([]);
  const [totalDebt, setTotalDebt] = useState(0);
  const [totalOwed, setTotalOwed] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const res = await fetch("/api/groups", { credentials: "include" });
        const data = await res.json();
        const groupsList = data.groups ?? [];
        setGroups(groupsList);

        let debt = 0, owed = 0;
        for (const g of groupsList) {
          try {
            const dRes = await fetch(`/api/groups/${g.id}/debts`, { credentials: "include" });
            if (dRes.ok) {
              const { members } = await dRes.json();
              const me = members?.find((m: any) => m.userId === user.id);
              if (me) { debt += me.owes ?? 0; owed += me.owed ?? 0; }
            }
          } catch { /* skip */ }
        }
        setTotalDebt(debt);
        setTotalOwed(owed);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const net = totalOwed - totalDebt;

  return (
    <div className="fade-in">

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "28px", fontWeight: "800",
          marginBottom: "6px",
        }}>
          Vítej zpět, {user?.username ?? "..."} 👋
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
          Přehled tvých sázek, skupin a dluhů
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "32px" }}>
        <div className="stat-card">
          <div className="stat-label">Skupiny</div>
          <div className="stat-value">{loading ? "..." : groups.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Dluhuji celkem</div>
          <div className="stat-value" style={{ color: totalDebt ? "#f87171" : "var(--text-primary)" }}>
            {loading ? "..." : `${totalDebt} Kč`}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Dluhují mi</div>
          <div className="stat-value stat-value-green">
            {loading ? "..." : `${totalOwed} Kč`}
          </div>
        </div>
      </div>

      {/* Net balance */}
      {!loading && (totalDebt + totalOwed > 0) && (
        <div style={{
          background: net >= 0 ? "rgba(212,175,55,0.04)" : "rgba(239,68,68,0.06)",
          border: `1px solid ${net >= 0 ? "rgba(212,175,55,0.12)" : "rgba(239,68,68,0.15)"}`,
          borderRadius: "12px", padding: "16px 20px", marginBottom: "32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Celková bilance
            </div>
            <div style={{
              fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: "700",
              color: net >= 0 ? "var(--green)" : "#f87171",
            }}>
              {net >= 0 ? "+" : ""}{net} Kč
            </div>
          </div>
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

        {!loading && groups.length === 0 ? (
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
            {groups.slice(0, 4).map((group) => (
              <Link key={group.id} href={`/dashboard/groups/${group.id}`} style={{ textDecoration: "none" }}>
                <div className="card card-hover" style={{ padding: "20px", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                    <div className="avatar avatar-md"
                      style={{ background: group.avatarColor, color: "#000", fontWeight: "700", fontSize: "14px" }}>
                      {group.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: "700", fontSize: "15px" }}>
                        {group.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {group.members?.length ?? 0} členů · {group._count?.games ?? 0} her
                      </div>
                    </div>
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
            { href: "/dashboard/bets", label: "Sázky", icon: "🎲", desc: "Vsaď se o cokoli" },
            { href: "/dashboard/groups", label: "Skupiny", icon: "👥", desc: "Spravuj party" },
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
