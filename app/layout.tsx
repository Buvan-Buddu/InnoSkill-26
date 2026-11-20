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
  metadataBase: new URL('https://innoskill.ai'),
  title: "InnoSkill AI — Inclusive Career Companion",
  description: "InnoSkill AI is an inclusive AI-powered career companion for accessible job discovery, resume intelligence, career development, and interview preparation.",
  icons: {
    icon: [
      { url: "/branding/innoskill-ai-favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/branding/innoskill-ai-icon.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico" }
    ],
    shortcut: "/branding/innoskill-ai-favicon.png",
    apple: "/branding/innoskill-ai-icon.png",
  },
  openGraph: {
    title: "InnoSkill AI — Inclusive Career Companion",
    description: "InnoSkill AI is an inclusive AI-powered career companion for accessible job discovery, resume intelligence, career development, and interview preparation.",
    url: "https://innoskill.ai",
    siteName: "InnoSkill AI",
    images: [
      {
        url: "/branding/innoskill-ai-logo.png",
        width: 1024,
        height: 440,
        alt: "InnoSkill AI — Inclusive Career Companion",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "InnoSkill AI — Inclusive Career Companion",
    description: "InnoSkill AI is an inclusive AI-powered career companion for accessible job discovery, resume intelligence, career development, and interview preparation.",
    images: ["/branding/innoskill-ai-logo.png"],
  },
};

import { AuthProvider } from '@/context/AuthContext';
import { VoiceAgentProvider } from '@/context/VoiceAgentContext';
import VoiceAgentWidget from '@/components/layout/VoiceAgentWidget';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          <VoiceAgentProvider>
            {children}
            <VoiceAgentWidget />
          </VoiceAgentProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
