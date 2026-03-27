import { useSession, signIn } from "next-auth/react"
import { useState, useEffect } from 'react'
import { supabase } from '../logic/supabaseClient'

export default function Home() {
  const { data: session } = useSession()

  // 1. ถ้ายังไม่ได้ Login -> โชว์หน้าเขียวๆ มีปุ่ม LINE Login
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Deaf Badminton Thai</h1>
        <button 
          onClick={() => signIn('line')}
          className="bg-[#00B900] text-white px-8 py-3 rounded-full font-black shadow-lg hover:scale-105 transition"
        >
          LINE Login เพื่อดูโปรไฟล์
        </button>
        <p className="mt-4 text-gray-400 text-sm italic">Developing 🔵</p>
      </div>
    )
  }

  // 2. ถ้า Login แล้ว -> โชว์หน้า Dashboard (สถิติ)
  return (
    <div>
       {/* เอาโค้ด Dashboard + สถิติ ที่เราคุยกันตะกี้มาวางตรงนี้ทั้งหมด */}
       {/* ทั้งส่วน Profile Image, สถิติแมตช์, และประวัติ Series */}
       <p className="text-center text-xs text-gray-400 mt-10">My app by Kik</p>
    </div>
  )
}
