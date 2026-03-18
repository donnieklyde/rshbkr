
import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function fix() {
  console.log('Merging duplicate playlists...');
  
  // 1. Find all playlists that would result in the same normalized ID
  const { rows: playlists } = await pool.query('SELECT * FROM playlists');
  
  for (const p of playlists) {
    const normalizedId = p.id.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    if (normalizedId !== p.id) {
      console.log(`Merging ${p.id} into ${normalizedId}`);
      
      // Ensure normalized playlist exists
      await pool.query('INSERT INTO playlists (id, title) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING', [normalizedId, p.title]);
      
      // Move songs
      await pool.query('UPDATE songs SET playlist_id = $1 WHERE playlist_id = $2', [normalizedId, p.id]);
      
      // Delete old playlist
      await pool.query('DELETE FROM playlists WHERE id = $1', [p.id]);
    }
  }

  console.log('Cleanup complete.');
  process.exit(0);
}

fix().catch(console.error);
