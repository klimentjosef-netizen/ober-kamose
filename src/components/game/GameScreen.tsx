"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { getSocket } from "@/hooks/useSocket";
import { calculatePiggyBank } from "@/lib/gameEngine";
import { EventType } from "@prisma/client";

export default function GameScreen() {
  const { roomState, myPlayerIndex, chatMessages } = useGameStore();
  const [chatText, setChatText] = useState("");
  const [activeTab, setActiveTab] = useState<"game" | "chat" | "history">("game");
  const socket = getSocket();

  if (!roomState) return null;

  const { players, rosters, settings, goalEvents } = roomState;
  const piggy = calculatePiggyBank(roomState);

  const addGoal = (footballPlayerId: string, playerName: string, owner: number) => {
    socket?.emit("add_goal", { footballPlayerId, playerName, owner });
  };

  const addAssist = (footballPlayerId: string, playerName: string, owner: number) => {
    socket?.emit("add_assist", { footballPlayerId, playerName, owner });
  };

  const undoLast = () => socket?.emit("undo_last_event");

  const sendChat = () => {
    if (!chatText.trim()) return;
    socket?.emit("chat", { text: chatText.trim() });
    setChatText("");
  };

  const activeEvents = goalEvents.filter((e) => !e.undone);

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: "800" }}>
          ⚽ Živá hra
        </h1>
        <div style={{ display: "flex", gap: "6px" }}>
          {(["game", "chat", "history"] as const).map((tab) => (
            <button key={tab} className={`btn btn-sm ${activeTab === tab ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setActiveTab(tab)}>
              {tab === "game" ? "Hra" : tab === "chat" ? `Chat${chatMessages.length > 0 ? ` (${chatMessages.length})` : ""}` : "Historie"}
            </button>
          ))}
          <button className="btn btn-sm btn-danger" onClick={undoLast}>↩ Undo</button>
        </div>
      </div>

      {activeTab === "game" && (
        <div>
          {/* Piggy bank summary */}
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${players.length}, 1fr)`, gap: "12px", marginBottom: "24px" }}>
            {players.map((player) => {
              const totals = piggy.totals[player.playerIndex];
              return (
                <div key={player.playerIndex} style={{
                  background: "var(--surface-2)", border: "1px solid var(--border)",
                  borderRadius: "12px", padding: "16px", textAlign: "center",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "10px" }}>
                    <div className="avatar avatar-sm" style={{ background: player.avatarColor, color: "#000", fontWeight: "700" }}>
                      {player.username.slice(0, 2).toUpperCase()}
                    </div>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: "700", fontSize: "14px" }}>
                      {player.username}
                    </span>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>Dává do čuníka</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: "800", color: "#f87171" }}>
                    {totals?.pays ?? 0} Kč
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                    Dostane: <span style={{ color: "var(--green)" }}>{totals?.receives ?? 0} Kč</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rosters with score buttons */}
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${players.length}, 1fr)`, gap: "20px" }}>
            {players.map((player) => (
              <div key={player.playerIndex}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <div className="avatar avatar-sm" style={{ background: player.avatarColor, color: "#000", fontWeight: "700" }}>
                    {player.username.slice(0, 2).toUpperCase()}
                  </div>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: "700" }}>{player.username}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {(rosters[player.playerIndex] ?? []).map((rp) => (
                    <div key={rp.id} className="card" style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <div>
                          <div style={{ fontWeight: "600", fontSize: "13px" }}>{rp.name}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{rp.team}</div>
                        </div>
                        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                          <span style={{ fontFamily: "var(--font-display)", fontWeight: "700", fontSize: "16px", color: "var(--green)" }}>
                            {rp.goals}G
                          </span>
                          <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>·</span>
                          <span style={{ fontFamily: "var(--font-display)", fontWeight: "700", fontSize: "16px" }}>
                            {rp.assists}A
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button className="btn btn-sm btn-secondary" style={{ flex: 1, fontSize: "12px" }}
                          onClick={() => addGoal(rp.id, rp.name, player.playerIndex)}>
                          ⚽ Gól
                        </button>
                        <button className="btn btn-sm btn-ghost" style={{ flex: 1, fontSize: "12px" }}
                          onClick={() => addAssist(rp.id, rp.name, player.playerIndex)}>
                          👟 Asistence
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "chat" && (
        <div className="card" style={{ padding: "0", overflow: "hidden" }}>
          <div style={{ height: "400px", overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {chatMessages.length === 0 && (
              <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "14px", marginTop: "80px" }}>
                Zatím ticho... 🦗
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <div className="avatar avatar-sm"
                  style={{ background: players[msg.playerIndex]?.avatarColor ?? "var(--surface-3)", color: "#000", fontWeight: "700", flexShrink: 0 }}>
                  {msg.username.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "2px" }}>
                    {msg.username} · {msg.time}
                  </div>
                  <div style={{ fontSize: "14px" }}>{msg.text}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid var(--border)", padding: "12px", display: "flex", gap: "8px" }}>
            <input className="input" placeholder="Napiš zprávu..." value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={sendChat}>→</button>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="card" style={{ padding: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {activeEvents.length === 0 && (
              <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "14px", padding: "40px" }}>
                Zatím žádné góly ani asistence
              </div>
            )}
            {[...activeEvents].reverse().map((event) => (
              <div key={event.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", background: "var(--surface-3)", borderRadius: "8px" }}>
                <span style={{ fontSize: "20px" }}>{event.eventType === EventType.GOAL ? "⚽" : "👟"}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>{event.playerName}</span>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "8px" }}>
                    {event.eventType === EventType.GOAL ? "Gól" : "Asistence"}
                  </span>
                </div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {players[event.playerIndex]?.username}
                </span>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: "700", color: "var(--green)", fontSize: "13px" }}>
                  +{event.eventType === EventType.GOAL ? roomState.settings.betPerGoal : roomState.settings.betPerAssist} Kč
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
