import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | RSHBKR',
    default: 'RSHBKR | Music, Critiques, Love',
  },
  description: "The ultimate platform for underground music, raw critiques, and finding love in the noise. Share your sound, rate track with depth, and connect.",
  keywords: ["music", "critiques", "love", "rshbkr", "reviews", "underground", "artist", "rating"],
  openGraph: {
    title: 'RSHBKR',
    description: 'Music, Critiques, Love.',
    url: 'https://rshbkr.com',
    siteName: 'RSHBKR',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RSHBKR',
    description: 'Music, Critiques, Love.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
