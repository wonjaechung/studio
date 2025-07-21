import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'InsightFlow',
  description: 'All-in-One Analytics Dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        {children}
      </body>
    </html>
  );
}
