import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '../logic/supabaseClient';

const MyGroupDashboard = () => {
  const { data: session, status } = useSession();
  const [group, setGroup] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [playDate, setPlayDate] = useState('');
  const [closeTime, setCloseTime] = useState(''); // เพิ่ม State สำหรับเวลาปิดรับ
  const [maxPlayers, setMaxPlayers] = useState(45);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchOrganizerData = async () => {
      if (session?.user?.id) {
        try {
          const { data: groupData, error: groupError } = await supabase
            .from('badminton_groups')
            .select('*')
            .eq('organizer_id', session.user.id)
            .single();

          if (!groupError && groupData) {
            setGroup(groupData);
            const { data: sessionData } = await supabase
              .from('group_sessions')
              .select('*')
              .eq('group_id', groupData.id)
              .order('play_date', { ascending: true });
            
            if (sessionData) setSessions(sessionData);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      } else if (status === 'unauthenticated') {
        setIsLoading(false);
      }
    };
    fetchOrganizerData();
  }, [session, status]);

  const handleOpenSession = async (e) => {
    e.preventDefault();
    if (!playDate || !closeTime) return alert('กรุณาระบุวันที่ตี และเวลาปิดรับให้ครบครับ');

    // เช็กว่าเวลาปิดรับ ต้องไม่ช้ากว่าวันที่ตี
    if (new Date(closeTime) > new Date(playDate + 'T23:59:59')) {
      return alert('เวลาปิดรับลงชื่อ ต้องอยู่ก่อนหรือภายในวันที่ตีแบดครับ');
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('group_sessions')
        .insert([{
          group_id: group.id,
          play_date: playDate,
          checkin_close_time: closeTime, // บันทึกเวลาปิดรับ
          max_players: maxPlayers,
          is_active: true
        }])
        .select();

      if (error) throw error;

      setSessions([...sessions, data[0]]);
      setPlayDate('');
      setCloseTime('');
      alert('📅 เปิดรอบวันตีแบดพร้อมกำหนดเวลาปิดรับสำเร็จ!');
    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!confirm('ต้องการลบรอบวันนี้ทิ้งใช่ไหม?')) return;
    try {
      const { error } = await supabase.from('group_sessions').delete().eq('id', sessionId);
      if (error) throw error;
      setSessions(sessions.filter((s) => s.id !== sessionId));
    } catch (error) {
      alert('ลบไม่สำเร็จ: ' + error.message);
    }
  };

  if (status === 'loading' || isLoading) return <div className="text-center p-12">กำลังโหลดข้อมูล...</div>;
  if (!group) return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-3xl shadow-lg text-center mt-12">
      <h2 className="text-xl font-bold mb-2">ยังไม่มีเพจก๊วนของคุณ</h2>
      <a href="/create-group" className="inline-block px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl">
        + ไปหน้าสร้างก๊วน
      </a>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-6 font-sans pb-20">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 rounded-3xl shadow-xl mb-8">
        <div className="text-xs uppercase text-blue-200 mb-1">👑 เพจก๊วนของคุณ</div>
        <h1 className="text-3xl font-black">{group.name}</h1>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">➕ เปิดรอบวันตีแบดใหม่</h2>
        <form onSubmit={handleOpenSession} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">วันที่ตีแบด 📅</label>
            <input type="date" value={playDate} onChange={(e) => setPlayDate(e.target.value)} className="w-full p-3 border-2 rounded-xl" required />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-red-500 mb-1">วัน-เวลา ปิดลงชื่อ (ล็อกยกเลิก) ⏰</label>
            <input type="datetime-local" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} className="w-full p-3 border-2 border-red-200 bg-red-50 rounded-xl" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">รับจำกัด (คน)</label>
            <input type="number" value={maxPlayers} onChange={(e) => setMaxPlayers(e.target.value)} className="w-full p-3 border-2 rounded-xl" min="1" required />
          </div>
          <div className="lg:col-span-4">
            <button type="submit" disabled={isSaving} className="w-full py-4 bg-[#16a34a] text-white font-bold rounded-xl shadow-md">
              {isSaving ? 'กำลังเปิด...' : 'เปิดเช็คอินวันนี้'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4">📋 รอบวันที่เปิดไว้</h2>
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.id} className="flex flex-col md:flex-row items-center justify-between p-4 border rounded-2xl bg-gray-50">
              <div>
                <div className="font-bold text-gray-800">📅 วันที่ตี: {s.play_date}</div>
                <div className="text-xs text-red-500 mt-1">⏰ หมดเวลาลงชื่อ/ยกเลิก: {new Date(s.checkin_close_time).toLocaleString('th-TH')}</div>
              </div>
              <button onClick={() => handleDeleteSession(s.id)} className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-xl mt-3 md:mt-0">ปิด/ลบ</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyGroupDashboard;
