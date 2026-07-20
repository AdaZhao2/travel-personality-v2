import type { Metadata } from "next";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const siteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: "Travel Personality Indicator｜AI算法看穿你的旅行人格",
  description: "16 道不正经选择题，用本地趣味规则测出你的旅行人格、异世界目的地和现实出发方案",
  openGraph: {
    title: "Travel Personality Indicator",
    description: "16 道互联网行为题，测出你的旅行人格",
    type: "website",
    locale: "zh_CN",
    url: `${basePath}/`,
    images: [{
      url: `${basePath}/social-preview.png`,
      width: 1200,
      height: 630,
      alt: "Travel Personality Indicator 几何动物人格测试",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Travel Personality Indicator",
    description: "16 道互联网行为题，测出你的旅行人格",
    images: [`${basePath}/social-preview.png`],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
