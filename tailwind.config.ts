import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        pop: "0 18px 0 rgba(20,16,48,.12)",
        soft: "0 24px 80px rgba(31, 24, 67, .18)",
      },
    },
  },
  plugins: [],
} satisfies Config;
