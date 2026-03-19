"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { UserStats } from "@/types";

export default function StatsPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/users/${user.id}/stats`, { credentials: "include" });
        if (res.ok) setStats(await res.json());
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

  return (
    <div className="fade-in">
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: "800", marginBottom: "4px" }}>
          Statistiky
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Tvoje výkonnost přes všechny hry</p>
      </div>

      {!stats || stats.totalGames === 0 ? (
        <div className="card" style={{ padding: "60px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>
            Zatím žádné statistiky
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Zahraj svou první hru a začni sbírat data
          </p>
        </div>
      ) : (
        <>
          {/* Main stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "28px" }}>
            <div className="stat-card">
              <div className="stat-label">Celkem her</div>
              <div className="stat-value">{stats.totalGames}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Góly celkem</div>
              <div className="stat-value stat-value-green">{stats.totalGoalsScored}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Asistence</div>
              <div className="stat-value">{stats.totalAssistsScored}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Bilance</div>
              <div className="stat-value" style={{ color: stats.netBalance >= 0 ? "var(--green)" : "#f87171" }}>
                {stats.netBalance >= 0 ? "+" : ""}{stats.netBalance} Kč
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {/* Finance */}
            <div className="card" style={{ padding: "22px" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: "700", fontSize: "16px", marginBottom: "16px" }}>
                Finance
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { label: "Celkem zaplaceno", value: `${stats.totalPaid} Kč`, color: "#f87171" },
                  { label: "Celkem přijato", value: `${stats.totalReceived} Kč`, color: "var(--green)" },
                  { label: "Čistá bilance", value: `${stats.netBalance >= 0 ? "+" : ""}${stats.netBalance} Kč`, color: stats.netBalance >= 0 ? "var(--green)" : "#f87171" },
                ].map((row) => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{row.label}</span>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: "700", color: row.color }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Favorite player */}
            <div className="card" style={{ padding: "22px" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: "700", fontSize: "16px", marginBottom: "16px" }}>
                Oblíbený hráč
              </h2>
              {stats.favoritePlayer ? (
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ fontSize: "40px" }}>⭐</div>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "700" }}>
                      {stats.favoritePlayer}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Nejčastěji draftovaný</div>
                  </div>
                </div>
              ) : (
                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Zatím žádný</p>
              )}
            </div>
          </div>

          {/* Recent games */}
          {stats.recentGames.length > 0 && (
            <div style={{ marginTop: "24px" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: "700", fontSize: "18px", marginBottom: "16px" }}>
                Poslední hry
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {stats.recentGames.map((game) => (
                  <div key={game.gameId} className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: "600", fontSize: "14px", marginBottom: "2px" }}>
                        Místnost #{game.roomCode}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        vs {game.opponents.join(", ")}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "13px", fontWeight: "600" }}>
                        {game.myGoals}G · {game.myAssists}A
                      </div>
                      {game.finishedAt && (
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {new Date(game.finishedAt).toLocaleDateString("cs-CZ")}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
