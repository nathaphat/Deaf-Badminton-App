// 1. กำหนดระดับมือตามรูปภาพก๊วนสุขนิยม
const LEVELS = {
  BABY: "เบบี้",
  PRIMARY: "ประถม",
  JUNIOR: "ม.ต้น"
};

/**
 * ฟังก์ชันจัดทีมอัตโนมัติ
 * @param {Array} players - รายชื่อคนที่เช็คอิน [ { name, level }, ... ]
 */
export const autoMatchmaking = (players) => {
  // แยกคนตามระดับเพื่อความง่ายในการจับคู่
  const babyGroup = players.filter(p => p.level === LEVELS.BABY);
  const primaryGroup = players.filter(p => p.level === LEVELS.PRIMARY);
  const juniorGroup = players.filter(p => p.level === LEVELS.JUNIOR);

  let courts = [];

  // กฎที่ 1: ม.ต้น ตีกับ ม.ต้น เท่านั้น (เน้นความเดือด)
  while (juniorGroup.length >= 4) {
    const match = juniorGroup.splice(0, 4);
    courts.push({
      level: LEVELS.JUNIOR,
      teamA: [match[0], match[1]],
      teamB: [match[2], match[3]]
    });
  }

  // กฎที่ 2: เบบี้ กับ ประถม สามารถตีด้วยกันได้ (ตามเงื่อนไข หน้าบ้าน+เบา)
  const beginnerPool = [...babyGroup, ...primaryGroup];
  
  while (beginnerPool.length >= 4) {
    // สุ่มคนจากสระผู้เล่นเริ่มต้น
    const match = beginnerPool.sort(() => 0.5 - Math.random()).splice(0, 4);
    courts.push({
      level: "เบบี้ / ประถม",
      teamA: [match[0], match[1]],
      teamB: [match[2], match[3]]
    });
  }

  return {
    matches: courts,
    waiting: beginnerPool.concat(juniorGroup) // คนที่เหลือที่ยังไม่ได้จับคู่
  };
};
