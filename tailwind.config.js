/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{ts,tsx,js,jsx,mdx}",
    "./app/**/*.{ts,tsx,js,jsx,mdx}",
    "./components/**/*.{ts,tsx,js,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary-color": "#1E2A38",
        "primary-color-muted": "#283342",
        "secondary-color": "#0EA5E9",
        "secondary-color-soft": "#E0F2FE",
        "warning-color": "#FACC15",
        "warning-color-soft": "#FEF3C7",
        "success-color": "#34D399",
        "success-color-soft": "#DCFCE7",
        "danger-color": "#F87171",
        "danger-color-soft": "#FEE2E2",
        "neutral-color": "#F1F5F9",
      },
    },
  },
  plugins: [],
};
