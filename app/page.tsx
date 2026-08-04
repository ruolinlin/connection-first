import type { Metadata } from "next";
import { RelationshipCoach } from "./relationship-coach";

export const metadata: Metadata = {
  title: "拆弹行动｜先连接，再解决",
  description: "判断冲突类型，获得对应话术，决定是否暂停，再一步一步缓和关系。",
};

export default function Home() {
  return <RelationshipCoach />;
}
