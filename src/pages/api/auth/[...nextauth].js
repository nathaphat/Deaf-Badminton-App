import NextAuth from "next-auth"
import LineProvider from "next-auth/providers/line"
import { supabase } from "../../../logic/supabaseClient"

export const authOptions = {
  providers: [
    LineProvider({
      clientId: process.env.LINE_CLIENT_ID,
      clientSecret: process.env.LINE_CLIENT_SECRET,
    }),
  ],
  // เมื่อล็อกอินเสร็จ จะให้เก็บข้อมูลไว้ใน Session
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === "line") {
        console.log("LINE User ID:", user.id);
        console.log("LINE User Name:", user.name);
        
        // 1. ของเดิม: บันทึก/อัปเดตข้อมูลลง profiles (ใช้ upsert จะได้ไม่ Error เวลาคนเดิมล็อกอินซ้ำ)
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([
            { 
              id: user.id, // ใช้ id เป็น Primary Key ตามปกติ
              display_name: user.name || 'No Name',
              avatar_url: user.image || ''
            }
          ]);
    
        if (profileError) {
          console.log("❌ Supabase Profile Error:", profileError.message);
        }

        // 📝 2. ส่วนที่เพิ่มใหม่: บันทึกประวัติการเข้าระบบลงตาราง login_logs
        const { error: logError } = await supabase
          .from('login_logs')
          .insert([
            { 
              line_id: user.id, 
              display_name: user.name 
            }
          ]);

        if (logError) {
          console.log("❌ Supabase Login Log Error:", logError.message);
        } else {
          console.log("✅ Login Log Saved Success!");
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub;

        // 🔄 อัปเดตรูปล่าสุดจาก LINE ลงตาราง profiles ทันที
        if (token.picture) {
          await supabase
            .from("profiles")
            .update({ 
              avatar_url: token.picture,
              line_name: session.user.name 
            })
            .eq("id", token.sub);
        }
      }
      return session;
    },
    async jwt({ token, user, profile }) {
      if (user) {
        token.sub = user.id;
      }
      if (profile?.pictureUrl) {
        token.picture = profile.pictureUrl;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)
