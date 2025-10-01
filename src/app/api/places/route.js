import { NextResponse } from 'next/server';
import axios from 'axios';

const NEARBY_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
const DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';

const isNum = (v) => typeof v === 'number' && !Number.isNaN(v);
const MAX_DETAILS = 10;

function normalizePlace(basic, details) {
    return {
        placeId: basic.place_id || details?.result?.place_id || null,
        name: details?.result?.name || basic.name || null,
        address:
            details?.result?.formatted_address ||
            basic.vicinity ||
            null,
        phone: details?.result?.formatted_phone_number || null,
    };
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { apiKey, center, radius, keyword, pageToken } = body || {};

        // Validation
        if (!apiKey) {
            return NextResponse.json({ message: 'API Key is required' }, { status: 400 });
        }
        const lat = Number(center?.lat);
        const lng = Number(center?.lng);
        const rad = Number(radius);

        if (!isNum(lat) || lat < -90 || lat > 90) {
            return NextResponse.json({ message: 'Invalid latitude' }, { status: 400 });
        }
        if (!isNum(lng) || lng < -180 || lng > 180) {
            return NextResponse.json({ message: 'Invalid longitude' }, { status: 400 });
        }
        if (!isNum(rad) || rad <= 0 || rad > 50000) {
            return NextResponse.json({ message: 'Radius must be between 1 and 50000 meters' }, { status: 400 });
        }

        // Build params
        const params = pageToken
            ? { key: apiKey, pagetoken: pageToken }
            : {
                key: apiKey,
                location: `${lat},${lng}`,
                radius: rad,
                ...(keyword ? { keyword } : {}),
            };

        // Nearby Search
        const nearbyRes = await axios.get(NEARBY_URL, {
            params,
            timeout: 10000,
            validateStatus: () => true,
        });

        if (nearbyRes.status !== 200) {
            return NextResponse.json({ message: 'Google Nearby Search failed', details: nearbyRes.statusText }, { status: 502 });
        }

        const { results = [], next_page_token: nextPageToken, status: gStatus, error_message } = nearbyRes.data || {};
        if (gStatus && gStatus !== 'OK' && gStatus !== 'ZERO_RESULTS') {
            // برخی وضعیت‌ها: OVER_QUERY_LIMIT, REQUEST_DENIED, INVALID_REQUEST, ...
            return NextResponse.json({ message: `Google API status: ${gStatus}`, details: error_message || null }, { status: 502 });
        }


        // Call Place Details
        const slice = results.slice(0, MAX_DETAILS);
        const detailsPromises = slice.map((r) =>
            axios.get(DETAILS_URL, {
                params: {
                    key: apiKey,
                    place_id: r.place_id,
                    fields: 'place_id,name,formatted_address,formatted_phone_number',
                },
                timeout: 8000,
                validateStatus: () => true,
            })
                .catch(() => ({ data: null, status: 500 }))
        );

        const detailsResponses = await Promise.all(detailsPromises);

        const normalized = slice.map((r, i) => {
            const d = detailsResponses[i];
            const ok = d && d.status === 200 && d.data && d.data.status === 'OK';
            return normalizePlace(r, ok ? d.data : null);
        });

        // If results are less than MAX_DETAILS, add the rest (without phone)
        if (results.length > MAX_DETAILS) {
            const rest = results.slice(MAX_DETAILS).map((r) =>
                normalizePlace(r, null)
            );
            normalized.push(...rest);
        }

        return NextResponse.json(
            {
                results: normalized,
                nextPageToken: nextPageToken || null,
            },
            { status: 200 }
        );
    } catch (e) {
        return NextResponse.json(
            { message: 'Server error', details: e?.message || String(e) },
            { status: 500 }
        );
    }
}
