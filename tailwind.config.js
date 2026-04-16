/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // บรรทัดนี้สำคัญที่สุด: มันสั่งให้ Tailwind ไปหา class ในทุกไฟล์ที่อยู่ในโฟลเดอร์ src
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

​
