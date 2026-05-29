import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Checkmate AI design system
        background: "#080810",
        surface: "#0f0f1a",
        elevated: "#14142a",
        card: "#1a1a2e",
        border: "rgba(148, 163, 184, 0.1)",

        // Accent
        accent: {
          DEFAULT: "#7c3aed",
          light: "#a855f7",
          dark: "#6d28d9",
        },
        cyan: {
          DEFAULT: "#06b6d4",
          light: "#22d3ee",
        },

        // Status
        blunder: "#ef4444",
        mistake: "#f97316",
        inaccuracy: "#eab308",
        good: "#22c55e",
        brilliant: "#06b6d4",

        // Text
        primary: "#f1f5f9",
        secondary: "#94a3b8",
        muted: "#475569",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backgroundImage: {
        "gradient-hero": "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)",
        "gradient-card": "linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)",
        "gradient-dark": "linear-gradient(180deg, #080810 0%, #0f0f1a 100%)",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s ease both",
        "fade-in": "fadeIn 0.4s ease both",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite linear",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(124, 58, 237, 0.2)" },
          "50%": { boxShadow: "0 0 40px rgba(124, 58, 237, 0.4)" },
        },
      },
      boxShadow: {
        glow: "0 0 40px rgba(124, 58, 237, 0.15)",
        "glow-sm": "0 0 20px rgba(124, 58, 237, 0.15)",
        card: "0 4px 24px rgba(0, 0, 0, 0.4)",
        elevated: "0 8px 48px rgba(0, 0, 0, 0.6)",
      },
      borderRadius: {
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },
    },
  },
  plugins: [],
};

export default config;
