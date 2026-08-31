import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { supabase } from '../logic/supabaseClient';

// ปรับ NavLink ให้รับ onClick ได้ (เพื่อปิดเมนูเวลากดเลือกลิงก์ในมือถือ)
const NavLink = ({ href, label, onClick }) => (
  <Link 
    href={href} 
    onClick={onClick}
    className="px-4 py-2 hover:bg-gray-200 rounded-lg text-gray-700 font-medium w-full text-center md:w-auto"
  >
    {label}
  </Link>
);

const Navbar = () => {
  const { data: session } = useSession();
  const [canCreateGroup, setCanCreateGroup] = useState(true);
  
  // 1. เพิ่ม State สำหรับเปิด/ปิดเมนูมือถือ
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 

  useEffect(() => {
    const checkGroupQuota = async () => {
      if (session?.user?.id) {
        try {
          const { count, error } = await supabase
            .from('badminton_groups')
            .select('*', { count: 'exact', head: true })
            .eq('organizer_id', session.user.id);

          if (count > 0) {
            setCanCreateGroup(false);
          }
        } catch (err) {
          console.error("Error:", err.message);
        }
      }
    };
    checkGroupQuota();
  }, [session]);

  // ฟังก์ชันสำหรับปิดเมนูมือถือเวลาที่ผู้ใช้กดลิงก์แล้ว
  const handleCloseMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="flex justify-between items-center">
        {/* โลโก้ */}
        <Link href="/">
          <span className="font-black text-xl text-blue-600 cursor-pointer flex items-center gap-2 uppercase">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm">🏸</div>
            Deaf Badminton
          </span>
        </Link>

        {/* 2. ปุ่มแฮมเบอร์เกอร์สำหรับมือถือ */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-gray-600 focus:outline-none hover:bg-gray-100 rounded-lg"
        >
          {/* เปลี่ยนไอคอน ขีดสามขีด / กากบาท ตามสถานะ */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> // ไอคอน ✕
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /> // ไอคอน ☰
            )}
          </svg>
        </button>

        {/* 3. เมนูสำหรับจอคอม (Desktop) จะซ่อนในมือถือ */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
          <NavLink href="/" label="หน้าหลัก" />
          <NavLink href="/checkin" label="เช็คอิน" />
          <NavLink href="/members" label="👥 สมาชิก"/>
          {canCreateGroup ? (
            <NavLink href="/create-group" label="+ สร้างก๊วน" />
          ) : (
            <NavLink href="/my-group" label="👑 ก๊วนของฉัน" />
          )}
          <NavLink href="/finance" label="การเงิน" />
          <NavLink href="/profile" label="โปรไฟล์" />
        </div>
      </div>

      {/* 4. เมนูสำหรับจอมือถือ (Mobile Dropdown) จะแสดงก็ต่อเมื่อ isMobileMenuOpen เป็น true */}
      {isMobileMenuOpen && (
        <div className="md:hidden flex flex-col items-center gap-2 mt-4 bg-slate-50 p-4 rounded-2xl border border-gray-100 shadow-inner animation-fade-in">
          <NavLink href="/" label="หน้าหลัก" onClick={handleCloseMenu} />
          <NavLink href="/checkin" label="เช็คอิน" onClick={handleCloseMenu} />
          <NavLink href="/members" label="👥 สมาชิก" onClick={handleCloseMenu} />
          {canCreateGroup ? (
            <NavLink href="/create-group" label="+ สร้างก๊วน" onClick={handleCloseMenu} />
          ) : (
            <NavLink href="/my-group" label="👑 ก๊วนของฉัน" onClick={handleCloseMenu} />
          )}
          <NavLink href="/finance" label="การเงิน" onClick={handleCloseMenu} />
          <NavLink href="/profile" label="โปรไฟล์" onClick={handleCloseMenu} />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
