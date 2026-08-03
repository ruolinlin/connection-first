import type { Metadata } from "next";
import { RelationshipCoach } from "./relationship-coach";

export const metadata: Metadata = {
  title: "拆弹行动｜先连接，再解决",
  description: "当你不知道如何回应爱的人时，让我们一步一步陪你。",
};

export default function Home() {
  return <RelationshipCoach />;
}
