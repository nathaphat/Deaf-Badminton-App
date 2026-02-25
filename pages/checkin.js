import React, { useState } from 'react';

// สร้าง Component
const CheckInPage = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 font-sans">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl text-center border-4 border-white max-w-sm w-full">
        <h1 className="text-3xl font-black mb-6 text-gray-800">เช็คอิน 🏸</h1>
        
        {!isCheckedIn ? (
          <button 
            onClick={() => {
              if(window.navigator.vibrate) window.navigator.vibrate(200);
              setIsCheckedIn(true);
            }}
            className="w-full py-8 bg-green-500 text-white text-3xl font-black rounded-3xl shadow-lg active:scale-95 transition-all"
          >
            มาแล้ว!
          </button>
        ) : (
          <div className="animate-bounce text-6xl mb-4">✅</div>
        )}
        
        {isCheckedIn && (
          <p className="text-green-600 font-black text-xl mt-4">เช็คอินสำเร็จ!</p>
        )}
      </div>
    </div>
  );
};

// บรรทัดนี้สำคัญที่สุด ห้ามลืมเด็ดขาดครับ!
export default CheckInPage;
