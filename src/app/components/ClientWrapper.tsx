'use client';

import { ErrorBoundary } from './ErrorBoundary';
import Header from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Header />
      <main className="pt-16" suppressHydrationWarning>
        {children}
      </main>
      <Footer />
    </ErrorBoundary>
  );
}
