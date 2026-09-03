import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '../logic/supabaseClient';

const MyGroupDashboard = () => {
  const { data: session, status } = useSession();
  const [group, setGroup] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [shuttleList, setShuttleList] = useState([]);

  // Form State
  const [playDate, setPlayDate] = useState('');
  const [closeTime, setCloseTime] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(45);
  const [courtFee, setCourtFee] = useState(120);
  const [selectedShuttleId, setSelectedShuttleId] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchOrganizerData = async () => {
      if (session?.user?.id) {
        try {
          // 1. ดึงข้อมูลก๊วน
          const { data: groupData, error: groupError } = await supabase
            .from('badminton_groups')
            .select('*')
            .eq('organizer_id', session.user.id)
            .single();

          if (!groupError && groupData) {
            setGroup(groupData);

            // 2. ดึงรอบวันที่เปิด พร้อมข้อมูลยี่ห้อลูกแบด
            const { data: sessionData } = await supabase
              .from('group_sessions')
              .select(`
                *,
                shuttlecock:shuttlecock_id(brand_name, price_per_shuttle)
              `)
              .eq('group_id', groupData.id)
              .order('play_date', { ascending: false });

            if (sessionData) setSessions(sessionData);
          }

          // 3. ดึงรายชื่อยี่ห้อลูกแบดทั้งหมด
          const { data: shuttleData } = await supabase
            .from('shuttlecocks')
            .select('*')
            .order('id', { ascending: true });

          if (shuttleData && shuttleData.length > 0) {
            setShuttleList(shuttleData);
            setSelectedShuttleId(shuttleData[0].id);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
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
          checkin_close_time: closeTime,
          max_players: Number(maxPlayers),
          court_fee_per_person: Number(courtFee) || 0,
          shuttlecock_id: selectedShuttleId ? Number(selectedShuttleId) : null,
          is_active: true
        }])
        .select(`
          *,
          shuttlecock:shuttlecock_id(brand_name, price_per_shuttle)
        `);

      if (error) throw error;

      setSessions([data[0], ...sessions]);
      setPlayDate('');
      setCloseTime('');
      alert('📅 เปิดรอบวันตีแบดสำเร็จ!');
    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!confirm('ต้องการลบรอบวันนี้ทิ้งใช่ไหม? ข้อมูลการเช็คอินของรอบนี้จะถูกลบไปด้วย')) return;
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
    <div className="max-w-4xl mx-auto p-6 font-sans pb-20">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 rounded-3xl shadow-xl mb-8">
        <div className="text-xs uppercase text-blue-200 mb-1">👑 เพจก๊วนของคุณ</div>
        <h1 className="text-3xl font-black">{group.name}</h1>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">➕ เปิดรอบวันตีแบดใหม่</h2>
        <form onSubmit={handleOpenSession} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* วันที่ตี */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">วันที่ตีแบด 📅</label>
            <input 
              type="date" 
              value={playDate} 
              onChange={(e) => setPlayDate(e.target.value)} 
              className="w-full p-3 border-2 rounded-xl text-sm" 
              required 
            />
          </div>

          {/* เวลาปิดรับ */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-red-500 mb-1">วัน-เวลา ปิดลงชื่อ (ล็อกยกเลิก) ⏰</label>
            <input 
              type="datetime-local" 
              value={closeTime} 
              onChange={(e) => setCloseTime(e.target.value)} 
              className="w-full p-3 border-2 border-red-200 bg-red-50 rounded-xl text-sm" 
              required 
            />
          </div>

          {/* จำกัดจำนวนคน */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">รับจำกัด (คน)</label>
            <input 
              type="number" 
              value={maxPlayers} 
              onChange={(e) => setMaxPlayers(e.target.value)} 
              className="w-full p-3 border-2 rounded-xl text-sm" 
              min="1" 
              required 
            />
          </div>

          {/* ค่าสนามต่อคน */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-blue-600 mb-1">🏟️ ค่าสนามต่อคน (บาท)</label>
            <input 
              type="number" 
              value={courtFee} 
              onChange={(e) => setCourtFee(e.target.value)} 
              placeholder="120"
              className="w-full p-3 border-2 border-blue-200 rounded-xl text-sm font-bold text-blue-700" 
              min="0"
              required 
            />
          </div>

          {/* ยี่ห้อลูกแบด */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-600 mb-1">🪶 ยี่ห้อลูกแบดที่ใช้รอบนี้</label>
            <select 
              value={selectedShuttleId} 
              onChange={(e) => setSelectedShuttleId(e.target.value)} 
              className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm font-medium bg-white"
            >
              {shuttleList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.brand_name}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-4 mt-2">
            <button 
              type="submit" 
              disabled={isSaving} 
              className="w-full py-4 bg-[#16a34a] hover:bg-green-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {isSaving ? 'กำลังเปิด...' : '🚀 เปิดรอบตีแบด'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex justify-between items-center">
          <span>📋 รอบวันที่เปิดไว้</span>
          <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-bold">{sessions.length} รอบ</span>
        </h2>
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">ยังไม่มีรอบที่เปิดไว้</div>
          ) : (
            sessions.map((s) => (
              <div key={s.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-2xl bg-gray-50 gap-3">
                <div>
                  <div className="font-bold text-gray-800 text-base">📅 วันที่ตี: {s.play_date} (รับ {s.max_players} คน)</div>
                  <div className="text-xs text-red-500 mt-0.5">⏰ หมดเวลาลงชื่อ/ยกเลิก: {new Date(s.checkin_close_time).toLocaleString('th-TH')}</div>
                  <div className="text-xs text-gray-600 mt-1 flex flex-wrap gap-x-4">
                    <span>🏟️ ค่าสนาม: <b className="text-gray-800">{s.court_fee_per_person || 0} บ./คน</b></span>
                    <span>🪶 ลูกแบด: <b className="text-gray-800">{s.shuttlecock?.brand_name || 'ไม่ได้ระบุ'}</b></span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteSession(s.id)} 
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xs transition-colors self-end md:self-auto"
                >
                  ปิด/ลบ
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyGroupDashboard;
