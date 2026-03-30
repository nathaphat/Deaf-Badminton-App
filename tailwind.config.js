/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // กำหนดสีตามระดับมือในรูปภาพก๊วนสุขนิยม
        'level-baby': '#f97316',    // สีส้ม มือหน้าบ้าน
        'level-primary': '#22c55e', // สีเขียว มือเบา
        'level-junior': '#3b82f6',  // สีน้ำเงิน มือกลาง
        'level-senior': '#ef4444',  // สีแดง มือหนัก
      },
    },
  },
  plugins: [],
};
