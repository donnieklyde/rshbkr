import { Suspense } from 'react';
import { getSongs, getPlaylists } from '@/app/lib/db';
import MusicContent, { PlaylistWithTracks } from './MusicContent';

async function MusicPageData() {
  const [playlists, allSongs] = await Promise.all([getPlaylists(), getSongs()]);
  const playlistData: PlaylistWithTracks[] = playlists.map(p => ({
    ...p,
    tracks: allSongs.filter(s => s.playlist_id === p.id).map(s => ({
      id: s.id,
      title: s.title,
      file: s.blob_url
    }))
  }));
  return <MusicContent playlists={playlistData} />;
}

export default function MusicPage() {
  return (
    <Suspense fallback={<div className="page" style={{ textAlign: 'center', padding: '10rem', background: '#050505', minHeight: '100vh', color: '#fff' }}>...</div>}>
      <MusicPageData />
    </Suspense>
  );
}
