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
