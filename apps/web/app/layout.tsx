import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business OS",
  description: "Local-first operating system for solo founders",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#0b0b0e] text-[#f4f4f5] min-h-screen antialiased selection:bg-white/10 selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}
