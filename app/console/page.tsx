import type { Metadata } from "next";
import { EnterpriseAtlas } from "../components/enterprise-atlas";
export const metadata: Metadata = {
  title: "企业工作台 · windsight 观风",
  description:
    "维护企业与业务画像，将全球政策动向转化为与业务相关的 AI 策略建议。默认免登录演示。",
};
export default function ConsolePage() {
  return <EnterpriseAtlas />;
}
