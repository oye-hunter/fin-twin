import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { FloatingNav } from '@/components/nav/floating-nav';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Fin-Twin — Your AI Financial Twin',
  description:
    'Effortless money tracking with natural language AI Dump, debt reminders, and pure statistical insights.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-parchment text-ink antialiased flex flex-col">
        <FloatingNav />
        <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="w-full max-w-[1100px] mx-auto px-4 py-8 text-center text-xs text-ink/40">
          Fin-Twin &copy; {new Date().getFullYear()} &middot; Built with Next.js, Groq & NeonDB
        </footer>
      </body>
    </html>
  );
}
