import React, { useState } from 'react';

const ProfileLevel = () => {
  const [selectedLevel, setSelectedLevel] = useState('หน้าบ้าน');

  const levels = [
    { id: 'front', name: 'หน้าบ้าน', color: 'bg-orange-500', desc: 'มือใหม่หัดตี/เบบี้' },
    { id: 'easy', name: 'เบา', color: 'bg-green-500', desc: 'ตบลูกได้/ประถม' },
    { id: 'medium', name: 'กลาง', color: 'bg-blue-500', desc: 'เหนียว/เล่นเป็นเกม' },
    { id: 'hard', name: 'หนัก', color: 'bg-red-500', desc: 'มือโปร/ม.ปลาย' },
  ];

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-3xl shadow-xl border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-gray-800 mb-1">ตั้งค่าระดับมือ</h2>
        <p className="text-xs text-gray-500">เลือกความสามารถที่ตรงกับคุณที่สุด</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {levels.map((level) => (
          <button
            key={level.id}
            onClick={() => setSelectedLevel(level.name)}
            className={`flex flex-col items-center p-5 rounded-[2rem] border-2 transition-all duration-300 ${
              selectedLevel === level.name 
                ? 'border-green-500 bg-green-50 scale-105 shadow-md' 
                : 'border-gray-100 bg-white hover:border-gray-200'
            }`}
          >
            <div className={`w-14 h-14 rounded-full ${level.color} flex items-center justify-center text-white mb-3 shadow-lg text-xl`}>
              🏸
            </div>
            
            <div className="text-center mb-3">
              <div className="font-bold text-gray-800">{level.name}</div>
              <div className="text-[10px] text-gray-400 leading-tight">{level.desc}</div>
            </div>

            {/* วงกลม Checkbox ด้านล่างแบบรูปที่ 2 */}
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              selectedLevel === level.name ? 'border-green-500 bg-green-500' : 'border-gray-300'
            }`}>
              {selectedLevel === level.name && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>

      <button className="w-full mt-10 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg active:scale-95">
        บันทึกข้อมูล
      </button>
    </div>
  );
};

export default ProfileLevel;
