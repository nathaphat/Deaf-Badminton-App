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
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-extrabold text-black mb-2">ตั้งค่าระดับมือ</h2>
        <p className="text-sm text-gray-600">เลือกระดับฝีมือการเล่นของคุณ</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {levels.map((level) => (
          <button
            key={level.id}
            onClick={() => setSelectedLevel(level.name)}
            className={`group flex flex-col items-center justify-between p-5 rounded-3xl border-2 transition-all duration-300 h-full text-center ${
              selectedLevel === level.name 
                ? 'border-green-500 bg-green-50 scale-105 shadow-md' 
                ? 'border-green-500 bg-green-50 scale-105 shadow-md' 
                : 'border-gray-200 bg-white hover:border-green-300'
            }`}
          >
            <div className="flex flex-col items-center">
              <div className={`w-16 h-16 rounded-full ${level.color} flex items-center justify-center text-white mb-4 shadow-inner text-2xl`}>
                🏸
              </div>
              
              <div className="mb-2">
                <div className="font-extrabold text-xl text-black">{level.name}</div>
                <div className="text-gray-500 text-xs px-2">{level.desc}</div>
              </div>
            </div>

            <div className="mt-auto pt-2 w-full flex justify-center">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedLevel === level.name ? 'border-green-500 bg-green-500' : 'border-gray-300'
              }`}>
                {selectedLevel === level.name && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <button className="w-full mt-10 py-3.5 bg-green-500 text-white font-extrabold rounded-full hover:bg-green-600 transition-colors shadow-md text-lg">
        บันทึกข้อมูล
      </div>
    </div>
  );
};

export default ProfileLevel;
