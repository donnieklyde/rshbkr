'use client'

import Link from 'next/link'
import { useState } from 'react'
import UsernameModal from './UsernameModal'

export default function UserIdentity({ user }: { user: any }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const hasUsername = user?.username && user?.isOnboarded

    if (hasUsername) {
        return (
            <Link href={`/profile/${user.username}`} style={{ color: '#888' }}>
                @{user.username || user.name}
            </Link>
        )
    }

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ffd700', // Gold to indicate action needed? Or just white/grey
                    cursor: 'pointer',
                    fontSize: '1rem',
                    textDecoration: 'underline'
                }}
            >
                {user.name || 'Set Username'}
            </button>

            <UsernameModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    )
}
