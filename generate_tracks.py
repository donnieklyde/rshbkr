import json

tracks2 = json.load(open('tracks.json', 'r', encoding='utf-8'))

out = """export const player1Tracks = [
  { id: 1, title: 'arschvoll', fileRaw: '1J_tjXmXvCEsjsgebqeoDeBXIvBnZukC2' },
  { id: 2, title: 'exitus', fileRaw: '1jQnx9AD4G0mA9POMkH5Z40l6Gygp5U0O' },
  { id: 3, title: 'dicke m\u00e4nner in meinem schornsteinschacht', fileRaw: '1u80-QGdcR0fddQ_CycVbXy95eoo0RWkq' },
  { id: 4, title: 'femme fatale hat sich togelacht', fileRaw: '1-_akicgdMGMSPHjXVsB-tgsqRCyyzcFy' },
  { id: 5, title: 'gef\u00fchlstechnisch', fileRaw: '1DJYIHM1z44qdXf_Pm9tjX3tcBYi1Km1Q' },
  { id: 6, title: 'butterweich', fileRaw: '1D3ZvwOkjYrOXA5xNVy7D_GcdGSQAyDqZ' },
  { id: 7, title: 'fluss', fileRaw: '1OKIbmZlk5iBP9xccNop53GsyQtvPNfxE' },
  { id: 8, title: 'lalilove', fileRaw: '1v18wQyazriQPEZ0w-tKBnXNEKHcd6eqh' },
  { id: 9, title: 'lowlifespielerpolitikfickzeit vorbei', fileRaw: '1t6NWG7pSnEC31Cyx8HIEnI1jHmWhAKkC' },
  { id: 10, title: 'melodie', fileRaw: '1x3vK_V126mX08gLqBeDcwscHWf9t2iH-' },
  { id: 11, title: 'nice', fileRaw: '1j5G51R3I8sqMk9aDJgltUZx7xYHnCXFo' },
  { id: 12, title: 'party', fileRaw: '131QUabmPIL0D_MaC2nBVRl4G9czLu1sx' },
  { id: 13, title: 'paralyze', fileRaw: '1mCTVWcZCHFbmC0fGH0n2ick-B9Dl3K-p' },
  { id: 14, title: 'pfand II', fileRaw: '1K0DvPFD6aABlisSVB9tgpDebE1QTKnbd' },
  { id: 15, title: 'danke an jesus', fileRaw: '1tLxkZ1T7RxzUMT19SOihMjcf7Ly1rRJK' },
  { id: 16, title: 'schizo nur ein shizo', fileRaw: '131sCnZ9FhwHjtRbpBHpEUUbkljgnpO5V' }
].map(t => ({ id: 'p1-' + t.id, title: t.title, file: 'https://docs.google.com/uc?export=download&id=' + t.fileRaw }));\n\n"""

out += "export const player2Tracks = [\n"
for i, t in enumerate(tracks2):
    title_escaped = t['title'].replace("'", "\\'")
    out += f"  {{ id: 'p2-{i+1}', title: '{title_escaped}', file: 'https://docs.google.com/uc?export=download&id={t['fileRaw']}' }},\n"
out += "];\n\n"

out += "export const allTracks = [...player1Tracks, ...player2Tracks];\n"

with open("app/music/tracks.ts", "w", encoding="utf-8") as f:
    f.write(out)
