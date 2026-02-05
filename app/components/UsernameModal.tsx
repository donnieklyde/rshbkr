'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UsernameModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/user/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Something went wrong')
            } else {
                // Success! Refresh the page to update session and UI
                window.location.reload()
            }
        } catch (err) {
            setError('Failed to submit. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }}>
            <div className="glass-panel" style={{ width: '400px', maxWidth: '90%', padding: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Choose your identity.</h2>
                <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    This is how you will be known forever. Choose wisely.
                </p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="username"
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: '#1a1a1a',
                            border: '1px solid #333',
                            color: '#fff',
                            borderRadius: '4px',
                            marginBottom: '1rem',
                            outline: 'none'
                        }}
                    />

                    {error && <p style={{ color: '#f00', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>}

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? '...' : 'Confirm'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
