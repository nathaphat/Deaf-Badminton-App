import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-blue-600 p-2 rounded-xl group-hover:scale-110 transition-transform shadow-lg shadow-blue-200">
            <span className="text-xl">🏸</span>
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            DEAF BADMINTON
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
          <NavLink href="/" label="หน้าหลัก" />
          <NavLink href="/checkin" label="เช็คอิน" />
          <NavLink href="/create-group" label="+ สร้างก๊วน" />
          <NavLink href="/finance" label="การเงิน" />
          <NavLink href="/profile" label="โปรไฟล์" isProfile />
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button className="p-2 text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

// แก้ไขตรงนี้: ลบ Type definitions ออกเพื่อให้รันใน JavaScript ปกติได้
const NavLink = ({ href, label, isProfile = false }) => (
  <Link 
    href={href} 
    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 
      ${isProfile 
        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-100' 
        : 'text-slate-600 hover:bg-white hover:text-blue-600 hover:shadow-sm'
      }`}
  >
    {label}
  </Link>
);

export default Navbar;
