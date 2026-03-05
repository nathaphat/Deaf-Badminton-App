import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// ตั้งค่า Supabase Client (แนะนำให้ใส่ใน .env.local)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request, { params }) {
  const userId = params.id; // ดึง ID จาก URL

  try {
    // 1. ดึงข้อมูลสถิติจาก View player_rankings
    const { data: profile, error } = await supabase
      .from('player_rankings')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    // 2. ดึงประวัติการแข่ง 5 นัดล่าสุด (เพิ่มเติม)
    const { data: matches, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .or(`team_a_p1.eq.${userId},team_a_p2.eq.${userId},team_b_p1.eq.${userId},team_b_p2.eq.${userId}`)
      .order('played_at', { ascending: false })
      .limit(5);

    if (matchError) throw matchError;

    return NextResponse.json({ profile, matches });
    
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
