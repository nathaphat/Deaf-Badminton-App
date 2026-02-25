import React, { useState } from 'react';

// สร้าง Component
//const CheckInPage = () => {
// ใช้คำว่า export default function นำหน้าชื่อเลย เพื่อให้ Next.js หาเจอแน่นอนครับ
export default function CheckInPage() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 font-sans text-gray-800">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl text-center border-4 border-white max-w-sm w-full">
        <h1 className="text-3xl font-black mb-6 italic">CHECK-IN 🏸</h1>
        
        {!isCheckedIn ? (
          <button 
            onClick={() => {
              // ระบบสั่นยืนยันสำหรับคนหูหนวก
              if (typeof window !== 'undefined' && window.navigator.vibrate) {
                window.navigator.vibrate(200);
              }
              setIsCheckedIn(true);
            }}
            className="w-full py-8 bg-green-500 text-white text-3xl font-black rounded-3xl shadow-lg active:scale-95 transition-all"
          >
            📍 มาแล้ว!
          </button>
        ) : (
          <div className="space-y-4">
            <div className="animate-bounce text-6xl">✅</div>
            <p className="text-green-600 font-black text-2xl uppercase italic tracking-wider">SUCCESS!</p>
            <p className="text-gray-400 text-sm font-bold">รายชื่อคุณเข้าสู่ระบบแล้ว</p>
          </div>
        )}
      </div>
      
      {/* ส่วนแสดงจำนวนคนตามแบบรูปภาพ Dashboard ของคุณ */}
      <div className="mt-8 bg-blue-600 text-white px-8 py-4 rounded-2xl shadow-xl flex items-center gap-4 border-b-4 border-blue-800">
        <span className="text-3xl">👥</span>
        <div className="text-left">
          <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">In the court</p>
          <p className="text-2xl font-black">15 คน</p>
        </div>
      </div>
    </div>
  );
}
