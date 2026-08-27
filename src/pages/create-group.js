import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '../logic/supabaseClient';

const CreateGroup = () => {
  const { data: session } = useSession();
  
  // State สำหรับเก็บข้อมูลฟอร์ม
  const [groupName, setGroupName] = useState('');
  const [playDate, setPlayDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // ฟังก์ชันบันทึกข้อมูลก๊วนใหม่
  const handleCreateGroup = async (e) => {
    e.preventDefault(); // ป้องกันหน้าเว็บรีเฟรชตอนกด Submit

    if (!session?.user?.id) {
      alert('กรุณาเข้าสู่ระบบก่อนสร้างก๊วนครับ');
      return;
    }

    if (!groupName || !playDate) {
      alert('กรุณากรอกชื่อก๊วน และวันที่ให้ครบถ้วน');
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('badminton_groups')
        .insert([
          { 
            name: groupName, 
            organizer_id: session.user.id, // ดึง ID คนล็อกอินมาเป็นผู้จัด
            play_date: playDate 
          }
        ]);

      if (error) throw error;
      
      alert('🎉 สร้างก๊วนสำเร็จแล้ว!');
      // TODO: สามารถใช้ Router ของ Next.js เพื่อเด้งไปหน้าอื่นหลังสร้างเสร็จได้
      // setGroupName('');
      // setPlayDate('');
      
    } catch (error) {
      console.error('Error creating group:', error.message);
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-3xl shadow-xl border border-gray-100 mt-10">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-gray-800 mb-1">🏸 สร้างก๊วนใหม่</h2>
        <p className="text-xs text-gray-500">ตั้งชื่อก๊วนและกำหนดวันตีแบดกันเลย</p>
      </div>

      <form onSubmit={handleCreateGroup}>
        
        {/* แสดงชื่อผู้จัดก๊วน (อ่านอย่างเดียว) */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">ผู้จัดก๊วน 👑</label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 font-medium">
            {session?.user?.name || 'กำลังโหลดชื่อผู้จัด...'}
          </div>
        </div>

        {/* ฟิลด์ตั้งชื่อก๊วน */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">ชื่อก๊วน</label>
          <input 
            type="text" 
            placeholder="เช่น ก๊วนตีขำๆ วันศุกร์, สายบวกมือโปร"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>

        {/* ฟิลด์เลือกวันที่ */}
        <div className="mb-8">
          <label className="block text-sm font-bold text-gray-700 mb-2">วันที่ตีแบด 📅</label>
          <input 
            type="date" 
            value={playDate}
            onChange={(e) => setPlayDate(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>

        {/* ปุ่มสร้างก๊วน */}
        <button 
          type="submit"
          disabled={isSaving}
          className={`w-full py-4 font-bold rounded-2xl transition-all shadow-lg active:scale-95 ${
            isSaving 
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isSaving ? 'กำลังสร้างก๊วน...' : 'ยืนยันการสร้างก๊วน'}
        </button>
      </form>
    </div>
  );
};

export default CreateGroup;
