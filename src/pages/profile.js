import React, { useState } from 'react';

const ProfilePage = () => {
  // ตั้งค่าเริ่มต้นตามรูปโปรไฟล์ที่คุณส่งมา (กิ๊ก - มอต้น)
  const [userLevel, setUserLevel] = useState('ม.ต้น');

  const levels = [
    { id: 1, name: 'เบบี้', desc: 'มือใหม่หัดตี พอโต้ได้บ้าง', color: 'bg-orange-400', icon: '👶' },
    { id: 2, name: 'ประถม', desc: 'มือใหม่ ตบลูกได้', color: 'bg-green-500', icon: '👦' },
    { id: 3, name: 'ม.ต้น', desc: 'ตีเหนียว เล่นเป็นเกม', color: 'bg-blue-500', icon: '🧑' },
  ];

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-50 min-h-screen">
      {/* ส่วนหัวโปรไฟล์ */}
      <div className="bg-white rounded-3xl p-6 shadow-sm mb-6 text-center">
        <div className="relative w-24 h-24 mx-auto mb-4">
          <img src="/api/placeholder/150/150" className="rounded-full border-4 border-white shadow-lg" alt="Profile" />
          <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full text-xs">📸</button>
        </div>
        <h1 className="text-2xl font-black">กิ๊ก</h1>
        <p className="text-gray-400 text-sm">สมาชิกตั้งแต่ 10/2/2569</p>
      </div>

      {/* ส่วนการเลือกจุด (มอต้น ดาว) */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4 px-2">เลือกระดับฝีมือของคุณ</h2>
        <div className="grid grid-cols-1 gap-3">
          {levels.map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => {
                setUserLevel(lvl.name);
                window.navigator.vibrate(50); // สั่นเบาๆ เมื่อเลือก
              }}
              className={`flex items-center p-4 rounded-2xl border-2 transition-all ${
                userLevel === lvl.name ? 'border-blue-500 bg-blue-50' : 'border-white bg-white'
              }`}
            >
              <div className={`w-12 h-12 ${lvl.color} rounded-xl flex items-center justify-center text-2xl mr-4 shadow-sm`}>
                {lvl.icon}
              </div>
              <div className="text-left">
                <div className="font-black text-gray-800">{lvl.name}</div>
                <div className="text-xs text-gray-500">{lvl.desc}</div>
              </div>
              {userLevel === lvl.name && <div className="ml-auto text-blue-500 font-bold">✓</div>}
            </button>
          ))}
        </div>
      </div>

      <button className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-blue-200 shadow-lg active:scale-95 transition-all">
        บันทึกโปรไฟล์
      </button>
    </div>
  );
};

export default ProfilePage;
