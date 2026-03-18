
import { Pool } from 'pg';
import { NextResponse, NextRequest } from 'next/server';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});


export async function GET(request: NextRequest) {
  try {
    // Check auth
    const sessionCookie = request.cookies.get('admin_session')?.value;
    if (sessionCookie !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const software = await pool.query('SELECT * FROM software ORDER BY created_at DESC');
    return NextResponse.json(software.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch software' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, blobUrl } = await request.json();

    // Check auth
    const sessionCookie = request.cookies.get('admin_session')?.value;
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

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    // Check auth
    const sessionCookie = request.cookies.get('admin_session')?.value;
    if (sessionCookie !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Missing software ID' }, { status: 400 });
    }

    await pool.query('DELETE FROM software WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete software' }, { status: 500 });
  }
}
