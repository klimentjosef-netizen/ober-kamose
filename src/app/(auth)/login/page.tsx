"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Přihlášení se nezdařilo");
        return;
      }

      setUser(data.user, data.token);
      router.push("/dashboard");
    } catch {
      setError("Chyba připojení. Zkuste to znovu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      background: "radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.04) 0%, transparent 60%)",
    }}>
      <div style={{ width: "100%", maxWidth: "400px" }} className="slide-up">

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "8px",
          }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "10px",
              background: "linear-gradient(135deg, #D4AF37, #B8942E)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "20px",
            }}>⚽</div>
            <span style={{
              fontFamily: "var(--font-display)",
              fontSize: "24px", fontWeight: "800",
              color: "var(--text-primary)",
            }}>Ober Kamoše</span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Fantasy fotbal se sázkami mezi přáteli
          </p>
        </div>

        {/* Form card */}
        <div className="card" style={{ padding: "32px" }}>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "20px", fontWeight: "700",
            marginBottom: "24px",
          }}>Přihlásit se</h1>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label className="input-label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="tvůj@email.cz"
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
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
              {loading ? <span className="spinner" /> : "Přihlásit se"}
            </button>
          </form>
        </div>

        <p style={{
          textAlign: "center",
          marginTop: "20px",
          fontSize: "14px",
          color: "var(--text-secondary)",
        }}>
          Nemáš účet?{" "}
          <Link href="/register" style={{ color: "var(--gold)", textDecoration: "none", fontWeight: "600" }}>
            Zaregistruj se
          </Link>
        </p>
      </div>
    </div>
  );
}
