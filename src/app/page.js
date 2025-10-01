'use client';
import { useState } from 'react';
import Image from "next/image";
import axios from 'axios';
import { FiEye, FiEyeOff, FiClipboard, FiExternalLink, FiLoader } from "react-icons/fi";

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
	const [showPassword, setShowPassword] = useState(false);
	const total = results.length;

	const search = async (pageToken) => {
		setLoading(true);
		setErr('');

		// Wait a bit for the token to become active
		if (pageToken) await new Promise(r => setTimeout(r, 2000));

		axios.post('/api/places', {
			apiKey,
			center: { lat: parseFloat(lat), lng: parseFloat(lng) },
			radius: parseInt(radius, 10),
			keyword: keyword || undefined,
			pageToken: pageToken || undefined
		})
			.then((res) => {
				const data = res?.data;
				if (!data) throw new Error('Request failed');
				setResults(prev => pageToken
					? [...prev, ...(data.results || [])]
					: (data.results || [])
				);
				setNextPageToken(data.nextPageToken || null);
				if (apiKey) { maybeStoreApiKey('GeoBiz Search'); }
			})
			.catch(ex => {
				// 1- Log full error
				const isAxios = !!ex.isAxiosError;
				const serverMsg =
					ex?.response?.data?.error ??
					ex?.response?.data?.message ??
					ex?.response?.data?.detail ??
					null;
				const status = ex?.response?.status;
				const statusText = ex?.response?.statusText;
				const humanMsg = serverMsg || (status ? `HTTP ${status}${statusText ? ` ${statusText}` : ''}` : ex.message);
				console.group('Request failed');
				console.error('Message:', humanMsg);
				console.error('URL:', ex?.config?.url);
				console.error('Method:', ex?.config?.method);
				console.error('Status:', status, statusText);
				console.error('Response data:', ex?.response?.data);
				console.error('Response headers:', ex?.response?.headers);
				console.error('Config:', ex?.config);
				if (typeof ex?.toJSON === 'function') { console.error('toJSON():', ex.toJSON()); }
				console.error('Full error object:', ex);
				console.groupEnd();

				// 2- Show friendly message
				setErr(ex.message);

				// 3- Clear results
				setResults([]);
				setNextPageToken(null);
			})
			.finally(() => {
				setLoading(false);
			});
	};

	const onSubmit = (e) => {
		e.preventDefault();
		if (!apiKey) return setErr('API Key is required.');
		if (!lat || !lng) return setErr('Latitude and Longitude are required.');
		if (!radius || Number.isNaN(Number(radius)) || Number(radius) <= 0) {
			return setErr('Radius must be a positive number.');
		}
		search();
	};

	const handleLoadMore = async () => {
		if (!nextPageToken) return;
		search(nextPageToken);
	};

	const maybeStoreApiKey = async (label = 'GeoBiz Search') => {
		try {
			if (navigator.credentials?.store && window.PasswordCredential) {
				const cred = new PasswordCredential({
					id: label, // username-like id
					name: 'Google Maps API Key',
					password: apiKey, // the secret to store
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

	const showFilters = () => (
		<form onSubmit={onSubmit} autoComplete="on" className="space-y-3 py-4 rounded-xl">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				<div className="w-full md:col-span-2">
					<label className="block text-sm mb-1">Google Maps API Key *</label>
					<div className="flex w-full rounded-md shadow-sm relative">
						<input
							type="text"
							name="api_key_label"
							autoComplete="username"
							className="hidden"
							defaultValue="GeoBiz Search"
						/>
						<input
							type={showPassword ? "text" : "password"}
							name="google_api_key"
							autoComplete="current-password"
							className="flex-1 rounded-l-md border border-gray-300 px-3 py-2 focus:outline-none"
							value={apiKey}
							onChange={(e) => setApiKey(e.target.value)}
							placeholder="Your Google Maps API Key"
							aria-label="Google Maps API Key"
						/>
						<button
							type="button"
							className="absolute right-10 top-1/2 -translate-y-1/2 px-2 text-gray-600 hover:text-gray-900 focus:outline-none cursor-pointer"
							onClick={() => setShowPassword((v) => !v)}
							tabIndex={-1}
							aria-label={showPassword ? "Hide API Key" : "Show API Key"}
						>
							{showPassword
								? <FiEyeOff size={16} aria-hidden="true" />
								: <FiEye size={16} aria-hidden="true" />
							}
						</button>
						<a
							href="https://console.cloud.google.com/apis/credentials"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center px-3 rounded-r-md border border-gray-300 border-l-0 bg-gray-50 text-sm text-gray-600 hover:bg-gray-100"
							title="Open Google Cloud to get an API key"
						>
							<FiExternalLink size={16} aria-hidden="true" />
							<span className="sr-only">Open Google Cloud</span>
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
					className="rounded-md bg-brand text-white px-4 py-2 disabled:opacity-60 hover:bg-brand/90 cursor-pointer inline-flex items-center gap-2"
					disabled={loading}
				>
					{loading ? (<><FiLoader className="animate-spin" aria-hidden="true" /> Searching...</>) : 'Search'}
				</button>

				{nextPageToken && (
					<button
						type="button"
						className="rounded-md border border-gray-300 px-4 py-2 disabled:opacity-60 hover:bg-gray-100 cursor-pointer inline-flex items-center gap-2"
						onClick={handleLoadMore}
						disabled={loading}
					>
						{loading ? (<><FiLoader className="animate-spin" aria-hidden="true" /> Loading...</>) : 'Load more'}
					</button>
				)}
			</div>

			{err && <p className="text-red-600 text-sm">{err}</p>}
		</form>
	);

	const showResultTable = () => {
		if (!loading && results.length === 0 && !err) return <p className="text-sm text-gray-600">No results.</p>;

		if (loading) return (
			<p className="text-sm text-gray-600 flex items-center">
				<FiLoader className="inline-block mr-2 animate-spin" aria-hidden="true" /> Loading...
			</p>
		);

		return <>
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
						<FiClipboard size={16} aria-hidden="true" />
					</button>
				</div>
			</div>




			{results.length > 0 &&
				<div className="overflow-x-auto border border-gray-300 rounded-md">
					<table className="min-w-full text-xs">
						<thead className="bg-gray-100 text-gray-600">
							<tr>
								<th className="text-left p-3">#</th>
								<th className="text-left p-3">Name</th>
								<th className="text-left p-3">Address</th>
								<th className="text-left p-3">Phone</th>
							</tr>
						</thead>
						<tbody>
							{[...results].reverse()?.map((r, i) => (
								<tr
									key={i || r.placeId}
									className="border-t border-gray-300 "
								>
									<td className="p-3">{total - i}</td>
									<td className="p-3">{r.name || '-'}</td>
									<td className="p-3">{r.address || '-'}</td>
									<td className="p-3 whitespace-nowrap">{r.phone || '-'}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>}
		</>
	};

	return (
		<main className="mx-auto max-w-3xl p-6">
			<h1 className="flex items-center text-2xl font-semibold mb-4">
				<Image src="/logo.png" alt="Logo" width={40} height={40} />
				<span className="ml-3"> Geo Business Search (BYOT)</span>
			</h1>

			{showFilters()}

			<section className="mt-6">
				{showResultTable()}
			</section>
		</main>
	);
}