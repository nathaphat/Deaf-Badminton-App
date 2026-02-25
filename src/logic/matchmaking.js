// 1. กำหนดระดับมือตามที่คุณต้องการ
const LEVELS = {
  FRONT: "หน้าบ้าน",
  EASY: "เบา",
  MEDIUM: "กลาง",
  HARD: "หนัก"
};

// 2. ฟังก์ชันหลักในการจัดสนาม
function generateMatch(playersCheckedIn) {
  // กรองผู้เล่นตามกลุ่มที่ตีด้วยกันได้
  const groupBeginner = playersCheckedIn.filter(p => 
    p.level === LEVELS.FRONT || p.level === LEVELS.EASY
  );
  const groupMedium = playersCheckedIn.filter(p => p.level === LEVELS.MEDIUM);
  const groupHard = playersCheckedIn.filter(p => p.level === LEVELS.HARD);

  // ตัวอย่างการสุ่มเลือก 4 คนจากกลุ่ม "หน้าบ้าน/เบา"
  if (groupBeginner.length >= 4) {
    const match = groupBeginner.sort(() => 0.5 - Math.random()).slice(0, 4);
    return {
      court: 1,
      teamA: [match[0], match[1]],
      teamB: [match[2], match[3]],
      message: "ระดับ หน้าบ้าน + เบา ลงสนามได้!"
    };
  }
  
  return "รอผู้เล่นให้ครบ 4 คนในระดับเดียวกัน...";
}

// --- ตัวอย่างข้อมูลผู้เล่นที่เช็คอินเข้าแอป ---
const players = [
  { name: "พี่บอล", level: "หน้าบ้าน" },
  { name: "เมย์", level: "เบา" },
  { name: "กิ๊ก", level: "เบา" },
  { name: "ตั้ว", level: "หน้าบ้าน" }
];

console.log(generateMatch(players));
