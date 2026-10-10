import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { navy: "#0B2545", teal: "#13827F", emerald: "#3DBE8B", paper: "#FAF7F2", ink: "#16202E" },
    fontFamily: { display: ["Fraunces Variable", "serif"], sans: ["Inter Variable", "system-ui", "sans-serif"] },
  } },
  plugins: [],
} satisfies Config;
