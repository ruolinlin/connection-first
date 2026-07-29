import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "先连接，再解决", template: "%s｜先连接，再解决" },
  description: "当你不知道如何回应爱的人时，让我们一步一步陪你。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: { title: "先连接，再解决", description: "一本陪你学习情绪识别、沟通表达和关系修复的关系练习册。", type: "website", locale: "zh_CN" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN" suppressHydrationWarning><body>{children}</body></html>;
}
