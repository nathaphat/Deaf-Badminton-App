import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { supabase } from '../logic/supabaseClient';
import Link from 'next/link';

const FinancePage = () => {
  const router = useRouter();
  const { sessionId: querySessionId } = router.query; // รับ sessionId จาก URL ถ้ามี
  const { data: session } = useSession();
  const [activeSession, setActiveSession] = useState(null);
  const [billingList, setBillingList] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [totalShuttlesCount, setTotalShuttlesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;

    const calculateSessionFinance = async () => {
      setIsLoading(true);
      const today = new Date().toISOString().split('T')[0];

      try {
        let sessionQuery = supabase
          .from('group_sessions')
          .select(`
            id, play_date, court_fee_per_person,
            badminton_groups ( name, organizer_id )
          `);

        // ถ้าระบุ sessionId มา ให้ดึงรอบนั้น ถ้าไม่ระบุให้ดึงรอบของวันนี้
        if (querySessionId) {
          sessionQuery = sessionQuery.eq('id', querySessionId);
        } else {
          sessionQuery = sessionQuery.eq('play_date', today);
        }

        const { data: sessionData, error: sessErr } = await sessionQuery.maybeSingle();

        if (sessErr || !sessionData) {
          setIsLoading(false);
          return;
        }
        setActiveSession(sessionData);

        // ดึงรายชื่อคนที่เช็คอินรอบนี้
        const { data: checkinData } = await supabase
          .from('checkins')
          .select('player_id, profiles(id, display_name, avatar_url)')
          .eq('session_id', sessionData.id);

        // ดึงแมตช์ที่จบแล้วทั้งหมด
        const { data: matchData } = await supabase
          .from('matches')
          .select(`
            id, team_a_1, team_a_2, team_b_1, team_b_2,
            shuttlecocks_used,
            shuttlecock:shuttlecock_id(brand_name, price_per_shuttle)
          `)
          .eq('session_id', sessionData.id)
          .eq('status', 'finished');

        const courtFee = Number(sessionData.court_fee_per_person) || 0;
        const playerSummary = {};

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

        let totalShuttles = 0;

        (matchData || []).forEach(m => {
          const usedCount = m.shuttlecocks_used || 1;
          totalShuttles += usedCount;

          const pricePerShuttle = m.shuttlecock?.price_per_shuttle || 60;
          const totalShuttleMatchCost = usedCount * pricePerShuttle;
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
        setTotalShuttlesCount(totalShuttles);

        const totalSum = list.reduce((acc, curr) => acc + curr.totalCost, 0);
        setGrandTotal(totalSum);

      } catch (err) {
        console.error('Error calculating finance:', err);
      } finally {
        setIsLoading(false);
      }
    };

    calculateSessionFinance();
  }, [router.isReady, querySessionId]);

  if (isLoading) return <div className="text-center p-12 font-sans">กำลังคำนวณบิล...</div>;
  if (!activeSession) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded-3xl shadow-sm border border-gray-100 text-center mt-12 font-sans">
        <span className="text-4xl block mb-2">🏸</span>
        <h2 className="text-lg font-bold text-gray-800 mb-1">ไม่พบข้อมูลรอบสำหรับคิดเงิน</h2>
        <p className="text-xs text-gray-400 mb-4">โปรดตรวจสอบรอบการเล่นที่ถูกต้อง</p>
        <Link href="/history" className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs">
          ไปดูประวัติรอบทั้งหมด
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 font-sans pb-24">
      <div className="bg-[#0f172a] text-white p-6 md:p-8 rounded-3xl shadow-lg mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[11px] bg-green-500/20 text-green-300 font-bold px-3 py-1 rounded-full border border-green-500/30">
            📊 สรุปยอดค่าใช้จ่าย
          </span>
          <h1 className="text-2xl md:text-3xl font-black mt-2 mb-1">{activeSession.badminton_groups?.name}</h1>
          <p className="text-blue-200 text-xs">รอบวันที่ {activeSession.play_date} | ใช้ลูกแบดรวม {totalShuttlesCount} ลูก</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl text-right w-full sm:w-auto">
          <div className="text-xs text-slate-400">ยอดรวมทั้งสิ้น</div>
          <div className="text-2xl md:text-3xl font-black text-green-400">
            {grandTotal.toLocaleString()} <span className="text-xs text-gray-300">บาท</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-bold text-gray-800">
            สรุปยอดรายบุคคล ({billingList.length} คน)
          </h2>
          <span className="text-xs text-gray-400">
            ค่าสนาม {activeSession.court_fee_per_person || 0} บ./คน
          </span>
        </div>

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
                  <div className="text-xs text-gray-500 mt-0.5 space-x-2">
                    <span>ตีไป <b>{player.matchesPlayed}</b> แมตช์</span>
                    <span>•</span>
                    <span>ค่าสนาม <b>{player.courtCost}</b> บ.</span>
                    <span>•</span>
                    <span>ค่าลูก <b>{player.shuttleCost}</b> บ.</span>
                  </div>
                </div>
              </div>

              <div className="text-right self-end sm:self-auto bg-blue-50 sm:bg-transparent px-4 py-2 sm:p-0 rounded-xl sm:rounded-none w-full sm:w-auto flex sm:block justify-between items-center">
                <span className="text-xs text-gray-500 sm:text-gray-400 block">ยอดที่ต้องจ่าย:</span>
                <span className="text-lg font-black text-blue-700">
                  {Math.round(player.totalCost)} <span className="text-xs font-medium text-gray-600">บาท</span>
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
