import { NextResponse } from 'next/server';
import { searchPlaces } from '@/app/lib/places';

export async function POST(req) {
    try {
        const body = await req.json();
        const data = await searchPlaces(body);
        return NextResponse.json(data ?? { results: [], nextPageToken: null }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: err?.message || 'Server error' }, { status: 400 });
    }
}
