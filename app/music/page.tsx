'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Metadata } from 'next';

const tracks = [
  { id: 1, title: 'arschvoll', file: '/music/arschvoll.mp3' },
  { id: 2, title: 'exitus', file: '/music/exitus.mp3' },
  { id: 3, title: 'dicke männer in meinem schornsteinschacht', file: '/music/dicke männer in meinem schornsteinschacht.mp3' },
  { id: 4, title: 'femme fatale hat sich togelacht', file: '/music/femme fatale hat sich togelacht.mp3' },
  { id: 5, title: 'gefühlstechnisch', file: '/music/gefühlstechnisch.mp3' },
  { id: 6, title: 'butterweich', file: '/music/butterweich.mp3' },
  { id: 7, title: 'fluss', file: '/music/fluss.mp3' },
  { id: 8, title: 'lalilove', file: '/music/lalilove.mp3' },
  { id: 9, title: 'lowlifespielerpolitikfickzeit vorbei', file: '/music/lowlifespielerpolitikfickzeit vorbei.mp3' },
  { id: 10, title: 'melodie', file: '/music/melodie.mp3' },
  { id: 11, title: 'nice', file: '/music/nice.mp3' },
  { id: 12, title: 'party', file: '/music/party.mp3' },
  { id: 13, title: 'paralyze', file: '/music/paralyze.mp3' },
  { id: 14, title: 'pfand II', file: '/music/pfand II.mp3' },
  { id: 15, title: 'danke an jesus', file: '/music/danke an jesus.mp3' },
  { id: 16, title: 'schizo nur ein shizo', file: '/music/schizo nur ein shizo.mp3' },
];

const ALL_TRACKS_ID = 'all-tracks';
const ALL_TRACKS_TITLE = 'Full Album (All Tracks)';

function formatTime(s: number) {
  if (!isFinite(s) || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51SM7RtRo0zWHQUn80vTrSFaf4rDOyDSdR8OYPddFzMLs3MsOsPQFo5YUKacE3K9KlSAMMZUlJgSySmCqnXdheiGk008ZKANUXy');

interface PayModalProps {
  track: { id: number | string, title: string, file: string | string[] };
  onClose: () => void;
}

function PayModal({ track, onClose }: PayModalProps) {
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
      for (const [idx, f] of track.file.entries()) {
        const fileName = `${tracks.find(t => t.file === f)?.title || 'track'}.mp3`;
        triggerDownload(f, fileName);
        await new Promise(r => setTimeout(r, 600));
      }
    } else {
      const fileName = `${track.title}.mp3`;
      triggerDownload(track.file, fileName);
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
          body: JSON.stringify({
            amount: numAmount,
            trackTitle: track.title,
            trackId: track.id
          }),
        });
        const session = await response.json();

        if (session.error) throw new Error(session.error);

        const stripe = await stripePromise;
        const { error } = await stripe!.redirectToCheckout({ sessionId: session.id });

        if (error) throw error;
      } catch (err: any) {
        alert(err.message);
        setIsProcessing(false);
      }
    } else {
      // Free download
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
            <button
              key={p}
              className={`preset-btn ${amount === p ? 'preset-active' : ''}`}
              onClick={() => setAmount(p)}
            >
              {p === '0' ? 'free' : `€${p}`}
            </button>
          ))}
        </div>
        <input
          className="modal-input"
          type="number"
          min="0"
          placeholder="other amount..."
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        {amount !== '' && Number(amount) > 0 && (
          <p className="modal-note">
            you legend.
            give me more
          </p>
        )}
        <button
          className="modal-download-btn"
          onClick={handleDownloadClick}
          disabled={isProcessing}
        >
          {isProcessing ? '... processing' : (Number(amount) > 0 ? 'Proceed to Payment' : '↓ download')}
        </button>
      </div>
    </div>
  );
}

export default function MusicPage() {
  return (
    <Suspense fallback={<div className="page" style={{ textAlign: 'center', padding: '10rem' }}>...</div>}>
      <MusicContent />
    </Suspense>
  );
}

