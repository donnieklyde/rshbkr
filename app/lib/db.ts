
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false // Necessary for many managed postgres providers
  }
});

// Helper for sql-like templates using pg pool
async function query<T>(text: string, params: any[] = []) {
  const { rows } = await pool.query(text, params);
  return rows as T[];
}

export interface Playlist {
  id: string;
  title: string;
  created_at: Date;
}

export interface Song {
  id: string;
  title: string;
  blob_url: string;
  category: string;
  playlist_id?: string;
  created_at: Date;
}

export interface Software {
  id: string;
  name: string;
  description: string;
  blob_url: string;
  created_at: Date;
}

export async function getPlaylists() {
  try {
    return await query<Playlist>('SELECT * FROM playlists ORDER BY created_at ASC');
  } catch (err) {
    console.error('Error fetching playlists:', err);
    throw err;
  }
}

export async function getSongs(playlistId?: string) {
  try {
    if (playlistId) {
      return await query<Song>('SELECT * FROM songs WHERE playlist_id = $1 ORDER BY created_at ASC', [playlistId]);
    }
    return await query<Song>('SELECT * FROM songs ORDER BY created_at ASC');
  } catch (err) {
    console.error('Error fetching songs:', err);
    throw err;
  }
}


export async function getSoftware() {
  try {
    return await query<Software>('SELECT * FROM software ORDER BY created_at ASC');
  } catch (err) {
    console.error('Error fetching software:', err);
    throw err;
  }
}

export async function getAboutContent() {
  try {
    const rows = await query<{ content: string }>('SELECT content FROM about_content WHERE id = \'main\'');
    return rows[0]?.content || 'RSHBKR is an underground artist and developer.';
  } catch (err) {
    console.error('Error fetching about content:', err);
    return 'RSHBKR is an underground artist and developer.';
  }
}
