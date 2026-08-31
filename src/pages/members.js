import React, { useState, useEffect } from 'react';
import { supabase } from '../logic/supabaseClient';

const MembersPage = () => {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // ดึงข้อมูลสมาชิกทุกคนจากตาราง profiles
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('display_name', { ascending: true }); // เรียงตามชื่อตัวอักษร

        if (error) throw error;
        setMembers(data || []);
      } catch (error) {
        console.error('Error fetching members:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // ฟังก์ชันตัวช่วยแสดงป้ายระดับฝีมือ
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
    return <div className="text-center p-12 text-gray-500">กำลังโหลดรายชื่อสมาชิก...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 font-sans bg-gray-50 min-h-screen pb-20">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-900 text-white p-8 rounded-3xl shadow-lg mb-8">
        <h1 className="text-3xl font-black mb-2">👥 ทำเนียบสมาชิก</h1>
        <p className="text-blue-200">รายชื่อนักแบดมินตันทั้งหมดในระบบ ({members.length} คน)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {members.map((member) => (
          <div key={member.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center text-center">
            
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

            {/* ข้อมูลติดต่อ (Line ID) */}
            <div className="w-full mt-auto pt-4 border-t border-gray-100">
              {member.line_id ? (
                <div className="flex items-center justify-center gap-2 text-sm bg-green-50 text-green-700 py-2 px-3 rounded-xl">
                  <span className="font-black text-green-600">LINE:</span> 
                  <span className="font-medium select-all">{member.line_id}</span>
                </div>
              ) : (
                <div className="text-xs text-gray-400 py-2">
                  ยังไม่ระบุ Line ID
                </div>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default MembersPage;
