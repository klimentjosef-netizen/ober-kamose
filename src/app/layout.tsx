import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ober Kamoše",
  description: "Fantasy fotbal sázení s kamarády",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  );
}
