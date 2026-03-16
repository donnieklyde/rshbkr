
'use client';

import { useState, useEffect } from 'react';
import { upload } from '@vercel/blob/client';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'music' | 'software'>('music');
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');

  // Music form state
  const [musicTitle, setMusicTitle] = useState('');
  const [playlistId, setPlaylistId] = useState('');
  const [musicFile, setMusicFile] = useState<File | null>(null);

  // Software form state
  const [softwareName, setSoftwareName] = useState('');
  const [softwareDesc, setSoftwareDesc] = useState('');
  const [softwareFile, setSoftwareFile] = useState<File | null>(null);

  const handleMusicUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!musicFile) return;
    setUploading(true);
    setStatus('Uploading track...');

    try {
      const newBlob = await upload(musicFile.name, musicFile, {
        access: 'public',
        handleUploadUrl: '/api/admin/upload/music',
      });

      const res = await fetch('/api/admin/db/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: musicTitle || musicFile.name.replace('.mp3', ''),
          blobUrl: newBlob.url,
          playlistId: playlistId || 'misc'
        }),
      });

      if (res.ok) {
        setStatus('Success! Track added.');
        setMusicTitle('');
        setMusicFile(null);
      } else {
        setStatus('DB update failed.');
      }
    } catch (err) {
      setStatus('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSoftwareUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!softwareFile) return;
    setUploading(true);
    setStatus('Uploading software...');

    try {
      const newBlob = await upload(softwareFile.name, softwareFile, {
        access: 'public',
        handleUploadUrl: '/api/admin/upload/software',
      });

      const res = await fetch('/api/admin/db/software', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: softwareName || softwareFile.name.replace('.exe', ''),
          description: softwareDesc,
          blobUrl: newBlob.url
        }),
      });

      if (res.ok) {
        setStatus('Success! Software added.');
        setSoftwareName('');
        setSoftwareDesc('');
        setSoftwareFile(null);
      } else {
        setStatus('DB update failed.');
      }
    } catch (err) {
      setStatus('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-dashboard" style={{
      minHeight: '100vh',
      background: '#050505',
      color: '#fff',
      fontFamily: 'Bahnschrift, sans-serif',
      padding: '4rem 2rem'
    }}>
      <style>{`
        .container { max-width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem; }
        .tabs { display: flex; gap: 2rem; margin-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem; }
        .tab { cursor: pointer; opacity: 0.5; transition: 0.2s; text-transform: uppercase; font-size: 0.9rem; letter-spacing: 0.1em; }
        .tab.active { opacity: 1; font-weight: 700; }
        .upload-form { background: #111; padding: 2rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); }
        .form-group { margin-bottom: 1.5rem; }
        .label { display: block; font-size: 0.75rem; text-transform: uppercase; opacity: 0.5; margin-bottom: 0.5rem; }
        .input, .textarea { width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 4px; outline: none; }
        .btn { padding: 0.75rem 2rem; background: #fff; color: #000; border: none; border-radius: 4px; font-weight: 700; cursor: pointer; text-transform: uppercase; }
        .status { margin-top: 1.5rem; font-size: 0.9rem; color: #4caf50; }
      `}</style>
      <div className="container">
        <div className="header">
          <h1 style={{ letterSpacing: '0.2em' }}>ADMIN DASHBOARD</h1>
          <a href="/" style={{ fontSize: '0.8rem', opacity: 0.5, color: '#fff' }}>Back to Site</a>
        </div>

        <div className="tabs">
          <div className={`tab ${activeTab === 'music' ? 'active' : ''}`} onClick={() => setActiveTab('music')}>Music</div>
          <div className={`tab ${activeTab === 'software' ? 'active' : ''}`} onClick={() => setActiveTab('software')}>Software</div>
        </div>

        {activeTab === 'music' ? (
          <form className="upload-form" onSubmit={handleMusicUpload}>
            <div className="form-group">
              <label className="label">Track Title</label>
              <input className="input" value={musicTitle} onChange={e => setMusicTitle(e.target.value)} placeholder="e.g. My New Song" />
            </div>
            <div className="form-group">
              <label className="label">Playlist ID (folder name)</label>
              <input className="input" value={playlistId} onChange={e => setPlaylistId(e.target.value)} placeholder="e.g. RSHBKR" />
            </div>
            <div className="form-group">
              <label className="label">MP3 File</label>
              <input type="file" accept=".mp3" className="input" onChange={e => setMusicFile(e.target.files?.[0] || null)} />
            </div>
            <button type="submit" className="btn" disabled={uploading}>{uploading ? 'Processing...' : 'Upload Music'}</button>
            {status && <p className="status">{status}</p>}
          </form>
        ) : (
          <form className="upload-form" onSubmit={handleSoftwareUpload}>
            <div className="form-group">
              <label className="label">Software Name</label>
              <input className="input" value={softwareName} onChange={e => setSoftwareName(e.target.value)} placeholder="e.g. MyTool" />
            </div>
            <div className="form-group">
              <label className="label">Description</label>
              <textarea className="input" value={softwareDesc} onChange={e => setSoftwareDesc(e.target.value)} placeholder="Brief description..." rows={3} />
            </div>
            <div className="form-group">
              <label className="label">EXE File</label>
              <input type="file" accept=".exe" className="input" onChange={e => setSoftwareFile(e.target.files?.[0] || null)} />
            </div>
            <button type="submit" className="btn" disabled={uploading}>{uploading ? 'Processing...' : 'Upload Software'}</button>
            {status && <p className="status">{status}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
