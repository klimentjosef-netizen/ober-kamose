"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { GroupWithMembers } from "@/types";
import Link from "next/link";
import Toast, { useToast } from "@/components/Toast";

export default function GroupsPage() {
  const { user } = useAuthStore();
  const [groups, setGroups] = useState<GroupWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const loadGroups = async () => {
    try {
      const res = await fetch("/api/groups", { credentials: "include" });
      const data = await res.json();
      setGroups(data.groups ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadGroups(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: createName, description: createDesc }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error, "error"); return; }
      setGroups((prev) => [data.group, ...prev]);
      setShowCreate(false);
      setCreateName("");
      setCreateDesc("");
      showToast("Skupina vytvořena!", "success");
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: joinCode }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error, "error"); return; }
      setGroups((prev) => [data.group, ...prev]);
      setShowJoin(false);
      setJoinCode("");
      showToast("Přidal ses do skupiny!", "success");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px" }}>
      <div className="spinner" style={{ width: "28px", height: "28px" }} />
    </div>
  );

  return (
    <div className="fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: "800", marginBottom: "4px" }}>
            Skupiny
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Tvoje party kamarádů
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-secondary" onClick={() => setShowJoin(true)}>
            🔗 Připojit se
          </button>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            + Vytvořit
          </button>
        </div>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 100, padding: "24px",
        }}>
          <div className="card slide-up" style={{ width: "100%", maxWidth: "420px", padding: "32px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "700", marginBottom: "24px" }}>
              Nová skupina
            </h2>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label className="input-label">Název skupiny</label>
                <input className="input" value={createName} onChange={(e) => setCreateName(e.target.value)}
                  placeholder="FC Kamarádi" required minLength={2} maxLength={40} autoFocus />
              </div>
              <div>
                <label className="input-label">Popis (volitelné)</label>
                <input className="input" value={createDesc} onChange={(e) => setCreateDesc(e.target.value)}
                  placeholder="Naše weekly sázky..." maxLength={200} />
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }}
                  onClick={() => setShowCreate(false)}>Zrušit</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? <span className="spinner" /> : "Vytvořit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join modal */}
      {showJoin && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 100, padding: "24px",
        }}>
          <div className="card slide-up" style={{ width: "100%", maxWidth: "420px", padding: "32px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "700", marginBottom: "24px" }}>
              Připojit se ke skupině
            </h2>
            <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label className="input-label">Kód pozvánky</label>
                <input className="input" value={joinCode} onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Vlož kód od kamaráda" required autoFocus />
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }}
                  onClick={() => setShowJoin(false)}>Zrušit</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? <span className="spinner" /> : "Připojit se"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Groups grid */}
      {groups.length === 0 ? (
        <div className="card" style={{ padding: "60px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏆</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>
            Zatím žádná skupina
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
            Vytvoř skupinu a pozvi kamarády nebo se připoj přes kód pozvánky
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => setShowCreate(true)}>
            Vytvořit první skupinu
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "14px" }}>
          {groups.map((group) => {
            const isOwner = group.members.find((m) => m.user.id === user?.id)?.role === "OWNER";
            return (
              <Link key={group.id} href={`/dashboard/groups/${group.id}`} style={{ textDecoration: "none" }}>
                <div className="card card-hover" style={{ padding: "22px", cursor: "pointer", height: "100%" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div className="avatar avatar-md"
                        style={{ background: group.avatarColor, color: "#000", fontWeight: "700", fontSize: "14px" }}>
                        {group.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontFamily: "var(--font-display)", fontWeight: "700", fontSize: "16px" }}>
                          {group.name}
                        </div>
                        {isOwner && <span className="badge badge-green" style={{ marginTop: "2px" }}>Owner</span>}
                      </div>
                    </div>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      {group._count.games} her
                    </span>
                  </div>

                  {group.description && (
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "14px", lineHeight: "1.5" }}>
                      {group.description}
                    </p>
                  )}

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", gap: "4px" }}>
                      {group.members.slice(0, 6).map((m) => (
                        <div key={m.user.id} className="avatar avatar-sm" title={m.user.username}
                          style={{ background: m.user.avatarColor, color: "#000", fontWeight: "700" }}>
                          {m.user.username.slice(0, 2).toUpperCase()}
                        </div>
                      ))}
                      {group.members.length > 6 && (
                        <div className="avatar avatar-sm"
                          style={{ background: "var(--surface-3)", color: "var(--text-secondary)", fontSize: "10px" }}>
                          +{group.members.length - 6}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      {group.members.length} členů
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
