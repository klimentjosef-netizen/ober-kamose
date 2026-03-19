"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { useSocket } from "@/hooks/useSocket";

function JoinGameInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const socket = useSocket();
  const { roomCode: joinedCode, addToast } = useGameStore();
  const [code, setCode] = useState(searchParams.get("code") ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (joinedCode) router.push(`/game/room/${joinedCode}`);
  }, [joinedCode]);

  const handleJoin = () => {
    if (!code.trim()) { addToast("Zadej kód místnosti", true); return; }
    if (!socket) { addToast("Není připojení", true); return; }
    setLoading(true);
    socket.emit("join_room", { roomCode: code.toUpperCase().trim() });
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
      background: "radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.05) 0%, transparent 60%)",
    }}>
      <div style={{ width: "100%", maxWidth: "400px" }} className="slide-up">
        <div style={{ marginBottom: "32px" }}>
          <a href="/dashboard" style={{ color: "var(--text-muted)", fontSize: "13px", textDecoration: "none" }}>← Zpět</a>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: "800", marginTop: "12px", marginBottom: "4px" }}>
            Připojit se
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Zadej 4-místný kód od kamaráda</p>
        </div>

        <div className="card" style={{ padding: "32px" }}>
          <div style={{ marginBottom: "20px" }}>
            <label className="input-label">Kód místnosti</label>
            <input
              className="input"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="AB3K"
              maxLength={4}
              autoFocus
              style={{ fontSize: "28px", fontFamily: "var(--font-display)", fontWeight: "700", letterSpacing: "0.2em", textAlign: "center" }}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            />
          </div>
          <button className="btn btn-primary btn-lg" onClick={handleJoin} disabled={loading || code.length < 4}
            style={{ width: "100%" }}>
            {loading ? <span className="spinner" /> : "Připojit se →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function JoinGamePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" style={{ width: "32px", height: "32px" }} />
      </div>
    }>
      <JoinGameInner />
    </Suspense>
  );
}
