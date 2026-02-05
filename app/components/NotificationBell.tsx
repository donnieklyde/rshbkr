'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Notification = {
    id: String
    content: String
    link?: String
    createdAt: String
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications')
            const data = await res.json()
            if (data.notifications) {
                setNotifications(data.notifications)
            }
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        // Initial fetch
        fetchNotifications()

        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [])

    const handleOpen = async () => {
        if (isOpen) {
            setIsOpen(false)
            return
        }

        setIsOpen(true)

        // Mark as read when opening (or maybe after a delay?)
        // For now, let's just mark them read locally instantly for UI, and sync to server
        if (notifications.length > 0) {
            await fetch('/api/notifications', { method: 'PATCH' })
            // Wait a moment then clear local count to assume they are read? 
            // Or typically we keep them in list but verify they are "read".
            // Implementation choice: clear the gold status immediately.
            setNotifications([]) // Simple approach: clear the "new" list locally
        }
    }

    const hasNew = notifications.length > 0

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={handleOpen}
                style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    color: hasNew ? '#ffd700' : '#888', // Gold if new, grey otherwise
                    textShadow: hasNew ? '0 0 10px #ffd700' : 'none',
                    transition: 'all 0.3s ease'
                }}
            >
                {hasNew ? '★' : '☆'}
            </button>

            {isOpen && (
                <div className="glass-panel" style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    width: '300px',
                    padding: '1rem',
                    zIndex: 100,
                    marginTop: '0.5rem'
                }}>
                    <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Notifications</h4>
                    {notifications.length === 0 ? (
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>No new notifications.</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                            {notifications.map((n: any) => (
                                <Link key={n.id} href={n.link || '#'} onClick={() => setIsOpen(false)}>
                                    <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                                        <p style={{ fontSize: '0.9rem', color: '#eee' }}>{n.content}</p>
                                        <span style={{ fontSize: '0.7rem', color: '#888' }}>
                                            {new Date(n.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
