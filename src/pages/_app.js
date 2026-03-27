import Navbar from '../components/Navbar';
import '../styles/globals.css'; // ตรวจสอบว่ามีไฟล์นี้อยู่ในโปรเจกต์ไหม

function MyApp({ Component, pageProps }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4">
        <Component {...pageProps} />
      </main>
    </div>
  );
}

export default MyApp;
