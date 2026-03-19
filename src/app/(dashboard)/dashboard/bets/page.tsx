"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import Toast, { useToast } from "@/components/Toast";
import { BetInfo } from "@/types";

export default function BetsPage() {
  const { user } = useAuthStore();
  const [groups, setGroups] = useState<any[]>([]);
  const [bets, setBets] = useState<BetInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  // Create form state
  const [selGroupId, setSelGroupId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(100);
  const [sides, setSides] = useState<{ userId: string; side: string }[]>([]);
  const [side1Label, setSide1Label] = useState("Za");
  const [side2Label, setSide2Label] = useState("Proti");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const groupsRes = await fetch("/api/groups", { credentials: "include" });
      const groupsData = await groupsRes.json();
      const groupsList = groupsData.groups ?? [];
      setGroups(groupsList);
      if (groupsList.length > 0 && !selGroupId) setSelGroupId(groupsList[0].id);

      // Load bets from all groups
      const allBets: BetInfo[] = [];
      for (const g of groupsList) {
        try {
          const res = await fetch(`/api/groups/${g.id}/bets`, { credentials: "include" });
          if (res.ok) {
            const data = await res.json();
            allBets.push(...(data.bets ?? []));
          }
        } catch { /* skip */ }
      }
      allBets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBets(allBets);
    } finally {
      setLoading(false);
    }
  };

  const selectedGroup = groups.find((g) => g.id === selGroupId);
  const groupMembers = selectedGroup?.members ?? [];

  const toggleParticipant = (userId: string, side: string) => {
    setSides((prev) => {
      const existing = prev.find((s) => s.userId === userId);
      if (existing) {
        if (existing.side === side) return prev.filter((s) => s.userId !== userId);
        return prev.map((s) => (s.userId === userId ? { ...s, side } : s));
      }
      return [...prev, { userId, side }];
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selGroupId) { showToast("Vyber skupinu", "error"); return; }
    if (!title.trim()) { showToast("Zadej název sázky", "error"); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/groups/${selGroupId}/bets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          amount,
          participants: sides,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "Chyba", "error"); return; }
      setBets((prev) => [data.bet, ...prev]);
      setShowCreate(false);
      setTitle(""); setDescription(""); setAmount(100); setSides([]);
      setSide1Label("Za"); setSide2Label("Proti");
      showToast("Sázka vytvořena!", "success");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (bet: BetInfo, winnerSide: string) => {
    try {
      const res = await fetch(`/api/groups/${bet.group.id}/bets/${bet.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerSide }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "Chyba", "error"); return; }
      setBets((prev) => prev.map((b) => (b.id === bet.id ? data.bet : b)));
      showToast("Sázka uzavřena!", "success");
    } catch {
      showToast("Chyba při uzavírání", "error");
    }
  };

  const handleCancel = async (bet: BetInfo) => {
    try {
      const res = await fetch(`/api/groups/${bet.group.id}/bets/${bet.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "Chyba", "error"); return; }
      setBets((prev) => prev.map((b) => (b.id === bet.id ? data.bet : b)));
      showToast("Sázka zrušena", "success");
    } catch {
      showToast("Chyba", "error");
    }
  };

  const openBets = bets.filter((b) => b.status === "OPEN");
  const resolvedBets = bets.filter((b) => b.status !== "OPEN");

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px" }}>
      <div className="spinner" style={{ width: "28px", height: "28px" }} />
    </div>
  );

  return (
    <div className="fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: "800", marginBottom: "4px" }}>
            Sázky
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Všechny tvoje sázky s kamarády
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + Nová sázka
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 100, padding: "24px",
        }}>
          <div className="card slide-up" style={{ width: "100%", maxWidth: "520px", padding: "32px", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "700", marginBottom: "24px" }}>
              Nová sázka
            </h2>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Group select */}
              <div>
                <label className="input-label">Skupina</label>
                <select className="input" value={selGroupId} onChange={(e) => { setSelGroupId(e.target.value); setSides([]); }}
                  style={{ background: "var(--surface-3)", color: "var(--text-primary)" }}>
                  {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="input-label">O co se vsadíte?</label>
                <input className="input" value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Např. Kdo vyhraje El Clásico" required autoFocus />
              </div>

              {/* Description */}
              <div>
                <label className="input-label">Popis / podmínky (volitelné)</label>
                <input className="input" value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Podrobnosti, pravidla..." />
              </div>

              {/* Amount */}
              <div>
                <label className="input-label">Částka (Kč)</label>
                <input className="input" type="number" min={0} max={100000} value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))} />
                <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                  Kolik platí prohrávající vítězi. 0 = jen pro slávu
                </span>
              </div>

              {/* Side labels */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label className="input-label">Strana 1</label>
                  <input className="input" value={side1Label} onChange={(e) => setSide1Label(e.target.value)}
                    placeholder="Za" />
                </div>
                <div>
                  <label className="input-label">Strana 2</label>
                  <input className="input" value={side2Label} onChange={(e) => setSide2Label(e.target.value)}
                    placeholder="Proti" />
                </div>
              </div>

              {/* Participants */}
              <div>
                <label className="input-label">Kdo se účastní?</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {groupMembers.map((m: any) => {
                    const current = sides.find((s) => s.userId === m.user.id);
                    return (
                      <div key={m.user.id} style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        padding: "8px 12px", borderRadius: "8px",
                        background: current ? "var(--surface-3)" : "var(--surface-2)",
                        border: `1px solid ${current ? "rgba(212,175,55,0.2)" : "var(--border)"}`,
                      }}>
                        <div className="avatar avatar-sm"
                          style={{ background: m.user.avatarColor, color: "#000", fontWeight: "700" }}>
                          {m.user.username.slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontSize: "14px", fontWeight: "500", flex: 1 }}>{m.user.username}</span>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button type="button"
                            onClick={() => toggleParticipant(m.user.id, side1Label)}
                            style={{
                              padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600",
                              border: "1px solid",
                              borderColor: current?.side === side1Label ? "var(--gold)" : "var(--border)",
                              background: current?.side === side1Label ? "var(--gold-glow)" : "transparent",
                              color: current?.side === side1Label ? "var(--gold)" : "var(--text-secondary)",
                              cursor: "pointer",
                            }}>
                            {side1Label}
                          </button>
                          <button type="button"
                            onClick={() => toggleParticipant(m.user.id, side2Label)}
                            style={{
                              padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600",
                              border: "1px solid",
                              borderColor: current?.side === side2Label ? "#f87171" : "var(--border)",
                              background: current?.side === side2Label ? "rgba(239,68,68,0.08)" : "transparent",
                              color: current?.side === side2Label ? "#f87171" : "var(--text-secondary)",
                              cursor: "pointer",
                            }}>
                            {side2Label}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }}
                  onClick={() => setShowCreate(false)}>Zrušit</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? <span className="spinner" /> : "Vytvořit sázku"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Open bets */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "700", marginBottom: "16px" }}>
          Aktivní sázky ({openBets.length})
        </h2>

        {openBets.length === 0 ? (
          <div className="card" style={{ padding: "48px", textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎲</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>
              Žádné aktivní sázky
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "20px" }}>
              Vytvoř sázku o cokoli — výsledek zápasu, kdo přijde dřív, počasí...
            </p>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              + Nová sázka
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {openBets.map((bet) => (
              <BetCard key={bet.id} bet={bet} userId={user?.id} onResolve={handleResolve} onCancel={handleCancel} />
            ))}
          </div>
        )}
      </div>

      {/* Resolved bets */}
      {resolvedBets.length > 0 && (
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "700", marginBottom: "16px" }}>
            Uzavřené sázky ({resolvedBets.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {resolvedBets.map((bet) => (
              <BetCard key={bet.id} bet={bet} userId={user?.id} onResolve={handleResolve} onCancel={handleCancel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BetCard({
  bet, userId, onResolve, onCancel,
}: {
  bet: BetInfo;
  userId: string | undefined;
  onResolve: (bet: BetInfo, winnerSide: string) => void;
  onCancel: (bet: BetInfo) => void;
}) {
  const isOpen = bet.status === "OPEN";
  const isResolved = bet.status === "RESOLVED";
  const isCancelled = bet.status === "CANCELLED";
  const isCreator = bet.createdBy.id === userId;

  // Group participants by side
  const sideGroups: Record<string, typeof bet.participants> = {};
  for (const p of bet.participants) {
    if (!sideGroups[p.side]) sideGroups[p.side] = [];
    sideGroups[p.side].push(p);
  }
  const sideNames = Object.keys(sideGroups);

  return (
    <div className="card" style={{ padding: "20px", opacity: isCancelled ? 0.5 : 1 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: "700" }}>
              {bet.title}
            </span>
            {isOpen && <span className="badge badge-green">Aktivní</span>}
            {isResolved && <span className="badge badge-amber">Uzavřeno</span>}
            {isCancelled && <span className="badge badge-gray">Zrušeno</span>}
          </div>
          {bet.description && (
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "4px" }}>
              {bet.description}
            </p>
          )}
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            {bet.group.name} · {new Date(bet.createdAt).toLocaleDateString("cs-CZ")} · vytvořil {bet.createdBy.username}
          </div>
        </div>
        {bet.amount > 0 && (
          <div style={{
            fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "800",
            color: "var(--gold)", whiteSpace: "nowrap", marginLeft: "16px",
          }}>
            {bet.amount} Kč
          </div>
        )}
      </div>

      {/* Sides */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${sideNames.length}, 1fr)`, gap: "10px", marginBottom: isOpen && isCreator ? "14px" : "0" }}>
        {sideNames.map((sideName) => {
          const members = sideGroups[sideName];
          const isWinningSide = isResolved && members[0]?.isWinner === true;
          return (
            <div key={sideName} style={{
              padding: "10px 14px", borderRadius: "8px",
              background: isWinningSide ? "rgba(212,175,55,0.06)" : "var(--surface-3)",
              border: `1px solid ${isWinningSide ? "rgba(212,175,55,0.2)" : "var(--border)"}`,
            }}>
              <div style={{
                fontSize: "11px", fontWeight: "700", textTransform: "uppercase",
                letterSpacing: "0.05em", marginBottom: "8px",
                color: isWinningSide ? "var(--gold)" : "var(--text-muted)",
              }}>
                {sideName} {isWinningSide && "✓"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {members.map((p) => (
                  <div key={p.user.id} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div className="avatar avatar-sm"
                      style={{ background: p.user.avatarColor, color: "#000", fontWeight: "700", width: "22px", height: "22px", fontSize: "9px" }}>
                      {p.user.username.slice(0, 2).toUpperCase()}
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: "500" }}>{p.user.username}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      {isOpen && isCreator && (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {sideNames.map((sideName) => (
            <button key={sideName} className="btn btn-sm btn-secondary"
              onClick={() => onResolve(bet, sideName)}>
              🏆 Vyhrál: {sideName}
            </button>
          ))}
          <button className="btn btn-sm btn-ghost" style={{ marginLeft: "auto", color: "var(--text-muted)" }}
            onClick={() => onCancel(bet)}>
            Zrušit
          </button>
        </div>
      )}
    </div>
  );
}
