import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '../logic/supabaseClient';

const FinancePage = () => {
  const { data: session } = useSession();
  const [activeSession, setActiveSession] = useState(null);
  const [billingList, setBillingList] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const calculateSessionFinance = async () => {
      setIsLoading(true);
      const today = new Date().toISOString().split('T')[0];

      try {
        // 1. ดึงรอบของวันนี้ พร้อมข้อมูลค่าสนาม
        const { data: sessionData } = await supabase
          .from('group_sessions')
          .select(`
            id, play_date, court_fee_per_person,
            badminton_groups ( name, organizer_id )
          `)
          .eq('play_date', today)
          .maybeSingle();

        if (!sessionData) {
          setIsLoading(false);
          return;
        }
        setActiveSession(sessionData);

        // 2. ดึงรายชื่อคนที่เช็คอินรอบนี้
        const { data: checkinData } = await supabase
          .from('checkins')
          .select('player_id, profiles(id, display_name, avatar_url)')
          .eq('session_id', sessionData.id);

        // 3. ดึงแมตช์ที่แข่งจบแล้วทั้งหมดพร้อมข้อมูลลูกแบด
        const { data: matchData } = await supabase
          .from('matches')
          .select(`
            id, team_a_1, team_a_2, team_b_1, team_b_2,
            shuttlecocks_used,
            shuttlecock:shuttlecock_id(price_per_shuttle)
          `)
          .eq('session_id', sessionData.id)
          .eq('status', 'finished');

        const courtFee = Number(sessionData.court_fee_per_person) || 0;
        const playerSummary = {};

        // เริ่มต้นรายชื่อคนที่เช็คอินทุกคนด้วยค่าสนามตั้งต้น
        (checkinData || []).forEach(c => {
          if (c.profiles) {
            playerSummary[c.player_id] = {
              id: c.profiles.id,
              name: c.profiles.display_name,
              avatar: c.profiles.avatar_url,
              matchesPlayed: 0,
              shuttleCost: 0,
              courtCost: courtFee,
              totalCost: courtFee
            };
          }
        });

        // คำนวณค่าลูกแบดตามแมตช์ที่แต่ละคนลงเล่นจริง (หาร 4 ต่อแมตช์)
        (matchData || []).forEach(m => {
          const pricePerShuttle = m.shuttlecock?.price_per_shuttle || 60;
          const totalShuttleMatchCost = (m.shuttlecocks_used || 1) * pricePerShuttle;
          const costPerPlayer = totalShuttleMatchCost / 4;

          const matchPlayers = [m.team_a_1, m.team_a_2, m.team_b_1, m.team_b_2];
          matchPlayers.forEach(pId => {
            if (pId && playerSummary[pId]) {
              playerSummary[pId].matchesPlayed += 1;
              playerSummary[pId].shuttleCost += costPerPlayer;
              playerSummary[pId].totalCost += costPerPlayer;
            }
          });
        });

        const list = Object.values(playerSummary);
        setBillingList(list);

        const totalSum = list.reduce((acc, curr) => acc + curr.totalCost, 0);
        setGrandTotal(totalSum);

      } catch (err) {
        console.error('Error calculating finance:', err);
      } finally {
        setIsLoading(false);
      }
    };

    calculateSessionFinance();
  }, [session]);

  if (isLoading) return <div className="text-center p-12 font-sans">กำลังคำนวณบิล...</div>;
  if (!activeSession) return <div className="text-center p-12 font-sans">ไม่พบข้อมูลรอบสำหรับคิดเงินในวันนี้ครับ</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 font-sans pb-24">
      {/* Header สรุปยอดรวม */}
      <div className="bg-[#0f172a] text-white p-6 md:p-8 rounded-3xl shadow-lg mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs bg-green-500/20 text-green-300 font-bold px-3 py-1 rounded-full border border-green-500/30">
            📊 สรุปยอดค่าใช้จ่าย
          </span>
          <h1 className="text-2xl md:text-3xl font-black mt-2">{activeSession.badminton_groups?.name}</h1>
          <p className="text-blue-200 text-xs">ประจำวันที่ {activeSession.play_date}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl text-right w-full sm:w-auto">
          <div className="text-xs text-slate-400">ยอดรวมทั้งก๊วน</div>
          <div className="text-2xl font-black text-green-400">{grandTotal.toLocaleString()} บาท</div>
        </div>
      </div>

      {/* ตารางแจกแจงรายคน */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-base font-bold text-gray-800 mb-4">รายละเอียดรายบุคคล ({billingList.length} คน)</h2>

        <div className="divide-y divide-gray-100">
          {billingList.map((player) => (
            <div key={player.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {player.avatar ? (
                  <img src={player.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover border" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm">🏸</div>
                )}
                <div>
                  <div className="font-bold text-gray-800 text-sm">{player.name}</div>
                  <div className="text-xs text-gray-400">
                    เล่น {player.matchesPlayed} แมตช์ | ค่าสนาม {player.courtCost} บ. | ค่าลูก {player.shuttleCost} บ.
                  </div>
                </div>
              </div>

              <div className="text-right self-end sm:self-auto">
                <span className="text-xs text-gray-400 block">ยอดชำระ</span>
                <span className="text-lg font-black text-blue-600">
                  {player.totalCost.toFixed(0)} <span className="text-xs text-gray-500">บาท</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinancePage;
