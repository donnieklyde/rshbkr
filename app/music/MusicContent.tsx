'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Playlist } from '@/app/lib/db';

const stripePromise = loadStripe('pk_live_51SM7RtRo0zWHQUn8TztsYvBVnYmC1wKcPrxN31EFn8hha5bHvZltMpN7Uv3TFMWjqcOPDKFIdEvNeC60X31dntGt00U8xnAOgt');

export interface Track {
  id: string | number;
  title: string;
  file: string;
}

export interface PlaylistWithTracks extends Playlist {
  tracks: Track[];
}

function formatTime(s: number) {
  if (!isFinite(s) || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

interface PayModalProps {
  track: { id: number | string, title: string, file: string | string[] };
  onClose: () => void;
  allTracks: Track[];
}

function PayModal({ track, onClose, allTracks }: PayModalProps) {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const presets = ['0', '1', '3', '5', '10', '20'];

  const triggerDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const executeDownloadAction = async () => {
    if (Array.isArray(track.file)) {
      for (const f of track.file) {
        const t = allTracks.find(at => at.file === f);
        triggerDownload(f, `${t?.title || 'track'}.mp3`);
        await new Promise(r => setTimeout(r, 600));
      }
    } else {
      triggerDownload(track.file as string, `${track.title}.mp3`);
    }
  };

  const handleDownloadClick = async () => {
    const numAmount = Number(amount);
    if (numAmount > 0) {
      setIsProcessing(true);
      try {
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: numAmount, trackTitle: track.title, trackId: track.id }),
        });
        const session = await response.json();
        const stripe = await stripePromise;
        await stripe!.redirectToCheckout({ sessionId: session.id });
      } catch (err: any) {
        alert(err.message);
        setIsProcessing(false);
      }
    } else {
      setIsProcessing(true);
      await executeDownloadAction();
      setIsProcessing(false);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <p className="modal-label">downloading</p>
        <p className="modal-track-title">{track.title}</p>
        <p className="modal-sublabel">pay what you want (€)</p>
        <div className="modal-presets">
          {presets.map((p) => (
            <button key={p} className={`preset-btn ${amount === p ? 'preset-active' : ''}`} onClick={() => setAmount(p)}>
              {p === '0' ? 'free' : `€${p}`}
            </button>
          ))}
        </div>
        <input className="modal-input" type="number" min="0" placeholder="other amount..." value={amount} onChange={(e) => setAmount(e.target.value)} />
        <button className="modal-download-btn" onClick={handleDownloadClick} disabled={isProcessing}>
          {isProcessing ? '... processing' : (Number(amount) > 0 ? 'Proceed to Payment' : '↓ download')}
        </button>
      </div>
    </div>
  );
}

