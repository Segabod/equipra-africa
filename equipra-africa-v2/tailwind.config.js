/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        ink: { 950: "#07131F", 900: "#0B1B2B", 800: "#13283D", 700: "#1E3A54", 600: "#3B556D", 500: "#5B7186", 400: "#8496A7", 300: "#B4C0CB", 200: "#D9E0E6", 100: "#EDF1F4", 50: "#F6F8FA" },
        brand: { 900: "#064E4A", 800: "#08665F", 700: "#0A7F76", 600: "#0F9F95", 500: "#18B8AC", 400: "#4FD1C5", 200: "#B2EDE7", 100: "#DDF7F4", 50: "#F0FBFA" },
        sun: { 500: "#F2A900", 100: "#FEF3D6" },
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,27,43,.04), 0 1px 3px rgba(11,27,43,.06)",
        lift: "0 10px 30px -12px rgba(11,27,43,.25)",
      },
      borderRadius: { xl: "14px", "2xl": "18px" },
    },
  },
  plugins: [],
};
