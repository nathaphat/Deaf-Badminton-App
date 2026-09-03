import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '../logic/supabaseClient';

const MembersPage = () => {
  const { data: session } = useSession();
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingMember, setEditingMember] = useState(null); // เก็บข้อมูลสมาชิกที่กำลังจะแก้ไข
  const [newSkillLevel, setNewSkillLevel] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchMembersAndRole = async () => {
    setIsLoading(true);
    try {
      // 1. ดึงข้อมูลสมาชิกทั้งหมด
      const { data: membersData, error: membersError } = await supabase
        .from('profiles')
        .select('*')
        .order('display_name', { ascending: true });

      if (membersError) throw membersError;
      setMembers(membersData || []);

      // 2. เช็คว่าผู้ใช้งานปัจจุบันเป็น Admin หรือไม่
      if (session?.user?.id) {
        const { data: myProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        if (myProfile?.role === 'admin') {
          setIsAdmin(true);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembersAndRole();
  }, [session]);

  // ฟังก์ชันสำหรับ Admin: ลบสมาชิก
  const handleDeleteMember = async (memberId, memberName) => {
    if (!isAdmin) return;
    const confirmDelete = confirm(`⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบคุณ "${memberName}" ออกจากระบบ?`);
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      alert(`ลบคุณ ${memberName} สำเร็จแล้ว`);
      fetchMembersAndRole(); // โหลดข้อมูลใหม่
    } catch (error) {
      console.error('Error deleting member:', error.message);
      alert('เกิดข้อผิดพลาดในการลบ: ' + error.message);
    }
  };

  // ฟังก์ชันสำหรับ Admin: บันทึกการแก้ไขระดับฝีมือ
  const handleSaveSkillLevel = async () => {
    if (!editingMember || !newSkillLevel) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ skill_level: newSkillLevel })
        .eq('id', editingMember.id);

      if (error) throw error;

      alert(`✅ ปรับระดับฝีมือของ ${editingMember.display_name} เป็น "${newSkillLevel}" เรียบร้อยแล้ว`);
      setEditingMember(null);
      fetchMembersAndRole();
    } catch (error) {
      console.error('Error updating skill level:', error.message);
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderSkillBadge = (level) => {
    if (!level) return <span className="text-xs text-gray-400">ยังไม่ระบุระดับ</span>;
    switch (level) {
      case 'Beginner': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">🌱 มือใหม่</span>;
      case 'Novice': return <span className="bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">🏸 ตีโต้ได้</span>;
      case 'Intermediate': return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">🔥 ระดับกลาง</span>;
      case 'Advanced': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">👑 มือโปร</span>;
      default: return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{level}</span>;
    }
  };

  if (isLoading) {
    return <div className="text-center p-12 text-gray-500 font-sans">กำลังโหลดรายชื่อสมาชิก...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 font-sans bg-gray-50 min-h-screen pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-900 text-white p-8 rounded-3xl shadow-lg mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            👥 ทำเนียบสมาชิก
            {isAdmin && (
              <span className="bg-amber-400 text-slate-900 text-xs px-3 py-1 rounded-full font-black uppercase tracking-wider shadow">
                Admin Mode 🛡️
              </span>
            )}
          </h1>
          <p className="text-blue-200">รายชื่อนักแบดมินตันทั้งหมดในระบบ ({members.length} คน)</p>
        </div>
      </div>

      {/* Grid รายชื่อสมาชิก */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {members.map((member) => (
          <div key={member.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col items-center text-center relative overflow-hidden">
            
            {/* ป้ายกำกับถ้าเป็น Admin */}
            {member.role === 'admin' && (
              <span className="absolute top-3 left-3 bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                ADMIN
              </span>
            )}

            {/* รูปโปรไฟล์ */}
            {member.avatar_url ? (
              <img src={member.avatar_url} alt="avatar" className="w-20 h-20 rounded-full object-cover mb-4 border-4 border-blue-50 shadow-sm" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4 border-4 border-white shadow-sm text-2xl">
                🏸
              </div>
            )}

            {/* ชื่อ และระดับฝีมือ */}
            <h3 className="text-lg font-bold text-gray-800 mb-1">{member.display_name || 'ผู้ใช้งานไม่ระบุชื่อ'}</h3>
            <div className="mb-4">
              {renderSkillBadge(member.skill_level)}
            </div>

            {/* ข้อมูล Line ID */}
            <div className="w-full mt-auto pt-3 border-t border-gray-100">
              {member.line_id ? (
                <div className="flex items-center justify-center gap-2 text-xs bg-green-50 text-green-700 py-2 px-3 rounded-xl">
                  <span className="font-black text-green-600">LINE:</span> 
                  <span className="font-medium select-all">{member.line_id}</span>
                </div>
              ) : (
                <div className="text-xs text-gray-400 py-1">
                  ยังไม่ระบุ Line ID
                </div>
              )}
            </div>

            {/* 🛠️ แถบเครื่องมือจัดการสำหรับ ADMIN */}
            {isAdmin && (
              <div className="w-full mt-3 pt-3 border-t border-dashed border-gray-200 flex gap-2">
                <button
                  onClick={() => {
                    setEditingMember(member);
                    setNewSkillLevel(member.skill_level || 'Beginner');
                  }}
                  className="flex-1 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
                >
                  ✏️ ปรับมือ
                </button>
                <button
                  onClick={() => handleDeleteMember(member.id, member.display_name)}
                  className="p-1.5 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
                  title="ลบสมาชิกนี้"
                >
                  🗑️
                </button>
              </div>
            )}

          </div>
        ))}
      </div>

      {/* 🪟 Modal กล่อง Popup ปรับระดับฝีมือสำหรับ Admin */}
      {editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-fade-in">
            <h3 className="text-lg font-black text-gray-800 mb-1">
              ปรับระดับมือ (Admin)
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              สมาชิก: <span className="font-bold text-gray-800">{editingMember.display_name}</span>
            </p>

            <label className="block text-xs font-bold text-gray-700 mb-2">
              เลือกระดับฝีมือที่ต้องการปรับ:
            </label>
            <select
              value={newSkillLevel}
              onChange={(e) => setNewSkillLevel(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-2xl focus:border-blue-500 font-medium text-sm mb-6 outline-none"
            >
              <option value="Beginner">Beginner - มือใหม่ (หน้าบ้าน/เบา)</option>
              <option value="Novice">Novice - ตีโต้ได้ (พอรู้จังหวะ)</option>
              <option value="Intermediate">Intermediate - ระดับกลาง (รับ-รุกได้)</option>
              <option value="Advanced">Advanced - มือโปร (หนัก)</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setEditingMember(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveSkillLevel}
                disabled={isUpdating}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50"
              >
                {isUpdating ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersPage;
