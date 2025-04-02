import { Metadata } from 'next';

export const defaultMetadata: Metadata = {
  title: 'Oluwabamise Omolaso - Full Stack Developer',
  description: 'Portfolio website of Oluwabamise Omolaso, a Full Stack Developer specializing in modern web technologies.',
  keywords: ['Full Stack Developer', 'Web Developer', 'React', 'Next.js', 'TypeScript', 'Node.js'],
  authors: [{ name: 'Oluwabamise Omolaso' }],
  creator: 'Oluwabamise Omolaso',
  publisher: 'Oluwabamise Omolaso',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://yourdomain.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://yourdomain.com',
    title: 'Oluwabamise Omolaso - Full Stack Developer',
    description: 'Portfolio website of Oluwabamise Omolaso, a Full Stack Developer specializing in modern web technologies.',
    siteName: 'Oluwabamise Omolaso',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Oluwabamise Omolaso - Full Stack Developer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oluwabamise Omolaso - Full Stack Developer',
    description: 'Portfolio website of Oluwabamise Omolaso, a Full Stack Developer specializing in modern web technologies.',
    images: ['/twitter-image.jpg'],
    creator: '@yourtwitterhandle',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification',
  },
};

export const getMetadata = (metadata?: Partial<Metadata>): Metadata => {
  return {
    ...defaultMetadata,
    ...metadata,
  };
}; 