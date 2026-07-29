import type { Metadata } from "next";
import { RelationshipCoach } from "./relationship-coach";

export const metadata: Metadata = {
  title: "先连接，再解决｜Connection First",
  description: "一本陪你练习情绪识别、温柔回应与关系修复的关系练习册。",
};

export default function Home() {
  return <RelationshipCoach />;
}
