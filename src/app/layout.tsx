import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/context/ThemeProvider';
import { CurrencyProvider } from '@/context/CurrencyProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Web Ledger Lite',
  description: 'Manage your income and expenses effortlessly.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="ledger-theme">
          <CurrencyProvider>
            {children}
            <Toaster />
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
