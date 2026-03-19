import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#FDF8E8", 100: "#F5ECCC", 200: "#E8D48B",
          300: "#D4AF37", 400: "#C9A84C", 500: "#B8942E",
          600: "#9A7B25", 700: "#7C631D", 800: "#5E4B16", 900: "#40330E"
        },
        dark: {
          900: "#0A0A0A", 800: "#0E0E0E", 700: "#161616",
          600: "#1E1E1E", 500: "#252525", 400: "#2E2E2E"
        }
      },
      fontFamily: { sans: ["var(--font-geist-sans)"], mono: ["var(--font-geist-mono)"] }
    }
  },
  plugins: []
};
export default config;
