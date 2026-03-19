"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { getSocket } from "@/hooks/useSocket";

export default function LobbyScreen() {
  const { roomState, myPlayerIndex, availableMatches } = useGameStore();
  const [customHome, setCustomHome] = useState("");
  const [customAway, setCustomAway] = useState("");
  const socket = getSocket();
  const isHost = myPlayerIndex === 0;

  if (!roomState) return null;

  const { roomCode, players, settings, selectedMatchIds } = roomState;

  const toggleMatch = (matchId: string, selected: boolean) => {
    socket?.emit("select_match", { matchId, selected });
  };

  const addCustomMatch = () => {
    if (!customHome.trim() || !customAway.trim()) return;
    socket?.emit("add_custom_match", { home: customHome.trim(), away: customAway.trim() });
    setCustomHome(""); setCustomAway("");
  };

  const startGame = () => socket?.emit("start_game");

  const allMatches = [
    ...availableMatches,
    ...roomState.matches.filter((m) => m.isCustom),
  ];

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Lobby
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "32px", fontWeight: "800" }}>
            Místnost <span style={{ color: "var(--gold)" }}>{roomCode}</span>
          </h1>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {isHost && (
            <button className="btn btn-primary btn-lg"
              onClick={startGame}
              disabled={selectedMatchIds.length === 0 || players.length < 2}
              title={players.length < 2 ? "Čekám na dalšího hráče" : ""}>
              Spustit draft →
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px" }}>

        {/* Matches */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: "700", fontSize: "16px" }}>
              Zápasy ({selectedMatchIds.length}/8)
            </h2>
            {!isHost && <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Hostitel vybírá zápasy</span>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
            {allMatches.length === 0 && (
              <div className="card" style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
                Načítám zápasy…
              </div>
            )}
            {allMatches.map((match) => {
              const selected = selectedMatchIds.includes(match.id);
              return (
                <div key={match.id}
                  onClick={() => isHost && toggleMatch(match.id, !selected)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 16px", borderRadius: "8px",
                    border: `1px solid ${selected ? "rgba(212,175,55,0.3)" : "var(--border)"}`,
                    background: selected ? "rgba(212,175,55,0.06)" : "var(--surface-2)",
                    cursor: isHost ? "pointer" : "default",
                    transition: "all 0.15s",
                  }}>
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "14px" }}>
                      {match.homeTeam} <span style={{ color: "var(--text-muted)" }}>vs</span> {match.awayTeam}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                      {match.competition ?? "Vlastní zápas"}
                      {match.matchDate && ` · ${new Date(match.matchDate).toLocaleDateString("cs-CZ")}`}
                    </div>
                  </div>
                  <div style={{
                    width: "20px", height: "20px", borderRadius: "50%",
                    border: `1.5px solid ${selected ? "var(--gold)" : "var(--border)"}`,
                    background: selected ? "var(--gold)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "11px", color: "#000", flexShrink: 0,
                  }}>
                    {selected && "✓"}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom match */}
          {isHost && (
            <div className="card" style={{ padding: "16px" }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Přidat vlastní zápas
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "8px", alignItems: "end" }}>
                <div>
                  <label className="input-label">Domácí</label>
                  <input className="input" value={customHome} onChange={(e) => setCustomHome(e.target.value)} placeholder="Tým A" />
                </div>
                <div>
                  <label className="input-label">Hosté</label>
                  <input className="input" value={customAway} onChange={(e) => setCustomAway(e.target.value)} placeholder="Tým B"
                    onKeyDown={(e) => e.key === "Enter" && addCustomMatch()} />
                </div>
                <button className="btn btn-secondary" onClick={addCustomMatch} disabled={!customHome || !customAway}>
                  +
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Players */}
          <div className="card" style={{ padding: "18px" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: "700", fontSize: "14px", marginBottom: "12px" }}>
              Hráči
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {players.map((p) => (
                <div key={p.playerIndex} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div className="avatar avatar-sm" style={{ background: p.avatarColor, color: "#000", fontWeight: "700" }}>
                    {p.username.slice(0, 2).toUpperCase()}
                  </div>
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>{p.username}</span>
                  {p.playerIndex === myPlayerIndex && (
                    <span className="badge badge-gray" style={{ fontSize: "10px", marginLeft: "auto" }}>ty</span>
                  )}
                  <div style={{
                    width: "6px", height: "6px", borderRadius: "50", marginLeft: "auto",
                    background: p.isOnline ? "var(--gold)" : "var(--text-muted)",
                  }} />
                </div>
              ))}
              {players.length < 2 && (
                <div style={{ fontSize: "13px", color: "var(--text-muted)", fontStyle: "italic", paddingTop: "4px" }}>
                  Čekám na hráče…
                </div>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="card" style={{ padding: "18px" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: "700", fontSize: "14px", marginBottom: "12px" }}>
              Nastavení
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { label: "Gól", value: `${settings.betPerGoal} Kč` },
                { label: "Asistence", value: `${settings.betPerAssist} Kč` },
                { label: "Draft", value: settings.draftType === "SNAKE" ? "🐍 Snake" : "↔ Manuální" },
                { label: "Picků", value: `${settings.picksPerPlayer} na hráče` },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "var(--text-muted)" }}>{row.label}</span>
                  <span style={{ fontWeight: "600" }}>{row.value}</span>
                </div>
              ))}
              {settings.customBetDescription && (
                <div style={{ marginTop: "6px", padding: "8px", background: "var(--surface-3)", borderRadius: "6px", fontSize: "12px", color: "var(--gold)" }}>
                  🎯 {settings.customBetDescription}
                </div>
              )}
            </div>
          </div>

          {/* Share */}
          <div className="card" style={{ padding: "18px", textAlign: "center" }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>Pozvánka</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "36px", fontWeight: "800", letterSpacing: "0.15em", color: "var(--gold)", marginBottom: "10px" }}>
              {roomCode}
            </div>
            <button className="btn btn-secondary btn-sm" style={{ width: "100%" }}
              onClick={() => { navigator.clipboard.writeText(roomCode); }}>
              Kopírovat kód
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
