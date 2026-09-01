import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '../logic/supabaseClient';

const DashboardStats = () => {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ total: 0, wins: 0, draws: 0, losses: 0, winRate: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyStats = async () => {
      if (!session?.user?.id) return;
      
      try {
        const userId = session.user.id;
        
        // 1. ดึงแมตช์ทั้งหมดที่เล่นจบแล้ว และเรามีส่วนร่วม
        const { data: matches, error } = await supabase
          .from('matches')
          .select('team_a_1, team_a_2, team_b_1, team_b_2, winner')
          .eq('status', 'finished')
          .or(`team_a_1.eq.${userId},team_a_2.eq.${userId},team_b_1.eq.${userId},team_b_2.eq.${userId}`);

        if (error) throw error;

        let wins = 0;
        let draws = 0;
        let losses = 0;

        // 2. คำนวณผลลัพธ์ทีละแมตช์
        matches?.forEach(match => {
          const isTeamA = match.team_a_1 === userId || match.team_a_2 === userId;
          const isTeamB = match.team_b_1 === userId || match.team_b_2 === userId;

          if (match.winner === 'Draw') {
            draws++;
          } else if ((isTeamA && match.winner === 'A') || (isTeamB && match.winner === 'B')) {
            wins++;
          } else {
            losses++;
          }
        });

        const total = wins + draws + losses;
        
        // 3. คำนวณ Win Rate (ชนะ = 1, เสมอ = 0.5)
        let winRate = 0;
        if (total > 0) {
          winRate = ((wins + (draws * 0.5)) / total) * 100;
        }

        setStats({ 
          total, 
          wins, 
          draws, 
          losses, 
          winRate: winRate.toFixed(1) // ปัดทศนิยม 1 ตำแหน่ง
        });

      } catch (error) {
        console.error('Error fetching stats:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyStats();
  }, [session]);

  if (isLoading) return <div className="animate-pulse h-32 bg-gray-100 rounded-3xl mb-6"></div>;

  return (
    <div className="w-full mb-6 font-sans">
      {/* กล่องบนสุด: แมตช์ทั้งหมด */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-4 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-gray-500 mb-1">แมตช์ทั้งหมด</h3>
          <p className="text-4xl font-black text-blue-900">{stats.total}</p>
        </div>
        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-3xl shadow-inner">
          🏆
        </div>
      </div>

      {/* Grid 4 กล่อง: ชนะ, อัตราชนะ, เสมอ, แพ้ */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* ชนะ */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center border-l-4 border-l-green-500">
          <div>
            <h3 className="text-xs font-bold text-gray-400 mb-1">ชนะ</h3>
            <p className="text-2xl font-black text-green-600">{stats.wins}</p>
          </div>
          <div className="text-green-500 text-xl font-bold bg-green-50 w-8 h-8 rounded-full flex items-center justify-center">✓</div>
        </div>

        {/* อัตราชนะ */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center border-l-4 border-l-blue-500">
          <div>
            <h3 className="text-xs font-bold text-gray-400 mb-1">อัตราชนะ</h3>
            <p className="text-2xl font-black text-blue-600">{stats.winRate}%</p>
          </div>
          <div className="text-blue-500 text-xl font-bold bg-blue-50 w-8 h-8 rounded-full flex items-center justify-center">📈</div>
        </div>

        {/* เสมอ */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center border-l-4 border-l-yellow-400">
          <div>
            <h3 className="text-xs font-bold text-gray-400 mb-1">เสมอ</h3>
            <p className="text-2xl font-black text-yellow-600">{stats.draws}</p>
          </div>
          <div className="text-yellow-600 text-xl font-bold bg-yellow-50 w-8 h-8 rounded-full flex items-center justify-center">−</div>
        </div>

        {/* แพ้ */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center border-l-4 border-l-red-500">
          <div>
            <h3 className="text-xs font-bold text-gray-400 mb-1">แพ้</h3>
            <p className="text-2xl font-black text-red-600">{stats.losses}</p>
          </div>
          <div className="text-red-500 text-xl font-bold bg-red-50 w-8 h-8 rounded-full flex items-center justify-center">✕</div>
        </div>

      </div>
    </div>
  );
};

export default DashboardStats;
