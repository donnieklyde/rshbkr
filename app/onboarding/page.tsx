'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/user/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Something went wrong');
            } else {
                // Force a reload or redirect to allow session to update
                // NextAuth session update might require a triggering event or simple reload
                window.location.href = '/';
            }
        } catch (err) {
            setError('Failed to submit. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#0a0a0a',
            color: '#fff',
            fontFamily: 'sans-serif'
        }}>
            <div style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Welcome.</h1>
                <p style={{ marginBottom: '2rem', color: '#888' }}>Choose your identity.</p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: '#1a1a1a',
                                border: '1px solid #333',
                                color: '#fff',
                                borderRadius: '4px',
                                fontSize: '1rem'
                            }}
                            placeholder="e.g. noise_architect"
                        />
                    </div>

                    {error && <p style={{ color: '#ff4444', marginBottom: '1rem' }}>{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: '#fff',
                            color: '#000',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Claiming...' : 'Enter'}
                    </button>
                </form>
            </div>
        </div>
    );
}
