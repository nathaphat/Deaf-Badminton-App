import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '../logic/supabaseClient';

const MyGroupDashboard = () => {
  const { data: session, status } = useSession();
  const [group, setGroup] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [playDate, setPlayDate] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(45);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ดึงข้อมูลก๊วนของผู้ใช้ที่ล็อกอินอยู่ และรอบวันที่เปิดไว้
  useEffect(() => {
    const fetchOrganizerData = async () => {
      if (session?.user?.id) {
        try {
          // 1. ดึงข้อมูลก๊วนของตัวเอง
          const { data: groupData, error: groupError } = await supabase
            .from('badminton_groups')
            .select('*')
            .eq('organizer_id', session.user.id)
            .single();

          if (groupError) {
            console.log('ยังไม่ได้สร้างก๊วน');
          } else {
            setGroup(groupData);

            // 2. ถ้ามีก๊วนแล้ว ให้ดึงรายการรอบวันที่เคยเปิดไว้ทั้งหมด
            const { data: sessionData, error: sessionError } = await supabase
              .from('group_sessions')
              .select('*')
              .eq('group_id', groupData.id)
              .order('play_date', { ascending: true });

            if (!sessionError) {
              setSessions(sessionData);
            }
          }
        } catch (error) {
          console.error('Error:', error.message);
        } finally {
          setIsLoading(false);
        }
      } else if (status === 'unauthenticated') {
        setIsLoading(false);
      }
    };

    fetchOrganizerData();
  }, [session, status]);

  // ฟังก์ชันกดเปิดรอบวันตีแบดใหม่
  const handleOpenSession = async (e) => {
    e.preventDefault();
    if (!playDate) return alert('กรุณาเลือกวันที่ตีแบดครับ');

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('group_sessions')
        .insert([{
          group_id: group.id,
          play_date: playDate,
          max_players: maxPlayers,
          is_active: true
        }])
        .select();

      if (error) throw error;

      // อัปเดตรายการหน้าเว็บทันทีโดยไม่ต้องกด F5
      setSessions([...sessions, data[0]]);
      setPlayDate('');
      alert('📅 เปิดรอบวันตีแบดสำเร็จ!');
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ฟังก์ชันลบรอบวันที่เปิดไว้
  const handleDeleteSession = async (sessionId) => {
    if (!confirm('คุณต้องการลบวันนี้ออกจากการเปิดเช็คอินใช่ไหม?')) return;

    try {
      const { error } = await supabase
        .from('group_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(sessions.filter((s) => s.id !== sessionId));
    } catch (error) {
      console.error(error);
      alert('ลบไม่สำเร็จ: ' + error.message);
    }
  };

  if (status === 'loading' || isLoading) {
    return <div className="text-center p-12 text-gray-500">กำลังโหลดข้อมูล...</div>;
  }

  // กรณีที่ผู้ใช้ยังไม่เคยสร้างก๊วน
  if (!group) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded-3xl shadow-lg text-center mt-12">
        <h2 className="text-xl font-bold text-gray-800 mb-2">ยังไม่มีเพจก๊วนของคุณ</h2>
        <p className="text-sm text-gray-500 mb-6">คุณยังไม่ได้สร้างก๊วนแบดมินตัน กรุณาสร้างก๊วนก่อนจัดการรอบตีครับ</p>
        <a href="/create-group" className="inline-block px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-md hover:bg-blue-700">
          + ไปหน้าสร้างก๊วน
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 font-sans">
      
      {/* การ์ดแสดงข้อมูลก๊วน */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 rounded-3xl shadow-xl mb-8">
        <div className="text-xs uppercase tracking-wider text-blue-200 mb-1">👑 เพจก๊วนของคุณ</div>
        <h1 className="text-3xl font-black">{group.name}</h1>
        <p className="text-sm text-blue-100 mt-2">จัดการวันเปิดรับเช็คอิน และกำหนดตารางก๊วนของคุณได้ที่นี่</p>
      </div>

      {/* ฟอร์มเปิดรอบวันตีแบดใหม่ */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">➕ เปิดรอบวันตีแบดใหม่</h2>
        <form onSubmit={handleOpenSession} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">วันที่ตีแบด 📅</label>
            <input 
              type="date" 
              value={playDate}
              onChange={(e) => setPlayDate(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">รับจำกัด (คน)</label>
            <input 
              type="number" 
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
              min="1"
              required
            />
          </div>
          <div className="flex items-end">
            <button 
              type="submit" 
              disabled={isSaving}
              className="w-full py-3 bg-[#16a34a] text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-md"
            >
              {isSaving ? 'กำลังเปิด...' : 'เปิดเช็คอินวันนึ้'}
            </button>
          </div>
        </form>
      </div>

      {/* รายการวันที่เปิดไว้แล้ว */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4">📋 รอบวันที่เปิดเช็คอินแล้ว</h2>
        
        {sessions.length === 0 ? (
          <p className="text-center text-gray-400 py-8">ยังไม่มีการเปิดรอบวันตีแบด เลือกวันที่ด้านบนแล้วกดเปิดได้เลยครับ</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((sessionItem) => (
              <div key={sessionItem.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md transition-all">
                <div>
                  <div className="font-bold text-gray-800 flex items-center gap-2">
                    <span>📅 วันที่ตี: {sessionItem.play_date}</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">เปิดอยู่</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">รับสมัครสูงสุด: {sessionItem.max_players} คน</div>
                </div>
                <button 
                  onClick={() => handleDeleteSession(sessionItem.id)}
                  className="px-4 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-xl hover:bg-red-100 transition-colors"
                >
                  ปิด/ลบวันนึ้
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

MyGroupDashboard;
