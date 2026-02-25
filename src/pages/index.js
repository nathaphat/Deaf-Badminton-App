import React from 'react';

const Dashboard = () => {
  // ข้อมูลสมมติจากรูปโปรไฟล์ที่คุณส่งมา
  const stats = {
    totalMatches: 7,
    win: 2,
    winRate: "28.6%",
    draw: 1,
    lose: 4
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-50 min-h-screen font-sans">
      {/* ส่วนหัวแอป */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-black flex items-center">
          <span className="text-blue-600 mr-2">🏆</span> Badminton App
        </h1>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
           <img src="/api/placeholder/40/40" alt="User" />
        </div>
      </div>

      <h2 className="text-2xl font-black mb-4">โปรไฟล์ผู้เล่น</h2>

      {/* สถิติหลัก (Stats Grid) - ถอดแบบจากรูปที่คุณส่งมา */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <p className="text-gray-500 text-xs font-bold uppercase">แมตช์ทั้งหมด</p>
          <p className="text-2xl font-black">{stats.totalMatches}</p>
          <span className="absolute right-4 bottom-4 text-yellow-500 text-xl">🏆</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs font-bold uppercase">ชนะ</p>
          <p className="text-2xl font-black text-green-600">{stats.win}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs font-bold uppercase">อัตราชนะ</p>
          <p className="text-2xl font-black text-green-500">{stats.winRate}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm
