/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F3FAF4",
          100: "#E1F4E5",
          500: "#16A34A",
          600: "#15803D",
          700: "#166534"
        },
        surface: {
          50: "#F5F5F4",
          100: "#E7E5E4"
        },
        "risk-low": "#22c55e",
        "risk-moderate": "#eab308",
        "risk-high": "#f97316",
        "risk-critical": "#dc2626"
      }
    }
  },
  plugins: []
};

