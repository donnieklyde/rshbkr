'use client';

import { useState } from 'react';

const CRITERIA = [
    { key: 'feelingStart', label: 'Feeling / Vibe', desc: 'Does it hit? Goosebumps, heartbreak, or cold unwanted Monday.' },
    { key: 'ideaIntent', label: 'Idea / Intent', desc: 'Big message, small thought, or beautiful nonsense with posture.' },
    { key: 'soundTexture', label: 'Sound / Texture', desc: 'Rough, glossy, dirty, sterile, warm, broken?' },
    { key: 'melodyHarmony', label: 'Melody & Harmony', desc: 'Hummable, annoying, hypnotic, anti-catchy?' },
    { key: 'rhythmGroove', label: 'Rhythm & Groove', desc: 'Does the body react? Head nods or heart trips?' },
    { key: 'lyrics', label: 'Lyrics', desc: 'Saying something new, or nothing convincingly?' },
    { key: 'originality', label: 'Originality', desc: 'Heard it a thousand times or wrong door at 4 a.m.?' },
    { key: 'commitment', label: 'Commitment', desc: 'Does it commit or bail out of fear?' },
    { key: 'context', label: 'Context', desc: '3 a.m. club, 6 a.m. alone, mid-spiral?' },
    { key: 'aftertaste', label: 'Aftertaste', desc: 'Do you think about it later or does it evaporate?' },
];

export default function RatingForm({ trackId, initialRating }: { trackId: string, initialRating?: any }) {
    const [ratings, setRatings] = useState<any>(initialRating || {});
    const [summary, setSummary] = useState(initialRating?.summary || '');
    const [submitting, setSubmitting] = useState(false);

    const handleSliderChange = (key: string, value: number) => {
        setRatings((prev: any) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const res = await fetch('/api/ratings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trackId,
                    ...ratings,
                    summary
                })
            });
            if (res.ok) {
                window.location.reload();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Rate Operation</h3>

            <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                {CRITERIA.map((c) => (
                    <div key={c.key} style={{ background: '#111', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{c.label}</label>
                            <span style={{ color: '#888', fontFamily: 'monospace' }}>{ratings[c.key] || '-'} / 10</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem', height: '2.5em' }}>{c.desc}</p>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            step="1"
                            value={ratings[c.key] || 0}
                            onChange={(e) => handleSliderChange(c.key, parseInt(e.target.value))}
                            style={{ width: '100%', cursor: 'pointer', accentColor: '#fff' }}
                        />
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Final Verdict / Comment</label>
                <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={4}
                    placeholder="Describe the experience..."
                    style={{
                        width: '100%',
                        background: '#111',
                        border: '1px solid #333',
                        padding: '1rem',
                        color: '#fff',
                        borderRadius: '8px',
                        fontFamily: 'inherit'
                    }}
                />
            </div>

            <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary"
                style={{ marginTop: '2rem', width: '100%' }}
            >
                {submitting ? 'Committing...' : 'Commit Rating'}
            </button>
        </div>
    );
}
