import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-blue-600">
      <Link href="/" style={{ color: 'white', fontWeight: 'bold', textDecoration: 'none', fontSize: '1.2rem' }}>
        🏸 Deaf Badminton
      </Link>
      <div style={{ display: 'flex', gap: '15px' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none' }}>หน้าหลัก</Link>
        <Link href="/checkin" style={{ color: 'white', textDecoration: 'none' }}>เช็คอิน</Link>
        <Link href="/finance" style={{ color: 'white', textDecoration: 'none' }}>การเงิน</Link>
        <Link href="/profile" style={{ color: 'white', textDecoration: 'none' }}>profile</Link>
      </div>
    </nav>
  );
};

export default Navbar;
