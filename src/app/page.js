'use client';
import { useState } from 'react';
import Image from "next/image";

export default function HomePage() {
	const [apiKey, setApiKey] = useState('');
	const [lat, setLat] = useState('43.7177675');
	const [lng, setLng] = useState('-79.707699');
	const [radius, setRadius] = useState('500');
	const [keyword, setKeyword] = useState('');
	const [results, setResults] = useState([]);
	const [nextPageToken, setNextPageToken] = useState(null);
	const [loading, setLoading] = useState(false);
	const [err, setErr] = useState('');
	const [copied, setCopied] = useState(false);
	const total = results.length;

	const search = async (pageToken) => {
		setLoading(true);
		setErr('');
		try {
			const res = await fetch('/api/places', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					apiKey,
					center: { lat: parseFloat(lat), lng: parseFloat(lng) },
					radius: parseInt(radius, 10),
					keyword: keyword || undefined,
					pageToken: pageToken || undefined
				})
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data?.message || 'Request failed');
			setResults(prev => pageToken ? [...prev, ...(data.results || [])] : (data.results || []));
			setNextPageToken(data.nextPageToken || null);
			if (apiKey) { maybeStoreApiKey('GeoBiz Search'); }
		} catch (e) {
			setErr(e.message);
			setResults([]);
			setNextPageToken(null);
		} finally {
			setLoading(false);
		}
	};

	const onSubmit = (e) => {
		e.preventDefault();
		// اعتبارسنجی ساده سمت کلاینت
		if (!apiKey) return setErr('API Key is required.');
		if (!lat || !lng) return setErr('Latitude and Longitude are required.');
		if (!radius || Number.isNaN(Number(radius)) || Number(radius) <= 0) {
			return setErr('Radius must be a positive number.');
		}
		search();
	};

	const goNext = async () => {
		if (!nextPageToken) return;
		// Wait a bit for the token to become active
		await new Promise(r => setTimeout(r, 2000));
		search(nextPageToken);
	};

	const maybeStoreApiKey = async (label = 'GeoBiz Search') => {
		try {
			if (navigator.credentials?.store && window.PasswordCredential) {
				const cred = new PasswordCredential({
					id: label,              // username-like id
					name: 'Google Maps API Key',
					password: apiKey,       // the secret to store
				});
				await navigator.credentials.store(cred);
			}
		} catch (_ex) { }
	}

	const copyResults = async () => {
		try {
			const rows = results.map(r => `${r.name || '-'}\t${r.address || '-'}\t${r.phone || '-'}`).join('\n');
			await navigator.clipboard.writeText(rows || '');
			setCopied(true);
			setTimeout(() => setCopied(false), 1200);
		} catch (_ex) { }
	};


	return (
		<main className="mx-auto max-w-3xl p-6">
			<h1 className="flex items-center text-2xl font-semibold mb-4">
				<Image
					src="/logo.png"
					alt="Logo"
					width={40}
					height={40}
				/>
				<span className="ml-3">
					Geo Business Search (BYOT)
				</span>
			</h1>
			<form onSubmit={onSubmit} autoComplete="on" className="space-y-3 bg-white/50 py-4 rounded-xl">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<div className="w-full md:col-span-2">
						<label className="block text-sm mb-1">Google Maps API Key *</label>
						<div className="flex w-full rounded-md shadow-sm">
							<input
								type="text"
								name="api_key_label"
								autoComplete="username"
								className="hidden"
								defaultValue="GeoBiz Search"
							/>
							<input
								type="password"
								name="google_api_key"
								autoComplete="current-password"
								className="flex-1 rounded-l-md border border-gray-300 px-3 py-2 focus:outline-none"
								value={apiKey}
								onChange={(e) => setApiKey(e.target.value)}
								placeholder="Your Google Maps API Key"
								aria-label="Google Maps API Key"
							/>
							<a
								href="https://console.cloud.google.com/apis/credentials"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center px-3 rounded-r-md border border-gray-300 border-l-0 bg-gray-50 text-sm text-gray-600 hover:bg-gray-100"
								title="Open Google Cloud to get an API key"
							>
								?
							</a>
						</div>
						<p className="text-xs text-gray-500 mt-1">
							Open the Google Cloud Console, select or create a project, go to the <a href="https://console.cloud.google.com/apis/library" target="_blank" rel="noopener noreferrer" className="underline">API Library</a> and enable <strong>Places API</strong> (required) and <strong>Maps JavaScript API</strong> (if you will show a map). Then open <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline">APIs &amp; Services → Credentials</a>, click <strong>Create Credentials → API key</strong>, copy the key, and paste it above.
						</p>
					</div>
					<div>
						<label className="block text-sm mb-1">Keyword (optional)</label>
						<input
							className="w-full rounded-md border border-gray-300 px-3 py-2"
							value={keyword}
							onChange={(e) => setKeyword(e.target.value)}
							placeholder="e.g. cafe, restaurant"
						/>
					</div>
					<div>
						<label className="block text-sm mb-1">Latitude *</label>
						<input
							className="w-full rounded-md border border-gray-300 px-3 py-2"
							value={lat}
							onChange={(e) => setLat(e.target.value)}
							placeholder="43.7177675"
						/>
					</div>
					<div>
						<label className="block text-sm mb-1">Longitude *</label>
						<input
							className="w-full rounded-md border border-gray-300 px-3 py-2"
							value={lng}
							onChange={(e) => setLng(e.target.value)}
							placeholder="-79.707699"
						/>
					</div>
					<div>
						<label className="block text-sm mb-1">Radius (meters) *</label>
						<input
							className="w-full rounded-md border border-gray-300 px-3 py-2"
							value={radius}
							onChange={(e) => setRadius(e.target.value)}
							placeholder="2000"
						/>
					</div>
				</div>

				<div className="flex gap-2">
					<button
						type="submit"
						className="rounded-md bg-brand text-white px-4 py-2 disabled:opacity-60 hover:bg-brand/90 cursor-pointer"
						disabled={loading}
					>
						{loading ? 'Searching...' : 'Search'}
					</button>

					{nextPageToken && (
						<button
							type="button"
							className="rounded-md border border-gray-300 px-4 py-2 disabled:opacity-60 hover:bg-gray-100 cursor-pointer"
							onClick={goNext}
							disabled={loading}
						>
							{loading ? 'Loading...' : 'Load more'}
						</button>
					)}
				</div>

				{err && <p className="text-red-600 text-sm">{err}</p>}
			</form>

			<section className="mt-6">
				<div className="mb-2 flex items-center justify-between">
					<h2 className="text-lg font-medium">
						Results{' '}
						<span className="ml-2 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
							{results.length}
						</span>
					</h2>

					<div className="flex items-center gap-2">
						{copied && (
							<span className="text-xs text-gray-500">Copied</span>
						)}
						<button
							type="button"
							onClick={copyResults}
							aria-label="Copy results"
							title="Copy results"
							className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 hover:bg-gray-100 active:scale-95 cursor-pointer"
						>
							{/* minimal copy icon (SVG) */}
							<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
								<rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2"></rect>
								<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2"></path>
							</svg>
						</button>
					</div>
				</div>

				{loading && <p>Loading...</p>}
				{!loading && results.length === 0 && !err && <p className="text-sm text-gray-600">No results.</p>}

				{results.length > 0 && (
					<div className="overflow-x-auto border border-gray-300 rounded-md">
						<table className="min-w-full text-xs">
							<thead className="bg-gray-100">
								<tr>
									<th className="text-left p-3">#</th>
									<th className="text-left p-3">Name</th>
									<th className="text-left p-3">Address</th>
									<th className="text-left p-3">Phone</th>
								</tr>
							</thead>
							<tbody>
								{[...results].reverse()?.map((r, i) => (
									<tr key={r.placeId || i} className="border-t border-gray-300 ">
										<td className="p-3">{total - i}</td>
										<td className="p-3">{r.name || '-'}</td>
										<td className="p-3">{r.address || '-'}</td>
										<td className="p-3 whitespace-nowrap">{r.phone || '-'}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</section>
		</main>
	);
}