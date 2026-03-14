
export interface DriveFile {
    id: string;
    name: string;
    description?: string;
    type: 'file' | 'text' | 'image';
    link: string;
    downloadLink: string;
    imageLink?: string;
}

export async function getFolderFiles(folderId: string): Promise<DriveFile[]> {
    const url = `https://drive.google.com/drive/folders/${folderId}?usp=sharing`;

    try {
        const res = await fetch(url, {
            next: { revalidate: 60 }, // Cache for 1 minute instead of 1 hour to test
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        if (!res.ok) throw new Error(`Failed to fetch folder: ${res.status} ${res.statusText}`);
        const html = await res.text();

        // Simple regex to find file IDs and names in the Google Drive HTML
        // regex1 matches patterns like ["ID", "Name.ext"] (older format)
        // regex2 matches HTML-escaped equivalents (newer format)
        const regex1 = /\["([a-zA-Z0-9_-]{22,35})",.*?"([^"]+)"/g;
        const regex2 = /&quot;([a-zA-Z0-9_-]{22,35})&quot;.*?&quot;((?:(?!&quot;).)*?(?:\.mp3|\.txt|\.jpg|\.jpeg|\.png|\.gif|\.webp|\.zip|\.rar|\.exe|\.pdf|\.docx))&quot;/gi;

        const rawMatches1 = Array.from(html.matchAll(regex1));
        const rawMatches2 = Array.from(html.matchAll(regex2));

        // Combine all possible matches
        let allMatches = [...rawMatches1, ...rawMatches2];

        const seenIds = new Set();
        let matches = allMatches.filter(m => {
            const id = m[1];
            const name = m[2];

            // Deduplicate
            if (seenIds.has(id)) return false;

            // Filter out obvious noise (like folder IDs matching)
            if (/^[a-zA-Z0-9_-]{20,}$/.test(name)) return false; // Name shouldn't be an ID

            seenIds.add(id);
            return true;
        });

        // Fallback filter: if the list has a lot of noise, we ensure the names actually look like filenames
        // We do this by checking if they contain a dot with an extension.
        const validNames = matches.filter(m => /\.(mp3|txt|jpg|jpeg|png|gif|webp|zip|rar|exe|pdf|docx)$/i.test(m[2]));
        if (validNames.length > 0) {
            matches = validNames;
        }

        return matches.map(match => {
            const id = match[1];
            const name = match[2];
            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
            const isText = /\.txt$/i.test(name);

            // Clean name: strip extensions from anywhere they appear as a suffix to a word
            const cleanString = (s: string) => s.replace(/\.(exe|zip|rar|7z|msi|pdf|jpg|jpeg|png|mp3|wav|mp4|mov|docx)(\b|$)/gi, "").trim();

            let title = cleanString(name);
            let description = '';

            if (name.includes(' - ')) {
                const parts = name.split(' - ');
                title = cleanString(parts[0]);
                description = cleanString(parts.slice(1).join(' - '));
            }

            return {
                id,
                name: title,
                description,
                type: isImage ? 'image' : isText ? 'text' : 'file',
                link: `https://drive.google.com/file/d/${id}/view`,
                downloadLink: `https://docs.google.com/uc?export=download&id=${id}`,
                imageLink: isImage ? `/api/drive/image/${id}` : undefined
            };
        });
    } catch (err) {
        console.error('Error fetching drive folder:', err);
        return [];
    }
}

export async function getFileContent(fileId: string): Promise<string> {
    const url = `https://docs.google.com/uc?export=download&id=${fileId}`;
    try {
        const res = await fetch(url);
        if (!res.ok) return '';
        return await res.text();
    } catch (err) {
        console.error('Error fetching file content:', err);
        return '';
    }
}
