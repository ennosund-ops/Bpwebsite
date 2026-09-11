import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Near-black canvas + charcoal surfaces
        ink: {
          950: "#050506",
          900: "#0a0a0c",
          800: "#101014",
          700: "#16161c",
          600: "#1d1d25",
          500: "#26262f",
        },
        line: {
          DEFAULT: "rgba(255,255,255,0.08)",
          strong: "rgba(255,255,255,0.14)",
        },
        // Restrained electric-violet accent
        accent: {
          DEFAULT: "#7c5cff",
          soft: "#9d86ff",
          dim: "#5a3ff0",
          glow: "rgba(124,92,255,0.20)",
        },
        fg: {
          DEFAULT: "#f3f3f5",
          muted: "#9a9aa6",
          faint: "#63636e",
        },
        signal: {
          high: "#4ade80",
          med: "#fbbf24",
          low: "#f87171",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.045em",
        label: "0.22em",
      },
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "bar-grow": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        "pulse-ring": {
          "0%": { opacity: "0.5", transform: "scale(0.9)" },
          "70%": { opacity: "0", transform: "scale(1.25)" },
          "100%": { opacity: "0", transform: "scale(1.25)" },
        },
        "scan": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(2100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fade-in 0.8s ease both",
        "bar-grow": "bar-grow 1s cubic-bezier(0.22,1,0.36,1) both",
        "pulse-ring": "pulse-ring 2.4s ease-out infinite",
        "scan": "scan 2.2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
