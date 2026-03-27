import { useSession, signIn } from "next-auth/react"
import { useState, useEffect } from 'react'
import { supabase } from '../logic/supabaseClient'

export default function Home() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({
    totalMatches: 0,
    win: 0,
    winRate: "0%",
    draw: 0,
    lose: 0
  });
  useEffect(() => {
    if (session?.user?.id) {
      fetchUserStats();
    }
  }, [session]);

  const fetchUserStats = async () => {
    const userId = session.user.id; // ID ของคนที่ล็อกอินอยู่

    // 1. ดึงแมตช์ทั้งหมดที่คนนี้ลงแข่ง (ไม่ว่าจะอยู่ทีม A หรือ B)
    const { data: matches, error } = await supabase
      .from('matches')
      .select('*')
      .or(`team_a_p1.eq.${userId},team_a_p2.eq.${userId},team_b_p1.eq.${userId},team_b_p2.eq.${userId}`);

    if (error) {
      console.error('Error fetching stats:', error);
      return;
    }

    if (matches) {
      let win = 0, lose = 0, draw = 0;

      matches.forEach(match => {
        // เช็คว่าคนนี้อยู่ฝั่ง A หรือ B
        const isTeamA = match.team_a_p1 === userId || match.team_a_p2 === userId;
        const winner = match.winner_team; // 'A' หรือ 'B' หรือ 'Draw'

        if (winner === 'Draw') {
          draw++;
        } else if ((isTeamA && winner === 'A') || (!isTeamA && winner === 'B')) {
          win++;
        } else {
          lose++;
        }
      });

      const total = matches.length;
      setStats({
        totalMatches: total,
        win: win,
        draw: draw,
        lose: lose,
        winRate: total > 0 ? ((win / total) * 100).toFixed(1) + "%" : "0%"
      });
    }
  };
  // 1. ถ้ายังไม่ได้ Login -> โชว์หน้าเขียวๆ มีปุ่ม LINE Login
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Deaf Badminton Thai</h1>
        <button 
          onClick={() => signIn('line')}
          className="bg-[#00B900] text-white px-8 py-3 rounded-full font-black shadow-lg hover:scale-105 transition"
        >
          LINE Login เพื่อดูโปรไฟล์
        </button>
        <p className="mt-4 text-gray-400 text-sm italic">Developing 🔵</p>
      </div>
    )
  }

  // 2. ถ้า Login แล้ว -> โชว์หน้า Dashboard (สถิติ)
  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-50 min-h-screen font-sans">
      
      {/* ส่วนหัวแสดงโปรไฟล์และปุ่มออก */}
      <div className="flex justify-between items-center p-4 bg-white rounded-2xl shadow-sm mb-6 border border-gray-100">
        <div className="flex items-center gap-3">
          <img 
            src={session.user.image || "/default-avatar.png"} 
            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
            alt="profile"
          />
          <div>
            <p className="font-black text-gray-800 text-sm">ยินดีต้อนรับ</p>
            <p className="text-xs text-gray-500">{session.user.name}</p>
          </div>
        </div>
        <button 
          onClick={() => signOut()} 
          className="text-xs font-bold text-red-500 bg-red-50 px-3 py-2 rounded-xl hover:bg-red-100 transition"
        >
          ออกจากระบบ
        </button>
      </div>

      <h1 className="text-xl font-black mb-6 flex items-center">
        <span className="text-blue-600 mr-2">🏆</span> ตำ 5 รส Dashboard
      </h1>

      {/* สถิติหลัก (ใช้ข้อมูลจริงจาก State: stats) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">แมตช์ทั้งหมด</p>
          <p className="text-2xl font-black">{stats.totalMatches}</p>
          <span className="absolute -right-2 -bottom-2 text-blue-500 text-4xl opacity-10">🏸</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider text-green-600">ชนะ</p>
          <p className="text-2xl font-black text-green-600">{stats.win}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider text-blue-500">อัตราชนะ</p>
          <p className="text-2xl font-black text-blue-500">{stats.winRate}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider text-red-500">แพ้</p>
          <p className="text-2xl font-black text-red-500">{stats.lose}</p>
        </div>
      </div>

      {/* ประวัติ Series แบบ Progress Bar */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-purple-100 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">สรุปภาพรวม Series</h3>
          <span className="text-[10px] bg-purple-100 text-purple-600 px-3 py-1 rounded-full font-black">
            {stats.totalMatches > 0 ? 'กำลังประมวลผล' : 'ยังไม่มีข้อมูล'}
          </span>
        </div>
        <div className="w-full bg-gray-100 h-3 rounded-full mb-6 overflow-hidden flex">
           {/* แถบสีแสดงสัดส่วน ชนะ-เสมอ-แพ้ */}
           <div style={{ width: stats.winRate }} className="bg-green-500 h-full"></div>
           <div style={{ width: `${(stats.draw/stats.totalMatches)*100}%` }} className="bg-yellow-400 h-full"></div>
        </div>
        <div className="grid grid-cols-4 text-center">
          <div><p className="text-green-600 font-black">{stats.win}</p><p className="text-[10px] text-gray-400 font-bold uppercase">WIN</p></div>
          <div><p className="text-yellow-600 font-black">{stats.draw}</p><p className="text-[10px] text-gray-400 font-bold uppercase">DRAW</p></div>
          <div><p className="text-red-600 font-black">{stats.lose}</p><p className="text-[10px] text-gray-400 font-bold uppercase">LOSE</p></div>
          <div><p className="text-blue-600 font-black">{(stats.win * 3) + stats.draw}</p><p className="text-[10px] text-gray-400 font-bold uppercase">POINTS</p></div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-10 mb-6 italic">My app by Kik</p>
    </div>
  )
}
