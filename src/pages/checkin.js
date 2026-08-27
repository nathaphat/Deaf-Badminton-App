import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '../logic/supabaseClient';

const CheckInPage = () => {
  const { data: session } = useSession();
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [players, setPlayers] = useState([]); // เก็บรายชื่อคนเช็คอินแล้ว
  const [isLoading, setIsLoading] = useState(false);

  // สมมติว่ามี session เปิดอยู่ของวันนี้
  const activeSessionId = "YOUR_ACTIVE_SESSION_ID"; 

  const handleCheckIn = async () => {
    if (!session?.user?.id) return alert('กรุณาเข้าสู่ระบบ');
    setIsLoading(true);

    try {
      // บันทึกการเช็คอินลงฐานข้อมูล
      const { error } = await supabase
        .from('checkins')
        .insert([{ session_id: activeSessionId, player_id: session.user.id }]);

      if (error) throw error;
      
      setHasCheckedIn(true);
      alert('เช็คอินสำเร็จ!');
      // TODO: เรียกฟังก์ชันดึงรายชื่อผู้เล่นใหม่ (Refresh list)
      
    } catch (error) {
      console.error(error);
      alert('คุณเช็คอินไปแล้ว หรือเกิดข้อผิดพลาด');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 font-sans bg-gray-50 min-h-screen">
      {/* ส่วนหัว */}
      <div className="bg-[#0f172a] text-white p-8 rounded-t-3xl shadow-md">
        <h1 className="text-3xl font-black mb-2">กิจกรรมประจำวัน</h1>
        <p className="text-blue-200">เช็คอินและเริ่มต้นวันแบดมินตันของคุณ!</p>
      </div>

      {/* กล่องเช็คอินกลางหน้า */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 -mt-6 mx-4 mb-8 text-center relative z-10">
        <h2 className="text-xl font-bold text-gray-800 mb-1">พร้อมเล่นแล้วหรือยัง?</h2>
        <p className="text-sm text-gray-500 mb-6">เช็คอินเพื่อเริ่มแมตช์ประจำวันของคุณ</p>
        
        {/* ปุ่มกดเช็คอินสีเขียวมะนาว */}
        <button 
          onClick={handleCheckIn}
          disabled={hasCheckedIn || isLoading}
          className={`px-12 py-4 rounded-full font-bold text-lg inline-flex items-center gap-2 transition-transform active:scale-95 ${
            hasCheckedIn 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-[#bbf7d0] text-green-800 hover:bg-[#86efac] shadow-lg shadow-green-100'
          }`}
        >
          {hasCheckedIn ? '✅ เช็คอินแล้ว' : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              เช็คอิน
            </>
          )}
        </button>
      </div>

      {/* ส่วนแสดงรายชื่อผู้เล่น */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-800">ผู้เล่นที่เช็คอิน</h3>
          <span className="text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
            👥 {players.length} / 45
          </span>
        </div>

        {/* ตารางกริดรายชื่อ (ดึงข้อมูลจริงมา .map ใส่ตรงนี้) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* ตัวอย่างการ์ดผู้เล่น 1 คน */}
          <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <img src="https://via.placeholder.com/40" alt="avatar" className="w-12 h-12 rounded-full object-cover" />
              <div>
                <div className="font-bold text-gray-800">หนูดี</div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px]">ม.ปลาย ⭐⭐</span>
                </div>
                <div className="text-[10px] text-gray-400 mt-1">เวลาเช็คอิน: 15:02</div>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-green-100 text-green-500 flex items-center justify-center">
              ✓
            </div>
          </div>
          {/* สิ้นสุดตัวอย่างการ์ด */}

        </div>
      </div>
    </div>
  );
};

export default CheckInPage;
