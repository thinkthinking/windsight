import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "观风 windsight · 全球企业 AI 战略情报",
  description:
    "追踪 GPAI、WAICO 与成员国的 AI 政策、模型和产业动向，为全球化企业提供有据可循的 AI 战略建议。",
  applicationName: "观风 windsight",
  openGraph: {
    title: "观风 windsight · 全球企业 AI 战略情报",
    description: "观全球风向，知企业进退。连接政策、技术与企业决策。",
    locale: "zh_CN",
    type: "website",
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
