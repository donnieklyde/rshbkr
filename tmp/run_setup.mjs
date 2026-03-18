
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function setup() {
  try {
    console.log('Creating about_content table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS about_content (
        id TEXT PRIMARY KEY DEFAULT 'main',
        content TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Initializing about content...');
    await pool.query(`
      INSERT INTO about_content (id, content)
      VALUES ('main', 'RSHBKR is an underground artist and developer.')
      ON CONFLICT (id) DO NOTHING
    `);
    
    console.log('Setup COMPLETE');
  } catch (err) {
    console.error('Setup FAILED:', err.message);
  } finally {
    await pool.end();
  }
}

setup();
