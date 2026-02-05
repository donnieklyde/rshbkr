import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import RatingForm from "@/app/components/RatingForm"
import RatingDisplay from "@/app/components/RatingDisplay"

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

    return (
        <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
            <a href="/" style={{ color: '#888', marginBottom: '2rem', display: 'inline-block' }}>← Back to Feed</a>

            <div className="glass-panel" style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{track.title}</h1>
                <p style={{ color: '#888', marginBottom: '2rem' }}>by @{track.artist.username || track.artist.name}</p>

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
                                    <span style={{ fontWeight: 'bold' }}>@{r.user.username || 'user'}</span>
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
