import { auth } from "@/auth"
import { SignIn, SignOut } from "./components/AuthButtons"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function Home() {
  const session = await auth()

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: '4rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontWeight: 800, letterSpacing: '-0.05em' }}>RSHBKR</h1>
        <div>
          {session ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: '#888' }}>@{session.user?.name}</span>
              <SignOut />
            </div>
          ) : (
            <SignIn />
          )}
        </div>
      </header>

      <main>
        {!session ? (
          <section style={{ textAlign: 'center', marginTop: '4rem' }}>
            <h2 style={{ fontSize: '3rem', lineHeight: 1.1, marginBottom: '2rem', background: 'linear-gradient(to bottom, #fff, #666)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              music<br />for not giving fucks<br />in the ass
            </h2>
            <p style={{ color: '#888', marginBottom: '2rem', fontSize: '1.2rem' }}>
              alles was sie sagen kann und wird gegen sie verwendet
            </p>
          </section>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Feed</h2>
              <a href="/upload" className="btn-primary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>+ Upload</a>
            </div>

            <TrackList />
          </div>
        )}
      </main>
    </div>
  );
}

async function TrackList() {
  const tracks = await prisma.track.findMany({
    orderBy: { createdAt: 'desc' },
    include: { artist: true, ratings: true }
  })

  if (tracks.length === 0) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', color: '#444' }}>
        <p>No tracks yet. Be the first.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {tracks.map(track => {
        // Calculate average rating
        const avg = track.ratings.length > 0
          ? (track.ratings.reduce((acc, r) => acc + ((r.feelingStart || 0) + (r.ideaIntent || 0) + (r.soundTexture || 0) + (r.melodyHarmony || 0) + (r.rhythmGroove || 0) + (r.lyrics || 0) + (r.originality || 0) + (r.commitment || 0) + (r.context || 0) + (r.aftertaste || 0)) / 10, 0) / track.ratings.length).toFixed(1)
          : '-';

        return (
          <Link key={track.id} href={`/track/${track.id}`}>
            <div className="glass-panel" style={{ cursor: 'pointer', transition: 'border-color 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{track.title}</h3>
                <p style={{ color: '#888', fontSize: '0.9rem' }}>@{track.artist.username || track.artist.name}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{avg}</span>
                <span style={{ fontSize: '0.8rem', color: '#666', display: 'block' }}>score</span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
