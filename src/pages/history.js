import React, { useState, useEffect } from 'react';
import { supabase } from '../logic/supabaseClient';
import Link from 'next/link';

const MatchHistoryPage = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [sessionMatches, setSessionMatches] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

  useEffect(() => {
    const fetchClosedSessions = async () => {
      setIsLoadingSessions(true);
      try {
        const { data, error } = await supabase
          .from('group_sessions')
          .select(`
            id,
            play_date,
            court_fee_per_person,
            badminton_groups ( name ),
            shuttlecock:shuttlecock_id ( brand_name )
          `)
          .order('play_date', { ascending: false });

        if (error) throw error;
        setSessions(data || []);

        if (data && data.length > 0) {
          setSelectedSessionId(data[0].id);
        }
      } catch (err) {
        console.error('Error fetching sessions:', err.message);
      } finally {
        setIsLoadingSessions(false);
      }
    };

    fetchClosedSessions();
  }, []);

  useEffect(() => {
    if (!selectedSessionId) return;

    const fetchMatchesBySession = async () => {
      setIsLoadingMatches(true);
      try {
        const { data, error } = await supabase
          .from('matches')
          .select(`
            id,
            status,
            winner,
            shuttle_number,
            shuttlecocks_used,
            shuttlecock:shuttlecock_id ( brand_name ),
            p_a1:team_a_1 ( display_name ),
            p_a2:team_a_2 ( display_name ),
            p_b1:team_b_1 ( display_name ),
            p_b2:team_b_2 ( display_name )
          `)
          .eq('session_id', selectedSessionId)
          .eq('status', 'finished')
          .order('id', { ascending: true });

        if (error) throw error;
        setSessionMatches(data || []);
      } catch (err) {
        console.error('Error fetching matches:', err.message);
      } finally {
        setIsLoadingMatches(false);
      }
    };

    fetchMatchesBySession();
  }, [selectedSessionId]);

  if (isLoadingSessions) {
    return <div className="text-center p-12 font-sans text-gray-500">กำลังโหลดประวัติก๊วน...</div>;
  }

  const currentSession = sessions.find((s) => s.id === selectedSessionId);

  return (
    <div className="max-w-5xl mx-auto p-4 font-sans pb-24">
      <div className="bg-[#0f172a] text-white p-6 md:p-8 rounded-3xl shadow-lg mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black mb-1">📜 ประวัติการแข่งขันย้อนหลัง</h1>
          <p className="text-blue-200 text-xs">ตรวจสอบผลการแข่งขันและรายละเอียดแมตช์ในแต่ละรอบ</p>
        </div>

        {/* ปุ่มลัดเปิดดูบิลของรอบที่กำลังเลือก */}
        {selectedSessionId && (
          <Link href={`/finance?sessionId=${selectedSessionId}`}>
            <button className="px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-md text-xs sm:text-sm transition-all flex items-center gap-2">
              <span>🧾 ดูสรุปบิลรอบนี้</span>
            </button>
          </Link>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <label className="text-sm font-bold text-gray-700">เลือกรอบวันที่:</label>
        <select
          value={selectedSessionId || ''}
          onChange={(e) => setSelectedSessionId(Number(e.target.value))}
          className="w-full sm:w-auto p-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 outline-none focus:border-blue-500"
        >
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              📅 {s.play_date} - {s.badminton_groups?.name || 'ก๊วน'}
            </option>
          ))}
        </select>
      </div>

      {currentSession && (
        <div className="bg-slate-100 p-4 rounded-2xl mb-6 text-xs text-gray-600 flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap gap-4">
            <div>ก๊วน: <b className="text-gray-800">{currentSession.badminton_groups?.name}</b></div>
            <div>ค่าสนาม: <b className="text-blue-700">{currentSession.court_fee_per_person || 0} บ./คน</b></div>
            <div>ลูกแบดหลัก: <b className="text-gray-800">{currentSession.shuttlecock?.brand_name || 'ไม่ได้ระบุ'}</b></div>
            <div>แมตช์ทั้งหมด: <b className="text-green-700">{sessionMatches.length} แมตช์</b></div>
          </div>
        </div>
      )}

      {isLoadingMatches ? (
        <div className="text-center p-8 text-gray-400 text-sm">กำลังโหลดข้อมูลแมตช์...</div>
      ) : sessionMatches.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-3xl border text-gray-400 text-sm">
          ไม่มีข้อมูลแมตช์ที่แข่งขันจบแล้วในรอบนี้
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessionMatches.map((m, idx) => (
            <div key={m.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-400">แมตช์ที่ #{idx + 1}</span>
                <span className={`text-xs font-black px-3 py-1 rounded-full ${
                  m.winner === 'Draw'
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  {m.winner === 'Draw' ? '🤝 เสมอ' : `🏆 ทีม ${m.winner} ชนะ`}
                </span>
              </div>

              <div className="flex items-center justify-between text-center mb-3 gap-2">
                <div className={`flex-1 p-3 rounded-2xl ${m.winner === 'A' ? 'bg-red-50 border border-red-200 font-bold' : 'bg-gray-50'}`}>
                  <div className="text-[10px] text-red-600 font-black mb-1">TEAM A</div>
                  <div className="text-xs truncate">{m.p_a1?.display_name || '-'}</div>
                  <div className="text-xs truncate">{m.p_a2?.display_name || '-'}</div>
                </div>

                <div className="text-xs font-black text-gray-300">VS</div>

                <div className={`flex-1 p-3 rounded-2xl ${m.winner === 'B' ? 'bg-blue-50 border border-blue-200 font-bold' : 'bg-gray-50'}`}>
                  <div className="text-[10px] text-blue-600 font-black mb-1">TEAM B</div>
                  <div className="text-xs truncate">{m.p_b1?.display_name || '-'}</div>
                  <div className="text-xs truncate">{m.p_b2?.display_name || '-'}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-dashed border-gray-100 flex justify-between text-[11px] text-gray-500">
                <span>🪶 {m.shuttlecock?.brand_name || 'ลูกตามรอบ'}</span>
                <span>
                  {m.shuttle_number && <span className="mr-2 text-amber-600 font-bold">#{m.shuttle_number}</span>}
                  ใช้ไป <b>{m.shuttlecocks_used || 1}</b> ลูก
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchHistoryPage;
