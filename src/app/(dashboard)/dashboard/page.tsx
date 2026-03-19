"use client";

import Link from "next/link";

export default function DashboardPage() {
  const user = { username: "Developer", id: "dev" };

  return (
    <div className="fade-in">

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "28px", fontWeight: "800",
          marginBottom: "6px",
        }}>
          Vítej zpět, {user.username} 👋
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
          Přehled tvých sázek, skupin a dluhů
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "32px" }}>
        <div className="stat-card">
          <div className="stat-label">Skupiny</div>
          <div className="stat-value">0</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Dluhuji celkem</div>
          <div className="stat-value">0 Kč</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Dluhují mi</div>
          <div className="stat-value stat-value-green">0 Kč</div>
        </div>
      </div>

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
