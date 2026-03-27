import React from 'react';
import { signIn, signOut, useSession } from "next-auth/react"
const Dashboard = () => {
  const { data: session } = useSession()
  const stats = {
    totalMatches: 7,
    win: 2,
    winRate: "28.6%",
    draw: 1,
    lose: 4
  };
  if (session) {
    return (
      <div className="text-center">
        <p>ยินดีต้อนรับคุณ {session.user.name}</p>
        <button onClick={() => signOut()} className="bg-red-500 text-white p-2 rounded">ออกจากระบบ</button>
      </div>
      <div className="max-w-4xl mx-auto p-4 bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-black flex items-center">
          <span className="text-blue-600 mr-2">🏆</span> ตำ 5 รส
        </h1>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-200">
           <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">👤</div>
        </div>
      </div>

      <h2 className="text-2xl font-black mb-4 text-gray-800">โปรไฟล์ผู้เล่น</h2>

      {/* สถิติหลัก */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <p className="text-gray-500 text-[10px] font-bold uppercase">แมตช์ทั้งหมด</p>
          <p className="text-2xl font-black">{stats.totalMatches}</p>
          <span className="absolute -right-1 -bottom-1 text-yellow-500 text-3xl opacity-20">🏆</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-[10px] font-bold uppercase">ชนะ</p>
          <p className="text-2xl font-black text-green-600">{stats.win}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-[10px] font-bold uppercase">อัตราชนะ</p>
          <p className="text-2xl font-black text-green-500">{stats.winRate}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-[10px] font-bold uppercase">แพ้</p>
          <p className="text-2xl font-black text-red-600">{stats.lose}</p>
        </div>
      </div>

      {/* ประวัติ Series */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-purple-100 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">ประวัติ Series</h3>
          <span className="text-[10px] bg-purple-100 text-purple-600 px-3 py-1 rounded-full font-black">กำลังดำเนินการ</span>
        </div>
        <div className="w-full bg-gray-100 h-3 rounded-full mb-6 overflow-hidden">
          <div className="bg-purple-500 h-full w-[70%] rounded-full"></div>
        </div>
        <div className="grid grid-cols-4 text-center">
          <div><p className="text-green-600 font-black">{stats.win}</p><p className="text-[10px] text-gray-400 font-bold">ชนะ</p></div>
          <div><p className="text-yellow-600 font-black">{stats.draw}</p><p className="text-[10px] text-gray-400 font-bold">เสมอ</p></div>
          <div><p className="text-red-600 font-black">{stats.lose}</p><p className="text-[10px] text-gray-400 font-bold">แพ้</p></div>
          <div><p className="text-blue-600 font-black">25</p><p className="text-[10px] text-gray-400 font-bold">คะแนน</p></div>
        </div>
      </div>

      {/* ผลงาน 30 วันล่าสุด */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-50">
        <h3 className="font-bold mb-4 px-2 text-gray-700">ผลงาน 30 วันล่าสุด</h3>
        <div className="space-y-2">
           <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100">
              <span className="text-sm font-bold text-gray-600">17/2/2569</span>
              <div className="flex gap-2">
                 <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded-lg font-bold">2 ชนะ</span>
                 <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-1 rounded-lg font-bold">1 เสมอ</span>
                 <span className="bg-red-100 text-red-700 text-[10px] px-2 py-1 rounded-lg font-bold">0 แพ้</span>
              </div>
           </div>
        </div>
      </div>
    </div>
    )
  }
  return (
    <div className="text-center">
      <button 
        onClick={() => signIn('line')} 
        className="bg-[#00B900] text-white px-4 py-2 rounded-lg font-bold"
      >
        LINE Login
      </button>
    </div>
  )
};

export default Dashboard;
