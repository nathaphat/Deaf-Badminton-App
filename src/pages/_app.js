import Navbar from '../components/Navbar'; // Import เข้ามา
import '../styles/globals.css'; // ไฟล์ CSS ของคุณ

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Navbar /> {/* วางไว้ตรงนี้ เพื่อให้โผล่ทุกหน้า */}
      <main className="min-h-screen bg-gray-50">
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default MyApp;
