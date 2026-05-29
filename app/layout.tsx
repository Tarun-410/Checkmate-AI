import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Checkmate AI — AI Chess Coaching Platform",
  description:
    "Improve your chess with AI-powered game analysis. Get human-friendly explanations of your mistakes, personalized coaching, and actionable insights to level up your game.",
  keywords: ["chess", "AI coaching", "chess analysis", "improve chess", "chess mistakes", "Stockfish"],
  openGraph: {
    title: "Checkmate AI — AI Chess Coaching Platform",
    description: "AI-powered chess coaching that explains your mistakes in plain English.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#080810] text-[#f1f5f9] antialiased">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
