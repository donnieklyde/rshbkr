
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    
    // Check if browser sent a Range header
    const rangeHeader = request.headers.get('range');
    
    let url = `https://docs.google.com/uc?export=download&id=${id}`;

    try {
        let res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                ...(rangeHeader ? { 'Range': rangeHeader } : {})
            }
        });

        // Handle Google Drive "Virus Scan" warning for large files
        if (res.headers.get('content-type')?.includes('text/html')) {
            const html = await res.text();
            const match = html.match(/href="([^"]+confirm=([^"&]+)[^"]*)"/);
            if (match) {
                const confirmUrl = match[1].replace(/&amp;/g, '&');
                const finalUrl = confirmUrl.startsWith('http') ? confirmUrl : `https://docs.google.com${confirmUrl}`;
                console.log(`Bypassing virus scan for ID: ${id}, confirm URL: ${finalUrl}`);
                res = await fetch(finalUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        ...(rangeHeader ? { 'Range': rangeHeader } : {})
                    }
                });
            }
        }

        if (!res.ok && res.status !== 206) {
            return new NextResponse('Failed to fetch audio from Drive', { status: res.status });
        }

        const contentType = res.headers.get('content-type') || 'audio/mpeg';
        const contentRange = res.headers.get('content-range');
        const contentLength = res.headers.get('content-length');

        const headers: Record<string, string> = {
            'Content-Type': contentType,
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'no-cache', // Media streaming usually shouldn't be cached too aggressively by the proxy
        };

        if (contentRange) headers['Content-Range'] = contentRange;
        if (contentLength) headers['Content-Length'] = contentLength;

        // Stream the response body
        return new NextResponse(res.body, {
            status: res.status,
            headers,
        });
    } catch (error) {
        console.error('Audio Proxy error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