export default function MusicContent({ playlists }: { playlists: PlaylistWithTracks[] }) {
  const allTracks = playlists.flatMap(p => p.tracks);
  const searchParams = useSearchParams();
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const currentPlaylist = playlists.find(p => p.id === activePlaylistId);
  const currentList = currentPlaylist ? currentPlaylist.tracks : [];
  const currentTrack = activePlaylistId && currentIndex !== null ? currentList[currentIndex] : null;

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [payTrack, setPayTrack] = useState<Track | { id: string, title: string, file: string[] } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (activePlaylistId === null || currentIndex === null) return;
    const audio = audioRef.current;
    if (!audio) return;
    const nextSrc = currentList[currentIndex].file;
    if (audio.src !== nextSrc && !audio.src.endsWith(nextSrc)) {
      audio.pause();
      audio.src = nextSrc;
      audio.load();
    }
    audio.volume = volume;
  }, [currentIndex, activePlaylistId, currentList, volume]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && isPlaying && currentIndex !== null) {
      audio.play().catch(err => { if (err.name !== 'AbortError') console.error("Autoplay failed:", err); });
    }
  }, [currentIndex, activePlaylistId, isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setProgress(audioRef.current.duration ? (audioRef.current.currentTime / audioRef.current.duration) * 100 : 0);
    }
  };

  const handleLoadedMetadata = () => { if (audioRef.current) setDuration(audioRef.current.duration); };

  const handleEnded = () => {
    if (currentIndex !== null && currentIndex < currentList.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!currentTrack && allTracks.length > 0) {
      audio.src = allTracks[0].file;
      audio.load();
    }
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, allTracks]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (activePlaylistId === null || currentIndex === null) {
      if (playlists.length > 0 && playlists[0].tracks.length > 0) {
        setActivePlaylistId(playlists[0].id);
        setCurrentIndex(0);
      } else return;
    }
    if (isPlaying) { audio.pause(); setIsPlaying(false); }
    else { audio.play().then(() => setIsPlaying(true)).catch(console.error); }
  };

  const selectTrack = (index: number, playlistId: string) => {
    if (activePlaylistId === playlistId && currentIndex === index) { togglePlay(); }
    else { setActivePlaylistId(playlistId); setCurrentIndex(index); setIsPlaying(true); }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
  };

  const skipPrev = () => { if (currentIndex !== null && currentIndex > 0) setCurrentIndex(currentIndex - 1); };
  const skipNext = () => { if (currentIndex !== null && currentIndex < currentList.length - 1) setCurrentIndex(currentIndex + 1); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bahnschrift&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050505; color: #fff; font-family: 'Bahnschrift', sans-serif; }
        .page { min-height: 100vh; background: #050505; padding: 2rem 1rem 8rem; max-width: 720px; margin: 0 auto; }
        .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; gap: 1rem; }
        .site-title { font-size: clamp(1.4rem, 5vw, 2.2rem); font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
        .header-info { margin-bottom: 2.5rem; line-height: 1.4; display: flex; flex-direction: column; align-items: flex-start; }
        .made-by { font-size: 1.1rem; color: #fff; }
        .download-all-btn { background: transparent; border: 1px solid rgba(255,255,255,0.25); color: #fff; font-size: 0.75rem; text-transform: uppercase; padding: 0.5rem 1rem; cursor: pointer; }
        .track-list { display: flex; flex-direction: column; gap: 2px; }
        .track-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 0.5rem; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05); border-radius: 4px; }
        .track-row.active { background: rgba(255,255,255,0.06); }
        .track-num-wrap { width: 2rem; display: flex; align-items: center; justify-content: flex-end; }
        .track-title { flex: 1; font-size: 0.95rem; }
        .dl-btn { background: transparent; border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.5); font-size: 0.7rem; padding: 0.3rem 0.6rem; cursor: pointer; border-radius: 3px; }
        .player { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(8,8,8,0.96); backdrop-filter: blur(20px); padding: 0.75rem 1.5rem 1rem; z-index: 100; border-top: 1px solid rgba(255,255,255,0.08); }
        .player-inner { max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; gap: 0.5rem; }
        .progress-bar { width: 100%; height: 3px; background: rgba(255,255,255,0.1); cursor: pointer; border-radius: 2px; }
        .progress-fill { height: 100%; background: #fff; border-radius: 2px; }
        .player-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
        .player-track-info { flex: 1; min-width: 0; }
        .player-track-name { font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .player-time { font-size: 0.7rem; color: rgba(255,255,255,0.35); }
        .player-controls { display: flex; align-items: center; gap: 1rem; }
        .ctrl-btn { background: none; border: none; color: rgba(255,255,255,0.6); cursor: pointer; font-size: 1.1rem; }
        .ctrl-btn.play-btn { width: 2.2rem; height: 2.2rem; border: 1px solid rgba(255,255,255,0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; }
        .volume-row { display: flex; align-items: center; gap: 0.5rem; }
        .vol-slider { -webkit-appearance: none; width: 80px; height: 3px; background: rgba(255,255,255,0.15); border-radius: 2px; }
        .vol-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; background: #fff; border-radius: 50%; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); z-index: 200; display: flex; align-items: center; justify-content: center; }
        .modal-box { background: #111; border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 2rem; width: 100%; max-width: 340px; display: flex; flex-direction: column; gap: 1rem; }
        .modal-close { position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: rgba(255,255,255,0.4); cursor: pointer; }
        .modal-download-btn { background: #fff; color: #000; padding: 0.75rem; border-radius: 4px; font-weight: 700; cursor: pointer; text-transform: uppercase; }
        @keyframes eq { 0%, 100% { height: 4px; } 50% { height: 14px; } }
        .eq-bars { display: flex; align-items: flex-end; gap: 2px; height: 16px; }
        .eq-bar { width: 3px; background: #fff; border-radius: 1px; animation: eq 0.7s infinite; }
      `}</style>

      <div className="page">
        {playlists.map((playlist) => (
          <div key={playlist.id} style={{ marginBottom: '4rem' }}>
            <div className="header">
              <h2 className="site-title">{playlist.title}</h2>
            </div>
            <div className="header-info">
              <p className="made-by">made by 𝗥𝗦𝗛𝗕𝗞𝗥</p>
              <button className="download-all-btn" onClick={() => setPayTrack({ id: `all-${playlist.id}`, title: playlist.title, file: playlist.tracks.map(t => t.file) })}>
                ↓ download all
              </button>
            </div>
            <div className="track-list">
              {playlist.tracks.map((track, idx) => {
                const isActive = activePlaylistId === playlist.id && currentIndex === idx;
                return (
                  <div key={track.id} className={`track-row ${isActive ? 'active' : ''}`} onClick={() => selectTrack(idx, playlist.id)}>
                    <div className="track-num-wrap">
                      {isActive ? (
                        <div className="eq-bars">
                          <div className="eq-bar" />
                          <div className="eq-bar" style={{ animationDelay: '0.2s' }} />
                          <div className="eq-bar" style={{ animationDelay: '0.4s' }} />
                        </div>
                      ) : <span className="track-num">{String(idx + 1).padStart(2, '0')}</span>}
                    </div>
                    <span className="track-title">{track.title}</span>
                    <button className="dl-btn" onClick={(e) => { e.stopPropagation(); setPayTrack(track); }}>↓</button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="player">
        <div className="player-inner">
          <div className="progress-bar" onClick={handleSeek}><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
          <div className="player-row">
            <div className="player-track-info">
              <div className="player-track-name">{currentTrack ? currentTrack.title : '—'}</div>
              <div className="player-time">{formatTime(currentTime)} / {formatTime(duration)}</div>
            </div>
            <div className="player-controls">
              <button className="ctrl-btn" onClick={skipPrev}>⏮</button>
              <button className="ctrl-btn play-btn" onClick={togglePlay}>{isPlaying ? '❚❚' : '▶'}</button>
              <button className="ctrl-btn" onClick={skipNext}>⏭</button>
            </div>
            <div className="volume-row">
              <input type="range" className="vol-slider" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(Number(e.target.value))} />
            </div>
          </div>
        </div>
      </div>
      <audio ref={audioRef} />
      {payTrack && <PayModal track={payTrack} onClose={() => setPayTrack(null)} allTracks={allTracks} />}
    </>
  );
}
