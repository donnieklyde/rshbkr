
import { put } from '@vercel/blob';
import pg from 'pg';
const { Pool } = pg;
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function query(text, params = []) {
  const { rows } = await pool.query(text, params);
  return rows;
}

async function sync() {
  console.log('Starting local synchronization...');
  const results = { music: [], software: [], errors: [] };

  const musicDir = path.join(process.cwd(), 'public', 'music');
  const softwareDir = path.join(process.cwd(), 'public', 'software');

  // 1. Sync Music
  if (fs.existsSync(musicDir)) {
    try {
      const folders = fs.readdirSync(musicDir).filter(f => fs.statSync(path.join(musicDir, f)).isDirectory());
      
      for (const folder of folders) {
        const playlistId = folder.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        await query(`
          INSERT INTO playlists (id, title)
          VALUES ($1, $2)
          ON CONFLICT (id) DO UPDATE SET title = $2
        `, [playlistId, folder]);

        const playlistPath = path.join(musicDir, folder);
        const files = fs.readdirSync(playlistPath).filter(f => f.endsWith('.mp3'));

        for (const file of files) {
          const title = file.replace('.mp3', '');
          const songId = `${playlistId}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const filePath = path.join(playlistPath, file);
          
          const existing = await query('SELECT * FROM songs WHERE id = $1', [songId]);
          
          if (existing.length === 0) {
            console.log(`Uploading track: ${title}`);
            const fileBuffer = fs.readFileSync(filePath);
            const blob = await put(`music/${folder}/${file}`, fileBuffer, { 
              access: 'public',
              token: process.env.BLOB_READ_WRITE_TOKEN,
              allowOverwrite: true
            });
            
            await query(`
              INSERT INTO songs (id, title, blob_url, playlist_id)
              VALUES ($1, $2, $3, $4)
            `, [songId, title, blob.url, playlistId]);
            results.music.push(title);
          }
        }
      }
    } catch (err) {
      console.error('Music sync error:', err);
      results.errors.push(`Music: ${err.message}`);
    }
  }

  // 2. Sync Software
  if (fs.existsSync(softwareDir)) {
    try {
      const files = fs.readdirSync(softwareDir);
      for (const file of files) {
        const filePath = path.join(softwareDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isFile()) {
          const name = file;
          const softwareId = file.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          
          const existing = await query('SELECT * FROM software WHERE id = $1', [softwareId]);
          
          if (existing.length === 0) {
            console.log(`Uploading software: ${name}`);
            const fileBuffer = fs.readFileSync(filePath);
            const blob = await put(`software/${file}`, fileBuffer, { 
              access: 'public',
              token: process.env.BLOB_READ_WRITE_TOKEN,
              allowOverwrite: true
            });
            
            await query(`
              INSERT INTO software (id, name, blob_url, description)
              VALUES ($1, $2, $3, $4)
            `, [softwareId, name, blob.url, 'Local software binary']);
            results.software.push(name);
          }
        }
      }
    } catch (err) {
      console.error('Software sync error:', err);
      results.errors.push(`Software: ${err.message}`);
    }
  }

  console.log('Synchronization finished.');
  console.log('Results:', JSON.stringify(results, null, 2));
  process.exit(0);
}

sync().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
