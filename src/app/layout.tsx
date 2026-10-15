import type { Metadata } from "next";
import { Cormorant_Garamond, Noto_Serif_JP, Noto_Naskh_Arabic, Noto_Sans_JP, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const notoSerifJp = Noto_Serif_JP({
  variable: "--font-jp",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const notoNaskhArabic = Noto_Naskh_Arabic({
  variable: "--font-ar",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

const notoSansJp = Noto_Sans_JP({
  variable: "--font-jp-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "ORIGINS — Leap of Faith",
  description: "An ancient cinematic journey. Assassin's Creed Origins inspired editorial experience.",
  keywords: ["Assassin's Creed", "Origins", "cinematic", "ancient", "editorial"],
  authors: [{ name: "Z.ai" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${cormorant.variable} ${inter.variable} ${notoSerifJp.variable} ${notoNaskhArabic.variable} ${notoSansJp.variable} antialiased bg-[#020514] text-[#f0f0f0]`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
