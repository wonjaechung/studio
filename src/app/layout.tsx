import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Script from 'next/script';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AP Learning Platform",
  description: "Comprehensive toolkit for AP Statistics and Economics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Navigation />
        {children}
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.8.0/math.min.js" strategy="beforeInteractive" />
        <Script src="https://cdn.plot.ly/plotly-2.32.0.min.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
