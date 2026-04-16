/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/logic/**/*.{js,ts,jsx,tsx,mdx}", // เพิ่มบรรทัดนี้ถ้ามีการใช้ Tailwind ใน logic
    "./src/**/*.{js,ts,jsx,tsx,mdx}",      // หรือใช้แบบนี้เพื่อครอบคลุมทุกอย่างใน src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
​
