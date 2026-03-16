
import { put } from '@vercel/blob';
import { sql } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';

// Note: This script is intended to be run in an environment with VERCEL_BLOB_READ_WRITE_TOKEN
// and POSTGRES_URL environment variables set.

async function migrate() {
  console.log('Starting migration...');

  const musicDir = path.join(process.cwd(), 'public', 'music');
  const softwareDir = path.join(process.cwd(), 'public', 'software');

  // 1. Migrate Music (Folders -> Playlists)
  if (fs.existsSync(musicDir)) {
    const folders = fs.readdirSync(musicDir).filter(f => fs.statSync(path.join(musicDir, f)).isDirectory());
    
    for (const folder of folders) {
      console.log(`Processing playlist: ${folder}`);
      const playlistId = folder.toLowerCase().replace(/\s+/g, '-');
      
      await sql`
        INSERT INTO playlists (id, title)
        VALUES (${playlistId}, ${folder})
        ON CONFLICT (id) DO UPDATE SET title = ${folder};
      `;

      const files = fs.readdirSync(path.join(musicDir, folder)).filter(f => f.endsWith('.mp3'));
      for (const file of files) {
        const title = file.replace('.mp3', '');
        const filePath = path.join(musicDir, folder, file);
        const fileBuffer = fs.readFileSync(filePath);
        
        console.log(`  Uploading track: ${title}`);
        const blob = await put(`music/${folder}/${file}`, fileBuffer, { access: 'public' });
        
        await sql`
          INSERT INTO songs (id, title, blob_url, playlist_id)
          VALUES (${`${playlistId}-${title}`}, ${title}, ${blob.url}, ${playlistId})
          ON CONFLICT (id) DO UPDATE SET blob_url = ${blob.url};
        `;
      }
    }

    // Handle files directly in musicDir as a default playlist
    const topLevelFiles = fs.readdirSync(musicDir).filter(f => f.endsWith('.mp3'));
    if (topLevelFiles.length > 0) {
      const playlistId = 'misc';
      await sql`INSERT INTO playlists (id, title) VALUES (${playlistId}, 'Misc') ON CONFLICT (id) DO NOTHING;`;
      for (const file of topLevelFiles) {
        const title = file.replace('.mp3', '');
        const filePath = path.join(musicDir, file);
        const fileBuffer = fs.readFileSync(filePath);
        const blob = await put(`music/misc/${file}`, fileBuffer, { access: 'public' });
        await sql`
          INSERT INTO songs (id, title, blob_url, playlist_id)
          VALUES (${`misc-${title}`}, ${title}, ${blob.url}, ${playlistId})
          ON CONFLICT (id) DO UPDATE SET blob_url = ${blob.url};
        `;
      }
    }
  }

  // 2. Migrate Software (.exe files)
  if (fs.existsSync(softwareDir)) {
    const exes = fs.readdirSync(softwareDir).filter(f => f.endsWith('.exe'));
    for (const exe of exes) {
      const name = exe.replace('.exe', '');
      const filePath = path.join(softwareDir, exe);
      const fileBuffer = fs.readFileSync(filePath);
      
      console.log(`Uploading software: ${name}`);
      const blob = await put(`software/${exe}`, fileBuffer, { access: 'public' });
      
      await sql`
        INSERT INTO software (id, name, description, blob_url)
        VALUES (${name.toLowerCase()}, ${name}, 'Local software binary', ${blob.url})
        ON CONFLICT (id) DO UPDATE SET blob_url = ${blob.url};
      `;
    }
  }

  console.log('Migration completed.');
}

migrate().catch(console.error);
