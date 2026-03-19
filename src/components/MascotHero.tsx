"use client";

export default function MascotHero() {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "400px", margin: "0 auto" }}>
      {/* Glow under pig */}
      <div style={{
        position: "absolute", bottom: "-20px", left: "50%", transform: "translateX(-50%)",
        width: "200px", height: "40px", borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(212,175,55,0.3) 0%, transparent 70%)",
        animation: "glowPulse 3s ease-in-out infinite",
      }} />

      {/* Floating coins */}
      {[
        { x: 30, delay: 0, size: 28 },
        { x: 320, delay: 1.2, size: 24 },
        { x: 80, delay: 2.4, size: 20 },
        { x: 280, delay: 0.8, size: 26 },
        { x: 180, delay: 1.8, size: 22 },
      ].map((coin, i) => (
        <svg key={i} width={coin.size} height={coin.size} viewBox="0 0 32 32"
          style={{
            position: "absolute",
            left: coin.x, top: 20 + i * 30,
            animation: `coinFloat 3.5s ease-in-out ${coin.delay}s infinite`,
            opacity: 0.7,
          }}>
          <circle cx="16" cy="16" r="14" fill="#D4AF37" stroke="#B8942E" strokeWidth="2" />
          <circle cx="16" cy="16" r="10" fill="none" stroke="#B8942E" strokeWidth="1" opacity="0.5" />
          <text x="16" y="21" textAnchor="middle" fontSize="14" fontWeight="800" fill="#0A0A0A" fontFamily="Georgia, serif">Kč</text>
        </svg>
      ))}

      {/* Main pig SVG */}
      <svg viewBox="0 0 360 420" xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "auto", animation: "pigFloat 3s ease-in-out infinite", position: "relative", zIndex: 1 }}>
        <defs>
          {/* Body gradient */}
          <radialGradient id="bodyGrad" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#E8D48B" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#B8942E" />
          </radialGradient>
          {/* Belly highlight */}
          <radialGradient id="bellyGrad" cx="50%" cy="30%" r="50%">
            <stop offset="0%" stopColor="#F0E4A8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
          </radialGradient>
          {/* Shadow */}
          <radialGradient id="shadowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8B6914" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#B8942E" stopOpacity="0" />
          </radialGradient>
          {/* Eye shine */}
          <radialGradient id="eyeShine" cx="35%" cy="30%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          {/* Nose gradient */}
          <radialGradient id="noseGrad" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#C9A84C" />
            <stop offset="100%" stopColor="#9A7B25" />
          </radialGradient>
          {/* Cheek blush */}
          <radialGradient id="blushGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E8A090" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#E8A090" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ─── BODY ─── */}
        <ellipse cx="180" cy="250" rx="110" ry="120" fill="url(#bodyGrad)" />
        {/* Body outline */}
        <ellipse cx="180" cy="250" rx="110" ry="120" fill="none" stroke="#9A7B25" strokeWidth="2" opacity="0.3" />
        {/* Belly highlight */}
        <ellipse cx="180" cy="230" rx="70" ry="80" fill="url(#bellyGrad)" />
        {/* Belly shadow bottom */}
        <ellipse cx="180" cy="310" rx="80" ry="40" fill="url(#shadowGrad)" />

        {/* ─── LEGS ─── */}
        {/* Left leg */}
        <ellipse cx="130" cy="360" rx="22" ry="35" fill="url(#bodyGrad)" />
        <ellipse cx="130" cy="360" rx="22" ry="35" fill="none" stroke="#9A7B25" strokeWidth="1.5" opacity="0.3" />
        {/* Left hoof */}
        <ellipse cx="130" cy="390" rx="18" ry="8" fill="#9A7B25" />
        <path d="M130 382 L130 398" stroke="#7C631D" strokeWidth="1.5" opacity="0.5" />

        {/* Right leg */}
        <ellipse cx="230" cy="360" rx="22" ry="35" fill="url(#bodyGrad)" />
        <ellipse cx="230" cy="360" rx="22" ry="35" fill="none" stroke="#9A7B25" strokeWidth="1.5" opacity="0.3" />
        {/* Right hoof */}
        <ellipse cx="230" cy="390" rx="18" ry="8" fill="#9A7B25" />
        <path d="M230 382 L230 398" stroke="#7C631D" strokeWidth="1.5" opacity="0.5" />

        {/* ─── LEFT ARM (behind body, holding coin) ─── */}
        <ellipse cx="85" cy="240" rx="20" ry="40" fill="url(#bodyGrad)" transform="rotate(25, 85, 240)" />
        <ellipse cx="85" cy="240" rx="20" ry="40" fill="none" stroke="#9A7B25" strokeWidth="1.5" opacity="0.3" transform="rotate(25, 85, 240)" />
        {/* Coin in left hand */}
        <g transform="translate(60, 210)">
          <circle cx="0" cy="0" r="18" fill="#D4AF37" stroke="#9A7B25" strokeWidth="2" />
          <circle cx="0" cy="0" r="13" fill="none" stroke="#B8942E" strokeWidth="1" opacity="0.4" />
          <text x="0" y="5" textAnchor="middle" fontSize="14" fontWeight="800" fill="#7C631D" fontFamily="Georgia, serif">G</text>
        </g>

        {/* ─── RIGHT ARM (waving) ─── */}
        <g style={{ transformOrigin: "275px 220px", animation: "wave 2s ease-in-out infinite" }}>
          <ellipse cx="275" cy="230" rx="20" ry="38" fill="url(#bodyGrad)" transform="rotate(-30, 275, 230)" />
          <ellipse cx="275" cy="230" rx="20" ry="38" fill="none" stroke="#9A7B25" strokeWidth="1.5" opacity="0.3" transform="rotate(-30, 275, 230)" />
          {/* Hand/hoof */}
          <ellipse cx="290" cy="198" rx="14" ry="10" fill="#C9A84C" transform="rotate(-30, 290, 198)" />
        </g>

        {/* ─── HEAD ─── */}
        <ellipse cx="180" cy="150" rx="85" ry="80" fill="url(#bodyGrad)" />
        <ellipse cx="180" cy="150" rx="85" ry="80" fill="none" stroke="#9A7B25" strokeWidth="2" opacity="0.3" />
        {/* Head highlight */}
        <ellipse cx="170" cy="120" rx="50" ry="40" fill="url(#bellyGrad)" />

        {/* ─── EARS ─── */}
        {/* Left ear */}
        <ellipse cx="115" cy="85" rx="25" ry="35" fill="url(#bodyGrad)" transform="rotate(-20, 115, 85)" />
        <ellipse cx="115" cy="85" rx="25" ry="35" fill="none" stroke="#9A7B25" strokeWidth="1.5" opacity="0.3" transform="rotate(-20, 115, 85)" />
        <ellipse cx="115" cy="85" rx="15" ry="22" fill="#C9A84C" opacity="0.4" transform="rotate(-20, 115, 85)" />
        {/* Right ear */}
        <ellipse cx="245" cy="85" rx="25" ry="35" fill="url(#bodyGrad)" transform="rotate(20, 245, 85)" />
        <ellipse cx="245" cy="85" rx="25" ry="35" fill="none" stroke="#9A7B25" strokeWidth="1.5" opacity="0.3" transform="rotate(20, 245, 85)" />
        <ellipse cx="245" cy="85" rx="15" ry="22" fill="#C9A84C" opacity="0.4" transform="rotate(20, 245, 85)" />

        {/* ─── COIN SLOT (on head) ─── */}
        <rect x="160" y="68" width="40" height="6" rx="3" fill="#9A7B25" />
        <rect x="162" y="70" width="36" height="2" rx="1" fill="#7C631D" opacity="0.5" />
        {/* Coin going in */}
        <g style={{ animation: "coinInsert 4s ease-in-out infinite" }}>
          <rect x="172" y="50" width="16" height="22" rx="8" fill="#D4AF37" stroke="#B8942E" strokeWidth="1.5" />
          <text x="180" y="66" textAnchor="middle" fontSize="10" fontWeight="700" fill="#7C631D" fontFamily="Georgia, serif">A</text>
        </g>

        {/* ─── EYES ─── */}
        {/* Left eye */}
        <ellipse cx="150" cy="140" rx="18" ry="20" fill="#0A0A0A" />
        <ellipse cx="150" cy="140" rx="15" ry="17" fill="#1a1a1a" />
        <circle cx="150" cy="138" r="10" fill="#D4AF37" />
        <circle cx="150" cy="138" r="6" fill="#0A0A0A" />
        <circle cx="146" cy="134" r="3" fill="white" opacity="0.9" />
        <circle cx="153" cy="141" r="1.5" fill="white" opacity="0.5" />

        {/* Right eye (winking) */}
        <ellipse cx="210" cy="140" rx="18" ry="20" fill="#0A0A0A" />
        <ellipse cx="210" cy="140" rx="15" ry="17" fill="#1a1a1a" />
        <circle cx="210" cy="138" r="10" fill="#D4AF37" />
        <circle cx="210" cy="138" r="6" fill="#0A0A0A" />
        <circle cx="206" cy="134" r="3" fill="white" opacity="0.9" />
        <circle cx="213" cy="141" r="1.5" fill="white" opacity="0.5" />

        {/* Eyebrows */}
        <path d="M132 120 Q145 112 162 118" fill="none" stroke="#9A7B25" strokeWidth="3" strokeLinecap="round" />
        <path d="M198 118 Q215 110 230 116" fill="none" stroke="#9A7B25" strokeWidth="3" strokeLinecap="round" />

        {/* ─── NOSE / SNOUT ─── */}
        <ellipse cx="180" cy="170" rx="30" ry="22" fill="url(#noseGrad)" />
        <ellipse cx="180" cy="170" rx="30" ry="22" fill="none" stroke="#7C631D" strokeWidth="1.5" opacity="0.4" />
        {/* Nostrils */}
        <ellipse cx="170" cy="172" rx="6" ry="5" fill="#7C631D" />
        <ellipse cx="190" cy="172" rx="6" ry="5" fill="#7C631D" />
        {/* Nose highlight */}
        <ellipse cx="175" cy="164" rx="8" ry="4" fill="white" opacity="0.15" />

        {/* ─── MOUTH (smirk) ─── */}
        <path d="M155 190 Q170 202 185 198 Q200 194 210 186" fill="none" stroke="#9A7B25" strokeWidth="2.5" strokeLinecap="round" />
        {/* Smirk corner */}
        <circle cx="210" cy="186" r="2" fill="#9A7B25" />

        {/* ─── CHEEK BLUSH ─── */}
        <circle cx="125" cy="168" r="15" fill="url(#blushGrad)" />
        <circle cx="235" cy="168" r="15" fill="url(#blushGrad)" />

        {/* ─── BOWTIE ─── */}
        <polygon points="160,215 180,225 160,235" fill="#3B82F6" />
        <polygon points="200,215 180,225 200,235" fill="#3B82F6" />
        <circle cx="180" cy="225" r="5" fill="#2563EB" />
        <circle cx="180" cy="225" r="3" fill="#3B82F6" />
        {/* Bowtie shine */}
        <polygon points="163,218 175,224 163,222" fill="#60A5FA" opacity="0.3" />
        <polygon points="197,218 185,224 197,222" fill="#60A5FA" opacity="0.3" />

        {/* ─── TAIL ─── */}
        <path d="M70 280 Q50 270 55 250 Q60 230 50 220 Q40 210 45 195" fill="none" stroke="url(#bodyGrad)" strokeWidth="6" strokeLinecap="round" />
        <path d="M70 280 Q50 270 55 250 Q60 230 50 220 Q40 210 45 195" fill="none" stroke="#9A7B25" strokeWidth="1" opacity="0.3" />

        {/* ─── BODY DETAILS ─── */}
        {/* "G" on belly (Gól) */}
        <text x="160" y="280" fontSize="28" fontWeight="800" fill="#B8942E" opacity="0.3" fontFamily="Georgia, serif">G</text>
        {/* "A" on belly (Asistence) */}
        <text x="190" y="310" fontSize="22" fontWeight="800" fill="#B8942E" opacity="0.2" fontFamily="Georgia, serif">A</text>
      </svg>

      <style>{`
        @keyframes pigFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-15deg); }
          75% { transform: rotate(10deg); }
        }
        @keyframes coinFloat {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.6; }
          100% { transform: translateY(-80px) rotate(360deg); opacity: 0; }
        }
        @keyframes coinInsert {
          0%, 60% { transform: translateY(0); opacity: 1; }
          80% { transform: translateY(16px); opacity: 0.5; }
          90% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 0; }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.4; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.7; transform: translateX(-50%) scale(1.15); }
        }
      `}</style>
    </div>
  );
}
