import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the V2 calm entry and persistent safety notice", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>拆弹行动｜先连接，再解决<\/title>/);
  assert.match(html, /深呼吸/);
  assert.match(html, /跟着水波节奏呼吸/);
  assert.match(html, /直接开始/);
  assert.match(html, /先连接，再解决/);
  assert.match(html, /如果出现威胁、限制离开、摔砸物品或身体伤害/);
  assert.doesNotMatch(html, /Step\s*\d|第\s*\d+\s*步|深色模式|情绪词典|关系日记/);
});

test("ships the bounded B.1 acute flow and semantic quote system", async () => {
  const [content, flow, components, machine, styles, roadmap] = await Promise.all([
    readFile(new URL("../app/v2/content.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/v2/relationship-flow.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/v2/components.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/v2/flow-machine.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../docs/PRODUCT-ROADMAP.md", import.meta.url), "utf8"),
  ]);

  for (const label of [
    "TA愿意继续说",
    "TA还是很激动",
    "TA哭了",
    "TA不说话",
    "TA想一个人待着",
    "我们还在微信里吵",
  ]) {
    assert.match(content, new RegExp(label));
  }

  assert.match(flow, /TA说话的时候/);
  assert.match(flow, /我现在能先听完吗/);
  assert.match(flow, /退后一步看这场争执/);
  assert.match(flow, /找回“我们是一边的”/);
  assert.doesNotMatch(flow, /新的 20 分钟已经开始/);
  assert.match(flow, /现在有缓和一点吗/);
  assert.match(flow, /你想让我抱抱你，还是想自己待一会儿/);
  assert.match(flow, /这次先到这里/);
  assert.doesNotMatch(flow, /语音输入|SpeechRecognition|webkitSpeechRecognition/);
  assert.match(flow, /按表面情况初步归类/);
  assert.match(flow, /你刚刚处理的是/);
  assert.match(content, /先接住，再暂停/);
  assert.match(flow, /说完了，再提出暂停/);
  assert.match(flow, /这不是对TA真实原因的判断/);
  assert.match(flow, /说到这里先停/);
  assert.match(flow, /不要接：“但是你也……”/);
  assert.match(machine, /MICRO_ACTION_NEXT: "REACTION_SELECT"/);
  assert.match(flow, /好，你刚才想说的，你继续说，我先听/);
  assert.match(components, /function SayThisCard/);
  assert.match(components, /brand-ring--outer/);
  assert.match(components, /brand-ring--inner/);
  assert.match(components, /可以这样说/);
  assert.match(machine, /acuteInterventionCount >= 2/);
  assert.doesNotMatch(machine, /RETURN_TO_REACTION/);
  assert.match(flow, /function PauseCountdown/);
  assert.match(flow, /pauseReferenceMinutes \* 60 \* 1000/);
  assert.match(flow, /把倒计时发给TA/);
  assert.match(flow, /pauseUntil/);
  assert.match(flow, /playGentleWaterSound/);
  assert.match(flow, /时间只是参考，不代表倒计时结束就必须继续谈/);
  assert.match(flow, /想先一起换一下心情吗/);
  assert.match(flow, /在家里/);
  assert.match(flow, /在外面/);
  assert.match(flow, /它不是道歉，也不代替之后把事情说清楚/);
  assert.match(flow, /给关系存一笔/);
  assert.match(flow, /下一次怎么稳住自己/);
  assert.match(flow, /导出书签/);
  assert.match(flow, /导出手机壁纸/);
  assert.match(flow, /到首页/);
  assert.doesNotMatch(flow, /回到开始/);
  assert.match(flow, /function validatePositiveNote/);
  assert.match(flow, /function exportBookmarkCard/);
  assert.match(flow, /popstate/);
  assert.match(flow, /history\.replaceState/);
  assert.match(flow, /history\.pushState/);
  assert.match(styles, /@media \(max-width: 680px\)/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /min-height: 44px/);
  assert.match(styles, /--tiffany-primary:\s*#81d8d0/i);
  assert.match(styles, /--tiffany-deep:\s*#3f9f99/i);
  assert.match(styles, /--tiffany-mist:\s*#e8f7f5/i);
  assert.match(styles, /--breath-level/);
  assert.match(components, /const cycleDuration = 12_000/);
  assert.match(components, /window\.cancelAnimationFrame/);
  assert.match(styles, /\.say-this-card/);
  assert.match(styles, /\.ambient-waves/);
  assert.match(styles, /@keyframes ambient-wave-drift/);
  assert.match(styles, /\.completion-convergence/);
  assert.match(styles, /\.bookmark-preview/);
  assert.doesNotMatch(content, /title:\s*"[^"]*。"/);
  assert.doesNotMatch(flow, /<h1[^>]*>[^<{]*。<\/h1>/);
  assert.doesNotMatch(styles, /#4d49fc|#3733d9|h1:focus-visible/i);
  assert.match(roadmap, /Milestone D/);
  assert.match(roadmap, /给关系充点电/);
});
