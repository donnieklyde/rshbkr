
import { Pool } from 'pg';
import { NextResponse } from 'next/server';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

export async function POST(request: Request) {
  try {
    const { name, description, blobUrl } = await request.json();

    // Check auth
    const sessionCookie = request.headers.get('cookie')?.split(';').find(c => c.trim().startsWith('admin_session='))?.split('=')[1];
    if (sessionCookie !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = name.toLowerCase().replace(/\s+/g, '-');

    await pool.query(
      'INSERT INTO software (id, name, description, blob_url) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET name = $2, description = $3, blob_url = $4',
      [id, name, description, blobUrl]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
  }
}
