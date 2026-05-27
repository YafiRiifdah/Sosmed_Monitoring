/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202a",
        line: "#d8dee8",
        mist: "#f5f7fa",
        coral: "#d65f45"
      }
    }
  },
  plugins: []
};
