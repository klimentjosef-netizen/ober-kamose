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
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const [groupRes, debtRes] = await Promise.all([
          fetch("/api/groups", { credentials: "include" }),
          fetch(`/api/groups/${groupId}/debts`, { credentials: "include" }),
        ]);
        const groupData = await groupRes.json();
        const debtData = await debtRes.json();
        const found = groupData.groups?.find((g: any) => g.id === groupId);
        setGroup(found ?? null);
        setDebts(debtData.debts ?? []);
        setMembers(debtData.members ?? []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [groupId]);

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
            <div style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "700", letterSpacing: "0.1em", color: "var(--green)" }}>
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
            Dluhový přehled
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
                Dluhuji: {myMember.owes} Kč · Dluhují mi: {myMember.owed} Kč
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
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "700", marginBottom: "16px" }}>
            Členové
          </h2>
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
    </div>
  );
}
