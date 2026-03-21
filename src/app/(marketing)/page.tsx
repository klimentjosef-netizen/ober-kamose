"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import MascotHero from "@/components/MascotHero";

export default function LandingPage() {
  return (
    <div style={{ background: "#0A0A0A", color: "#F5F0E8", minHeight: "100vh", fontFamily: "var(--font-body)" }}>

      {/* ─── NAVBAR ─────────────────────────────────────────────────────── */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 48px",
        borderBottom: "1px solid rgba(212,175,55,0.07)",
        position: "sticky", top: 0,
        background: "rgba(10,10,10,0.92)",
        backdropFilter: "blur(12px)",
        zIndex: 50,
      }}>
        <Logo size="sm" />
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Link href="/login" style={{
            background: "transparent", color: "#9B8E7B",
            border: "1px solid rgba(212,175,55,0.15)", borderRadius: "8px",
            padding: "8px 18px", fontSize: "13px", fontWeight: "600",
            textDecoration: "none", transition: "all 0.2s",
          }}>
            Přihlásit se
          </Link>
          <Link href="/register" style={{
            background: "#D4AF37", color: "#0A0A0A",
            border: "none", borderRadius: "8px",
            padding: "8px 18px", fontSize: "13px", fontWeight: "700",
            textDecoration: "none",
          }}>
            Začít zdarma
          </Link>
        </div>
      </nav>

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section style={{ padding: "64px 48px", borderTop: "none" }}>
        <div style={{
          maxWidth: "1100px", margin: "0 auto",
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: "48px", alignItems: "center",
        }}>

          {/* Left — mascot */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <MascotHero />
          </div>

          {/* Right — text + CTA */}
          <div>
            <div style={{
              display: "inline-block",
              background: "rgba(212,175,55,0.1)", color: "#D4AF37",
              border: "1px solid rgba(212,175,55,0.2)",
              borderRadius: "20px", padding: "4px 16px",
              fontSize: "12px", fontWeight: "600",
              letterSpacing: "0.06em", textTransform: "uppercase",
              marginBottom: "24px",
            }}>
              Fantasy fotbal pro kamarády
            </div>

            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: "800", lineHeight: "1.05",
              letterSpacing: "-0.02em", marginBottom: "20px",
            }}>
              Zahrajte si.<br />
              <span style={{ color: "#D4AF37" }}>Draftujte.<br />Sledujte.</span>
            </h1>

            <p style={{
              fontSize: "17px", color: "#9B8E7B",
              lineHeight: "1.65", marginBottom: "12px",
              maxWidth: "440px",
            }}>
              Vyberte si hráče z reálných zápasů, sledujte góly
              a automaticky počítejte kdo komu dluží.
            </p>

            <p style={{
              fontSize: "14px", color: "#6B5F4F",
              marginBottom: "36px", maxWidth: "400px",
            }}>
              Dva módy:{" "}
              <span style={{ color: "#D4AF37" }}>čuník</span>
              {" "}(průběžná odměna za každý gól) nebo{" "}
              <span style={{ color: "#D4AF37" }}>výzva vítězi</span>
              {" "}(vítěz dostane odměnu).
            </p>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link href="/register" style={{
                background: "#D4AF37", color: "#0A0A0A",
                borderRadius: "10px", padding: "14px 28px",
                fontSize: "15px", fontWeight: "800",
                textDecoration: "none", display: "inline-block",
              }}>
                Vytvořit účet zdarma
              </Link>
              <Link href="/game/join" style={{
                background: "transparent", color: "#F5F0E8",
                border: "1px solid rgba(212,175,55,0.2)",
                borderRadius: "10px", padding: "14px 24px",
                fontSize: "15px", fontWeight: "600",
                textDecoration: "none", display: "inline-block",
              }}>
                Mám kód místnosti →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── JAK TO FUNGUJE ─────────────────────────────────────────────── */}
      <section style={{ padding: "64px 48px", borderTop: "1px solid rgba(212,175,55,0.07)" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "32px", fontWeight: "800", marginBottom: "8px" }}>
            Jak to funguje?
          </h2>
          <p style={{ color: "#9B8E7B", fontSize: "15px" }}>Od přihlášení ke hře za 2 minuty</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", maxWidth: "900px", margin: "0 auto" }}>
          {[
            { n: "01", title: "Vytvoř skupinu", desc: "Pozvi kamarády přes odkaz nebo kód. Všichni vidí společný přehled dluhů." },
            { n: "02", title: "Spusť hru", desc: "Vyber reálné zápasy. Nastav odměnu za gól — nebo nastav odměnu pro vítěze." },
            { n: "03", title: "Draftuj hráče", desc: "Střídavě si vybírejte hráče ze soupisk. Snake draft zajistí férovost." },
            { n: "04", title: "Sleduj a plať", desc: "Každý gól tvých hráčů vydělává. Čuník nebo klasika — ty rozhoduješ." },
          ].map((s) => (
            <div key={s.n} style={{ background: "#161616", border: "1px solid rgba(212,175,55,0.08)", borderRadius: "10px", padding: "22px 18px" }}>
              <div style={{ fontSize: "28px", fontWeight: "800", fontFamily: "var(--font-display)", color: "rgba(212,175,55,0.25)", marginBottom: "10px" }}>{s.n}</div>
              <div style={{ fontSize: "15px", fontWeight: "700", marginBottom: "8px" }}>{s.title}</div>
              <div style={{ fontSize: "13px", color: "#9B8E7B", lineHeight: "1.55" }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── DVA MÓDY ───────────────────────────────────────────────────── */}
      <section style={{ padding: "64px 48px", borderTop: "1px solid rgba(212,175,55,0.07)" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "32px", fontWeight: "800", marginBottom: "8px" }}>
            Dva módy hry
          </h2>
          <p style={{ color: "#9B8E7B", fontSize: "15px" }}>Vyber si co ti sedí</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ background: "#161616", border: "1px solid rgba(212,175,55,0.15)", borderRadius: "12px", padding: "28px 24px" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>🐷</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "800", marginBottom: "8px", color: "#D4AF37" }}>
              Čuník
            </div>
            <p style={{ fontSize: "13px", color: "#9B8E7B", lineHeight: "1.6", marginBottom: "16px" }}>
              Za každý gól tvých hráčů ti kamarád dluží do společného fondu. Průběžné napětí po celou hru. Na konci se vyúčtuje kdo dal víc.
            </p>
            <div style={{ fontSize: "12px", color: "#6B5F4F" }}>
              Příklad: gól = 50 Kč · 3 góly = kamarád ti dluží 150 Kč
            </div>
          </div>
          <div style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "28px 24px" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>🏆</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "800", marginBottom: "8px" }}>
              Výzva vítězi
            </div>
            <p style={{ fontSize: "13px", color: "#9B8E7B", lineHeight: "1.6", marginBottom: "16px" }}>
              Dohodněte se na částce předem. Kdo má víc gólů na konci hry, vyhrává celou sumu. Jednoduché a jasné.
            </p>
            <div style={{ fontSize: "12px", color: "#6B5F4F" }}>
              Příklad: výzva 500 Kč · vítěz dostane odměnu
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ───────────────────────────────────────────────────── */}
      <section style={{ padding: "64px 48px", borderTop: "1px solid rgba(212,175,55,0.07)" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "32px", fontWeight: "800", marginBottom: "8px" }}>
            Vše co potřebuješ
          </h2>
          <p style={{ color: "#9B8E7B", fontSize: "15px" }}>Žádné papíry, žádné hádky o výsledcích</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", maxWidth: "900px", margin: "0 auto" }}>
          {[
            { icon: "⚽", title: "Reálné zápasy", desc: "Premier League, La Liga, Champions League. Aktualizace každý týden." },
            { icon: "🐍", title: "Snake draft", desc: "Férový výběr hráčů pro 2–8 hráčů. Automatický los kdo začíná." },
            { icon: "🎲", title: "Vlastní výzvy", desc: "Zahrajte si o cokoli mimo draft — výsledek zápasu, pivní kolo, cokoliv." },
            { icon: "💰", title: "Dluhový přehled", desc: "Kdo komu dluží po každé hře. Čistá bilance přes celou sezónu." },
            { icon: "📊", title: "Statistiky", desc: "Nejúspěšnější hráči, historické hry, finanční bilance." },
            { icon: "👥", title: "Skupiny přátel", desc: "Jedna skupina, všichni vidí stejné dluhy a historii." },
          ].map((f) => (
            <div key={f.title} style={{ background: "#161616", border: "1px solid rgba(212,175,55,0.08)", borderRadius: "10px", padding: "20px" }}>
              <div style={{ fontSize: "24px", marginBottom: "10px" }}>{f.icon}</div>
              <div style={{ fontSize: "14px", fontWeight: "700", marginBottom: "6px" }}>{f.title}</div>
              <div style={{ fontSize: "12px", color: "#9B8E7B", lineHeight: "1.5" }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 48px", textAlign: "center", borderTop: "1px solid rgba(212,175,55,0.07)" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "36px", fontWeight: "800", marginBottom: "12px" }}>
          Připraven začít?
        </h2>
        <p style={{ color: "#9B8E7B", fontSize: "16px", marginBottom: "32px" }}>
          Zdarma. Žádná kreditní karta.
        </p>
        <Link href="/register" style={{
          background: "#D4AF37", color: "#0A0A0A",
          border: "none", borderRadius: "10px",
          padding: "16px 40px", fontSize: "18px", fontWeight: "800",
          textDecoration: "none", display: "inline-block",
        }}>
          Vytvořit účet zdarma →
        </Link>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid rgba(212,175,55,0.07)", padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Logo size="sm" />
        </div>
        <div style={{ fontSize: "12px", color: "#6B5F4F" }}>
          © 2025 · Fantasy fotbal pro kamarády
        </div>
        <div style={{ display: "flex", gap: "20px" }}>
          <Link href="/login" style={{ fontSize: "12px", color: "#6B5F4F", textDecoration: "none" }}>Přihlásit se</Link>
          <Link href="/register" style={{ fontSize: "12px", color: "#D4AF37", textDecoration: "none" }}>Registrace</Link>
        </div>
      </footer>

    </div>
  );
}
