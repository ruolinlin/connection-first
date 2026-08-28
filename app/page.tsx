import type { Metadata } from "next";
import { RelationshipFlowV2 } from "./v2/relationship-flow";

export const metadata: Metadata = {
  title: { absolute: "拆弹行动｜先连接，再解决" },
  description: "正在吵架时，不用一次想清楚。先找到下一句话和下一个动作。",
};

export default function Home() {
  return <RelationshipFlowV2 />;
}
