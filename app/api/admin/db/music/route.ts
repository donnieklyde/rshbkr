
import { Pool } from 'pg';
import { NextResponse, NextRequest } from 'next/server';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

export async function POST(request: NextRequest) {
  try {
    const { title, blobUrl, playlistId } = await request.json();

    // Check auth
    const sessionCookie = request.cookies.get('admin_session')?.value;
    if (sessionCookie !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Normalize playlist identifier
    const normalizedPlaylistId = playlistId.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Ensure playlist exists
    await pool.query('INSERT INTO playlists (id, title) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING', [normalizedPlaylistId, playlistId]);

    const id = `${normalizedPlaylistId}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    await pool.query(
      'INSERT INTO songs (id, title, blob_url, playlist_id) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET title = $2, blob_url = $3',
      [id, title, blobUrl, normalizedPlaylistId]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
  }
}
