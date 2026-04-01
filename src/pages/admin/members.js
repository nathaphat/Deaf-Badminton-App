import React, { useState } from 'react';

const MemberManagement = () => {
  // ข้อมูลสมมติของคนที่รออนุมัติเข้าก๊วน
  const [pendingMembers, setPendingMembers] = useState([
    { id: 101, name: "อาร์ต", level: "เบบี้", color: "bg-level-baby" },
    { id: 102, name: "ฝน", level: "ม.ต้น", color: "bg-level-junior" }
  ]);

  const handleApprove = (id) => {
    // ระบบสั่นเมื่อกดอนุมัติ
    window.navigator.vibrate(100);
    setPendingMembers(pendingMembers.filter(m => m.id !== id));
    alert("อนุมัติสมาชิกเรียบร้อย!");
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-black mb-6 flex items-center">
        👥 จัดการสมาชิก <span className="ml-2 text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded-full">{pendingMembers.length} คน</span>
      </h2>

      <div className="space-y-4">
        {pendingMembers.length > 0 ? (
          pendingMembers.map((member) => (
            <div key={member.id} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-10 h-10 ${member.color} rounded-full flex items-center justify-center text-white font-bold mr-3`}>
                  {member.name[0]}
                </div>
                <div>
                  <div className="font-bold">{member.name}</div>
                  <div className="text-xs text-gray-400">ขอเข้าร่วมระดับ: {member.level}</div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleApprove(member.id)}
                  className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm active:scale-95 transition-all"
                >
                  ยอมรับ
                </button>
                <button className="bg-gray-100 text-gray-400 px-4 py-2 rounded-xl text-sm font-bold">
                  ปฏิเสธ
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-400 font-bold">
            ไม่มีสมาชิกที่รอการอนุมัติ 😊
          </div>
        )}
      </div>
    </div>
  );
};
export default MemberManagement;
