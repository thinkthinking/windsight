import type { Metadata } from "next";
import { PublicTracker } from "./components/public-tracker";
export const metadata: Metadata = {
  title: "windsight 观风 · 全球 AI 政策风向",
  description:
    "以时间轴和地图持续观察 GPAI、WAICO 与相关国家的 AI 政策、技术和合作动向。",
};
export default function Home() {
  return <PublicTracker />;
}
