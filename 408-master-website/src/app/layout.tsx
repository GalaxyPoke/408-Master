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
  title: "408-Master | 计算机考研一站式学习平台",
  description: "408-Master 是一款专为计算机考研（408统考）设计的学习应用，集成了刷题、视频学习、笔记、学习管理等功能，帮助考研党高效备考。",
  keywords: ["408考研", "计算机考研", "数据结构", "计算机组成原理", "操作系统", "计算机网络", "考研刷题"],
  authors: [{ name: "408-Master Team" }],
  openGraph: {
    title: "408-Master | 计算机考研一站式学习平台",
    description: "专为408统考设计的智能学习应用，助你一战成硕！",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-white`}
      >
        {children}
      </body>
    </html>
  );
}
