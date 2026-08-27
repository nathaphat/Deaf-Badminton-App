import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react'; 
import { supabase } from '../logic/supabaseClient'; 

const ProfileLevel = () => {
  const { data: session, status } = useSession();

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
    { id: 'intermediate', name: 'ระดับกลาง', dbValue: 'Intermediate', color: 'bg-blue-500', desc: 'เหนียว/เล่นเป็นเกม' },
    { id: 'advanced', name: 'มือโปร (หนัก)', dbValue: 'Advanced', color: 'bg-red-500', desc: 'ตีหนัก/ม.ปลาย' },
  ];

  const handleSave = async () => {

    if (!session || !session.user) {
      alert('ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่');
      return;
    }

    setIsSaving(true); 

    try {
      console.log('กำลังส่งค่าไปฐานข้อมูล:', selectedLevel); 

      const { data, error } = await supabase
        .from('profiles') 
        .update({ 
          skill_level: selectedLevel,
          gender: gender,
          hand_preference: handPref
        })
        .eq('id', session.user.id); 

      if (error) {
        throw error; 
      }
      
      alert('บันทึกระดับฝีมือเรียบร้อยแล้ว!');
      
      if (gender) setIsGenderLocked(true);
      if (handPref) setIsHandPrefLocked(true);
      
    } catch (error) {
      console.error('Error updating profile:', error.message);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };
  
  useEffect(() => {
    const fetchProfileData = async () => {
      // ตรวจสอบว่าโหลด Session เสร็จแล้วและมี user id
      if (session?.user?.id) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('skill_level, avatar_url, gender, hand_preference')
            .eq('id', session.user.id)
            .single(); // คาดหวังข้อมูลแค่แถวเดียว

          if (error) {
            console.error('Error fetching data:', error);
            return;
          }

          if (data) {
            if (data.avatar_url) setAvatarUrl(data.avatar_url);
            if (data.skill_level) setSelectedLevel(data.skill_level);
            if (data.gender) {
              setGender(data.gender);
              setIsGenderLocked(true); 
            }
            if (data.hand_preference) {
              setHandPref(data.hand_preference);
              setIsHandPrefLocked(true);
            }
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
    
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-3xl shadow-xl border border-gray-100">
      
      {/* ส่วนแสดงรูปโปรไฟล์ (Avatar) */}
      <div className="flex flex-col items-center mb-8">
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
        <h2 className="text-xl font-black text-gray-800 mt-4">
          {session?.user?.name || 'ผู้ใช้งานแบดมินตัน'}
        </h2>
      </div>

      {/* เพศ */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center justify-between">
          <span>เพศ</span>
          {isGenderLocked && <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">🔒 ไม่สามารถเปลี่ยนได้</span>}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setGender('Male')}
            disabled={isGenderLocked}
            className={`py-3 rounded-xl font-bold border-2 transition-all ${
              gender === 'Male' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-400'
            } ${isGenderLocked ? 'opacity-70 cursor-not-allowed' : 'hover:border-blue-300'}`}
          >
            ชาย 👨
          </button>
          <button
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

      {/* มือที่ถนัด */}
      <div className="mb-8">
        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center justify-between">
          <span>ข้างที่ถนัด</span>
          {isHandPrefLocked && <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">🔒 ไม่สามารถเปลี่ยนได้</span>}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setHandPref('Left')}
            disabled={isHandPrefLocked}
            className={`py-3 rounded-xl font-bold border-2 transition-all ${
              handPref === 'Left' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-white border-gray-200 text-gray-400'
            } ${isHandPrefLocked ? 'opacity-70 cursor-not-allowed' : 'hover:border-orange-300'}`}
          >
            มือซ้าย 👈
          </button>
          <button
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
      <div className="mb-2">
        <label className="block text-sm font-bold text-gray-700 mb-3">ระดับฝีมือของคุณ</label>
        <div className="grid grid-cols-1 gap-3">
          {levels.map((level) => (
            <button
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
        onClick={handleSave} 
        disabled={isSaving}
        className={`w-full mt-8 py-4 font-bold rounded-2xl transition-all shadow-lg active:scale-95 ${
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
