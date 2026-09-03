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
        // ลองส่งแค่ user_line_id อย่างเดียวดูก่อนเพื่อทดสอบ
        const { data, error } = await supabase
          .from('profiles')
          .insert([
            { 
              user_line_id: user.id, 
              display_name: user.name || 'No Name',
              avatar_url: user.image || ''
            }
          ]);
    
        if (error) {
          // บรรทัดนี้จะพ่น Error จริงๆ ออกมาใน Vercel Logs
          console.log("❌ Supabase Insert Error:", error.message);
          console.log("❌ Error Code:", error.code);
        } else {
          console.log("✅ Insert Success!");
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