function MusicContent() {
  const searchParams = useSearchParams();
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [payTrack, setPayTrack] = useState<typeof tracks[0] | { id: string, title: string, file: string[] } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // sync audio source when track changes
  useEffect(() => {
    if (currentIndex === null) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = tracks[currentIndex].file;
    audio.volume = volume;
    audio.play().then(() => setIsPlaying(true)).catch(() => { });
  }, [currentIndex]);

  // sync volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
    setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleEnded = () => {
    if (currentIndex !== null && currentIndex < tracks.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    // If no track is selected, start with the first one
    if (currentIndex === null) {
      setCurrentIndex(0);
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => { });
    }
  };

  const selectTrack = (index: number) => {
    if (currentIndex === index) {
      togglePlay();
    } else {
      setCurrentIndex(index);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * audio.duration;
  };

  const skipPrev = () => {
    if (currentIndex === null || currentIndex === 0) return;
    setCurrentIndex(currentIndex - 1);
  };

  const skipNext = () => {
    if (currentIndex === null || currentIndex >= tracks.length - 1) return;
    setCurrentIndex(currentIndex + 1);
  };

  const currentTrack = currentIndex !== null ? tracks[currentIndex] : null;

  // Handle Stripe Success Download
  useEffect(() => {
    const success = searchParams.get('success');
    const trackId = searchParams.get('trackId');
    if (success === 'true' && trackId) {
      // Clear URL params without reloading
      window.history.replaceState({}, '', '/music');

      const triggerDownload = (url: string, filename: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      if (trackId === ALL_TRACKS_ID) {
        const downloadAll = async () => {
          for (const t of tracks) {
            triggerDownload(t.file, `${t.title}.mp3`);
            await new Promise(r => setTimeout(r, 600));
          }
        };
        downloadAll();
      } else {
        const track = tracks.find(t => String(t.id) === trackId);
        if (track) {
          triggerDownload(track.file, `${track.title}.mp3`);
        }
      }
    }
  }, [searchParams]);

  // Integrate Hit Counter Plugin
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/counter/index.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
      const element = document.getElementById('rshbkr-counter');
      if (element) element.remove();
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bahnschrift&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #050505; color: #fff; font-family: 'Bahnschrift', 'Arial Narrow', sans-serif; }

        .page {
          min-height: 100vh;
          background: #050505;
          padding: 2rem 1rem 8rem;
          max-width: 720px;
          margin: 0 auto;
        }

        /* ── Header ── */
        .header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          gap: 1rem;
        }
        @media (max-width: 600px) {
          .header {
            flex-direction: column;
            align-items: stretch;
          }
        }
        .site-title {
          font-family: 'Bahnschrift', 'Arial Narrow', sans-serif;
          font-size: clamp(1.4rem, 5vw, 2.2rem);
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #fff;
          text-transform: uppercase;
        }
        .header-info {
          margin-bottom: 2.5rem;
          line-height: 1.4;
        }
        .made-by {
          font-size: 1.1rem;
          color: #fff;
          letter-spacing: 0.02em;
        }
        .release-date {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.05em;
        }
        .download-all-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.25);
          color: #fff;
          font-family: inherit;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.5rem 1rem;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
          text-align: center;
        }
        @media (max-width: 600px) {
          .download-all-btn {
            width: 100%;
            margin-top: 0.5rem;
          }
        }
        .download-all-btn:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.5); }

        /* ── Track List ── */
        .track-list { display: flex; flex-direction: column; gap: 2px; }

        .track-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 0.5rem;
          cursor: pointer;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: background 0.15s;
          border-radius: 4px;
        }
        .track-row:hover { background: rgba(255,255,255,0.04); }
        .track-row.active { background: rgba(255,255,255,0.06); }

        .track-num {
          width: 2rem;
          text-align: right;
          font-size: 0.78rem;
          color: rgba(255,255,255,0.3);
          flex-shrink: 0;
          transition: opacity 0.2s;
        }
        .track-row.active .track-num { opacity: 0; }

        .track-play-icon {
          display: none;
          width: 2rem;
          text-align: right;
          font-size: 0.9rem;
          flex-shrink: 0;
          color: #fff;
          position: absolute;
        }
        .track-row.active .track-play-icon { display: flex; align-items: center; justify-content: flex-end; position: relative; }

        .track-num-wrap {
          width: 2rem;
          flex-shrink: 0;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }

        .track-title {
          flex: 1;
          font-size: 0.95rem;
          letter-spacing: 0.03em;
          color: #fff;
          font-family: 'Bahnschrift', sans-serif;
        }
        .track-row.active .track-title { color: #fff; }

        .dl-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.5);
          font-family: inherit;
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.3rem 0.6rem;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
          border-radius: 3px;
        }
        .dl-btn:hover { color: #fff; border-color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.06); }

        /* ── Sticky Player ── */
        .player {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: rgba(8,8,8,0.96);
          border-top: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(20px);
          padding: 0.75rem 1.5rem 1rem;
          z-index: 100;
        }
        .player-inner {
          max-width: 720px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        /* progress */
        .progress-bar {
          width: 100%;
          height: 3px;
          background: rgba(255,255,255,0.1);
          cursor: pointer;
          position: relative;
          border-radius: 2px;
        }
        .progress-fill {
          height: 100%;
          background: #fff;
          border-radius: 2px;
          transition: width 0.1s linear;
          pointer-events: none;
        }

        .player-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .player-track-info {
          flex: 1;
          min-width: 0;
        }
        .player-track-name {
          font-size: 0.85rem;
          font-family: 'Bahnschrift', sans-serif;
          letter-spacing: 0.04em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #fff;
        }
        .player-time {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.35);
          margin-top: 2px;
          letter-spacing: 0.06em;
        }

        .player-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .ctrl-btn {
          background: none;
          border: none;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          font-size: 1.1rem;
          padding: 0.25rem;
          transition: color 0.2s;
          display: flex;
          align-items: center;
        }
        .ctrl-btn:hover { color: #fff; }
        .ctrl-btn.play-btn {
          width: 2.2rem;
          height: 2.2rem;
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          justify-content: center;
          font-size: 0.9rem;
        }
        .ctrl-btn.play-btn:hover { border-color: #fff; color: #fff; }

        /* volume */
        .volume-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .vol-icon { font-size: 0.85rem; color: rgba(255,255,255,0.4); }
        .vol-slider {
          -webkit-appearance: none;
          width: 80px;
          height: 3px;
          background: rgba(255,255,255,0.15);
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }
        .vol-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px; height: 12px;
          background: #fff;
          border-radius: 50%;
          cursor: pointer;
        }

        /* ── Modal ── */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(6px);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .modal-box {
          background: #111;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          padding: 2rem;
          width: 100%;
          max-width: 340px;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          font-family: 'Bahnschrift', sans-serif;
        }
        .modal-close {
          position: absolute;
          top: 1rem; right: 1rem;
          background: none;
          border: none;
          color: rgba(255,255,255,0.4);
          font-size: 1rem;
          cursor: pointer;
          transition: color 0.2s;
        }
        .modal-close:hover { color: #fff; }
        .modal-label {
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
        }
        .modal-track-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.04em;
        }
        .modal-sublabel {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.08em;
        }
        .modal-presets {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .preset-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.6);
          font-family: inherit;
          font-size: 0.8rem;
          padding: 0.35rem 0.75rem;
          cursor: pointer;
          border-radius: 3px;
          transition: all 0.2s;
          letter-spacing: 0.05em;
        }
        .preset-btn:hover { color: #fff; border-color: rgba(255,255,255,0.5); }
        .preset-btn.preset-active { color: #fff; border-color: #fff; background: rgba(255,255,255,0.08); }
        .modal-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.15);
          color: #fff;
          font-family: inherit;
          font-size: 0.9rem;
          padding: 0.5rem 0.75rem;
          outline: none;
          border-radius: 3px;
          width: 100%;
          transition: border-color 0.2s;
        }
        .modal-input:focus { border-color: rgba(255,255,255,0.4); }
        .modal-input::placeholder { color: rgba(255,255,255,0.25); }
        .modal-note {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.03em;
        }
        .modal-download-btn {
          background: #fff;
          color: #000;
          border: none;
          font-family: inherit;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.75rem;
          cursor: pointer;
          border-radius: 4px;
          transition: opacity 0.2s;
        }
        .modal-download-btn:hover { opacity: 0.85; }

        /* equalizer bars animation */
        @keyframes eq1 { 0%,100%{height:4px} 50%{height:14px} }
        @keyframes eq2 { 0%,100%{height:10px} 50%{height:4px} }
        @keyframes eq3 { 0%,100%{height:7px} 33%{height:14px} 66%{height:4px} }
        .eq-bars {
          display: flex;
          align-items: flex-end;
          gap: 2px;
          height: 16px;
        }
        .eq-bar {
          width: 3px;
          background: #fff;
          border-radius: 1px;
        }
        .eq-bar:nth-child(1) { animation: eq1 0.7s ease-in-out infinite; }
        .eq-bar:nth-child(2) { animation: eq2 0.5s ease-in-out infinite; }
        .eq-bar:nth-child(3) { animation: eq3 0.9s ease-in-out infinite; }
        .eq-bars.paused .eq-bar { animation-play-state: paused; }
      `}</style>

      <div className="page">
        {/* Header */}
        <div className="header">
          <h1 className="site-title">HTTP://hvnPUNKTwtf</h1>
          <button
            className="download-all-btn"
            onClick={() => {
              setPayTrack({
                id: ALL_TRACKS_ID,
                title: ALL_TRACKS_TITLE,
                file: tracks.map(t => t.file)
              });
            }}
          >
            ↓ download all
          </button>
        </div>
        <div className="header-info">
          <p className="made-by">made by 𝗥𝗦𝗛𝗕𝗞𝗥</p>
          <p className="release-date">20.03 on spotify and everywhere</p>
        </div>

        {/* Track List */}
        <div className="track-list" role="list">
          {tracks.map((track, index) => {
            const isActive = currentIndex === index;
            return (
              <div
                key={track.id}
                className={`track-row ${isActive ? 'active' : ''}`}
                role="listitem"
                onClick={() => selectTrack(index)}
              >
                <div className="track-num-wrap">
                  {isActive ? (
                    <div className={`eq-bars ${isPlaying ? '' : 'paused'}`}>
                      <div className="eq-bar" style={{ height: '4px' }} />
                      <div className="eq-bar" style={{ height: '10px' }} />
                      <div className="eq-bar" style={{ height: '7px' }} />
                    </div>
                  ) : (
                    <span className="track-num">{String(index + 1).padStart(2, '0')}</span>
                  )}
                </div>
                <span className="track-title">{track.title}</span>
                <button
                  className="dl-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPayTrack(track);
                  }}
                  title="download"
                >
                  ↓
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Player */}
      <div className="player">
        <div className="player-inner">
          <div
            className="progress-bar"
            onClick={handleSeek}
            role="slider"
            aria-label="seek"
          >
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="player-row">
            <div className="player-track-info">
              <div className="player-track-name">
                {currentTrack ? currentTrack.title : '—'}
              </div>
              <div className="player-time">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
            <div className="player-controls">
              <button className="ctrl-btn" onClick={skipPrev} aria-label="previous">
                ⏮
              </button>
              <button className="ctrl-btn play-btn" onClick={togglePlay} aria-label={isPlaying ? 'pause' : 'play'}>
                {isPlaying ? '❚❚' : '▶'}
              </button>
              <button className="ctrl-btn" onClick={skipNext} aria-label="next">
                ⏭
              </button>
            </div>
            <div className="volume-row">
              <span className="vol-icon">🔈</span>
              <input
                type="range"
                className="vol-slider"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                aria-label="volume"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Pay What You Want Modal */}
      {payTrack && (
        <PayModal track={payTrack} onClose={() => setPayTrack(null)} />
      )}
    </>
  );
}
