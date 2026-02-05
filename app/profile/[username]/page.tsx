import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from 'next/link'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
    const { username } = await params
    const user = await prisma.user.findUnique({ where: { username } })

    if (!user) return { title: 'Not Found' }

    return {
        title: `${user.username} | RSHBKR`,
        description: `Check out tracks and critiques by ${user.username} on RSHBKR.`,
        openGraph: {
            title: `${user.username} | RSHBKR`,
            description: `Check out tracks and critiques by ${user.username}`,
            type: 'profile',
            username: user.username || undefined,
        }
    }
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params

    // Decode username just in case
    const decodedUsername = decodeURIComponent(username)

    const user = await prisma.user.findUnique({
        where: { username: decodedUsername },
        include: {
            tracks: {
                orderBy: { createdAt: 'desc' },
                include: { ratings: true }
            }
        }
    })

    if (!user) return notFound()

    return (
        <div className="container" style={{ paddingTop: '4rem' }}>
            <div className="glass-panel" style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <div style={{
                    width: '100px', height: '100px',
                    borderRadius: '50%', background: '#333',
                    margin: '0 auto 1rem', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2rem', fontWeight: 'bold'
                }}>
                    {user.image ? (
                        <img src={user.image} alt={user.username || "User"} style={{ width: '100%', height: '100%' }} />
                    ) : (
                        (user.username?.[0] || "U").toUpperCase()
                    )}
                </div>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>@{user.username}</h1>
                <p style={{ color: '#888' }}>{user.tracks.length} Tracks</p>
            </div>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                Discography
            </h2>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {user.tracks.map(track => {
                    // Calculate average rating
                    const avg = track.ratings.length > 0
                        ? (track.ratings.reduce((acc, r) => acc + ((r.feelingStart || 0) + (r.ideaIntent || 0) + (r.soundTexture || 0) + (r.melodyHarmony || 0) + (r.rhythmGroove || 0) + (r.lyrics || 0) + (r.originality || 0) + (r.commitment || 0) + (r.context || 0) + (r.aftertaste || 0)) / 10, 0) / track.ratings.length).toFixed(1)
                        : '-';

                    return (
                        <Link key={track.id} href={`/track/${track.id}`}>
                            <div className="glass-panel" style={{
                                cursor: 'pointer', transition: 'border-color 0.2s',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{track.title}</h3>
                                    <p style={{ color: '#888', fontSize: '0.8rem' }}>
                                        {new Date(track.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{avg}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#666', display: 'block' }}>score</span>
                                </div>
                            </div>
                        </Link>
                    )
                })}
                {user.tracks.length === 0 && (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>Silence, for now.</p>
                )}
            </div>
        </div>
    )
}
