import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '../logic/supabaseClient';

const CheckInPage = () => {
  const { data: session, status } = useSession();
  const [sessionsList, setSessionsList] = useState([]);
  const [myCheckins, setMyCheckins] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); 

  useEffect(() => {
    fetchData();
  }, [session, status]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // 1. ดึงข้อมูลรอบก๊วน พร้อมค่าสนาม และ ยี่ห้อลูกแบด
      const { data: availableSessions, error: sessionError } = await supabase
        .from('group_sessions')
        .select(`
          id, 
          play_date, 
          checkin_close_time, 
          max_players, 
          court_fee_per_person,
          is_active,
          shuttlecock:shuttlecock_id(brand_name, price_per_shuttle),
          badminton_groups ( 
            name,
            profiles ( display_name )
          ),
          checkins (
            player_id,
            profiles (
              display_name,
              avatar_url,
              skill_level
            )
          )
        `)
        .gte('play_date', today)
        .order('play_date', { ascending: true });

      if (sessionError) throw sessionError;
      setSessionsList(availableSessions || []);

      if (session?.user?.id) {
        const { data: userCheckins, error: checkinError } = await supabase
          .from('checkins')
          .select(`
            session_id,
            group_sessions ( play_date )
          `)
          .eq('player_id', session.user.id);

        if (!checkinError && userCheckins) {
          setMyCheckins(userCheckins);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async (sessionId, playDate) => {
    if (!session?.user?.id) return alert('กรุณาเข้าสู่ระบบก่อนเช็คอินครับ');

    const alreadyCheckedInToday = myCheckins.find(
      (c) => c.group_sessions?.play_date === playDate
    );

    if (alreadyCheckedInToday) {
      return alert(`คุณได้เช็คอินก๊วนอื่นสำหรับวันที่ ${playDate} ไปแล้วครับ`);
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('checkins')
        .insert([{ session_id: sessionId, player_id: session.user.id }]);

      if (error) throw error;
      alert('✅ เช็คอินสำเร็จ ขอให้สนุกกับการตีแบดครับ!');
      fetchData(); 

    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelCheckIn = async (sessionId) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการเช็คอินรอบนี้?')) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('checkins')
        .delete()
        .eq('session_id', sessionId)
        .eq('player_id', session.user.id);

      if (error) throw error;
      alert('❌ ยกเลิกการเช็คอินเรียบร้อยแล้ว');
      fetchData(); 

    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const getButtonStatus = (sessionData) => {
    const sessionId = sessionData.id;
    const playDate = sessionData.play_date;
    const currentCheckins = sessionData.checkins?.length || 0;
    const maxPlayers = sessionData.max_players;
    
    const closeTime = new Date(sessionData.checkin_close_time);
    const now = new Date();
    const isTimeUp = now > closeTime; 

    const isCheckedInThisSession = myCheckins.some(c => c.session_id === sessionId);
    const isCheckedInOtherSessionToday = myCheckins.some(
      c => c.group_sessions?.play_date === playDate && c.session_id !== sessionId
    );

    if (isCheckedInThisSession) {
      if (isTimeUp) {
         return { text: 'ล็อกรายชื่อแล้ว', color: 'bg-gray-700 text-white cursor-not-allowed', disabled: true, action: 'none' };
      }
      return { text: 'ยกเลิกการเช็คอิน', color: 'bg-red-50 text-red-600 hover:bg-red-100 border-2 border-red-200', disabled: false, action: 'cancel' };
    }

    if (isTimeUp) {
       return { text: 'หมดเวลาลงชื่อ', color: 'bg-gray-200 text-gray-500 cursor-not-allowed', disabled: true, action: 'none' };
    }
    if (isCheckedInOtherSessionToday) {
      return { text: '🔒 ติดก๊วนอื่นแล้ว', color: 'bg-gray-100 text-gray-400 cursor-not-allowed', disabled: true, action: 'none' };
    }
    if (currentCheckins >= maxPlayers) {
      return { text: 'เต็มแล้ว', color: 'bg-gray-200 text-gray-500 cursor-not-allowed', disabled: true, action: 'none' };
    }

    return { text: 'ลงชื่อเช็คอิน', color: 'bg-[#16a34a] text-white hover:bg-green-700 shadow-md', disabled: false, action: 'checkin' };
  };

  const renderSkillBadge = (level) => {
    if (!level) return null;
    switch (level) {
      case 'Beginner': return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold">🌱 มือใหม่</span>;
      case 'Novice': return <span className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded text-[10px] font-bold">🏸 ตีโต้ได้</span>;
      case 'Intermediate': return <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px] font-bold">🔥 ระดับกลาง</span>;
      case 'Advanced': return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold">👑 มือโปร</span>;
      default: return <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">{level}</span>;
    }
  };

  if (status === 'loading' || isLoading) {
    return <div className="text-center p-10 flex justify-center items-center h-screen font-sans">กำลังค้นหาก๊วน...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 font-sans bg-gray-50 min-h-screen pb-20">
      <div className="bg-[#0f172a] text-white p-8 rounded-3xl shadow-md mb-6">
        <h1 className="text-3xl font-black mb-2">รอบก๊วนที่เปิดรับ</h1>
        <p className="text-blue-200">เลือกก๊วนและวันที่คุณต้องการไปร่วมแจมได้เลย!</p>
      </div>

      {sessionsList.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-3xl shadow-sm border border-gray-100">
          <span className="text-4xl mb-4 block">🏸</span>
          <p className="text-gray-500 font-medium">ยังไม่มีก๊วนไหนเปิดรอบในขณะนี้ครับ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sessionsList.map((s) => {
            const btn = getButtonStatus(s); 
            const currentPlayers = s.checkins?.length || 0;

            return (
              <div key={s.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-800">
                      {s.badminton_groups?.name || 'ไม่ทราบชื่อก๊วน'}
                    </h3>
                    <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                      รับ {s.max_players} คน
                    </span>
                  </div>
                  
                  {/* ข้อมูลผู้จัด วันที่ เวลาปิดรับ พร้อมค่าสนาม และ ยี่ห้อลูกแบด */}
                  <div className="text-gray-600 text-sm mb-6 space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      👑 <span className="font-semibold text-gray-700">ผู้จัด:</span> {s.badminton_groups?.profiles?.display_name || 'ไม่ระบุ'}
                    </div>
                    <div className="flex items-center gap-2">
                      📅 <span className="font-semibold text-gray-700">วันที่ตี:</span> {s.play_date}
                    </div>

                    {/* 🏟️ แสดงค่าสนาม และ 🪶 ลูกแบด */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 border-t border-slate-200/60 text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5">
                        🏟️ <span className="font-semibold text-gray-700">ค่าสนาม:</span> 
                        <b className="text-blue-700 font-bold">{s.court_fee_per_person || 0} บ./คน</b>
                      </div>
                      <div className="flex items-center gap-1.5">
                        🪶 <span className="font-semibold text-gray-700">ลูกแบด:</span> 
                        <b className="text-slate-800 font-bold">{s.shuttlecock?.brand_name || 'ไม่ได้ระบุ'}</b>
                      </div>
                    </div>

                    {s.checkin_close_time && (
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                        ⏰ <span className="font-semibold text-red-500">ปิดรับ:</span> {new Date(s.checkin_close_time).toLocaleString('th-TH')}
                      </div>
                    )}
                  </div>

                  <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-bold text-gray-700">ผู้เล่นที่เข้าร่วมแล้ว</h4>
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${currentPlayers >= s.max_players ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600'}`}>
                        {currentPlayers} / {s.max_players}
                      </span>
                    </div>
                    
                    {currentPlayers > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {s.checkins.map((c, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-white pr-3 p-1 rounded-full border border-gray-200 shadow-sm">
                            {c.profiles?.avatar_url ? (
                              <img src={c.profiles.avatar_url} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px]">🏸</div>
                            )}
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-gray-700">{c.profiles?.display_name || 'ไม่ระบุชื่อ'}</span>
                              <div className="mt-0.5">
                                {renderSkillBadge(c.profiles?.skill_level)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 text-center py-2">ยังไม่มีผู้ลงชื่อในรอบนี้ เป็นคนแรกเลยสิ!</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => btn.action === 'cancel' ? handleCancelCheckIn(s.id) : handleCheckIn(s.id, s.play_date)}
                  disabled={btn.disabled || isProcessing}
                  className={`w-full py-4 font-bold rounded-2xl transition-all active:scale-95 ${btn.color} ${
                    isProcessing && !btn.disabled ? 'opacity-70 cursor-wait' : ''
                  }`}
                >
                  {isProcessing && !btn.disabled ? 'กำลังดำเนินการ...' : btn.text}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CheckInPage;
