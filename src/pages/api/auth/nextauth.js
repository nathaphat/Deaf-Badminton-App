import NextAuth from "next-auth"
import LineProvider from "next-auth/providers/line"

export const authOptions = {
  providers: [
    LineProvider({
      clientId: process.env.LINE_CLIENT_ID,
      clientSecret: process.env.LINE_CLIENT_SECRET,
    }),
  ],
  // เมื่อล็อกอินเสร็จ จะให้เก็บข้อมูลไว้ใน Session
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)
