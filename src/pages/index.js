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
    <div>
       {/* เอาโค้ด Dashboard + สถิติ ที่เราคุยกันตะกี้มาวางตรงนี้ทั้งหมด */}
       {/* ทั้งส่วน Profile Image, สถิติแมตช์, และประวัติ Series */}
       <p className="text-center text-xs text-gray-400 mt-10">My app by Kik</p>
    </div>
  )
}
