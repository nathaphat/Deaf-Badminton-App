import Navbar from '../components/Navbar';

function MyApp({ Component, pageProps }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-column">
      <Navbar />
      
      <main className="max-w-4xl mx-auto p-4 flex-grow">
        <Component {...pageProps} />
      </main>

      {/* ย้ายมาไว้ข้างล่างสุด จะดูเป็นระเบียบกว่าครับ */}
      <footer className="text-center p-4 text-gray-500 text-sm">
        My app by Kik
      </footer>
    </div>
  );
}

export default MyApp;
