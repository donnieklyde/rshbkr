
import { Pool } from 'pg';
import { NextResponse, NextRequest } from 'next/server';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

// GET: List all songs
export async function GET(request: NextRequest) {
  try {
    // Check auth
    const sessionCookie = request.cookies.get('admin_session')?.value;
    if (sessionCookie !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const songs = await pool.query(`
      SELECT s.*, p.title as playlist_title 
      FROM songs s 
      LEFT JOIN playlists p ON s.playlist_id = p.id 
      ORDER BY s.created_at DESC
    `);
    
    return NextResponse.json(songs.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 });
  }
}

// DELETE: Delete a song
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    // Check auth
    const sessionCookie = request.cookies.get('admin_session')?.value;
    if (sessionCookie !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Missing song ID' }, { status: 400 });
    }

    // Optional: Delete from Vercel Blob here if we had the URL, 
    // but typically we just remove from DB for now as Vercel Blob management 
    // is better handled if we store the full blob URL and use del().
    
    await pool.query('DELETE FROM songs WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete song' }, { status: 500 });
  }
}
