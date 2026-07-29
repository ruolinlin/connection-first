import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://connection-first-cn.ruolinlin17.chatgpt.site"),
  title: { default: "先连接，再解决", template: "%s｜先连接，再解决" },
  description: "当你不知道如何回应爱的人时，让我们一步一步陪你。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: { title: "先连接，再解决", description: "说清情境，先慢下来，再走下一步。", type: "website", locale: "zh_CN", images: [{ url: "/og.png", width: 1200, height: 630, alt: "先连接，再解决" }] },
  twitter: { card: "summary_large_image", title: "先连接，再解决", description: "说清情境，先慢下来，再走下一步。", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN" suppressHydrationWarning><body>{children}</body></html>;
}
