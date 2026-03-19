"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useGameStore } from "@/store/gameStore";
import { useSocket } from "@/hooks/useSocket";
import { DraftType } from "@prisma/client";

export default function NewGamePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const socket = useSocket();
  const { roomCode, addToast } = useGameStore();
  const [groups, setGroups] = useState<any[]>([]);
  const [groupId, setGroupId] = useState<string>("");
  const [betPerGoal, setBetPerGoal] = useState(100);
  const [betPerAssist, setBetPerAssist] = useState(50);
  const [draftType, setDraftType] = useState<DraftType>(DraftType.SNAKE);
  const [picksPerPlayer, setPicksPerPlayer] = useState(8);
  const [customBet, setCustomBet] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/groups", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setGroups(d.groups ?? []));
  }, []);

  useEffect(() => {
    if (roomCode) router.push(`/game/room/${roomCode}`);
  }, [roomCode]);

  const handleCreate = () => {
    if (!socket) { addToast("Není připojení k serveru", true); return; }
    setLoading(true);
    socket.emit("create_room", {
      groupId: groupId || undefined,
      betPerGoal,
      betPerAssist,
      draftType,
      picksPerPlayer,
      customBetDescription: customBet || undefined,
    });
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
      background: "radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.05) 0%, transparent 60%)",
    }}>
      <div style={{ width: "100%", maxWidth: "500px" }} className="slide-up">

        <div style={{ marginBottom: "32px" }}>
          <a href="/dashboard" style={{ color: "var(--text-muted)", fontSize: "13px", textDecoration: "none" }}>
            ← Zpět
          </a>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: "800", marginTop: "12px", marginBottom: "4px" }}>
            Nová hra
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Nastav pravidla a pozvi kamarády</p>
        </div>

        <div className="card" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "22px" }}>

          {/* Group */}
          {groups.length > 0 && (
            <div>
              <label className="input-label">Skupina (volitelné)</label>
              <select className="input" value={groupId} onChange={(e) => setGroupId(e.target.value)}
                style={{ background: "var(--surface-3)", color: "var(--text-primary)" }}>
                <option value="">Bez skupiny</option>
                {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          )}

          {/* Sázky */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label className="input-label">Kč za gól</label>
              <input className="input" type="number" min={0} max={10000} value={betPerGoal}
                onChange={(e) => setBetPerGoal(Number(e.target.value))} />
            </div>
            <div>
              <label className="input-label">Kč za asistenci</label>
              <input className="input" type="number" min={0} max={10000} value={betPerAssist}
                onChange={(e) => setBetPerAssist(Number(e.target.value))} />
            </div>
          </div>

          {/* Custom bet */}
          <div>
            <label className="input-label">Vlastní sázka (volitelné)</label>
            <input className="input" placeholder="Prohrávající platí pivo..." value={customBet}
              onChange={(e) => setCustomBet(e.target.value)} maxLength={100} />
          </div>

          {/* Draft type */}
          <div>
            <label className="input-label">Typ draftu</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {([DraftType.SNAKE, DraftType.MANUAL] as DraftType[]).map((type) => (
                <button key={type} type="button"
                  onClick={() => setDraftType(type)}
                  style={{
                    padding: "12px", borderRadius: "8px", border: "1px solid",
                    borderColor: draftType === type ? "var(--green)" : "var(--border)",
                    background: draftType === type ? "var(--green-glow)" : "var(--surface-3)",
                    color: draftType === type ? "var(--green)" : "var(--text-secondary)",
                    cursor: "pointer", transition: "all 0.15s",
                    fontFamily: "var(--font-display)", fontWeight: "600", fontSize: "13px",
                  }}>
                  {type === DraftType.SNAKE ? "🐍 Snake" : "↔ Manuální"}
                  <div style={{ fontSize: "11px", fontWeight: "400", marginTop: "2px", fontFamily: "var(--font-body)" }}>
                    {type === DraftType.SNAKE ? "A-B-B-A-A-B" : "A-B-A-B-A-B"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Picks per player */}
          <div>
            <label className="input-label">Počet picků na hráče: <strong>{picksPerPlayer}</strong></label>
            <input type="range" min={3} max={15} value={picksPerPlayer}
              onChange={(e) => setPicksPerPlayer(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--green)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)" }}>
              <span>3</span><span>15</span>
            </div>
          </div>

          <button className="btn btn-primary btn-lg" onClick={handleCreate} disabled={loading}
            style={{ width: "100%", marginTop: "8px" }}>
            {loading ? <span className="spinner" /> : "⚽ Vytvořit místnost"}
          </button>
        </div>
      </div>
    </div>
  );
}
