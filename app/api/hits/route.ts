import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Local persistence file
const DATA_PATH = path.join(process.cwd(), 'counter-data.json');

interface CounterData {
    totalHits: number;
    uniqueIdentities: string[]; // Store combined IP + Fingerprint hashes
}

function getData(): CounterData {
    try {
        if (fs.existsSync(DATA_PATH)) {
            return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
        }
    } catch (e) {
        console.error('Error reading counter data', e);
    }
    return { totalHits: 0, uniqueIdentities: [] };
}

function saveData(data: CounterData) {
    try {
        fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    } catch (e) {
        // On Vercel, this might fail or be evanescent, but it's the "no database" way.
        console.error('Error saving counter data', e);
    }
}

export async function POST(req: Request) {
    try {
        const { fingerprint } = await req.json();
        const ip = req.headers.get('x-forwarded-for') || '0.0.0.0';
        const identity = `${ip}-${fingerprint}`;

        let data = getData();
        data.totalHits += 1;

        const isUnique = !data.uniqueIdentities.includes(identity);
        if (isUnique) {
            data.uniqueIdentities.push(identity);
        }

        saveData(data);

        return NextResponse.json({
            total: data.totalHits,
            unique: data.uniqueIdentities.length
        });
    } catch (err) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

// Support GET for just viewing if needed
export async function GET() {
    const data = getData();
    return NextResponse.json({
        total: data.totalHits,
        unique: data.uniqueIdentities.length
    });
}
