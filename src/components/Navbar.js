import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Name */}
          <div className="flex items-center">
            <Link href="/" className="font-bold text-xl flex items-center gap-2">
              🏸 <span className="hidden md:inline">Deaf Badminton</span>
            </Link>
          </div>

          {/* Menu Links */}
          <div className="flex space-x-4 text-sm font-medium">
            <Link href="/" className="hover:bg-blue-700 px-3 py-2 rounded-md transition">
              หน้าหลัก
            </Link>
            <Link href="/checkin" className="hover:bg-blue-700 px-3 py-2 rounded-md transition">
              เช็คอิน
            </Link>
            <Link href="/finance" className="hover:bg-blue-700 px-3 py-2 rounded-md transition">
              การเงิน
            </Link>
            <Link href="/admin" className="hover:bg-blue-700 px-3 py-2 rounded-md transition">
              แอดมิน
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
