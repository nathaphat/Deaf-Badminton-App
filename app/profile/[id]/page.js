'use client';
import { useEffect, useState } from 'react';

export default function ProfilePage({ params }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // เรียกใช้ API Route ของเรา
    fetch(`/api/profile/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) return <p className="p-10 text-center">กำลังโหลดข้อมูลนักกีฬา...</p>;
  if (!data?.profile) return <p className="p-10 text-center">ไม่พบข้อมูลนักกีฬา</p>;

  return (
    <div className="p-6 max-w-lg mx-auto">
      {/* ส่วนแสดงชื่อและอันดับ */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">{data.profile.display_name}</h1>
        <p className="text-blue-600 font-semibold">อันดับที่: {data.profile.rank_position}</p>
      </div>

      {/* ส่วนแสดงสถิติ */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500">อัตราการชนะ</p>
          <p className="text-2xl font-bold text-green-600">{data.profile.win_rate}%</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500">แข่งทั้งหมด</p>
          <p className="text-2xl font-bold">{data.profile.total_matches} เกม</p>
        </div>
      </div>
    </div>
  );
}
