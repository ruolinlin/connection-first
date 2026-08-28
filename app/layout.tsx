/* eslint-disable @next/next/no-sync-scripts -- 51.la requires its collector before the inline initializer. */
import type { Metadata } from "next";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://connection-first-cn.ruolinlin17.chatgpt.site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "拆弹行动", template: "%s｜拆弹行动" },
  description: "正在吵架时，先找到下一句话和下一个动作。先连接，再解决。",
  icons: { icon: `${basePath}/favicon.svg`, shortcut: `${basePath}/favicon.svg` },
  openGraph: { title: "拆弹行动", description: "不用一次想清楚，我们先找下一步。", type: "website", locale: "zh_CN", images: [{ url: `${basePath}/og.jpg`, width: 1200, height: 630, alt: "拆弹行动" }] },
  twitter: { card: "summary_large_image", title: "拆弹行动", description: "不用一次想清楚，我们先找下一步。", images: [`${basePath}/og.jpg`] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        {children}
        <script charSet="UTF-8" id="LA_COLLECT" src="//sdk.51.la/js-sdk-pro.min.js" />
        <script dangerouslySetInnerHTML={{ __html: 'LA.init({id:"3R1TL0jmEItYBYVM",ck:"3R1TL0jmEItYBYVM"})' }} />
      </body>
    </html>
  );
}
