"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { useSocket } from "@/hooks/useSocket";
import { GameStatus } from "@prisma/client";
import LobbyScreen from "@/components/game/LobbyScreen";
import DraftScreen from "@/components/game/DraftScreen";
import GameScreen from "@/components/game/GameScreen";

export default function RoomPage() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const router = useRouter();
  const socket = useSocket();
  const { roomState, toasts, removeToast } = useGameStore();

  useEffect(() => {
    if (!socket || !roomCode) return;
    if (!roomState || roomState.roomCode !== roomCode) {
      socket.emit("join_room", { roomCode });
    }
  }, [socket, roomCode]);

  if (!roomState) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
        <div className="spinner" style={{ width: "36px", height: "36px" }} />
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Připojuji se k místnosti {roomCode}…</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Toast notifications */}
      <div style={{ position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)", zIndex: 9999, display: "flex", flexDirection: "column", gap: "8px" }}>
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.isError ? "toast-error" : "toast-success"}`}
            onClick={() => removeToast(t.id)} style={{ cursor: "pointer" }}>
            {t.text}
          </div>
        ))}
      </div>

      {roomState.status === GameStatus.LOBBY && <LobbyScreen />}
      {roomState.status === GameStatus.DRAFT && <DraftScreen />}
      {roomState.status === GameStatus.ACTIVE && <GameScreen />}
      {roomState.status === GameStatus.FINISHED && (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>🏆</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "32px", fontWeight: "800" }}>Hra skončila</h1>
            <button className="btn btn-primary btn-lg" style={{ marginTop: "24px" }} onClick={() => router.push("/dashboard")}>
              Zpět na přehled
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
