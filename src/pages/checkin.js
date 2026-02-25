import React, { useState } from 'react';

const CheckInPage = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [playerCount, setPlayerCount] = useState(12);

  const handleCheckIn = () => {
    if (window.navigator.vibrate) {
      window.navigator.vibrate(200);
    }
    setIsCheckedIn(true);
    setPlayerCount(prev => prev + 1);
  };

  const handleCancel = () => {
    setIsCheckedIn(false);
    setPlayerCount(prev => prev - 1);
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-50 min-h-screen font-sans">
      <div className="text-center mt-10 mb-8">
        <h1 className="text-3xl font-black mb-2 text-gray-800">เช็คอินเข้าสนาม 🏸</h1>
        <p className="text-gray-500 font-medium">กรุณากดปุ่มเมื่อมาถึงสนามแล้ว</p>
      </div>

      <div className="bg-white rounded-[2rem] p-8 shadow-xl text-center border-4 border-white">
        {!isCheckedIn ? (
          <>
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">
              📍
            </div>
            <p className="text-gray-400 mb-8 font-bold">ยังไม่ได้เช็คอิน</p>
            <button 
              onClick={handleCheckIn}
              className="w-full py-6 bg-green-500 text-white text-2xl font-black rounded-2xl shadow-lg shadow-green-100 active:scale-95 transition-all"
            >
              กดเช็คอินทันที
            </button>
          </>
        ) : (
          <>
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl animate-bounce shadow-inner">
              ✅
            </div>
            <p className="text-green-600 mb-2 font-black text-xl">เช็คอินสำเร็จ!</p>
            <p className="text-gray-500 mb-8 font-medium">รอระบบจัดทีมสักครู่นะครับ</p>
            <button 
              onClick={handleCancel}
              className="text-gray-400 text-sm font-bold underline hover:text-red-400 transition-colors"
            >
              ยกเลิกเช็คอิน
            </button>
          </>
        )}
      </div>

      <div className="mt-8 bg-blue-600 rounded-[1.5rem] p-6 text-white flex justify-between items-center shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest">มาถึงสนามแล้ว</p>
          <p className="text-4xl font-black">{playerCount} <span className="text-lg">คน</span></p>
        </div>
        <div className="text-6xl absolute -right-2 opacity-20 transform rotate-12">👥</div>
      </div>
      
      <p className="text-center text-gray-400 text-[10px] mt-8 px-6 font-medium leading-relaxed">
        *เมื่อเช็คอินแล้ว รายชื่อของคุณจะไปปรากฏในระบบจัดทีมอัตโนมัติของก๊วนสุขนิยม
      </p>
    </div>
  );
};

// สำคัญมาก: ต้องมีบรรทัดนี้เพื่อให้ Next.js รู้จักหน้าเช็คอินครับ
export default CheckInPage;
