interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon";
}

export default function Logo({ size = "md", variant = "full" }: LogoProps) {
  const iconSizes = { sm: 28, md: 36, lg: 56 };
  const s = iconSizes[size];

  const Icon = () => (
    <svg width={s} height={s} viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="80" height="80" rx="18" fill="#D4AF37"/>
      <ellipse cx="40" cy="44" rx="22" ry="20" fill="#0A0A0A"/>
      <ellipse cx="22" cy="26" rx="8" ry="9" fill="#0A0A0A"/>
      <ellipse cx="58" cy="26" rx="8" ry="9" fill="#0A0A0A"/>
      <ellipse cx="22" cy="26" rx="5" ry="6" fill="#B8942E"/>
      <ellipse cx="58" cy="26" rx="5" ry="6" fill="#B8942E"/>
      <circle cx="32" cy="38" r="4" fill="#D4AF37"/>
      <circle cx="48" cy="38" r="4" fill="#D4AF37"/>
      <circle cx="33.5" cy="36.5" r="1.6" fill="#0A0A0A"/>
      <circle cx="49.5" cy="36.5" r="1.6" fill="#0A0A0A"/>
      <ellipse cx="40" cy="50" rx="11" ry="7.5" fill="#B8942E"/>
      <circle cx="36" cy="50" r="2.8" fill="#0A0A0A"/>
      <circle cx="44" cy="50" r="2.8" fill="#0A0A0A"/>
    </svg>
  );

  if (variant === "icon") return <Icon />;

  const textSizes = { sm: 13, md: 16, lg: 22 };
  const ts = textSizes[size];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: size === "lg" ? 14 : 10 }}>
      <Icon />
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
        <span style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: ts,
          fontWeight: "700",
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
        }}>Ober</span>
        <span style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: ts,
          fontWeight: "700",
          color: "var(--gold)",
          letterSpacing: "-0.02em",
        }}>Kamoše</span>
      </div>
    </div>
  );
}
