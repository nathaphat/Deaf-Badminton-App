import React, { useState } from 'react';
import { useSession } from "next-auth/react"
const ProfileLevel = () => {
  const { data: session } = useSession()
  const [selectedLevel, setSelectedLevel] = useState('หน้าบ้าน');

  const levels = [
    { id: 'front', name: 'หน้าบ้าน', color: 'bg-orange-500', desc: 'มือใหม่หัดตี/เบบี้' },
    { id: 'easy', name: 'เบา', color: 'bg-green-500', desc: 'ตบลูกได้/ประถม' },
    { id: 'medium', name: 'กลาง', color: 'bg-blue-500', desc: 'เหนียว/เล่นเป็นเกม' },
    { id: 'hard', name: 'หนัก', color: 'bg-red-500', desc: 'มือโปร/ม.ปลาย' },
  ];

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">ตั้งค่าระดับมือ</h2>
      
      <div className="grid grid-cols-1 gap-4">
        {levels.map((level) => (
          <button
            key={level.id}
            onClick={() => setSelectedLevel(level.name)}
            className={`flex items-center p-4 rounded-lg border-2 transition-all ${
              selectedLevel === level.name ? 'border-black scale-105 shadow-md' : 'border-gray-100'
            }`}
          >
            <div className={`w-12 h-12 rounded-full ${level.color} flex items-center justify-center text-white mr-4`}>
              🏸
            </div>
            <div className="text-left">
              <div className="font-bold text-lg">{level.name}</div>
              <div className="text-gray-500 text-sm">{level.desc}</div>
            </div>
            {selectedLevel === level.name && (
              <div className="ml-auto text-green-500 font-bold">✅</div>
            )}
          </button>
        ))}
      </div>

      <button className="w-full mt-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
        บันทึกข้อมูล
      </button>
    </div>
  );
};

export default ProfileLevel;
