import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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

export const metadata = {
	metadataBase: new URL("https://example.com"),
	title: {
		default: "Geo Business Search (BYOT)",
		template: "%s · Geo Business Search",
	},
	description: "Find nearby businesses using your own Google Maps API key.",
	applicationName: "GBizSearch",
	icons: {
		icon: "/favicon.ico",
		apple: "/apple-touch-icon.png",
	},
	appleWebApp: {
		title: "GBizSearch",
		capable: true,
		statusBarStyle: "default",
	},
	openGraph: {
		title: "Geo Business Search (BYOT)",
		description: "Find nearby businesses using your own Google Maps API key.",
		url: "/",
		siteName: "Geo Business Search",
		images: [{ url: "/og.png", width: 1200, height: 630 }],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Geo Business Search (BYOT)",
		description: "Find nearby businesses using your own Google Maps API key.",
		images: ["/og.png"],
	},
	robots: {
		index: true,
		follow: true,
	},
	manifest: "/site.webmanifest",
};

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
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh bg-background text-foreground`}
			>
				{children}
			</body>
		</html>
	);
}
