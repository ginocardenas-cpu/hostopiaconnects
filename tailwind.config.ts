import type { Config } from "tailwindcss";

/** Palette and typography aligned with hostopia-website-mac (design system / brand guidelines). */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Montserrat", "sans-serif"],
        body: ["Raleway", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
        raleway: ["Raleway", "sans-serif"],
      },
      colors: {
        charcoal: "#24282b",
        teal: "#2cadb2",
        "teal-dark": "#1d8f93",
        "teal-light": "#e8f7f7",
        gold: "#f8cf41",
        "gold-dark": "#e0b82a",
        cream: "#f7f6f2",
        brand: {
          charcoal: "#24282b",
          teal: "#2cadb2",
          "teal-dark": "#1d8f93",
          "teal-light": "#e8f7f7",
          gold: "#f8cf41",
          "gold-dark": "#e0b82a",
          cream: "#f7f6f2",
          /** Legacy aliases */
          yellow: "#f8cf41",
          dark: "#24282b",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
      },
      backgroundImage: {
        "teal-gradient": "linear-gradient(135deg, #2cadb2 0%, #1d8f93 100%)",
        "gold-gradient": "linear-gradient(135deg, #f8cf41 0%, #e0b82a 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
