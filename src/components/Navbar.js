import Link from 'next/link';

const Navbar = () => {
  return (
    <nav style={{
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
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
