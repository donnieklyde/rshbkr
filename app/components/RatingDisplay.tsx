export default function RatingDisplay({ ratings }: { ratings: any[] }) {
    if (!ratings || ratings.length === 0) return (
        <div style={{ color: '#666', fontSize: '0.9rem', fontStyle: 'italic' }}>
            No ratings yet. Be the first to judge.
        </div>
    );

    const keys = [
        { k: 'feelingStart', l: 'Vibe' },
        { k: 'ideaIntent', l: 'Idea' },
        { k: 'soundTexture', l: 'Texture' },
        { k: 'melodyHarmony', l: 'Melody' },
        { k: 'rhythmGroove', l: 'Groove' },
        { k: 'lyrics', l: 'Lyrics' },
        { k: 'originality', l: 'Originality' },
        { k: 'commitment', l: 'Commitment' },
        { k: 'context', l: 'Context' },
        { k: 'aftertaste', l: 'Aftertaste' },
    ];

    // Calculate averages for each criteria
    const averages = keys.map(({ k, l }) => {
        const sum = ratings.reduce((acc, r) => acc + (r[k] || 0), 0);
        return { label: l, value: sum / ratings.length };
    });

    const totalAverage = (averages.reduce((acc, curr) => acc + curr.value, 0) / 10).toFixed(1);

    return (
        <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '3.5rem', fontWeight: 800, background: 'linear-gradient(to right, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {totalAverage}
                </span>
                <span style={{ color: '#666', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Aggregate / {ratings.length} Voices
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                {averages.map((item) => (
                    <div key={item.label} style={{ marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem', color: '#ccc' }}>
                            <span>{item.label}</span>
                            <span style={{ fontWeight: 'bold' }}>{item.value.toFixed(1)}</span>
                        </div>
                        <div style={{ width: '100%', height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${(item.value / 10) * 100}%`,
                                height: '100%',
                                background: item.value > 8 ? '#fff' : item.value > 5 ? '#888' : '#444',
                                transition: 'width 0.5s ease'
                            }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
