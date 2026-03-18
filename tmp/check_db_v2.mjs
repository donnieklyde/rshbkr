
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    console.log('Connecting to:', process.env.POSTGRES_URL ? 'URL exists' : 'URL MISSING');
    const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    const tables = res.rows.map(r => r.table_name);
    console.log('Tables found:', tables);
    
    if (tables.includes('about_content')) {
      const columns = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'about_content'");
      console.log('about_content columns:', columns.rows);
      const rows = await pool.query("SELECT * FROM about_content");
      console.log('about_content rows:', rows.rows);
    } else {
      console.log('about_content table NOT FOUND');
    }
  } catch (err) {
    console.error('Database query failed:', err.message);
  } finally {
    await pool.end();
  }
}

check();
