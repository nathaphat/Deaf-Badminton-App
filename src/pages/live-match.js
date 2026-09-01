import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react'; 
import { supabase } from '../logic/supabaseClient';

const levelMap = {
  'Beginner': 1,
  'Novice': 2,
  'Intermediate': 3,
  'Advanced': 4
};

const LiveMatchPage = () => {
  const { data: session } = useSession(); 
  const [activeSession, setActiveSession] = useState(null);
  const [waitingPlayers, setWaitingPlayers] = useState([]);
  const [activeMatches, setActiveMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMatchData = async () => {
    setIsLoading(true);
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const { data: sessionData } = await supabase
        .from('group_sessions')
        .select('id, badminton_groups(name, organizer_id)') 
        .eq('play_date', today)
        .single();

      if (!sessionData) return setIsLoading(false);
      setActiveSession(sessionData);

      const { data: matches } = await supabase
        .from('matches')
        .select(`
          id, status, winner,
          p_a1:team_a_1(display_name, skill_level),
          p_a2:team_a_2(display_name, skill_level),
          p_b1:team_b_1(display_name, skill_level),
          p_b2:team_b_2(display_name, skill_level)
        `)
        .eq('session_id', sessionData.id)
        .order('created_at', { ascending: false });

      setActiveMatches(matches || []);

      const { data: checkins } = await supabase
        .from('checkins')
        .select('player_id, profiles(id, display_name, skill_level)')
        .eq('session_id', sessionData.id);

      const playingIds = new Set();
      matches?.filter(m => m.status === 'playing').forEach(m => {
        playingIds.add(m.p_a1?.id); playingIds.add(m.p_a2?.id);
        playingIds.add(m.p_b1?.id); playingIds.add(m.p_b2?.id);
      });

      const available = checkins
        .map(c => c.profiles)
        .filter(p => !playingIds.has(p.id));

      setWaitingPlayers(available);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchData();
  }, []);

  const handleAutoMatch = async () => {
    if (waitingPlayers.length < 4) return alert('มีผู้เล่นรอไม่ถึง 4 คนครับ');

    let sortedPlayers = [...waitingPlayers].sort((a, b) => 
      (levelMap[a.skill_level] || 1) - (levelMap[b.skill_level] || 1)
    );

    let matchFound = false;

    while (sortedPlayers.length >= 4) {
      const group = sortedPlayers.slice(0, 4);
      const levelDiff = Math.abs(
        (levelMap[group[3].skill_level] || 1) - (levelMap[group[0].skill_level] || 1)
      );

      if (levelDiff <= 1) {
        matchFound = true;
        const teamA1 = group[0].id;
        const teamA2 = group[3].id;
        const teamB1 = group[1].id;
        const teamB2 = group[2].id;

        try {
          await supabase.from('matches').insert([{
            session_id: activeSession.id,
            team_a_1: teamA1, team_a_2: teamA2,
            team_b_1: teamB1, team_b_2: teamB2,
            status: 'playing'
          }]);
          alert('🏸 จับคู่สำเร็จ 1 คอร์ท!');
          fetchMatchData();
          break; 
        } catch (error) {
          console.error(error);
        }
      } else {
        sortedPlayers.shift();
      }
    }

    if (!matchFound) {
      alert('ไม่สามารถจับคู่ได้ เนื่องจากระดับฝีมือคนที่รออยู่ห่างกันเกิน 1 ระดับครับ');
    }
  };

  const handleSetWinner = async (matchId, winnerTeam) => {
    try {
      await supabase
        .from('matches')
        .update({ status: 'finished', winner: winnerTeam })
        .eq('id', matchId);
      fetchMatchData();
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) return <div className="text-center p-12">กำลังโหลดกระดานแข่งขัน...</div>;
  if (!activeSession) return <div className="text-center p-12">ไม่มีรอบก๊วนเปิดในวันนี้ครับ</div>;

  const isOrganizer = session?.user?.id === activeSession.badminton_groups?.organizer_id;

  return (
    <div className="max-w-5xl mx-auto p-4 font-sans pb-20">
      <div className="bg-[#0f172a] text-white p-8 rounded-3xl shadow-md mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black mb-2 flex items-center gap-2">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
            </span>
            Live Match
          </h1>
          <p className="text-blue-200">จัดการแข่งขัน: {activeSession.badminton_groups?.name}</p>
        </div>
        <div className="text-center bg-blue-900 p-4 rounded-2xl">
          <div className="text-sm text-blue-200">คนรอตี</div>
          <div className="text-3xl font-bold">{waitingPlayers.length}</div>
        </div>
      </div>

      {isOrganizer ? (
        <div className="mb-8 text-center">
          <button 
            onClick={handleAutoMatch}
            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 active:scale-95 text-xl flex items-center justify-center gap-2 mx-auto w-full md:w-auto"
          >
            <span>⚡ จับคู่อัตโนมัติ (สุ่มคนว่าง)</span>
          </button>
          <p className="text-sm text-gray-500 mt-2">ระบบจะจับคู่คนระดับเดียวกัน หรือห่างกันไม่เกิน 1 ระดับ</p>
        </div>
      ) : (
        <div className="mb-8 text-center bg-blue-50 p-4 rounded-2xl border border-blue-100">
          <p className="text-blue-800 font-bold flex items-center justify-center gap-2">
            👀 โหมดผู้ชม (กำลังรอกรรมการจัดคอร์ท)
          </p>
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-800 mb-4">คอร์ทที่กำลังตี / ผลการแข่งขัน</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeMatches.map(match => (
          <div key={match.id} className={`p-6 rounded-3xl border-2 ${match.status === 'playing' ? 'bg-white border-blue-400 shadow-lg' : 'bg-gray-50 border-gray-200 opacity-80'}`}>
            
            <div className="flex justify-between items-center mb-4">
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${match.status === 'playing' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                {match.status === 'playing' ? '🔥 กำลังแข่งขัน' : '✅ จบเกม'}
              </span>
              
              {/* ปรับปรุงการแสดงผลลัพธ์ให้รองรับ "เสมอ" */}
              {match.winner && (
                <span className={`text-sm font-bold ${match.winner === 'Draw' ? 'text-gray-600' : 'text-green-600'}`}>
                  {match.winner === 'Draw' ? '🤝 เสมอกัน' : `🏆 ทีม ${match.winner} ชนะ`}
                </span>
              )}
            </div>

            <div className="flex justify-between items-center text-center">
              <div className="flex-1 p-4 bg-red-50 rounded-2xl">
                <div className="font-black text-red-600 mb-2">TEAM A</div>
                <div className="text-sm font-medium">{match.p_a1?.display_name || '-'}</div>
                <div className="text-sm font-medium">{match.p_a2?.display_name || '-'}</div>
              </div>
              <div className="px-4 font-black text-gray-400 text-xl">VS</div>
              <div className="flex-1 p-4 bg-blue-50 rounded-2xl">
                <div className="font-black text-blue-600 mb-2">TEAM B</div>
                <div className="text-sm font-medium">{match.p_b1?.display_name || '-'}</div>
                <div className="text-sm font-medium">{match.p_b2?.display_name || '-'}</div>
              </div>
            </div>

            {/* เพิ่มปุ่ม "เสมอ" ตรงกลาง */}
            {match.status === 'playing' && isOrganizer && (
              <div className="mt-6 flex gap-2">
                <button 
                  onClick={() => handleSetWinner(match.id, 'A')}
                  className="flex-1 py-3 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200 transition-colors"
                >
                  TEAM A ชนะ
                </button>
                <button 
                  onClick={() => handleSetWinner(match.id, 'Draw')}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  เสมอ
                </button>
                <button 
                  onClick={() => handleSetWinner(match.id, 'B')}
                  className="flex-1 py-3 bg-blue-100 text-blue-700 font-bold rounded-xl hover:bg-blue-200 transition-colors"
                >
                  TEAM B ชนะ
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveMatchPage;
