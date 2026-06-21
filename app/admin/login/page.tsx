'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const S = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#111111',
    padding: '1.5rem',
  } as React.CSSProperties,

  card: {
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '400px',
  } as React.CSSProperties,

  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '2rem',
  } as React.CSSProperties,

  logoBox: {
    width: '36px',
    height: '36px',
    border: '1px solid #D4AF37',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#D4AF37',
    fontSize: '1.1rem',
  } as React.CSSProperties,

  logoText: {
    fontSize: '0.7rem',
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
    color: '#D4AF37',
  } as React.CSSProperties,

  heading: {
    fontFamily: 'Georgia, serif',
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#ffffff',
    marginBottom: '0.5rem',
  } as React.CSSProperties,

  subheading: {
    fontSize: '0.8rem',
    color: '#666',
    marginBottom: '2rem',
    letterSpacing: '0.05em',
  } as React.CSSProperties,

  label: {
    display: 'block',
    fontSize: '0.7rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: '#888',
    marginBottom: '0.5rem',
    fontWeight: 500,
  } as React.CSSProperties,

  input: {
    width: '100%',
    background: '#111111',
    border: '1px solid #333',
    color: '#fff',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    outline: 'none',
    marginBottom: '1.25rem',
    transition: 'border-color 0.2s',
  } as React.CSSProperties,

  btn: {
    width: '100%',
    background: '#D4AF37',
    color: '#111111',
    border: 'none',
    padding: '0.875rem',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  } as React.CSSProperties,

  error: {
    background: 'rgba(220,38,38,0.1)',
    border: '1px solid rgba(220,38,38,0.3)',
    color: '#fca5a5',
    padding: '0.75rem 1rem',
    fontSize: '0.8rem',
    marginBottom: '1rem',
  } as React.CSSProperties,

  divider: {
    height: '1px',
    background: '#222',
    margin: '1.5rem 0',
  } as React.CSSProperties,

  note: {
    fontSize: '0.7rem',
    color: '#444',
    textAlign: 'center' as const,
    lineHeight: 1.6,
  } as React.CSSProperties,
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed.');
        return;
      }
      router.push('/admin/dashboard');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        {/* Logo */}
        <div style={S.logoRow}>
          <div style={S.logoBox}>⚖</div>
          <span style={S.logoText}>Admin Portal</span>
        </div>

        <h1 style={S.heading}>Sign In</h1>
        <p style={S.subheading}>Legal Consultation Dashboard</p>

        {error && <div style={S.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={S.label}>Admin Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            placeholder="Enter admin password"
            autoComplete="current-password"
            required
            style={S.input}
            onFocus={(e) => (e.target.style.borderColor = '#D4AF37')}
            onBlur={(e) => (e.target.style.borderColor = '#333')}
          />

          <button
            type="submit"
            disabled={loading || !password.trim()}
            style={{ ...S.btn, opacity: loading || !password.trim() ? 0.5 : 1 }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div style={S.divider} />
        <p style={S.note}>
          This portal is for authorised use only.<br />
          Set <code style={{ color: '#D4AF37' }}>ADMIN_PASSWORD</code> in your environment variables.
        </p>
      </div>
    </div>
  );
}
