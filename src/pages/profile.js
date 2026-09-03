import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react'; 
import { supabase } from '../logic/supabaseClient'; 
import { useRouter } from 'next/router';

const ProfileLevel = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [lineName, setLineName] = useState('');
  const [lineId, setLineId] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [gender, setGender] = useState(''); 
  const [handPref, setHandPref] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('Beginner'); 
  
  const [isGenderLocked, setIsGenderLocked] = useState(false);
  const [isHandPrefLocked, setIsHandPrefLocked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const levels = [
    { id: 'beginner', name: 'มือใหม่ (หน้าบ้าน/เบา)', dbValue: 'Beginner', color: 'bg-green-500', desc: 'มือใหม่หัดตี/ตบลูกได้' },
    { id: 'novice', name: 'ตีโต้ได้ (พอรู้จังหวะ)', dbValue: 'Novice', color: 'bg-sky-500', desc: 'เหนียว/เล่นเป็นเกม' },
    { id: 'intermediate', name: 'ระดับกลาง (รับ-รุกได้)', dbValue: 'Intermediate', color: 'bg-orange-500', desc: 'เหนียว/เล่นเป็นเกม' },
    { id: 'advanced', name: 'มือโปร (หนัก)', dbValue: 'Advanced', color: 'bg-red-500', desc: 'ตีหนัก/ม.ปลาย' },
  ];

  const handleSave = async () => {
    if (!session || !session.user) {
      alert('ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่');
      return;
    }

    if (!displayName.trim()) return alert('กรุณาระบุชื่อที่ใช้แสดงในระบบครับ');
    if (!gender) return alert('กรุณาระบุ "เพศ" ก่อนบันทึกข้อมูลครับ');
    if (!handPref) return alert('กรุณาระบุ "ข้างที่ถนัด" ก่อนบันทึกข้อมูลครับ');

    setIsSaving(true); 

    try {
      const { error } = await supabase
        .from('profiles') 
        .upsert({ 
          id: session.user.id,
          display_name: displayName.trim(),
          line_name: lineName || session.user.name, // สำรองชื่อ Line
          line_id: lineId.trim() || null,
          skill_level: selectedLevel,
          gender: gender,
          hand_preference: handPref,
          avatar_url: avatarUrl || session.user.image
        }); 

      if (error) throw error; 
      
      alert('✅ บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว!');
      setIsGenderLocked(true);
      setIsHandPrefLocked(true);
      router.push('/');
      
    } catch (error) {
      console.error('Error updating profile:', error.message);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };
  
  useEffect(() => {
    const fetchProfileData = async () => {
      if (session?.user?.id) {
        try {
          // ดึงข้อมูลทั้งหมดด้วย '*' ป้องกัน Error กรณีคอลัมน์ไม่ตรง
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (error) {
            console.error('Error fetching data:', error.message);
          }

          if (data) {
            setDisplayName(data.display_name || session.user.name || '');
            setLineName(data.line_name || session.user.name || '');
            setLineId(data.line_id || '');
            setAvatarUrl(data.avatar_url || session.user.image || '');
            if (data.skill_level) setSelectedLevel(data.skill_level);
            if (data.gender) {
              setGender(data.gender);
              setIsGenderLocked(true); 
            }
            if (data.hand_preference) {
              setHandPref(data.hand_preference);
              setIsHandPrefLocked(true);
            }
          } else {
            // ถ้ายังไม่มีโปรไฟล์ในระบบเลย ให้ดึงค่าเริ่มต้นจาก Line Session
            setDisplayName(session.user.name || '');
            setLineName(session.user.name || '');
            setAvatarUrl(session.user.image || '');
          }
          
        } catch (error) {
          console.error('Error:', error.message);
        } finally {
          setIsLoading(false); 
        }
      } else if (status === 'unauthenticated') {
        setIsLoading(false); 
      }
    };

    fetchProfileData();
  }, [session, status]);

  if (isLoading) {
    return <div className="text-center p-12 text-gray-500 font-sans">กำลังโหลดข้อมูลโปรไฟล์...</div>;
  }
    
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-3xl shadow-xl border border-gray-100 my-6 font-sans">
      
      {/* รูปโปรไฟล์ */}
      <div className="flex flex-col items-center mb-6">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt="Profile Avatar" 
            className="w-24 h-24 rounded-full shadow-md object-cover border-4 border-green-50"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center shadow-inner border-4 border-white">
            <span className="text-4xl">🏸</span>
          </div>
        )}
      </div>

      {/* ช่องแก้ไขชื่อแสดงผล & แสดงชื่อ Line สำรอง */}
      <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          ชื่อที่ใช้ในก๊วน (ชื่อเล่น / ฉายา) <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="เช่น กิ๊ก, นัท, บอมบ์"
          className="w-full p-3 bg-white border-2 border-gray-200 rounded-xl font-bold text-gray-800 focus:border-blue-500 outline-none transition-colors"
        />
        {lineName && (
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <span>💬 ชื่อใน LINE เดิม:</span> 
            <span className="font-semibold text-gray-600 truncate">{lineName}</span>
          </p>
        )}
      </div>

      {/* ช่องใส่ LINE ID */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          LINE ID (สำหรับให้เพื่อนติดต่อ)
        </label>
        <input
          type="text"
          value={lineId}
          onChange={(e) => setLineId(e.target.value)}
          placeholder="ไอดีไลน์ของคุณ (ถ้ามี)"
          className="w-full p-3 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-blue-500 outline-none transition-colors text-sm"
        />
      </div>

      {/* เพศ */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center justify-between">
          <span>เพศ <span className="text-red-500">*</span></span>
          {isGenderLocked && <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">🔒 ไม่สามารถเปลี่ยนได้</span>}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setGender('Male')}
            disabled={isGenderLocked}
            className={`py-3 rounded-xl font-bold border-2 transition-all ${
              gender === 'Male' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-400'
            } ${isGenderLocked ? 'opacity-70 cursor-not-allowed' : 'hover:border-blue-300'}`}
          >
            ชาย 👨
          </button>
          <button
            type="button"
            onClick={() => setGender('Female')}
            disabled={isGenderLocked}
            className={`py-3 rounded-xl font-bold border-2 transition-all ${
              gender === 'Female' ? 'bg-pink-50 border-pink-500 text-pink-700' : 'bg-white border-gray-200 text-gray-400'
            } ${isGenderLocked ? 'opacity-70 cursor-not-allowed' : 'hover:border-pink-300'}`}
          >
            หญิง 👩
          </button>
        </div>
      </div>

      {/* ข้างที่ถนัด */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center justify-between">
          <span>ข้างที่ถนัด <span className="text-red-500">*</span></span>
          {isHandPrefLocked && <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">🔒 ไม่สามารถเปลี่ยนได้</span>}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setHandPref('Left')}
            disabled={isHandPrefLocked}
            className={`py-3 rounded-xl font-bold border-2 transition-all ${
              handPref === 'Left' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-white border-gray-200 text-gray-400'
            } ${isHandPrefLocked ? 'opacity-70 cursor-not-allowed' : 'hover:border-orange-300'}`}
          >
            มือซ้าย 👈
          </button>
          <button
            type="button"
            onClick={() => setHandPref('Right')}
            disabled={isHandPrefLocked}
            className={`py-3 rounded-xl font-bold border-2 transition-all ${
              handPref === 'Right' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-white border-gray-200 text-gray-400'
            } ${isHandPrefLocked ? 'opacity-70 cursor-not-allowed' : 'hover:border-orange-300'}`}
          >
            มือขวา 👉
          </button>
        </div>
      </div>

      {/* ส่วนเลือกระดับฝีมือ */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-3">ระดับฝีมือของคุณ</label>
        <div className="grid grid-cols-1 gap-3">
          {levels.map((level) => (
            <button
              type="button"
              key={level.id}
              onClick={() => setSelectedLevel(level.dbValue)}
              className={`flex items-center p-4 rounded-[1.5rem] border-2 transition-all duration-300 ${
                selectedLevel === level.dbValue 
                  ? 'border-green-500 bg-green-50 shadow-sm' 
                  : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <div className={`w-12 h-12 rounded-full ${level.color} flex flex-shrink-0 items-center justify-center text-white mr-4 shadow-sm text-lg`}>
                🏸
              </div>
              
              <div className="text-left flex-grow">
                <div className="font-bold text-gray-800">{level.name}</div>
                <div className="text-[12px] text-gray-500 leading-tight">{level.desc}</div>
              </div>

              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                selectedLevel === level.dbValue ? 'border-green-500 bg-green-500' : 'border-gray-300'
              }`}>
                {selectedLevel === level.dbValue && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ปุ่มบันทึก */}
      <button 
        type="button"
        onClick={handleSave} 
        disabled={isSaving}
        className={`w-full mt-4 py-4 font-bold rounded-2xl transition-all shadow-lg active:scale-95 ${
          isSaving 
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
      </button>

    </div>
  );
};

export default ProfileLevel;
