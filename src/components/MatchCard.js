const MatchCard = ({ court, teamA, teamB, levelColor, levelName }) => (
  <div className="border-l-8 rounded-lg shadow-md p-4 mb-4 bg-white" style={{ borderColor: levelColor }}>
    <div className="flex justify-between items-center mb-2">
      <span className="font-bold text-lg">สนาม {court}</span>
      <span className="px-3 py-1 rounded-full text-white text-xs" style={{ backgroundColor: levelColor }}>
        {levelName}
      </span>
    </div>
    
    <div className="flex justify-around items-center bg-gray-50 py-3 rounded">
      <div className="text-center">
        <p className="font-semibold">{teamA[0]}</p>
        <p className="font-semibold">{teamA[1]}</p>
      </div>
      <div className="text-red-500 font-black italic">VS</div>
      <div className="text-center">
        <p className="font-semibold">{teamB[0]}</p>
        <p className="font-semibold">{teamB[1]}</p>
      </div>
    </div>
    
    {/* ปุ่มสั่นแจ้งเตือน (สำหรับคนหูหนวก) */}
    <button 
      onClick={() => window.navigator.vibrate([200, 100, 200])}
      className="w-full mt-3 py-2 bg-gray-800 text-white rounded text-sm active:bg-black"
    >
      📳 สั่นเตือนเพื่อนในกลุ่มนี้
    </button>
  </div>
);
