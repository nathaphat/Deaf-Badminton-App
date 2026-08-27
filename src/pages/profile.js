import React, { useState } from 'react';

const ProfileLevel = () => {
  // 1. ตั้งค่าเริ่มต้นให้ตรงกับค่าในฐานข้อมูล
  const [selectedLevel, setSelectedLevel] = useState('Beginner');

  // 2. ปรับตัวเลือกให้เหลือ 3 ระดับ และเพิ่ม dbValue
  const levels = [
    { id: 'beginner', name: 'มือใหม่ (หน้าบ้าน/เบา)', dbValue: 'Beginner', color: 'bg-green-500', desc: 'มือใหม่หัดตี/ตบลูกได้' },
    { id: 'intermediate', name: 'ระดับกลาง', dbValue: 'Intermediate', color: 'bg-blue-500', desc: 'เหนียว/เล่นเป็นเกม' },
    { id: 'advanced', name: 'มือโปร (หนัก)', dbValue: 'Advanced', color: 'bg-red-500', desc: 'ตีหนัก/ม.ปลาย' },
  ];

  // ฟังก์ชันสำหรับจำลองการบันทึกข้อมูล
  const handleSave = () => {
    // ค่าที่จะส่งไป Supabase/API คือ 'Beginner', 'Intermediate', หรือ 'Advanced'
    console.log('ค่าที่จะส่งไปบันทึกในฐานข้อมูล:', selectedLevel); 
    // TODO: ใส่โค้ดอัปเดตฐานข้อมูลตรงนี้
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-3xl shadow-xl border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-gray-800 mb-1">ตั้งค่าระดับมือ</h2>
        <p className="text-xs text-gray-500">เลือกความสามารถที่ตรงกับคุณที่สุด</p>
      </div>
      
      {/* ปรับ grid-cols เป็น 1 หรือ 3 ตามความสวยงาม เพราะมี 3 ตัวเลือกแล้ว */}
      <div className="grid grid-cols-1 gap-4"> 
        {levels.map((level) => (
          <button
            key={level.id}
            // 3. เปลี่ยนมาเซ็ตค่า dbValue แทน name
            onClick={() => setSelectedLevel(level.dbValue)} 
            className={`flex items-center p-4 rounded-[2rem] border-2 transition-all duration-300 ${
              selectedLevel === level.dbValue 
                ? 'border-green-500 bg-green-50 scale-105 shadow-md' 
                : 'border-gray-100 bg-white hover:border-gray-200'
            }`}
          >
            <div className={`w-14 h-14 rounded-full ${level.color} flex flex-shrink-0 items-center justify-center text-white mr-4 shadow-lg text-xl`}>
              🏸
            </div>
            
            <div className="text-left flex-grow">
              <div className="font-bold text-gray-800">{level.name}</div>
              <div className="text-[12px] text-gray-500 leading-tight">{level.desc}</div>
            </div>

            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              selectedLevel === level.dbValue ? 'border-green-500 bg-green-500' : 'border-gray-300'
            }`}>
              {selectedLevel === level.dbValue && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>

      <button 
        onClick={handleSave} // 4. ผูกฟังก์ชันบันทึก
        className="w-full mt-10 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg active:scale-95"
      >
        บันทึกข้อมูล
      </button>
    </div>
  );
};

export default ProfileLevel;
