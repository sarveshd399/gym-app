import type { Config } from "tailwindcss";
// "orange" is remapped to the neon lime accent, so every existing orange class picks up the new theme.
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: { colors: { orange: { 400: "#e4ff5c", 500: "#d4ff00" } } } },
  plugins: [],
} satisfies Config;
