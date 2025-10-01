import { NextResponse } from 'next/server';
import { searchPlaces } from '@/app/lib/places';

export async function POST(req) {
    try {
        const body = await req.json();
        const data = await searchPlaces(body);
        return NextResponse.json(data ?? { results: [], nextPageToken: null }, { status: 200 });
    } catch (err) {
        const status = err?.response?.status || (err?.message?.includes('Invalid') ? 400 : 500);
        const payload = {
            error: err?.message || 'Server error',
            code: err?.code ?? null,
            details: {
                from: 'server',
                cause: err?.cause ?? null,
                axiosData: err?.response?.data ?? null,
            },
        };
        return NextResponse.json(payload, { status });
    }
}

export async function GET() {
    return Response.json({ ok: true });
}
