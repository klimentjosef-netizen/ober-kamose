"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { AVATAR_COLORS } from "@/lib/constants";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registrace se nezdařila");
        return;
      }

      setUser(data.user, data.token);
      router.push("/dashboard");
    } catch {
      setError("Chyba připojení. Zkus to znovu.");
    } finally {
      setLoading(false);
    }
  };

  const initials = username ? username.slice(0, 2).toUpperCase() : "??";

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      background: "radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.06) 0%, transparent 60%)",
    }}>
      <div style={{ width: "100%", maxWidth: "400px" }} className="slide-up">

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "10px",
              background: "var(--green)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "20px",
            }}>⚽</div>
            <span style={{
              fontFamily: "var(--font-display)",
              fontSize: "24px", fontWeight: "800",
            }}>Ober Kamoše</span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Fantasy fotbal se sázkami mezi přáteli
          </p>
        </div>

        <div className="card" style={{ padding: "32px" }}>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "20px", fontWeight: "700",
            marginBottom: "24px",
          }}>Vytvořit účet</h1>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Avatar preview */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                className="avatar avatar-xl"
                style={{ background: avatarColor, color: "#000", fontWeight: "800" }}
              >
                {initials}
              </div>
              <div>
                <div className="input-label" style={{ marginBottom: "8px" }}>Barva avataru</div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setAvatarColor(color)}
                      style={{
                        width: "24px", height: "24px",
                        borderRadius: "50%",
                        background: color,
                        border: avatarColor === color ? "2px solid white" : "2px solid transparent",
                        cursor: "pointer",
                        transition: "transform 0.15s",
                        transform: avatarColor === color ? "scale(1.2)" : "scale(1)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="input-label">Uživatelské jméno</label>
              <input
                className="input"
                type="text"
                placeholder="kamoš123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_]+"
                autoComplete="username"
              />
              <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                Pouze písmena, čísla a podtržítko
              </span>
            </div>

            <div>
              <label className="input-label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="tvuj@email.cz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="input-label">Heslo</label>
              <input
                className="input"
                type="password"
                placeholder="min. 6 znaků"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "8px",
                padding: "10px 14px",
                fontSize: "13px",
                color: "#f87171",
              }}>
                {error}
              </div>
            )}

            <button
              className="btn btn-primary btn-lg"
              type="submit"
              disabled={loading}
              style={{ marginTop: "4px", width: "100%" }}
            >
              {loading ? <span className="spinner" /> : "Vytvořit účet"}
            </button>
          </form>
        </div>

        <p style={{
          textAlign: "center",
          marginTop: "20px",
          fontSize: "14px",
          color: "var(--text-secondary)",
        }}>
          Už máš účet?{" "}
          <Link href="/login" style={{ color: "var(--green)", textDecoration: "none", fontWeight: "600" }}>
            Přihlásit se
          </Link>
        </p>
      </div>
    </div>
  );
}
