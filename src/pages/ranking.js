import React from 'react';

const RankingBoard = () => {
  // สมมติข้อมูลอันดับที่ดึงมาจาก Database
  const rankings = [
    { rank: 1, name: "พี่บอล", level: "หน้าบ้าน", win: 15, lose: 2, winRate: "88%", color: "bg-orange-500" },
    { rank: 2, name: "เมย์", level: "เบา", win: 12, lose: 4, winRate: "75%", color: "bg-green-500" },
    { rank: 3, name: "กิ๊ก", level: "เบา", win: 10, lose: 5, winRate: "66%", color: "bg-green-500" },
    { rank: 4, name: "ตั้ว", level: "หน้าบ้าน", win: 8, lose: 6, winRate: "57%", color: "bg-orange-500" },
  ];

  return (
    <div className="max-w-md mx-auto p-4 bg-white min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-black text-gray-800">อันดับก๊วน 🏆</h2>
        <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">อัปเดตล่าสุดวันนี้</span>
      </div>

      <div className="space-y-3">
        {rankings.map((player) => (
          <div 
            key={player.rank}
            className={`flex items-center p-4 rounded-2xl border-2 transition-all hover:border-gray-300 ${player.rank <= 3 ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-100'}`}
          >
            {/* เลขอันดับ */}
            <div className="w-8 text-2xl font-black text-gray-400 mr-2">
              {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : player.rank}
            </div>

            {/* โปรไฟล์และระดับมือ */}
            <div className="flex-1">
              <div className="flex items-center">
                <span className="font-bold text-lg mr-2">{player.name}</span>
                <span className={`w-3 h-3 rounded-full ${player.color}`}></span>
              </div>
              <p className="text-xs text-gray-500 uppercase font-bold">{player.level}</p>
            </div>

            {/* สถิติชนะ/แพ้ */}
            <div className="text-right">
              <div className="text-sm font-bold text-blue-600">ชนะ {player.win}</div>
              <div className="text-xs text-gray-400 font-medium">Win Rate: {player.winRate}</div>
            </div>
          </div>
        ))}
      </div>

      {/* คำแนะนำท้ายหน้าจอ */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center">
        <p className="text-gray-500 text-sm italic">ยิ่งชนะมาก อันดับยิ่งสูงขึ้น! สู้ๆ นะทุกคน 🏸</p>
      </div>
    </div>
  );
};
export default RankingBoard;
