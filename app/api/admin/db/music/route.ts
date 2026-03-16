
import { Pool } from 'pg';
import { NextResponse } from 'next/server';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

export async function POST(request: Request) {
  try {
    const { title, blobUrl, playlistId } = await request.json();

    // Check auth
    const sessionCookie = request.headers.get('cookie')?.split(';').find(c => c.trim().startsWith('admin_session='))?.split('=')[1];
    if (sessionCookie !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure playlist exists
    await pool.query('INSERT INTO playlists (id, title) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING', [playlistId, playlistId]);

    const id = `${playlistId}-${title.toLowerCase().replace(/\s+/g, '-')}`;

    await pool.query(
      'INSERT INTO songs (id, title, blob_url, playlist_id) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET title = $2, blob_url = $3',
      [id, title, blobUrl, playlistId]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
  }
}
