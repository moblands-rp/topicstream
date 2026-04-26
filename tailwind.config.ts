import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        topic: {
          accent: "#3b82f6",
          bg: "#070b14",
          card: "#101827",
          muted: "#94a3b8",
          border: "#1e293b",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(59,130,246,0.2), 0 12px 30px rgba(2,6,23,0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
