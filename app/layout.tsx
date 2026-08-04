import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://connection-first-cn.ruolinlin17.chatgpt.site"),
  title: { default: "拆弹行动", template: "%s｜拆弹行动" },
  description: "判断冲突类型，获得对应话术，决定是否暂停，再一步一步缓和关系。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: { title: "拆弹行动", description: "别让情绪，炸掉关系。", type: "website", locale: "zh_CN", images: [{ url: "/og.png", width: 1200, height: 630, alt: "拆弹行动" }] },
  twitter: { card: "summary_large_image", title: "拆弹行动", description: "别让情绪，炸掉关系。", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN" suppressHydrationWarning><body>{children}</body></html>;
}
