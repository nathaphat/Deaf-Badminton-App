import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '../logic/supabaseClient';

const CreateGroup = () => {
  const { data: session } = useSession();
  const [groupName, setGroupName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!session?.user?.id) return alert('กรุณาเข้าสู่ระบบ');
    if (!groupName) return alert('กรุณาตั้งชื่อก๊วนครับ');

    setIsSaving(true);
    try {
      // เช็กโควต้า (1 คน สร้างได้ 1 ก๊วน)
      const { count } = await supabase
        .from('badminton_groups') // ตารางก๊วน (หลัก)
        .select('*', { count: 'exact', head: true })
        .eq('organizer_id', session.user.id);

      if (count >= 1) {
        alert('คุณได้ใช้สิทธิ์สร้างก๊วนครบ 1 ครั้งแล้วครับ');
        return;
      }

      // บันทึกเฉพาะข้อมูลก๊วน
      const { error } = await supabase
        .from('badminton_groups')
        .insert([{ 
          name: groupName, 
          organizer_id: session.user.id 
        }]);

      if (error) throw error;
      alert('🎉 สร้างเพจก๊วนสำเร็จแล้ว!');
      // TODO: Redirect ไปหน้าจัดการก๊วน (เพจก๊วน) ของตัวเอง
      
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-[2rem] shadow-lg border border-gray-100 mt-10">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-gray-800 mb-2">🏸 สร้างก๊วนใหม่</h2>
        <p className="text-sm text-gray-500">ตั้งชื่อก๊วนของคุณเพื่อเป็นจุดศูนย์รวมสมาชิก</p>
      </div>

      <form onSubmit={handleCreateGroup}>
        {/* ผู้จัดก๊วน (อ่านอย่างเดียว) */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">ผู้จัดก๊วน 👑</label>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 font-medium flex items-center gap-2">
            {session?.user?.name || 'กำลังโหลด...'}
          </div>
        </div>

        {/* ชื่อก๊วน */}
        <div className="mb-8">
          <label className="block text-sm font-bold text-gray-700 mb-2">ชื่อก๊วน</label>
          <input 
            type="text" 
            placeholder="เช่น ก๊วนตีขำๆ วันศุกร์, สายบวกมือโปร"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
          />
        </div>

        <button 
          type="submit" disabled={isSaving}
          className="w-full py-4 bg-[#16a34a] text-white font-bold rounded-2xl hover:bg-green-700 transition-all active:scale-95 shadow-md"
        >
          {isSaving ? 'กำลังสร้าง...' : 'ยืนยันการสร้างก๊วน'}
        </button>
      </form>
    </div>
  );
};

export default CreateGroup;
