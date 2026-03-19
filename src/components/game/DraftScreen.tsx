"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { getSocket } from "@/hooks/useSocket";

export default function DraftScreen() {
  const { roomState, myPlayerIndex, pendingPickIdx, setPendingPick } = useGameStore();
  const [search, setSearch] = useState("");
  const [posFilter, setPosFilter] = useState("Vše");
  const socket = getSocket();

  if (!roomState) return null;

  const { allPlayers, drafted, draftOrder, draftPos, players, rosters, settings, draftHistory } = roomState;
  const currentDrafter = draftOrder[draftPos] ?? 0;
  const isMyTurn = myPlayerIndex === currentDrafter;
  const totalPicks = draftOrder.length;
  const progress = Math.round((draftPos / totalPicks) * 100);

  const positions = ["Vše", "Brankář", "Obránce", "Záložník", "Útočník"];

  const filtered = allPlayers.filter((p, i) => {
    if (drafted[i]) return false;
    if (posFilter !== "Vše" && p.position !== posFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
        !p.team.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handlePick = (idx: number) => {
    if (!isMyTurn) return;
    if (pendingPickIdx === idx) {
      socket?.emit("draft_pick", { playerIdx: idx });
      setPendingPick(null);
    } else {
      setPendingPick(idx);
    }
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px" }}>

      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <div>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Pick {draftPos + 1} / {totalPicks}
            </span>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: "800" }}>
              {isMyTurn
                ? "🟢 Tvůj výběr"
                : `⏳ Vybírá ${players[currentDrafter]?.username ?? "..."}`}
            </h1>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {players.map((p) => (
              <div key={p.playerIndex} style={{
                padding: "6px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "600",
                background: p.playerIndex === currentDrafter ? "var(--green-glow)" : "var(--surface-2)",
                border: `1px solid ${p.playerIndex === currentDrafter ? "rgba(34,197,94,0.3)" : "var(--border)"}`,
                color: p.playerIndex === currentDrafter ? "var(--green)" : "var(--text-secondary)",
              }}>
                {p.username}
              </div>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div style={{ height: "4px", background: "var(--surface-3)", borderRadius: "2px" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "var(--green)", borderRadius: "2px", transition: "width 0.3s" }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "20px" }}>

        {/* Player list */}
        <div>
          {/* Filters */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
            <input className="input" placeholder="Hledat hráče..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: "160px" }} />
            {positions.map((pos) => (
              <button key={pos} onClick={() => setPosFilter(pos)}
                className={`btn btn-sm ${posFilter === pos ? "btn-primary" : "btn-secondary"}`}>
                {pos}
              </button>
            ))}
          </div>

          {/* Players grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "6px", maxHeight: "calc(100vh - 280px)", overflowY: "auto" }}>
            {filtered.map((player) => {
              const idx = allPlayers.findIndex((p) => p.id === player.id);
              const isPending = pendingPickIdx === idx;
              return (
                <div key={player.id}
                  onClick={() => isMyTurn && handlePick(idx)}
                  style={{
                    padding: "10px 12px", borderRadius: "8px",
                    border: `1px solid ${isPending ? "var(--green)" : "var(--border)"}`,
                    background: isPending ? "var(--green-glow)" : "var(--surface-2)",
                    cursor: isMyTurn ? "pointer" : "default",
                    transition: "all 0.12s",
                    transform: isPending ? "scale(1.01)" : "scale(1)",
                  }}>
                  <div style={{ fontWeight: "600", fontSize: "13px", marginBottom: "2px" }}>{player.name}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{player.team}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>{player.position}</div>
                  {isPending && (
                    <div style={{ marginTop: "8px", background: "var(--green)", color: "#000", borderRadius: "4px", padding: "4px 8px", fontSize: "11px", fontWeight: "700", textAlign: "center" }}>
                      Potvrdit pick ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right panel — rosters */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {players.map((player) => (
            <div key={player.playerIndex} className="card" style={{ padding: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <div className="avatar avatar-sm" style={{ background: player.avatarColor, color: "#000", fontWeight: "700" }}>
                  {player.username.slice(0, 2).toUpperCase()}
                </div>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: "700", fontSize: "13px" }}>
                  {player.username}
                </span>
                <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--text-muted)" }}>
                  {rosters[player.playerIndex]?.length ?? 0}/{settings.picksPerPlayer}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {(rosters[player.playerIndex] ?? []).map((p) => (
                  <div key={p.id} style={{ fontSize: "12px", padding: "4px 8px", background: "var(--surface-3)", borderRadius: "4px", display: "flex", justifyContent: "space-between" }}>
                    <span>{p.name}</span>
                    <span style={{ color: "var(--text-muted)" }}>{p.team.slice(0, 3)}</span>
                  </div>
                ))}
                {(rosters[player.playerIndex]?.length ?? 0) < settings.picksPerPlayer && (
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic", padding: "4px 8px" }}>
                    {settings.picksPerPlayer - (rosters[player.playerIndex]?.length ?? 0)} zbývá
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
