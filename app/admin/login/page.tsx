
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/admin');
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#050505',
      color: '#fff',
      fontFamily: 'Bahnschrift, sans-serif'
    }}>
      <style>{`
        .login-box {
          background: #111;
          padding: 2.5rem;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          width: 100%;
          max-width: 360px;
          text-align: center;
        }
        .login-title {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .login-input {
          width: 100%;
          padding: 0.75rem;
          margin-bottom: 1rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          border-radius: 4px;
          outline: none;
        }
        .login-btn {
          width: 100%;
          padding: 0.75rem;
          background: #fff;
          color: #000;
          border: none;
          border-radius: 4px;
          font-weight: 700;
          cursor: pointer;
          text-transform: uppercase;
        }
        .error-msg {
          color: #ff4d4d;
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }
      `}</style>
      <div className="login-box">
        <h1 className="login-title">Admin Access</h1>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            className="login-input"
            placeholder="Enter password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Entering...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}
