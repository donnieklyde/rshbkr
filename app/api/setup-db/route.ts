
import { Pool } from 'pg';
import { NextResponse } from 'next/server';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

export async function GET() {
  try {
    // 1. Create Playlists table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS playlists (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Create Songs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS songs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        blob_url TEXT NOT NULL,
        category TEXT,
        playlist_id TEXT REFERENCES playlists(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Create Software table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS software (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        blob_url TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    return NextResponse.json({ message: 'Database tables initialized successfully' });
  } catch (error) {
    console.error('Database setup failed:', error);
    return NextResponse.json({ error: 'Database setup failed' }, { status: 500 });
  }
}
