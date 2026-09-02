import type {
  Channel,
  FlowStage,
  Intensity,
  MicroActionContent,
  ReactionBranch,
  ReactionId,
} from "./types.ts";

export const intensityOptions: Array<{ id: Intensity; label: string }> = [
  { id: "tense", label: "有点僵" },
  { id: "arguing", label: "已经吵起来了" },
  { id: "losing-control", label: "快控制不住了" },
];

export const channelOptions: Array<{ id: Channel; label: string }> = [
  { id: "face-to-face", label: "面对面" },
  { id: "text", label: "微信或短信" },
  { id: "phone", label: "电话" },
];

export function getSituationClassification(
  description: string,
  intensity: Intensity,
  channel: Channel,
) {
  const text = description.trim();

  if (/哭|流泪|掉眼泪/.test(text)) {
    return { label: "TA正在哭", goal: "先确认TA想靠近，还是想要一点空间。" };
  }
  if (/沉默|不说话|不回应|不回我|不理我/.test(text)) {
    return { label: "对话暂时中断", goal: "先停止追问，降低被逼迫感。" };
  }
  if (/走开|离开|一个人待|空间|别跟着/.test(text)) {
    return { label: "TA正在拉开距离", goal: "先尊重距离，同时说明你不会消失。" };
  }
  if (channel === "text" || /微信|短信|消息|打字|连发/.test(text)) {
    return { label: "文字沟通正在升级", goal: "先停止连续发送，避免逐句反驳。" };
  }
  if (/大声|提高音量|吼|骂|争|越说越/.test(text)) {
    return { label: "争吵正在升级", goal: "先降低声音和身体紧张，再决定是否继续。" };
  }
  if (intensity === "losing-control") {
    return { label: "冲突接近失控", goal: "先暂停，不要继续解决问题。" };
  }
  if (intensity === "arguing") {
    return { label: "双方已经进入争辩", goal: "先停止证明对错，让对话慢下来。" };
  }
  return { label: "关系有些紧张", goal: "先稳住语气，确认彼此真正介意的事。" };
}

const actionOrder: FlowStage[] = [
  "MICRO_ACTION_BODY",
  "MICRO_ACTION_PHRASE",
  "MICRO_ACTION_NEXT",
  "MICRO_ACTION_AVOID",
];

export function getMicroAction(
  stage: FlowStage,
  intensity: Intensity,
  channel: Channel,
): MicroActionContent {
  const minimal = intensity === "losing-control";
  const compact = intensity === "arguing";

  const channelBody =
    channel === "text"
      ? "先别继续打字。把手机放下 10 秒。"
      : channel === "phone"
        ? "先停两秒。把声音放低一点。"
        : "肩膀放松下来，声音放低些，停两秒再说。";

  const nextAction =
    channel === "text"
      ? "这条发完以后，先不要继续发。"
      : "让 TA 说一会儿。先别纠正细节。";

  const phrase =
    intensity === "losing-control"
      ? "我们现在越说越急了。我不想继续把事情弄得更糟。"
      : "我先不跟你争对错。你刚才说的，我听到了。";

  const content: Record<string, MicroActionContent> = {
    MICRO_ACTION_BODY: {
      eyebrow: "先稳住身体",
      title: "先别急着回",
      instruction: channelBody,
      rationale: minimal
        ? undefined
        : compact
          ? "先打断身体的加速。"
          : "声音和动作慢下来，能给这段对话留出一点空间。",
      primaryAction: "好了",
      completionId: `body:${channel}`,
    },
    MICRO_ACTION_PHRASE: {
      eyebrow: "现在只说一句",
      title: "现在只说这一句",
      instruction: `“${phrase}”`,
      rationale: minimal
        ? undefined
        : "重点不是说得漂亮，是说完以后先别反驳。",
      primaryAction: "我说了",
      completionId: `phrase:${intensity}`,
    },
    MICRO_ACTION_NEXT: {
      eyebrow: "说完以后",
      title: "接下来先这样",
      instruction: nextAction,
      rationale: minimal
        ? undefined
        : compact
          ? "先让新的信息进来。"
          : "现在先听，比继续补充自己的理由更有用。",
      primaryAction: "做了",
      completionId: `next:${channel}`,
    },
    MICRO_ACTION_AVOID: {
      eyebrow: "阻断升级",
      title: "有一句先别说",
      instruction: "“但是你也……”",
      rationale: minimal
        ? undefined
        : "现在接上这句，很容易重新把争吵拉起来。",
      primaryAction: "记住了",
      completionId: "avoid:but-you-also",
    },
  };

  if (!actionOrder.includes(stage)) {
    throw new Error(`No micro action content for ${stage}`);
  }

  return content[stage];
}

export const reactionBranches: Record<ReactionId, ReactionBranch> = {
  continue: {
    id: "continue",
    label: "TA愿意继续说",
    stage: "CONTINUE_LISTENING",
    title: "先让 TA 说完",
    phrase: "好，你说，我先听完。",
    action: "不打断，先听一段。然后确认：我听下来，你最介意的是____，对吗？",
    avoid: "马上纠正细节。",
  },
  agitated: {
    id: "agitated",
    label: "TA还是很激动",
    stage: "AGITATED_BRIDGE",
    title: "先接住，再暂停",
    phrase: "我知道你现在很生气。我先不解释，也不会不管这件事。",
    action: "说完先停几秒，让TA听见你没有逃开，再提出暂停。",
    avoid: "继续证明自己为什么没错。",
  },
  crying: {
    id: "crying",
    label: "TA哭了",
    stage: "CRYING_CHOICE",
    title: "先问 TA 想要什么距离",
    phrase: "你想让我抱抱你，还是想自己待一会儿？",
    action: "让 TA 选择靠近还是独处，不要自动伸手拥抱。",
    avoid: "一边安慰一边证明自己没错；不要默认拥抱。",
  },
  silent: {
    id: "silent",
    label: "TA不说话",
    stage: "GIVE_SPACE",
    title: "先别追问",
    phrase: "你现在不想说也可以，等你想说的时候我们再继续。",
    action: "留一点安静，不连续追问。一次沉默不等于冷暴力。",
    avoid: "“你到底什么意思？”“你倒是说话啊。”",
  },
  space: {
    id: "space",
    label: "TA想一个人待着",
    stage: "GIVE_SPACE",
    title: "给 TA 一点空间",
    phrase: "好，我先不追着说。我们晚一点再把这件事说完。",
    action: "停止跟随、追问或连续发消息。",
    avoid: "堵住去路，或要求 TA 必须现在说清楚。",
  },
  wechat: {
    id: "wechat",
    label: "我们还在微信里吵",
    stage: "WECHAT_PAUSE",
    title: "先别一条条回",
    phrase: "我们现在这样打字只会越说越乱。我先停一下，等缓一点我们再说。",
    action: "这条发完，停止发送。",
    avoid: "连发长段、截图旧聊天、逐句反驳或连续问号。",
  },
};

export const reactionOptions = Object.values(reactionBranches).map(({ id, label }) => ({
  id,
  label,
}));

export const safetyCopy =
  "如果出现威胁、限制离开、摔砸物品或身体伤害，先不要继续解决争执，优先保证人身安全。";

export const riskTerms = [
  "威胁",
  "不让我走",
  "限制离开",
  "摔东西",
  "砸东西",
  "打我",
  "打人",
  "掐",
  "刀",
  "伤害",
];
