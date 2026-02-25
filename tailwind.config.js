/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // กำหนดสีตามระดับมือในรูปภาพก๊วนสุขนิยม
        'level-baby': '#f97316',    // สีส้ม (เบบี้)
        'level-primary': '#22c55e', // สีเขียว (ประถม)
        'level-junior': '#3b82f6',  // สีน้ำเงิน (ม.ต้น)
        'level-senior': '#ef4444',  // สีแดง (ม.ปลาย/หนัก)
        'brand-purple': '#a855f7',  // สีม่วงของแถบ Series
      },
    },
  },
  plugins: [],
};
