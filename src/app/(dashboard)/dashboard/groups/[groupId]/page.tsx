"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Toast, { useToast } from "@/components/Toast";
import Link from "next/link";

export default function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuthStore();
  const [group, setGroup] = useState<any>(null);
  const [debts, setDebts] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [bets, setBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  // User search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  const loadData = async () => {
    try {
      const [groupRes, debtRes, betsRes] = await Promise.all([
        fetch("/api/groups", { credentials: "include" }),
        fetch(`/api/groups/${groupId}/debts`, { credentials: "include" }),
        fetch(`/api/groups/${groupId}/bets`, { credentials: "include" }),
      ]);
      const groupData = await groupRes.json();
      const debtData = await debtRes.json();
      const betsData = await betsRes.json();
      const found = groupData.groups?.find((g: any) => g.id === groupId);
      setGroup(found ?? null);
      setDebts(debtData.debts ?? []);
      setMembers(debtData.members ?? []);
      setBets(betsData.bets ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [groupId]);

  // Debounced user search
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          // Filter out existing members
          const memberIds = members.map((m) => m.userId);
          setSearchResults((data.users ?? []).filter((u: any) => !memberIds.includes(u.id)));
        }
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, members]);

  const addMember = async (userId: string) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "Chyba", "error"); return; }
      showToast(`${data.username} přidán do skupiny!`, "success");
      setSearchQuery("");
      setSearchResults([]);
      setShowAddMember(false);
      loadData(); // Refresh
    } catch {
      showToast("Chyba při přidávání", "error");
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(group.inviteCode);
    showToast("Kód zkopírován!", "success");
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px" }}>
      <div className="spinner" style={{ width: "28px", height: "28px" }} />
    </div>
  );

  if (!group) return (
    <div style={{ textAlign: "center", padding: "60px" }}>
      <p style={{ color: "var(--text-secondary)" }}>Skupina nenalezena</p>
    </div>
  );

  const myMember = members.find((m) => m.userId === user?.id);

  return (
    <div className="fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div className="avatar avatar-xl"
            style={{ background: group.avatarColor, color: "#000", fontWeight: "800", fontSize: "20px" }}>
            {group.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: "800" }}>
              {group.name}
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
              {group.members.length} členů · {group._count.games} her
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-secondary" onClick={() => setShowInvite(!showInvite)}>
            🔗 Pozvánka
          </button>
          <Link href="/game/new" className="btn btn-primary">
            + Nová hra
          </Link>
        </div>
      </div>

      {/* Invite code */}
      {showInvite && (
        <div className="card" style={{ padding: "20px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div className="stat-label">Kód pozvánky</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "700", letterSpacing: "0.1em", color: "var(--gold)" }}>
              {group.inviteCode}
            </div>
          </div>
          <button className="btn btn-secondary" onClick={copyInviteCode}>
            Kopírovat
          </button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

        {/* Debt overview */}
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "700", marginBottom: "16px" }}>
            Přehled dluhů
          </h2>

          {/* My balance */}
          {myMember && (
            <div style={{
              background: myMember.net >= 0 ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)",
              border: `1px solid ${myMember.net >= 0 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"}`,
              borderRadius: "10px", padding: "16px", marginBottom: "16px",
            }}>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>Tvoje bilance</div>
              <div style={{
                fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: "800",
                color: myMember.net >= 0 ? "var(--green)" : "#f87171",
              }}>
                {myMember.net >= 0 ? "+" : ""}{myMember.net} Kč
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                Dlužím: {myMember.owes} Kč · Dluží mi: {myMember.owed} Kč
              </div>
            </div>
          )}

          {/* Debt pairs */}
          {debts.length === 0 ? (
            <div className="card" style={{ padding: "24px", textAlign: "center" }}>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>✅</div>
              <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Všichni jsou vyrovnaní</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {debts.map((debt, i) => (
                <div key={i} className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
                    <span style={{ fontWeight: "600" }}>{debt.fromUsername}</span>
                    <span style={{ color: "var(--text-muted)" }}>→</span>
                    <span style={{ fontWeight: "600" }}>{debt.toUsername}</span>
                  </div>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: "700", color: "#f87171" }}>
                    {debt.amount} Kč
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Members */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "700" }}>
              Členové
            </h2>
            <button className="btn btn-sm btn-secondary" onClick={() => setShowAddMember(!showAddMember)}>
              + Přidat
            </button>
          </div>

          {/* Add member search */}
          {showAddMember && (
            <div className="card" style={{ padding: "14px", marginBottom: "12px" }}>
              <input
                className="input"
                placeholder="Hledat uživatele podle jména nebo e-mailu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searching && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", fontSize: "13px", color: "var(--text-muted)" }}>
                  <div className="spinner" style={{ width: "14px", height: "14px" }} /> Hledám...
                </div>
              )}
              {searchResults.length > 0 && (
                <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {searchResults.map((u) => (
                    <div key={u.id} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "8px 10px", borderRadius: "6px", background: "var(--surface-3)",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div className="avatar avatar-sm"
                          style={{ background: u.avatarColor, color: "#000", fontWeight: "700" }}>
                          {u.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: "600" }}>{u.username}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{u.email}</div>
                        </div>
                      </div>
                      <button className="btn btn-sm btn-primary" onClick={() => addMember(u.id)}>
                        Přidat
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                <div style={{ marginTop: "10px", fontSize: "13px", color: "var(--text-muted)", textAlign: "center" }}>
                  Žádný uživatel nenalezen
                </div>
              )}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {members.map((member) => (
              <div key={member.userId} className="card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div className="avatar avatar-sm"
                    style={{ background: member.avatarColor, color: "#000", fontWeight: "700" }}>
                    {member.username.slice(0, 2).toUpperCase()}
                  </div>
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>{member.username}</span>
                  {member.userId === user?.id && (
                    <span className="badge badge-gray" style={{ fontSize: "10px" }}>ty</span>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: member.net >= 0 ? "var(--green)" : "#f87171" }}>
                    {member.net >= 0 ? "+" : ""}{member.net} Kč
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bets section */}
      <div style={{ marginTop: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "700" }}>
            Sázky ({bets.filter((b: any) => b.status === "OPEN").length} aktivních)
          </h2>
          <Link href="/dashboard/bets" className="btn btn-ghost btn-sm">
            Všechny sázky →
          </Link>
        </div>

        {bets.length === 0 ? (
          <div className="card" style={{ padding: "32px", textAlign: "center" }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>🎲</div>
            <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Zatím žádné sázky v této skupině</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {bets.slice(0, 5).map((bet: any) => {
              const isOpen = bet.status === "OPEN";
              const sideGroups: Record<string, any[]> = {};
              for (const p of bet.participants ?? []) {
                if (!sideGroups[p.side]) sideGroups[p.side] = [];
                sideGroups[p.side].push(p);
              }
              return (
                <div key={bet.id} className="card" style={{ padding: "14px 18px", opacity: bet.status === "CANCELLED" ? 0.5 : 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontWeight: "600", fontSize: "14px" }}>{bet.title}</span>
                        {isOpen && <span className="badge badge-green" style={{ fontSize: "10px" }}>Aktivní</span>}
                        {bet.status === "RESOLVED" && <span className="badge badge-amber" style={{ fontSize: "10px" }}>Uzavřeno</span>}
                        {bet.status === "CANCELLED" && <span className="badge badge-gray" style={{ fontSize: "10px" }}>Zrušeno</span>}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                        {Object.entries(sideGroups).map(([side, members]) => (
                          <span key={side} style={{ marginRight: "12px" }}>
                            <strong>{side}:</strong> {(members as any[]).map((m: any) => m.user.username).join(", ")}
                          </span>
                        ))}
                      </div>
                    </div>
                    {bet.amount > 0 && (
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: "700", color: "var(--gold)", fontSize: "15px" }}>
                        {bet.amount} Kč
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
