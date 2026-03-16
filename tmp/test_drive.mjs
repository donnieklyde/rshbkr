
import fs from 'fs';
const id = '1wAAIafBNn1HTcPE6nf3jQUfErOBD6JQD';
const url = `https://docs.google.com/uc?export=download&id=${id}`;

async function testFetch() {
    let log = '';
    const addLog = (msg) => {
        console.log(msg);
        log += msg + '\n';
    };

    addLog(`Fetching ${url}...`);
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        addLog(`Status: ${res.status}`);
        addLog(`Content-Type: ${res.headers.get('content-type')}`);
        addLog(`Content-Length: ${res.headers.get('content-length')}`);

        const buffer = await res.arrayBuffer();
        addLog(`Buffer length: ${buffer.byteLength}`);

        if (res.headers.get('content-type').includes('text/html')) {
            addLog('WARNING: Drive returned HTML instead of audio.');
            const text = new TextDecoder().decode(buffer.slice(0, 1000));
            addLog('HTML Snippet:');
            addLog(text);
        } else {
            addLog('Success: Received non-HTML content.');
        }
    } catch (err) {
        addLog(`Fetch error: ${err.message}`);
    }

    fs.writeFileSync('c:\\Users\\peppe\\Documents\\AI_slop\\rshbkr\\tmp\\log.txt', log, 'utf8');
}

testFetch();
