import React from 'react';

const RankingPage = () => {
  // ข้อมูลสมมติที่อ้างอิงจากรูปโปรไฟล์ของคุณ (กิ๊ก)
  const rankingList = [
    { id: 1, name: "กิ๊ก", level: "ม.ต้น", win: 2, winRate: "28.6%", color: "bg-blue-500", icon: "🧑" },
    { id: 2, name: "พี่บอล", level: "ประถม", win: 5, winRate: "60.0%", color: "bg-green-500", icon: "👦" },
    { id: 3, name: "ตั้ว", level: "เบบี้", win: 1, winRate: "15.0%", color: "bg-orange-400", icon: "👶" },
  ];

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black italic text-gray-800">RANKING 🏆</h1>
        <span className="text-xs font-bold text-gray-400">ก๊วนสุขนิยม</span>
      </div>

      <div className="space-y-3">
        {rankingList.map((player, index) => (
          <div 
            key={player.id} 
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center"
          >
            {/* อันดับ */}
            <div className="w-10 text-xl font-black text-blue-600 italic">
              #{index + 1}
            </div>

            {/* ไอคอนระดับมือตามรูปภาพก๊วน */}
            <div className={`w-12 h-12 ${player.color} rounded-xl flex items-center justify-center text-2xl mr-4`}>
              {player.icon}
            </div>

            {/* ข้อมูลผู้เล่น */}
            <div className="flex-1">
              <div className="font-bold text-gray-800">{player.name}</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                ระดับ: {player.level}
              </div>
            </div>

            {/* สถิติอัตราชนะ */}
            <div className="text-right">
              <div className="text-sm font-black text-green-600">{player.winRate}</div>
              <div className="text-[10px] text-gray-400 font-bold">WIN RATE</div>
            </div>
          </div>
        ))}
      </div>

      {/* ปุ่มสั่นแจ้งเตือนเมื่อดูอันดับ (เพื่อความสนุกของคนหูหนวก) */}
      <button 
        onClick={() => window.navigator.vibrate([100, 50, 100])}
        className="w-full mt-8 py-4 bg-gray-800 text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all"
      >
        📳 สั่นเพื่อฉลองอันดับ!
      </button>
    </div>
  );
};

export default RankingPage;
