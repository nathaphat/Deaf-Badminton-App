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
      <button className="bg-red-500 text-white p-10 text-5xl">TEST TAILWIND</button>
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
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      {/* 1. Top Navigation & Profile */}
      <div className="bg-white px-6 pt-12 pb-6 rounded-b-[40px] shadow-sm border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={session.user.image || "/default-avatar.png"} 
                style={{ width: '56px', height: '56px', borderRadius: '20px', objectFit: 'cover' }}
                className="border-2 border-white shadow-md"
                alt="profile"
              />
              <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ยินดีต้อนรับ</p>
              <h2 className="text-xl font-black text-gray-800">{session.user.name}</h2>
            </div>
          </div>
          <button 
            onClick={() => signOut()} 
            className="p-3 bg-gray-50 rounded-2xl hover:bg-red-50 transition-colors group"
          >
            <span className="text-xl group-hover:filter-none grayscale group-hover:grayscale-0">🚪</span>
          </button>
        </div>
      </div>
  
      <div className="max-w-4xl mx-auto px-6 -mt-8">
        {/* 2. Main Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-50 relative overflow-hidden">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">แมตช์ทั้งหมด</p>
            <p className="text-3xl font-black text-gray-900">{stats.totalMatches}</p>
            <div className="absolute -right-2 -bottom-2 text-5xl opacity-5 grayscale">🏸</div>
          </div>
          <div className="bg-[#ECFDF5] p-5 rounded-[32px] shadow-sm border border-green-100 relative overflow-hidden">
            <p className="text-[10px] font-black text-green-600 uppercase tracking-wider mb-1">ชนะ (Wins)</p>
            <p className="text-3xl font-black text-green-700">{stats.win}</p>
            <div className="absolute -right-2 -bottom-2 text-5xl opacity-10">🏆</div>
          </div>
          <div className="bg-[#EFF6FF] p-5 rounded-[32px] shadow-sm border border-blue-100 relative overflow-hidden">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider mb-1">Win Rate</p>
            <p className="text-3xl font-black text-blue-700">{stats.winRate}</p>
            <div className="absolute -right-2 -bottom-2 text-5xl opacity-10">📈</div>
          </div>
          <div className="bg-[#FFF1F2] p-5 rounded-[32px] shadow-sm border border-red-100 relative overflow-hidden">
            <p className="text-[10px] font-black text-red-600 uppercase tracking-wider mb-1">แพ้ (Losses)</p>
            <p className="text-3xl font-black text-red-700">{stats.lose}</p>
            <div className="absolute -right-2 -bottom-2 text-5xl opacity-10">📉</div>
          </div>
        </div>
  
        {/* 3. Performance Overview (Series Progress) */}
        <div className="bg-[#1E293B] p-8 rounded-[40px] shadow-xl mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-white font-bold text-lg">ภาพรวมผลงาน</h3>
                <p className="text-slate-400 text-xs">Series ล่าสุดของคุณ</p>
              </div>
              <div className="text-right">
                <p className="text-[#38BDF8] text-2xl font-black">{(stats.win * 3) + stats.draw} pts</p>
              </div>
            </div>
            
            {/* Custom Progress Bar */}
            <div className="flex w-full h-4 bg-slate-700 rounded-full overflow-hidden mb-6">
              <div style={{ width: stats.winRate }} className="bg-[#38BDF8] h-full shadow-[0_0_15px_rgba(56,189,248,0.5)]"></div>
              <div style={{ width: `${(stats.draw/stats.totalMatches)*100}%` }} className="bg-yellow-400 h-full"></div>
            </div>
  
            <div className="flex justify-between text-center px-2">
              <div className="flex flex-col">
                <span className="text-white font-bold">{stats.win}</span>
                <span className="text-[9px] text-slate-400 font-bold tracking-tighter">ชนะ</span>
              </div>
              <div className="flex flex-col border-x border-slate-700 px-8">
                <span className="text-yellow-400 font-bold">{stats.draw}</span>
                <span className="text-[9px] text-slate-400 font-bold tracking-tighter">เสมอ</span>
              </div>
              <div className="flex flex-col">
                <span className="text-red-400 font-bold">{stats.lose}</span>
                <span className="text-[9px] text-slate-400 font-bold tracking-tighter">แพ้</span>
              </div>
            </div>
          </div>
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[80px] opacity-20"></div>
        </div>
  
        <p className="text-center text-[10px] text-gray-300 font-bold tracking-[0.2em] uppercase">
          My app by Kik • Deaf Badminton Thai
        </p>
      </div>
    </div>
  )
}
