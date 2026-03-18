
import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  const { rows: playlists } = await pool.query('SELECT * FROM playlists');
  const { rows: songs } = await pool.query('SELECT playlist_id, count(*) FROM songs GROUP BY playlist_id');
  
  console.log(JSON.stringify({ playlists, songs }, null, 2));
  process.exit(0);
}

check().catch(console.error);
