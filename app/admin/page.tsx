
'use client';

import { useState, useEffect } from 'react';
import { upload } from '@vercel/blob/client';
import { useRouter } from 'next/navigation';

type Tab = 'music' | 'software' | 'about' | 'overview';

interface Song {
  id: string;
  title: string;
  blob_url: string;
  playlist_id: string;
  playlist_title: string;
  created_at: string;
}

interface Software {
  id: string;
  name: string;
  description: string;
  blob_url: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('music');
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');
  const router = useRouter();

  // Data state
  const [songs, setSongs] = useState<Song[]>([]);
  const [softwareList, setSoftwareList] = useState<Software[]>([]);
  const [aboutContent, setAboutContent] = useState('');
  const [loading, setLoading] = useState(true);

  // Form states
  const [musicTitle, setMusicTitle] = useState('');
  const [playlistId, setPlaylistId] = useState('rshbkr');
  const [musicFile, setMusicFile] = useState<File | null>(null);

  const [softName, setSoftName] = useState('');
  const [softDesc, setSoftDesc] = useState('');
  const [softFile, setSoftFile] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [songsRes, softRes, aboutRes] = await Promise.all([
        fetch('/api/admin/db/songs'),
        fetch('/api/admin/db/software'),
        fetch('/api/admin/db/about')
      ]);

