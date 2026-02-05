import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import RatingForm from "@/app/components/RatingForm"
import RatingDisplay from "@/app/components/RatingDisplay"
import Link from "next/link"
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
    const track = await prisma.track.findUnique({
        where: { id },
        include: { artist: true }
    })

    if (!track) {
        return {
            title: 'Not Found',
        }
    }

    return {
        title: track.title,
        description: track.description || `Listen to ${track.title} by ${track.artist.username || track.artist.name} on RSHBKR.`,
        openGraph: {
            title: `${track.title} | RSHBKR`,
            description: track.description || `Listen to ${track.title} by ${track.artist.username || track.artist.name}`,
            type: 'music.song',
            audio: track.fileUrl,
            images: ['/og-image.jpg'], // Ideally dynamic, but static for now
        },
    }
}

export default async function TrackPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await auth()

    const track = await prisma.track.findUnique({
        where: { id },
        include: {
            artist: true,
            ratings: {
                include: { user: true },
                orderBy: { createdAt: 'desc' }
            }
        }
    })

    if (!track) return notFound()

    const userRating = session ? track.ratings.find(r => r.userId === session.user?.id) : null;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'MusicRecording',
        name: track.title,
        url: `https://rshbkr.com/track/${track.id}`,
        description: track.description,
        byArtist: {
            '@type': 'MusicGroup',
            name: track.artist.username || track.artist.name,
            url: `https://rshbkr.com/profile/${track.artist.username}`
        },
        audio: track.fileUrl,
        datePublished: track.createdAt.toISOString(),
        aggregateRating: track.ratings.length > 0 ? {
            '@type': 'AggregateRating',
            ratingValue: (track.ratings.reduce((acc, r) => acc + ((r.feelingStart || 0) + (r.ideaIntent || 0) + (r.soundTexture || 0) + (r.melodyHarmony || 0) + (r.rhythmGroove || 0) + (r.lyrics || 0) + (r.originality || 0) + (r.commitment || 0) + (r.context || 0) + (r.aftertaste || 0)) / 10, 0) / track.ratings.length).toFixed(1),
            reviewCount: track.ratings.length
        } : undefined
    }

    return (
        <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <a href="/" style={{ color: '#888', marginBottom: '2rem', display: 'inline-block' }}>← Back to Feed</a>

            <div className="glass-panel" style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{track.title}</h1>
                <Link href={`/profile/${track.artist.username}`} style={{ color: '#888', marginBottom: '2rem', display: 'inline-block' }}>
                    by @{track.artist.username || track.artist.name}
                </Link>

                {track.description && (
                    <div style={{ marginBottom: '2rem', fontStyle: 'italic', borderLeft: '2px solid #333', paddingLeft: '1rem', color: '#ccc' }}>
                        "{track.description}"
                    </div>
                )}

                <div style={{ background: '#000', borderRadius: '8px', padding: '1rem' }}>
                    <audio controls src={track.fileUrl} style={{ width: '100%', outline: 'none' }} />
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <RatingDisplay ratings={track.ratings} />
                </div>
            </div>

            {/* Comments / Community Ratings section */}
            <div style={{ marginBottom: '4rem' }}>
                <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Critique</h3>
                {track.ratings.length === 0 ? (
                    <p style={{ color: '#666' }}>No voices yet.</p>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {track.ratings.map(r => (
                            <div key={r.id} style={{ background: '#111', padding: '1rem', borderRadius: '8px', border: '1px solid #222' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <Link href={`/profile/${r.user.username}`} style={{ fontWeight: 'bold' }}>
                                        @{r.user.username || 'user'}
                                    </Link>
                                    <span style={{ color: '#888', fontSize: '0.8rem' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#ccc', marginBottom: '0.5rem' }}>
                                    {r.summary || <span style={{ fontStyle: 'italic', color: '#666' }}>No comment</span>}
                                </div>
                                {/* Could visualize their specific rating breakdown here if desired, kept simple for now */}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {session ? (
                <RatingForm trackId={track.id} initialRating={userRating} />
            ) : (
                <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed #333', borderRadius: '8px' }}>
                    <p>Log in to rate this track.</p>
                </div>
            )}
        </div>
    )
}
