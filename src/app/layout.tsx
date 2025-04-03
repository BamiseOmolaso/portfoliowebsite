import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { validateEnv } from '@/lib/config';

const inter = Inter({ subsets: ['latin'] });

// Validate environment variables at startup
validateEnv();

export const metadata: Metadata = {
  title: 'Bamise Omolaso - Full Stack Developer & Cloud Engineer',
  description:
    'Personal portfolio website of Bamise Omolaso, showcasing projects, blog posts, and professional experience.',
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
    ],
    apple: {
      url: '/apple-touch-icon.png',
      sizes: '180x180',
    },
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#1F2937" />
      </head>
      <body className={`${inter.className} bg-gray-950 text-white`}>
        <ErrorBoundary>
          <Navbar />
          <main className="min-h-screen pt-16">{children}</main>
          <Footer />
        </ErrorBoundary>
      </body>
    </html>
  );
}