      if (songsRes.ok) setSongs(await songsRes.json());
      if (softRes.ok) setSoftwareList(await softRes.json());
      if (aboutRes.ok) {
        const data = await aboutRes.json();
        setAboutContent(data.content);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

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
          playlistId: playlistId
        }),
      });

      if (res.ok) {
        setStatus('Success! Track added.');
        setMusicTitle('');
        setMusicFile(null);
        fetchData();
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
    if (!softFile) return;
    setUploading(true);
    setStatus('Uploading software...');

    try {
      const newBlob = await upload(softFile.name, softFile, {
        access: 'public',
        handleUploadUrl: '/api/admin/upload/software',
      });

      const res = await fetch('/api/admin/db/software', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: softName || softFile.name.replace('.exe', ''),
          description: softDesc,
          blobUrl: newBlob.url
        }),
      });

      if (res.ok) {
        setStatus('Success! Software added.');
        setSoftName('');
        setSoftDesc('');
        setSoftFile(null);
        fetchData();
      } else {
        setStatus('DB update failed.');
      }
    } catch (err) {
      setStatus('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleAboutUpdate = async () => {
    setUploading(true);
    try {
      const res = await fetch('/api/admin/db/about', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: aboutContent }),
      });
      if (res.ok) setStatus('About me updated!');
      else setStatus('Update failed.');
    } catch (err) {
      setStatus('Error updating.');
    } finally {
      setUploading(false);
    }
  };

  const deleteItem = async (type: 'songs' | 'software', id: string) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
      const res = await fetch(`/api/admin/db/${type}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) fetchData();
      else alert('Delete failed.');
    } catch (err) {
      alert('Error deleting.');
    }
  };

  return (
    <div className="admin-page">
      <style jsx>{`
        .admin-page {
          min-height: 100vh;
          background: #050505;
          color: #fff;
          font-family: 'Bahnschrift', sans-serif;
          padding: 2rem;
        }
        .container {
          max-width: 1000px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding-bottom: 1rem;
        }
        h1 { font-size: 1.5rem; letter-spacing: 0.2em; text-transform: uppercase; margin: 0; }
        .nav-link { font-size: 0.8rem; opacity: 0.5; color: #fff; text-decoration: none; }
        .nav-link:hover { opacity: 1; }

        .tabs {
          display: flex;
          gap: 2rem;
          margin-bottom: 2rem;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .tab {
          cursor: pointer;
          opacity: 0.4;
          transition: 0.3s;
          text-transform: uppercase;
          font-size: 0.8rem;
          letter-spacing: 0.1em;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid transparent;
          white-space: nowrap;
        }
        .tab.active {
          opacity: 1;
          font-weight: 700;
          border-bottom: 2px solid #fff;
        }

        .glass-panel {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 2rem;
          backdrop-filter: blur(10px);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }
        @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }

        .form-group { margin-bottom: 1.5rem; }
        .label { display: block; font-size: 0.7rem; text-transform: uppercase; opacity: 0.5; margin-bottom: 0.5rem; }
        .input, .textarea, .select {
          width: 100%;
          padding: 0.8rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          border-radius: 6px;
          outline: none;
          font-family: inherit;
        }
        .textarea { min-height: 150px; resize: vertical; }
        .btn {
          padding: 0.8rem 2rem;
          background: #fff;
          color: #000;
          border: none;
          border-radius: 6px;
          font-weight: 700;
          cursor: pointer;
          text-transform: uppercase;
          transition: 0.2s;
        }
        .btn:hover { background: #eee; transform: translateY(-2px); }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .status { margin-top: 1rem; color: #4caf50; font-size: 0.9rem; }

        .content-list { margin-top: 3rem; }
        .list-header { font-size: 0.8rem; text-transform: uppercase; opacity: 0.5; margin-bottom: 1rem; }
        .item-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 8px;
          margin-bottom: 0.5rem;
        }
        .item-info h4 { margin: 0; font-size: 1rem; }
        .item-info p { margin: 0; font-size: 0.75rem; opacity: 0.5; }
        .delete-btn {
          color: #ff4d4d;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 700;
        }
        .delete-btn:hover { text-decoration: underline; }

        .loading-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(5px);
          z-index: 100;
        }
      `}</style>

      {loading && <div className="loading-overlay">LOADING...</div>}

      <div className="container">
        <header className="header">
          <h1>ADMIN DASHBOARD</h1>
          <a href="/" className="nav-link">BACK TO SITE</a>
        </header>

        <nav className="tabs">
          <div className={`tab ${activeTab === 'music' ? 'active' : ''}`} onClick={() => setActiveTab('music')}>Music</div>
          <div className={`tab ${activeTab === 'software' ? 'active' : ''}`} onClick={() => setActiveTab('software')}>Software</div>
          <div className={`tab ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>About Me</div>
          <div className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Full Content</div>
        </nav>

        {activeTab === 'music' && (
          <div className="tab-content">
            <div className="glass-panel">
              <form onSubmit={handleMusicUpload}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="label">Track Title</label>
                    <input className="input" value={musicTitle} onChange={e => setMusicTitle(e.target.value)} placeholder="e.g. My New Song" />
                  </div>
                  <div className="form-group">
                    <label className="label">Artist / Playlist</label>
                    <select className="select" value={playlistId} onChange={e => setPlaylistId(e.target.value)}>
                      <option value="rshbkr">RSHBKR</option>
                      <option value="peppendriver">peppendriver</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">MP3 File</label>
                  <input type="file" accept=".mp3" className="select" onChange={e => setMusicFile(e.target.files?.[0] || null)} />
                </div>
                <button type="submit" className="btn" disabled={uploading}>
                  {uploading ? 'Processing...' : 'Upload Music'}
                </button>
                {status && <p className="status">{status}</p>}
              </form>
            </div>

            <div className="content-list">
              <div className="list-header">Existing Tracks</div>
              {songs.map(song => (
                <div key={song.id} className="item-card">
                  <div className="item-info">
                    <h4>{song.title}</h4>
                    <p>{song.playlist_title.toUpperCase()} • {new Date(song.created_at).toLocaleDateString()}</p>
                  </div>
                  <button className="delete-btn" onClick={() => deleteItem('songs', song.id)}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'software' && (
          <div className="tab-content">
            <div className="glass-panel">
              <form onSubmit={handleSoftwareUpload}>
                <div className="form-group">
                  <label className="label">Software Name</label>
                  <input className="input" value={softName} onChange={e => setSoftName(e.target.value)} placeholder="e.g. MyTool" />
                </div>
                <div className="form-group">
                  <label className="label">Description</label>
                  <textarea className="textarea" value={softDesc} onChange={e => setSoftDesc(e.target.value)} placeholder="What does this software do?" />
                </div>
                <div className="form-group">
                  <label className="label">Executable / Zip File</label>
                  <input type="file" accept=".exe,.zip,.rar,.msi" className="select" onChange={e => setSoftFile(e.target.files?.[0] || null)} />
                </div>
                <button type="submit" className="btn" disabled={uploading}>
                  {uploading ? 'Processing...' : 'Upload Software'}
                </button>
                {status && <p className="status">{status}</p>}
              </form>
            </div>

            <div className="content-list">
              <div className="list-header">Existing Software</div>
              {softwareList.map(item => (
                <div key={item.id} className="item-card">
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p>{item.description?.substring(0, 100)}{item.description?.length > 100 ? '...' : ''}</p>
                  </div>
                  <button className="delete-btn" onClick={() => deleteItem('software', item.id)}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="tab-content">
            <div className="glass-panel">
              <div className="form-group">
                <label className="label">About Me Content</label>
                <textarea 
                  className="textarea" 
                  value={aboutContent} 
                  onChange={e => setAboutContent(e.target.value)} 
                  placeholder="Tell your story..."
                />
              </div>
              <button className="btn" onClick={handleAboutUpdate} disabled={uploading}>
                {uploading ? 'Saving...' : 'Save Content'}
              </button>
              {status && <p className="status">{status}</p>}
            </div>
            <p style={{ marginTop: '2rem', fontSize: '0.8rem', opacity: 0.5 }}>
              This content will be displayed on the public About page. Use newlines for paragraphs.
            </p>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="tab-content glass-panel">
            <div className="list-header">Full Content Summary</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>SONGS ({songs.length})</h3>
                {songs.map(song => (
                  <div key={song.id} style={{ fontSize: '0.8rem', marginBottom: '0.5rem', opacity: 0.7 }}>
                    {song.title} ({song.playlist_title})
                  </div>
                ))}
              </div>
              <div>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>SOFTWARE ({softwareList.length})</h3>
                {softwareList.map(item => (
                  <div key={item.id} style={{ fontSize: '0.8rem', marginBottom: '0.5rem', opacity: 0.7 }}>
                    {item.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
