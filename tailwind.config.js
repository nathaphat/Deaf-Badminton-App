/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // คลุมทุกอย่างใน src
    "./pages/**/*.{js,ts,jsx,tsx,mdx}", // คลุมทุกอย่างใน pages (เผื่อไว้)
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // คลุมทุกอย่างใน components (เผื่อไว้)
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
