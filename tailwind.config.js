/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",      // 1. ชี้ไปที่โฟลเดอร์ pages นอก src
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // 2. ชี้ไปที่โฟลเดอร์ components นอก src
    "./src/**/*.{js,ts,jsx,tsx,mdx}",        // 3. กวาดใน src ไว้ด้วยเผื่อมีไฟล์อื่น
    "./styles/**/*.css",                     // 4. กวาดไฟล์ css
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
