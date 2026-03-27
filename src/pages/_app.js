import '../styles/globals.css';
import { SessionProvider } from "next-auth/react"
import Navbar from '../components/Navbar';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    // เพิ่ม SessionProvider ครอบไว้แบบนี้ครับ
    <SessionProvider session={session}>
      <div className="min-h-screen bg-gray-50 text-black">
        <Navbar />
        <main className="max-w-4xl mx-auto p-4">
          <Component {...pageProps} />
        </main>
      </div>
    </SessionProvider>
  )
}

export default MyApp;
