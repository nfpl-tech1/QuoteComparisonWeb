import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f0f3fa",
          100: "#d6e0f2",
          200: "#adc1e5",
          300: "#7a9dd3",
          400: "#4a79be",
          500: "#1B3461",
          600: "#162a50",
          700: "#10203e",
          800: "#0a152c",
          900: "#050b1a",
        },
        accent: {
          50:  "#fef0f1",
          100: "#fdd9db",
          200: "#fbb3b7",
          300: "#f87e84",
          400: "#f44249",
          500: "#CC1F28",
          600: "#a71822",
          700: "#88131b",
        },
      },
    },
  },
  plugins: [],
};

export default config;
