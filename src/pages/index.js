import { useSession, signIn, signOut } from "next-auth/react"
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
  // ตัวอย่างสไตล์ Card ที่จะทำให้ Dashboard ของคุณดู "ตำ 5 รส" จริงๆ
return (
  <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
    {/* Header Profile */}
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6 flex items-center gap-4">
      <img src={session.user.image} className="w-16 h-16 rounded-2xl border-4 border-blue-50 shadow-sm" />
      <div>
        <h2 className="text-xl font-black text-slate-800">{session.user.name}</h2>
        <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-1 rounded-full font-bold uppercase">Pro Member</span>
      </div>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-[2rem] text-white shadow-lg shadow-blue-200">
        <p className="text-xs opacity-80 font-bold">แมตช์ทั้งหมด</p>
        <h3 className="text-3xl font-black mt-1">{stats.totalMatches}</h3>
      </div>
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Win Rate</p>
        <h3 className="text-3xl font-black text-slate-800 mt-1">{stats.winRate}</h3>
      </div>
    </div>
    <Link href="/live-match" className="block mt-6">
  <div className="bg-gradient-to-r from-indigo-900 to-slate-800 rounded-3xl p-6 text-white shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-between border border-slate-700">
    <div className="flex items-center gap-4">
      {/* จุดไฟกระพริบสีแดงแบบ Live */}
      <div className="relative flex h-5 w-5 justify-center items-center">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
      </div>
      
      <div>
        <h3 className="text-xl font-black tracking-wide mb-1">LIVE MATCH</h3>
        <p className="text-sm text-slate-300">กระดานแข่งขันสด / ดูคอร์ทที่กำลังตี</p>
      </div>
    </div>
    
    <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-xl">
      👉
    </div>
  </div>
</Link>
  </div>
)
}
