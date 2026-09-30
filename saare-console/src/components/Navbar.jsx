// saare-console/src/components/Navbar.jsx
export default function Navbar() {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', background: '#0b0f19', borderBottom: '1px solid #1e293b' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src="/assets/logo-saare.svg" alt="S.A.A.R.E. Logo" style={{ height: '32px', width: 'auto' }} />
        <span style={{ fontWeight: '800', color: '#fff', fontSize: '0.9rem', letterSpacing: '1px' }}>
          S.A.A.R.E. <span style={{ color: '#38bdf8' }}>ENTERPRISE</span>
        </span>
      </div>
    </nav>
  );
}