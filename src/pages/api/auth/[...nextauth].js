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
    async signIn({ user, account, profile }) {
      console.log("LINE User ID:", user.id); // ดูใน Logs ว่า ID มาไหม
      if (account.provider === "line") {
        try {
          // 1. ลองหาดูว่ามี user_line_id นี้ในตาราง profiles หรือยัง
          const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_line_id', user.id) // user.id ตรงนี้คือ ID จาก LINE
            .single();
    
          if (existingProfile) {
            // 2. ถ้ามีแล้ว -> อัปเดตข้อมูล ชื่อ และ รูป
            await supabase
              .from('profiles')
              .update({ 
                display_name: user.name, 
                avatar_url: user.image,
                updated_at: new Date()
              })
              .eq('user_line_id', user.id);
          } else {
            // 3. ถ้ายังไม่มี -> สร้างแถวใหม่ (id จะถูกเจนเป็น uuid ให้อัตโนมัติโดย Supabase)
            await supabase
              .from('profiles')
              .insert([{ 
                user_line_id: user.id, 
                display_name: user.name, 
                avatar_url: user.image 
              }]);
          }
        } catch (err) {
          console.error("❌ Profile Sync Error:", err.message);
        }
      }
      return true;
    },
    async signInxx01({ user, account, profile }) {
      if (account.provider === "line") {
        const { data, error } = await supabase
          .from('profiles')
          .upsert({ 
            id: user.id, // ID จาก LINE/NextAuth
            display_name: user.name, 
            avatar_url: user.image,
            updated_at: new Date()
          }, { onConflict: 'id' }) // ถ้ามี ID เดิมอยู่แล้วให้ Update ถ้าไม่มีให้ Insert ใหม่

        if (error) {
          console.error("Error saving profile:", error)
          console.error("Supabase Error Details:", JSON.stringify(error));
          return false // ถ้าบันทึกไม่ได้ จะไม่ให้ Login เข้าเครื่อง
        }
      }
      return true
    },
    async session({ session, token }) {
      session.user.id = token.sub;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)
