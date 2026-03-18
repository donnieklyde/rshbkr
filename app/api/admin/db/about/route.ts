
import { Pool } from 'pg';
import { NextResponse, NextRequest } from 'next/server';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

// GET: Current about content
export async function GET(request: NextRequest) {
  try {
    // Check auth - though this one could be public if needed, 
    // but the admin uses it to fill the text area.
    const about = await pool.query("SELECT content FROM about_content WHERE id = 'main'");
    
    if (about.rows.length === 0) {
      return NextResponse.json({ content: 'RSHBKR is an underground artist and developer.' });
    }
    
    return NextResponse.json(about.rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch about content' }, { status: 500 });
  }
}

// POST: Update about content
export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();
    
    // Check auth
    const sessionCookie = request.cookies.get('admin_session')?.value;
    if (sessionCookie !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (content === undefined) {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 });
    }

    await pool.query(
      `INSERT INTO about_content (id, content, updated_at) 
       VALUES ('main', $1, CURRENT_TIMESTAMP) 
       ON CONFLICT (id) DO UPDATE SET content = $1, updated_at = CURRENT_TIMESTAMP`,
      [content]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update about content' }, { status: 500 });
  }
}
