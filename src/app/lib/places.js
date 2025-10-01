const NEARBY_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
const DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';

const _isNum = (v) => typeof v === 'number' && !Number.isNaN(v);

export const searchPlaces = async ({ apiKey, center, radius, keyword, pageToken }) => {
    // 1- Validation
    if (!apiKey) throw new Error('API Key is required');

    // 2- Create Params
    const lat = Number(center?.lat);
    const lng = Number(center?.lng);
    const rad = Number(radius);
    if (!_isNum(lat) || lat < -90 || lat > 90) throw new Error('Invalid latitude');
    if (!_isNum(lng) || lng < -180 || lng > 180) throw new Error('Invalid longitude');
    if (!_isNum(rad) || rad <= 0 || rad > 50000) throw new Error('Radius must be between 1 and 50000 meters');

    // 3- Nearby Search
    const axios = (await import('axios')).default;
    const nearbyRes = await axios.get(NEARBY_URL, {
        params: {
            key: apiKey,
            location: `${lat},${lng}`,
            radius: rad,
            ...(keyword ? { keyword } : {})
        }
    });
    if (nearbyRes.status !== 200) throw new Error('Google Nearby Search failed');
    const { results = [], next_page_token: nextPageToken, status: gStatus, error_message } = nearbyRes.data || {};
    if (gStatus && gStatus !== 'OK' && gStatus !== 'ZERO_RESULTS') throw new Error(error_message || `Google API status: ${gStatus}`);
    if (!Array.isArray(results) || results.length === 0) return { results: [], nextPageToken: null };

    // Get Details (for each place)
    const details = await Promise.all(
        results.map(async (r) => {
            const dq = new URLSearchParams({
                key: apiKey,
                place_id: r.place_id,
                fields: 'place_id,name,formatted_address,formatted_phone_number',
            });
            try {
                const dRes = await fetch(`${DETAILS_URL}?${dq.toString()}`);
                if (!dRes.ok) return null;
                const dJson = await dRes.json();
                return dJson?.status === 'OK' ? dJson : null;
            } catch {
                return null;
            }
        })
    );

    // Normalize
    const normalized = results.map((r, i) => {
        return {
            placeId: r.place_id || details[i]?.result?.place_id || null,
            name: details[i]?.result?.name || r.name || null,
            address: details[i]?.result?.formatted_address || r.vicinity || null,
            phone: details[i]?.result?.formatted_phone_number || null,
        };
    });

    // Return
    return {
        results: normalized,
        nextPageToken: nextPageToken || null
    };
}