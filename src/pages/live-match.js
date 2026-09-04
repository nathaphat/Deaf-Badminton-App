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
  const [shuttleList, setShuttleList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [matchDetails, setMatchDetails] = useState({});

  const fetchMatchData = async () => {
    setIsLoading(true);
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const { data: sessionData } = await supabase
        .from('group_sessions')
        .select(`
          id, 
          shuttlecock_id,
          badminton_groups(name, organizer_id)
        `) 
        .eq('play_date', today)
        .single();

      if (!sessionData) return setIsLoading(false);
      setActiveSession(sessionData);

      const { data: shuttles } = await supabase
        .from('shuttlecocks')
        .select('*')
        .order('id', { ascending: true });
      setShuttleList(shuttles || []);

      const { data: matches } = await supabase
        .from('matches')
        .select(`
          id, status, winner, shuttle_number, shuttlecocks_used, shuttlecock_id,
          team_a_1, team_a_2, team_b_1, team_b_2,
          shuttlecock:shuttlecock_id(brand_name, price_per_shuttle),
          p_a1:team_a_1(id, display_name, skill_level),
          p_a2:team_a_2(id, display_name, skill_level),
          p_b1:team_b_1(id, display_name, skill_level),
          p_b2:team_b_2(id, display_name, skill_level)
        `)
        .eq('session_id', sessionData.id)
        .order('created_at', { ascending: false });

      setActiveMatches(matches || []);

      const initialDetails = {};
      matches?.forEach(m => {
        initialDetails[m.id] = {
          shuttlecock_id: m.shuttlecock_id || sessionData.shuttlecock_id || (shuttles?.[0]?.id || ''),
          shuttle_number: m.shuttle_number || '',
          shuttlecocks_used: m.shuttlecocks_used || 1
        };
      });
      setMatchDetails(initialDetails);

      const { data: checkins } = await supabase
        .from('checkins')
        .select('player_id, profiles(id, display_name, skill_level)')
        .eq('session_id', sessionData.id);

      const playingIds = new Set();
      matches?.filter(m => m.status === 'playing').forEach(m => {
        if (m.team_a_1) playingIds.add(m.team_a_1);
        if (m.team_a_2) playingIds.add(m.team_a_2);
        if (m.team_b_1) playingIds.add(m.team_b_1);
        if (m.team_b_2) playingIds.add(m.team_b_2);
      });

      const available = (checkins || [])
        .map(c => c.profiles)
        .filter(p => p && !playingIds.has(p.id));

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
    if (waitingPlayers.length < 4) {
      return alert(`มีคนว่างพร้อมเล่น ${waitingPlayers.length} คน (ต้องการอย่างน้อย 4 คนครับ)`);
    }

    let pool = [...waitingPlayers].sort(() => Math.random() - 0.5);
    pool.sort((a, b) => (levelMap[a.skill_level] || 1) - (levelMap[b.skill_level] || 1));

    let bestGroup = null;
    let minDiff = 999;

    for (let i = 0; i <= pool.length - 4; i++) {
      const group = pool.slice(i, i + 4);
      const diff = Math.abs(
        (levelMap[group[3].skill_level] || 1) - (levelMap[group[0].skill_level] || 1)
      );
      if (diff < minDiff) {
        minDiff = diff;
        bestGroup = group;
      }
    }

    if (!bestGroup) {
      bestGroup = pool.slice(0, 4);
    }

    const teamA1 = bestGroup[0].id;
    const teamA2 = bestGroup[3].id;
    const teamB1 = bestGroup[1].id;
    const teamB2 = bestGroup[2].id;

    try {
      await supabase.from('matches').insert([{
        session_id: activeSession.id,
        team_a_1: teamA1,
        team_a_2: teamA2,
        team_b_1: teamB1,
        team_b_2: teamB2,
        shuttlecock_id: activeSession.shuttlecock_id || (shuttleList[0]?.id || null),
        shuttlecocks_used: 1,
        status: 'playing'
      }]);

      alert('🏸 จับคู่สำเร็จ 1 คอร์ท!');
      fetchMatchData();
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการจับคู่: ' + error.message);
    }
  };

  const handleDetailChange = (matchId, field, value) => {
    setMatchDetails(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: value
      }
    }));
  };

  const handleSetWinner = async (matchId, winnerTeam) => {
    const details = matchDetails[matchId] || {};
    try {
      await supabase
        .from('matches')
        .update({ 
          status: 'finished', 
          winner: winnerTeam,
          shuttlecock_id: details.shuttlecock_id ? Number(details.shuttlecock_id) : null,
          shuttle_number: details.shuttle_number || null,
          shuttlecocks_used: Number(details.shuttlecocks_used) || 1
        })
        .eq('id', matchId);
      
      alert('✅ บันทึกผลและข้อมูลลูกแบดเรียบร้อย');
      fetchMatchData();
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาด: ' + error.message);
    }
  };

  if (isLoading) return <div className="text-center p-12 font-sans">กำลังโหลดกระดานแข่งขัน...</div>;
  if (!activeSession) return <div className="text-center p-12 font-sans">ไม่มีรอบก๊วนเปิดในวันนี้ครับ</div>;

  const isOrganizer = session?.user?.id === activeSession.badminton_groups?.organizer_id;

  return (
    <div className="max-w-5xl mx-auto p-4 font-sans pb-24">
      <div className="bg-[#0f172a] text-white p-6 md:p-8 rounded-3xl shadow-md mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-black mb-1 flex items-center gap-2">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
            </span>
            Live Match
          </h1>
          <p className="text-blue-200 text-sm">จัดการแข่งขัน: {activeSession.badminton_groups?.name}</p>
        </div>
        <div className="text-center bg-blue-900/80 px-5 py-3 rounded-2xl border border-blue-700">
          <div className="text-xs text-blue-200 font-bold">คนรอตี</div>
          <div className="text-2xl md:text-3xl font-black text-white">{waitingPlayers.length}</div>
        </div>
      </div>

      {isOrganizer ? (
        <div className="mb-8 text-center">
          <button 
            onClick={handleAutoMatch}
            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 active:scale-95 text-lg flex items-center justify-center gap-2 mx-auto w-full md:w-auto transition-all"
          >
            <span>⚡ จับคู่อัตโนมัติ (สุ่มคนว่าง)</span>
          </button>
        </div>
      ) : (
        <div className="mb-8 text-center bg-blue-50 p-4 rounded-2xl border border-blue-100">
          <p className="text-blue-800 font-bold flex items-center justify-center gap-2 text-sm">
            👀 โหมดผู้ชม (กำลังรอกรรมการจัดคอร์ท)
          </p>
        </div>
      )}

      <h2 className="text-xl font-black text-gray-800 mb-4">กระดานคอร์ทแข่งขัน</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeMatches.map(match => {
          const details = matchDetails[match.id] || {};
          const isPlaying = match.status === 'playing';

          return (
            <div key={match.id} className={`p-6 rounded-3xl border-2 transition-all ${isPlaying ? 'bg-white border-blue-400 shadow-lg' : 'bg-gray-50 border-gray-200 opacity-90'}`}>
              
              <div className="flex justify-between items-center mb-4">
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${isPlaying ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                  {isPlaying ? '🔥 กำลังแข่งขัน' : '✅ จบเกมแล้ว'}
                </span>
                
                {match.winner && (
                  <span className={`text-sm font-black ${match.winner === 'Draw' ? 'text-gray-600' : 'text-green-600'}`}>
                    {match.winner === 'Draw' ? '🤝 เสมอกัน' : `🏆 ทีม ${match.winner} ชนะ`}
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center text-center mb-4">
                <div className="flex-1 p-3 bg-red-50 rounded-2xl border border-red-100">
                  <div className="font-black text-red-600 text-xs mb-1 uppercase tracking-wider">TEAM A</div>
                  <div className="text-sm font-bold text-gray-800 truncate">{match.p_a1?.display_name || '-'}</div>
                  <div className="text-sm font-bold text-gray-800 truncate">{match.p_a2?.display_name || '-'}</div>
                </div>
                <div className="px-3 font-black text-gray-300 text-lg">VS</div>
                <div className="flex-1 p-3 bg-blue-50 rounded-2xl border border-blue-100">
                  <div className="font-black text-blue-600 text-xs mb-1 uppercase tracking-wider">TEAM B</div>
                  <div className="text-sm font-bold text-gray-800 truncate">{match.p_b1?.display_name || '-'}</div>
                  <div className="text-sm font-bold text-gray-800 truncate">{match.p_b2?.display_name || '-'}</div>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 mb-4 text-xs space-y-2.5">
                <div className="font-bold text-slate-700 flex items-center gap-1">
                  <span>🪶 ข้อมูลลูกแบดที่ใช้ในแมตช์นี้:</span>
                </div>

                {isPlaying && isOrganizer ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-gray-500 font-bold mb-1">ยี่ห้อลูกแบด</label>
                      <select
                        value={details.shuttlecock_id || ''}
                        onChange={(e) => handleDetailChange(match.id, 'shuttlecock_id', e.target.value)}
                        className="w-full p-2 bg-white border border-gray-300 rounded-xl font-medium outline-none focus:border-blue-500"
                      >
                        {shuttleList.map(s => (
                          <option key={s.id} value={s.id}>{s.brand_name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-500 font-bold mb-1">เลข/รหัสบนลูก (เช่น 01, A2)</label>
                      <input
                        type="text"
                        value={details.shuttle_number || ''}
                        onChange={(e) => handleDetailChange(match.id, 'shuttle_number', e.target.value)}
                        placeholder="เบอร์ลูก..."
                        className="w-full p-2 bg-white border border-gray-300 rounded-xl font-bold outline-none focus:border-blue-500 text-center"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-500 font-bold mb-1">จำนวนลูกที่ใช้</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={details.shuttlecocks_used || 1}
                        onChange={(e) => handleDetailChange(match.id, 'shuttlecocks_used', e.target.value)}
                        className="w-full p-2 bg-white border border-gray-300 rounded-xl font-black outline-none focus:border-blue-500 text-center text-blue-600"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between text-gray-600 gap-2 font-medium">
                    <div>
                      <span>ยี่ห้อ: </span>
                      <b className="text-gray-800">{match.shuttlecock?.brand_name || 'ตามรอบก๊วน'}</b>
                    </div>
                    {match.shuttle_number && (
                      <div className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold">
                        ลูกเบอร์: #{match.shuttle_number}
                      </div>
                    )}
                    <div>
                      <span>ใช้ไป: </span>
                      <b className="text-blue-600 font-bold">{match.shuttlecocks_used || 1} ลูก</b>
                    </div>
                  </div>
                )}
              </div>

              {isPlaying && isOrganizer && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleSetWinner(match.id, 'A')}
                    className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-xs sm:text-sm transition-colors border border-red-200"
                  >
                    TEAM A ชนะ
                  </button>
                  <button 
                    onClick={() => handleSetWinner(match.id, 'Draw')}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs sm:text-sm transition-colors border border-gray-200"
                  >
                    เสมอ
                  </button>
                  <button 
                    onClick={() => handleSetWinner(match.id, 'B')}
                    className="flex-1 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs sm:text-sm transition-colors border border-blue-200"
                  >
                    TEAM B ชนะ
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LiveMatchPage;
