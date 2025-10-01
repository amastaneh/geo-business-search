import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Fonts
const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
	display: "swap",
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
	display: "swap",
});

// Site metadata (sub-path aware for GitHub Pages)
export const metadata = {
	metadataBase: new URL("https://amastaneh.github.io/geo-business-search/"),
	title: {
		default: "Geo Business Search (BYOT)",
		template: "%s · Geo Business Search",
	},
	description: "Find nearby businesses using your own Google Maps API key.",
	applicationName: "GBizSearch",
	icons: {
		// Use path-relative URLs so they resolve under /geo-business-search/
		icon: "favicon.ico",
		apple: "apple-icon.png",
	},
	appleWebApp: {
		title: "GBizSearch",
		capable: true,
		statusBarStyle: "default",
	},
	openGraph: {
		title: "Geo Business Search (BYOT)",
		description: "Find nearby businesses using your own Google Maps API key.",
		url: "./",
		siteName: "Geo Business Search",
		// Use an existing asset from /public
		images: [{ url: "logo.png" }],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Geo Business Search (BYOT)",
		description: "Find nearby businesses using your own Google Maps API key.",
		images: ["logo.png"],
	},
	robots: {
		index: true,
		follow: true,
	},
	// Match your /public/manifest.json
	manifest: "manifest.json",
};

// Viewport/theme
export const viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#ffffff" },
		{ media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
	],
	colorScheme: "light dark",
	width: "device-width",
	initialScale: 1,
};

export default function RootLayout({ children }) {
	return (
		<html lang="en" dir="ltr">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh bg-background text-foreground`}>
				{children}
				<footer className="container mx-auto py-4 mt-10">
					<p className="text-center text-xs text-gray-400 dark:text-gray-600">
						&copy; {new Date().getFullYear()} Geo Business Search v{process.env.npm_package_version}. All rights reserved.
					</p>
				</footer>
			</body>
		</html>
	);
}
