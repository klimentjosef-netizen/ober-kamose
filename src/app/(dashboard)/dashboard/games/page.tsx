"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function GamesPage() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Games are loaded per-group for now
    setLoading(false);
  }, []);

  return (
    <div className="fade-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: "800", marginBottom: "4px" }}>
            Hry
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Tvoje herní historie
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Link href="/game/join" className="btn btn-secondary">
            🔗 Připojit se
          </Link>
          <Link href="/game/new" className="btn btn-primary">
            + Nová hra
          </Link>
        </div>
      </div>

      <div className="card" style={{ padding: "60px", textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚽</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>
          Začni svou první hru
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px", maxWidth: "400px", margin: "0 auto 24px" }}>
          Vytvoř místnost, pozvi kamarády, vydraftuj hráče a sleduj góly v reálném čase
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <Link href="/game/new" className="btn btn-primary btn-lg">
            Vytvořit hru
          </Link>
          <Link href="/game/join" className="btn btn-secondary btn-lg">
            Připojit se
          </Link>
        </div>
      </div>
    </div>
  );
}
