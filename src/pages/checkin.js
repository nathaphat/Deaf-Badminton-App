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
      
      const { data: availableSessions, error: sessionError } = await supabase
        .from('group_sessions')
        .select(`
          id, 
          play_date, 
          max_players, 
          is_active,
          badminton_groups ( name )
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

  // 1. เพิ่มฟังก์ชันสำหรับยกเลิกการเช็คอิน
  const handleCancelCheckIn = async (sessionId) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการเช็คอินรอบนี้?')) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('checkins')
        .delete()
        .eq('session_id', sessionId)
        .eq('player_id', session.user.id); // ต้องระบุ ID ผู้เล่นด้วยเพื่อป้องกันการลบของคนอื่น

      if (error) throw error;
      alert('❌ ยกเลิกการเช็คอินเรียบร้อยแล้ว');
      fetchData(); // โหลดข้อมูลใหม่

    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. ปรับตัวช่วยเช็กสถานะปุ่ม ให้คืนค่า action เพิ่มเติม
  const getButtonStatus = (sessionId, playDate) => {
    const isCheckedInThisSession = myCheckins.some(c => c.session_id === sessionId);
    const isCheckedInOtherSessionToday = myCheckins.some(
      c => c.group_sessions?.play_date === playDate && c.session_id !== sessionId
    );

    if (isCheckedInThisSession) {
      // ถ้าเช็คอินก๊วนนี้แล้ว ให้ปุ่มกลายเป็นปุ่มยกเลิก
      return { 
        text: 'ยกเลิกการเช็คอิน', 
        color: 'bg-red-50 text-red-600 hover:bg-red-100 border-2 border-red-200', 
        disabled: false,
        action: 'cancel' // ระบุว่าปุ่มนี้คือปุ่มยกเลิก
      };
    }
    if (isCheckedInOtherSessionToday) {
      return { 
        text: '🔒 ติดก๊วนอื่นแล้ว', 
        color: 'bg-gray-100 text-gray-400 cursor-not-allowed', 
        disabled: true,
        action: 'none'
      };
    }
    return { 
      text: 'ลงชื่อเช็คอิน', 
      color: 'bg-[#16a34a] text-white hover:bg-green-700 shadow-md', 
      disabled: false,
      action: 'checkin'
    };
  };

  if (status === 'loading' || isLoading) {
    return <div className="text-center p-10 flex justify-center items-center h-screen">กำลังค้นหาก๊วน...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 font-sans bg-gray-50 min-h-screen pb-20">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessionsList.map((s) => {
            const btn = getButtonStatus(s.id, s.play_date);
            return (
              <div key={s.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-800">
                      {s.badminton_groups?.name || 'ไม่ทราบชื่อก๊วน'}
                    </h3>
                    <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                      รับ {s.max_players} คน
                    </span>
                  </div>
                  <div className="text-gray-500 text-sm mb-6 flex items-center gap-2">
                    📅 วันที่ตี: <span className="font-semibold text-gray-700">{s.play_date}</span>
                  </div>
                </div>

                {/* 3. ดักจับ onClick ว่าจะเรียกฟังก์ชันเช็คอิน หรือ ยกเลิก */}
                <button
                  onClick={() => btn.action === 'cancel' ? handleCancelCheckIn(s.id) : handleCheckIn(s.id, s.play_date)}
                  disabled={btn.disabled || isProcessing}
                  className={`w-full py-3 font-bold rounded-2xl transition-all active:scale-95 ${btn.color} ${
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
