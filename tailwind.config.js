/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: "#F3F7FF", // subtle page bg
          DEFAULT: "#2874F0", // Flipkart blue
          dark: "#1C54B2", // darker blue for hover
          yellow: "#FFE11B", // Flipkart yellow
        },
        surface: {
          50: "#ffffff",
          100: "#f8fafc",
          200: "#f1f5f9",
        },
        ink: {
          900: "#111827",
          700: "#374151",
          500: "#6b7280",
        },
      },
      boxShadow: {
        card: "0 6px 20px rgba(0,0,0,0.08)",
        navbar: "0 2px 10px rgba(0,0,0,0.06)",
      },
      borderRadius: {
        xl: "1rem",
        '2xl': "1.25rem",
      },
      fontFamily: {
        // Nunito is already used; alias for clarity
        sans: ["Nunito", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
