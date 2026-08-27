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
      // 1. เช็กโควต้าก่อนบันทึก
      const { count, error: countError } = await supabase
        .from('daily_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('organizer_id', session.user.id);

      if (countError) throw countError;

      // 2. ถ้าเจอว่าสร้างไปแล้ว 1 ครั้ง ให้บล็อกการทำงานทันที
      if (count >= 1) {
        alert('คุณได้ใช้สิทธิ์สร้างก๊วนครบ 1 ครั้งแล้วครับ ไม่สามารถสร้างเพิ่มได้');
        setIsSaving(false);
        return; 
      }

      // 3. ถ้าโควต้ายังเหลือ (count = 0) ก็บันทึกข้อมูลตามปกติ
      const { error: insertError } = await supabase
        .from('daily_sessions')
        .insert([{ 
          organizer_id: session.user.id,
          play_date: playDate,
          checkin_close_time: closeTime,
          max_players: maxPlayers,
          is_active: true
        }]);

      if (insertError) throw insertError;
      alert('เปิดให้สมาชิกลงชื่อเช็คอินล่วงหน้าสำเร็จ!');
      
    } catch (error) {
      console.error(error);
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
