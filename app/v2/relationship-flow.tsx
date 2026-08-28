"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Bookmark,
  Download,
  Home,
  Mic,
  Pause,
  RefreshCw,
  Share2,
  ShieldCheck,
  Square,
  Volume2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  channelOptions,
  getMicroAction,
  getSituationClassification,
  intensityOptions,
  reactionBranches,
  reactionOptions,
  riskTerms,
} from "./content";
import {
  CalmVisual,
  CompletionConvergence,
  FlowShell,
  FocusCard,
  SayThisCard,
} from "./components";
import {
  flowReducer,
  initialFlowState,
  isFlowState,
  normalizeFlowState,
} from "./flow-machine";
import type {
  FlowAction,
  FlowState,
  MoodShiftActivityId,
  PhysicalConnectionChoice,
  ReactionId,
} from "./types";

type HistorySnapshot = { chaidanV2: FlowState; depth: number };

function isHistorySnapshot(value: unknown): value is HistorySnapshot {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<HistorySnapshot>;
  return isFlowState(candidate.chaidanV2) && typeof candidate.depth === "number";
}

export function RelationshipFlowV2() {
  const [flow, setFlow] = useState<FlowState>(initialFlowState);
  const [historyDepth, setHistoryDepth] = useState(0);
  const [sharedPauseUntil, setSharedPauseUntil] = useState<number | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const reducedMotion = useReducedMotion() ?? false;

  useEffect(() => {
    const sharedUntil = Number(
      new URLSearchParams(window.location.search).get("pauseUntil"),
    );
    let sharedFrame: number | undefined;
    if (Number.isFinite(sharedUntil) && sharedUntil > 0) {
      sharedFrame = window.requestAnimationFrame(() => {
        setSharedPauseUntil(sharedUntil);
      });
    }

    const existing = window.history.state;
    let restoreFrame: number | undefined;
    if (isHistorySnapshot(existing)) {
      restoreFrame = window.requestAnimationFrame(() => {
        const restored = normalizeFlowState(existing.chaidanV2);
        setFlow(restored);
        setHistoryDepth(existing.depth);
        window.history.replaceState(
          { chaidanV2: restored, depth: existing.depth } satisfies HistorySnapshot,
          "",
        );
      });
    } else {
      window.history.replaceState(
        { chaidanV2: initialFlowState, depth: 0 } satisfies HistorySnapshot,
        "",
      );
    }

    const onPopState = (event: PopStateEvent) => {
      if (!isHistorySnapshot(event.state)) return;
      const restored = normalizeFlowState(event.state.chaidanV2);
      setFlow(restored);
      setHistoryDepth(event.state.depth);
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      if (restoreFrame) window.cancelAnimationFrame(restoreFrame);
      if (sharedFrame) window.cancelAnimationFrame(sharedFrame);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  }, [flow.stage, flow.context.readiness, flow.context.physicalConnectionChoice, reducedMotion]);

  const replace = useCallback(
    (action: FlowAction) => {
      setFlow((current) => {
        const next = flowReducer(current, action);
        window.history.replaceState(
          { chaidanV2: next, depth: historyDepth } satisfies HistorySnapshot,
          "",
        );
        return next;
      });
    },
    [historyDepth],
  );

  const advance = useCallback(
    (action: FlowAction) => {
      setFlow((current) => {
        const next = flowReducer(current, action);
        if (next === current) return current;
        const nextDepth = historyDepth + 1;
        window.history.replaceState(
          { chaidanV2: current, depth: historyDepth } satisfies HistorySnapshot,
          "",
        );
        window.history.pushState(
          { chaidanV2: next, depth: nextDepth } satisfies HistorySnapshot,
          "",
        );
        setHistoryDepth(nextDepth);
        return next;
      });
    },
    [historyDepth],
  );

  const riskElevated = useMemo(
    () => riskTerms.some((term) => flow.context.description.includes(term)),
    [flow.context.description],
  );

  const goHome = useCallback(() => {
    const cleanUrl = `${window.location.pathname}${window.location.hash}`;
    window.history.replaceState(
      { chaidanV2: initialFlowState, depth: 0 } satisfies HistorySnapshot,
      "",
      cleanUrl,
    );
    setFlow(initialFlowState);
    setHistoryDepth(0);
  }, []);

  if (sharedPauseUntil !== null) {
    return (
      <FlowShell canGoBack={false} onBack={() => undefined} riskElevated={false}>
        <SharedPauseTimer endAt={sharedPauseUntil} />
      </FlowShell>
    );
  }

  return (
    <FlowShell
      canGoBack={historyDepth > 0}
      onBack={() => historyDepth > 0 && window.history.back()}
      riskElevated={riskElevated}
      waveMode={
        flow.stage === "ACUTE_COMPLETE"
          ? "completion"
          : flow.context.intensity === "losing-control"
            ? "urgent"
            : "normal"
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${flow.stage}:${flow.context.readiness ?? "unset"}:${flow.context.physicalConnectionChoice ?? "unset"}`}
          className="stage-wrap"
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: reducedMotion ? 0 : 0.24, ease: "easeOut" }}
          aria-live="polite"
          aria-atomic="true"
        >
          <Stage
            flow={flow}
            headingRef={headingRef}
            reducedMotion={reducedMotion}
            replace={replace}
            advance={advance}
            goHome={goHome}
          />
        </motion.div>
      </AnimatePresence>
    </FlowShell>
  );
}

function Stage({
  flow,
  headingRef,
  reducedMotion,
  replace,
  advance,
  goHome,
}: {
  flow: FlowState;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  reducedMotion: boolean;
  replace: (action: FlowAction) => void;
  advance: (action: FlowAction) => void;
  goHome: () => void;
}) {
  const { stage, context } = flow;

  if (stage === "CALM_ENTRY") {
    return (
      <FocusCard>
        <div className="calm-entry">
          <CalmVisual reducedMotion={reducedMotion} />
          <div>
            <span className="eyebrow">先稳一下</span>
            <h1 ref={headingRef} tabIndex={-1}>深呼吸</h1>
            <p className="calm-guidance-cn">跟着水波节奏呼吸</p>
            <p className="calm-guidance-en" lang="en">
              Breath in as the shape grows.<br />
              Breath out as the shape shrinks.
            </p>
            <button className="primary-button" type="button" onClick={() => advance({ type: "START" })}>直接开始</button>
          </div>
        </div>
      </FocusCard>
    );
  }

  if (stage === "CONFLICT_INPUT") {
    return (
      <ConflictInput
        flow={flow}
        headingRef={headingRef}
        replace={replace}
        advance={advance}
      />
    );
  }

  if (stage.startsWith("MICRO_ACTION_")) {
    const action = getMicroAction(stage, context.intensity, context.channel);
    const urgent = context.intensity === "losing-control";
    const speakable = stage === "MICRO_ACTION_PHRASE";
    return (
      <FocusCard intensity={context.intensity}>
        <span className="eyebrow">{urgent ? "现在只做这一件事" : action.eyebrow}</span>
        <h1 ref={headingRef} tabIndex={-1}>{action.title}</h1>
        {speakable ? <SayThisCard>{action.instruction}</SayThisCard> : <p className="action-instruction">{action.instruction}</p>}
        {speakable ? (
          <aside className="stop-before-but" aria-label="说到这里先停">
            <span>说到这里先停</span>
            <strong>不要接：“但是你也……”</strong>
            <p>一接上“但是”，前面的理解很容易听起来像铺垫。</p>
          </aside>
        ) : null}
        {action.rationale ? <p className="rationale">{action.rationale}</p> : null}
        {urgent && stage === "MICRO_ACTION_BODY" ? (
          <div className="action-row urgent-actions">
            <button className="primary-button" type="button" onClick={() => advance({ type: "PREPARE_PAUSE" })}>先暂停一下</button>
            <button className="text-action" type="button" onClick={() => advance({ type: "CONTINUE_URGENT", actionId: action.completionId })}>我还能先听</button>
          </div>
        ) : (
          <div className="action-row">
            <button className="primary-button" type="button" onClick={() => advance({ type: "COMPLETE_MICRO_ACTION", actionId: action.completionId })}>{action.primaryAction}</button>
            {urgent ? <PauseAction onClick={() => advance({ type: "PREPARE_PAUSE" })} /> : null}
          </div>
        )}
      </FocusCard>
    );
  }

  if (stage === "REACTION_SELECT") {
    return (
      <FocusCard intensity={context.intensity}>
        <span className="eyebrow">根据现在的反应继续</span>
        <h1 ref={headingRef} tabIndex={-1}>TA现在是什么反应？</h1>
        {context.intensity !== "losing-control" ? <p className="lead">选最接近的一项。现在只做对应的下一件事。</p> : null}
        <div className="reaction-selector" role="group" aria-label="TA现在的反应">
          {reactionOptions.map((option) => (
            <button key={option.id} type="button" onClick={() => advance({ type: "SELECT_REACTION", reaction: option.id })}>{option.label}</button>
          ))}
        </div>
        {context.intensity === "losing-control" ? <PauseAction standalone onClick={() => advance({ type: "PREPARE_PAUSE" })} /> : null}
      </FocusCard>
    );
  }

  if (
    stage === "GIVE_SPACE" &&
    context.reaction === "crying" &&
    context.contactPreference === "space"
  ) {
    return (
      <FocusCard>
        <span className="eyebrow">按 TA 选择的距离</span>
        <h1 ref={headingRef} tabIndex={-1}>给 TA 一点空间</h1>
        <SayThisCard>“好，我先让你自己待一会儿。我就在附近，需要我就叫我。”</SayThisCard>
        <p className="rationale">先停止追问，也不要把离开变成惩罚。</p>
        <div className="action-row">
          <button className="primary-button" type="button" onClick={() => advance({ type: "COMPLETE_REACTION_ACTION" })}>我先给了空间</button>
          <PauseAction onClick={() => advance({ type: "PREPARE_PAUSE" })} />
        </div>
      </FocusCard>
    );
  }

  if (stage === "CONTINUE_LISTENING" || stage === "GIVE_SPACE") {
    const reaction = context.reaction ? reactionBranches[context.reaction] : undefined;
    if (!reaction) return null;
    return <BranchCard branch={reaction} headingRef={headingRef} onDone={() => advance({ type: "COMPLETE_REACTION_ACTION" })} onPause={() => advance({ type: "PREPARE_PAUSE" })} />;
  }

  if (stage === "CRYING_CHOICE") {
    return (
      <FocusCard>
        <span className="eyebrow">先问，不要猜</span>
        <h1 ref={headingRef} tabIndex={-1}>让 TA 选择距离</h1>
        <SayThisCard>“你想让我抱抱你，还是想自己待一会儿？”</SayThisCard>
        <div className="decision-list" role="group" aria-label="TA想要的距离">
          <button type="button" onClick={() => advance({ type: "SET_CRYING_PREFERENCE", value: "closeness" })}><strong>TA愿意让我靠近</strong><span>先确认，再选择一种轻微的身体接触。</span></button>
          <button type="button" onClick={() => advance({ type: "SET_CRYING_PREFERENCE", value: "space" })}><strong>TA想自己待一会儿</strong><span>给空间，不追问。</span></button>
          <button type="button" onClick={() => advance({ type: "SET_CRYING_PREFERENCE", value: "unclear" })}><strong>TA没有说清楚</strong><span>先不碰TA，安静待在附近。</span></button>
        </div>
      </FocusCard>
    );
  }

  if (stage === "STAY_NEARBY") {
    return (
      <FocusCard>
        <span className="eyebrow">TA没有明确选择</span>
        <h1 ref={headingRef} tabIndex={-1}>先不碰 TA，安静待着</h1>
        <SayThisCard>“我先不碰你。我在旁边，你想说的时候告诉我。”</SayThisCard>
        <p className="rationale">不要追问，也不要突然离开。给TA一点安静。</p>
        <div className="action-row">
          <button className="primary-button" type="button" onClick={() => advance({ type: "COMPLETE_REACTION_ACTION" })}>我先陪了一会儿</button>
          <PauseAction onClick={() => advance({ type: "PREPARE_PAUSE" })} />
        </div>
      </FocusCard>
    );
  }

  if (stage === "PHYSICAL_CONNECTION") {
    return <PhysicalConnection flow={flow} headingRef={headingRef} replace={replace} advance={advance} />;
  }

  if (stage === "DEESCALATION_CHECK") {
    return (
      <FocusCard>
        <span className="eyebrow">看看此刻</span>
        <h1 ref={headingRef} tabIndex={-1}>现在有缓和一点吗？</h1>
        <p className="lead">不用完全解决。看看你们是不是已经没那么对着来了。</p>
        <div className="decision-list" role="group" aria-label="缓和程度">
          <button type="button" onClick={() => advance({ type: "SET_DEESCALATION", value: "calmed" })}><strong>缓和了</strong><span>能正常说话了，或者已经不想继续吵了。</span></button>
          <button type="button" onClick={() => advance({ type: "SET_DEESCALATION", value: "somewhat" })}><strong>有一点，但还没完全好</strong><span>还是不舒服，但没刚才那么冲了。</span></button>
          <button type="button" onClick={() => advance({ type: "SET_DEESCALATION", value: "not" })}><strong>没有，还很僵</strong><span>还是听不进去，或者又要吵起来了。</span></button>
        </div>
      </FocusCard>
    );
  }

  if (stage === "LISTENING_CAPACITY_CHECK") {
    return (
      <FocusCard quiet>
        <span className="eyebrow">最多再试一次</span>
        <h1 ref={headingRef} tabIndex={-1}>TA说话的时候，<br />我现在还能先听完吗？</h1>
        <div className="readiness-actions">
          <button className="primary-button" type="button" onClick={() => advance({ type: "SET_LISTENING_CAPACITY", value: "can-listen" })}>可以，我再听一次</button>
          <button className="secondary-button" type="button" onClick={() => advance({ type: "SET_LISTENING_CAPACITY", value: "cannot-listen" })}>还不行，先暂停</button>
        </div>
        <p className="rationale">再试一次仍然没有缓和，就先停止解决。</p>
      </FocusCard>
    );
  }

  if (stage === "CLOSE_FOR_NOW") {
    return (
      <FocusCard quiet>
        <span className="eyebrow">先把对话收住</span>
        <h1 ref={headingRef} tabIndex={-1}>现在先别继续解决</h1>
        <p className="lead">这件事不用这一刻全部说清楚。先停在这里。</p>
        <SayThisCard>“我们现在比刚才缓一点了。这件事我不躲，等我们都稳一些再继续说。”</SayThisCard>
        <button className="primary-button" type="button" onClick={() => advance({ type: "COMPLETE_CLOSE" })}>先停在这里</button>
      </FocusCard>
    );
  }

  if (stage === "MOOD_SHIFT_ACTIVITY") {
    return (
      <MoodShiftActivity
        flow={flow}
        headingRef={headingRef}
        replace={replace}
        advance={advance}
      />
    );
  }

  if (stage === "PAUSE_PREP" || stage === "WECHAT_PAUSE") {
    const isWechat = stage === "WECHAT_PAUSE";
    return (
      <FocusCard intensity={context.intensity}>
        <span className="eyebrow">先暂停一下</span>
        <h1 ref={headingRef} tabIndex={-1}>{isWechat ? "先别一条条回" : "先告诉 TA 你会回来"}</h1>
        <SayThisCard>{isWechat ? "“好，我先不追着说。我们先停 20 分钟，之后再回来看看。”" : "“我们先暂停20分钟，等我理性一些了我们再继续谈。”"}</SayThisCard>
        <p className="rationale">{isWechat ? "发完以后停止发送。不要再补一条解释。" : "要说清楚，20分钟后会回到的具体位置。"}</p>
        <button
          className="primary-button"
          type="button"
          onClick={() => {
            void unlockWaterSound();
            advance({ type: "BEGIN_PAUSE" });
          }}
        >
          {isWechat ? "停止发送，开始倒计时" : "说完了，先离开一下"}
        </button>
      </FocusCard>
    );
  }

  if (stage === "PAUSE_MODE") {
    return <PauseMode flow={flow} headingRef={headingRef} advance={advance} />;
  }

  if (stage === "READINESS_CHECK") {
    return (
      <FocusCard quiet>
        <span className="eyebrow">返回条件</span>
        <h1 ref={headingRef} tabIndex={-1}>TA说话的时候，<br />我现在能先听完吗？</h1>
        <div className="readiness-actions">
          <button className="primary-button" type="button" onClick={() => advance({ type: "SET_READINESS", value: "ready" })}>可以了</button>
          <button className="secondary-button" type="button" onClick={() => advance({ type: "SET_READINESS", value: "not-ready" })}>还不行</button>
        </div>
        <p className="rationale">还听不进去，就先别回来谈。</p>
      </FocusCard>
    );
  }

  if (stage === "RETURN_TO_LISTENING") {
    return (
      <FocusCard quiet>
        <span className="eyebrow">回到对话</span>
        <h1 ref={headingRef} tabIndex={-1}>先听，不急着解决</h1>
        <SayThisCard>“好，你刚才想说的，你继续说，我先听。”</SayThisCard>
        <p className="rationale">听完这一段，再看看有没有缓和。</p>
        <button className="primary-button" type="button" onClick={() => advance({ type: "RETURN_AND_LISTEN" })}>我先听完了</button>
      </FocusCard>
    );
  }

  if (stage === "ACUTE_COMPLETE") {
    const classification = getSituationClassification(
      context.description,
      context.intensity,
      context.channel,
    );
    const intensityLabel = intensityOptions.find(
      (option) => option.id === context.intensity,
    )?.label;
    const channelLabel = channelOptions.find(
      (option) => option.id === context.channel,
    )?.label;
    const moodActivity = moodShiftActivities.find(
      (activity) => activity.id === context.moodShiftActivity,
    );
    return (
      <FocusCard quiet>
        <CompletionConvergence />
        <span className="eyebrow">急性处理先结束</span>
        <h1 ref={headingRef} tabIndex={-1}>这次先到这里</h1>
        <p className="lead">{context.completionReason === "calmed" ? "现在已经有了继续相处的空间，不用立刻把问题全部解决。" : "你们先停止了升级。之后再选择更合适的时间继续。"}</p>
        <div className="acute-recap">
          <span>你刚刚处理的是</span>
          <blockquote>{context.description}</blockquote>
          <p>{classification.label} · {intensityLabel} · {channelLabel}</p>
          {moodActivity ? <p>你们选择了：{moodActivity.label}</p> : null}
        </div>
        <div className="completion-options" aria-label="可选的下一步">
          <button type="button" onClick={() => advance({ type: "OPEN_RELATIONSHIP_DEPOSIT" })}>
            <Bookmark aria-hidden="true" size={20} />
            <span><strong>给关系存一笔</strong><small>做一张积极文字书签，可选</small></span>
          </button>
          <button type="button" onClick={() => advance({ type: "OPEN_NEXT_TIME_PLAN" })}>
            <ShieldCheck aria-hidden="true" size={20} />
            <span><strong>看看下次怎么稳住自己</strong><small>生成一张个人提醒卡，可选</small></span>
          </button>
        </div>
        <button className="primary-button home-button" type="button" onClick={goHome}>
          <Home aria-hidden="true" size={18} />到首页
        </button>
      </FocusCard>
    );
  }

  if (stage === "RELATIONSHIP_DEPOSIT") {
    return (
      <RelationshipDeposit
        flow={flow}
        headingRef={headingRef}
        replace={replace}
        advance={advance}
        goHome={goHome}
      />
    );
  }

  if (stage === "NEXT_TIME_PLAN") {
    return <NextTimePlan flow={flow} headingRef={headingRef} advance={advance} goHome={goHome} />;
  }

  return null;
}

let waterAudioContext: AudioContext | null = null;

async function unlockWaterSound() {
  if (typeof window === "undefined" || !window.AudioContext) return false;
  if (!waterAudioContext || waterAudioContext.state === "closed") {
    waterAudioContext = new window.AudioContext();
  }
  if (waterAudioContext.state === "suspended") {
    await waterAudioContext.resume();
  }

  const oscillator = waterAudioContext.createOscillator();
  const gain = waterAudioContext.createGain();
  gain.gain.value = 0.00001;
  oscillator.connect(gain).connect(waterAudioContext.destination);
  oscillator.start();
  oscillator.stop(waterAudioContext.currentTime + 0.02);
  return waterAudioContext.state === "running";
}

async function playGentleWaterSound() {
  const available = await unlockWaterSound();
  if (!available || !waterAudioContext) return false;

  const context = waterAudioContext;
  const duration = 5.5;
  const frameCount = Math.floor(context.sampleRate * duration);
  const buffer = context.createBuffer(1, frameCount, context.sampleRate);
  const data = buffer.getChannelData(0);
  let softCurrent = 0;
  let brightCurrent = 0;

  for (let index = 0; index < frameCount; index += 1) {
    const noise = Math.random() * 2 - 1;
    softCurrent = softCurrent * 0.992 + noise * 0.008;
    brightCurrent = brightCurrent * 0.72 + noise * 0.28;
    const position = index / frameCount;
    const envelope = Math.sin(Math.PI * position) ** 0.65;
    const ripple = 0.78 + Math.sin(position * Math.PI * 18) * 0.12;
    data[index] = (softCurrent * 1.55 + brightCurrent * 0.14) * envelope * ripple;
  }

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  filter.type = "lowpass";
  filter.frequency.value = 1450;
  filter.Q.value = 0.55;
  gain.gain.value = 0.18;
  source.buffer = buffer;
  source.connect(filter).connect(gain).connect(context.destination);
  source.start();
  return true;
}

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function PauseCountdown({
  endAt,
  soundEnabled,
}: {
  endAt: number;
  soundEnabled: boolean;
}) {
  const [now, setNow] = useState(() => Date.now());
  const [shareStatus, setShareStatus] = useState("");
  const soundedRef = useRef(false);
  const remainingSeconds = Math.max(0, Math.ceil((endAt - now) / 1000));
  const ended = remainingSeconds === 0;
  const endTime = new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(endAt));

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!ended || !soundEnabled || soundedRef.current) return;
    void playGentleWaterSound().then((played) => {
      if (played) soundedRef.current = true;
    });
  }, [ended, soundEnabled]);

  const shareCountdown = async () => {
    const shareUrl = new URL(window.location.href);
    shareUrl.search = "";
    shareUrl.hash = "";
    shareUrl.searchParams.set("pauseUntil", String(endAt));
    const shareData = {
      title: "我们先暂停一下",
      text: `我们先暂停到 ${endTime}。时间到了，再看看我们能不能先听完对方。`,
      url: shareUrl.toString(),
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus("倒计时已经打开分享选项。");
      } else {
        await navigator.clipboard.writeText(
          `${shareData.text}\n${shareData.url}`,
        );
        setShareStatus("倒计时链接已复制，可以发给TA。");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareStatus("暂时无法自动分享，可以复制当前页面地址。");
    }
  };

  return (
    <div className={`pause-timer${ended ? " pause-timer--ended" : ""}`}>
      <span>{ended ? "暂停时间到了" : `预计 ${endTime} 再检查`}</span>
      <strong aria-label={ended ? "倒计时结束" : `剩余 ${remainingSeconds} 秒`}>
        {formatCountdown(remainingSeconds)}
      </strong>
      <p aria-live="polite">
        {ended
          ? "先别急着回来解释。先检查自己能不能听完。"
          : "时间只是参考，不代表倒计时结束就必须继续谈。"}
      </p>
      <button className="share-countdown" type="button" onClick={shareCountdown}>
        <Share2 aria-hidden="true" size={17} />
        把倒计时发给TA
      </button>
      <small aria-live="polite">{shareStatus}</small>
    </div>
  );
}

function PauseMode({
  flow,
  headingRef,
  advance,
}: {
  flow: FlowState;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  advance: (action: FlowAction) => void;
}) {
  const { context } = flow;
  const endAt =
    (context.pauseStartedAt ?? 0) +
    context.pauseReferenceMinutes * 60 * 1000;

  return (
    <FocusCard quiet>
      <span className="eyebrow">先暂停一下</span>
      <h1 ref={headingRef} tabIndex={-1}>先让身体慢下来</h1>
      {context.readiness === "not-ready" ? (
        <p className="pause-status" role="status">还没准备好也没关系。新的 20 分钟已经开始，不要急着回去证明什么。</p>
      ) : null}
      <PauseCountdown endAt={endAt} soundEnabled />
      <div className="water-cue-note">
        <Volume2 aria-hidden="true" size={18} />
        倒计时结束时，会播放一小段温柔流水声
      </div>
      <ol className="pause-actions">
        <li>离开刚才争吵的位置。</li>
        <li>喝几口水，让呼气稍微长一点。</li>
        <li>先不翻聊天记录，也不准备下一轮反驳。</li>
      </ol>
      <button className="text-action standalone" type="button" onClick={() => advance({ type: "CHECK_READINESS" })}>我想提前检查是否能听完</button>
    </FocusCard>
  );
}

function SharedPauseTimer({ endAt }: { endAt: number }) {
  const [soundEnabled, setSoundEnabled] = useState(false);

  const enableSound = async () => {
    const enabled = await unlockWaterSound();
    setSoundEnabled(enabled);
  };

  return (
    <FocusCard quiet>
      <span className="eyebrow">共同暂停时间</span>
      <h1 tabIndex={-1}>我们先暂停一下</h1>
      <p className="lead">给彼此一点时间。倒计时结束后，再看看双方是否都能先听完。</p>
      <PauseCountdown endAt={endAt} soundEnabled={soundEnabled} />
      <button className="secondary-button sound-enable" type="button" onClick={enableSound} aria-pressed={soundEnabled}>
        <Volume2 aria-hidden="true" size={18} />
        {soundEnabled ? "结束提示音已开启" : "开启结束流水声"}
      </button>
    </FocusCard>
  );
}

const moodShiftActivities: Array<{
  id: MoodShiftActivityId;
  place: "在家里" | "在外面";
  label: string;
  duration: string;
  detail: string;
  phrase: string;
}> = [
  {
    id: "warm-drink",
    place: "在家里",
    label: "一起喝点东西",
    duration: "5–10 分钟",
    detail: "倒杯水、泡茶或准备一杯双方都喜欢的饮料，先不谈争执。",
    phrase: "“这件事我们晚一点再说。你愿意先和我一起喝点东西吗？”",
  },
  {
    id: "small-home-task",
    place: "在家里",
    label: "一起做件很小的事",
    duration: "5–10 分钟",
    detail: "切水果、收一下桌面或照顾宠物。只做这一件，不借机讲道理。",
    phrase: "“我们先不继续说。要不要和我一起做件很小的事？”",
  },
  {
    id: "quiet-same-room",
    place: "在家里",
    label: "安静待在同一个空间",
    duration: "5 分钟",
    detail: "不用聊天，各自坐一会儿。TA想拉开距离时不要勉强。",
    phrase: "“我们先安静坐一会儿，可以不用说话。”",
  },
  {
    id: "short-walk",
    place: "在外面",
    label: "一起走一小圈",
    duration: "10 分钟",
    detail: "走到楼下或街角。先观察周围，不在路上复盘争执。",
    phrase: "“这件事我们晚一点再说。愿意和我下楼走一小圈吗？”",
  },
  {
    id: "pick-a-snack",
    place: "在外面",
    label: "去买一份小东西",
    duration: "10–15 分钟",
    detail: "买水或双方都喜欢的小吃。它不是道歉，也不代替之后把事情说清楚。",
    phrase: "“我们先出去买点喝的，回来再决定什么时候继续谈，好吗？”",
  },
  {
    id: "sit-outside",
    place: "在外面",
    label: "找个地方看一会儿天",
    duration: "5–10 分钟",
    detail: "在楼下、长椅或安静的地方坐一会儿，不要求马上变开心。",
    phrase: "“要不要先出去坐一会儿？我们不用现在把话说完。”",
  },
];

function MoodShiftActivity({
  flow,
  headingRef,
  replace,
  advance,
}: {
  flow: FlowState;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  replace: (action: FlowAction) => void;
  advance: (action: FlowAction) => void;
}) {
  const selected = moodShiftActivities.find(
    (activity) => activity.id === flow.context.moodShiftActivity,
  );

  return (
    <FocusCard quiet>
      <span className="eyebrow">已经缓和一点</span>
      <h1 ref={headingRef} tabIndex={-1}>想先一起换一下心情吗？</h1>
      <p className="lead">只在双方都愿意时选一个。不是假装没事，也不代替之后再谈。</p>
      <div className="mood-activity-groups">
        {(["在家里", "在外面"] as const).map((place) => (
          <section key={place} aria-labelledby={`mood-${place}`}>
            <h2 id={`mood-${place}`}>{place}</h2>
            <div className="mood-activity-grid">
              {moodShiftActivities
                .filter((activity) => activity.place === place)
                .map((activity) => (
                  <button
                    key={activity.id}
                    type="button"
                    aria-pressed={selected?.id === activity.id}
                    onClick={() => replace({ type: "SELECT_MOOD_SHIFT", value: activity.id })}
                  >
                    <strong>{activity.label}</strong>
                    <span>{activity.duration}</span>
                  </button>
                ))}
            </div>
          </section>
        ))}
      </div>
      {selected ? (
        <div className="mood-activity-detail" role="status">
          <SayThisCard>{selected.phrase}</SayThisCard>
          <p>{selected.detail}</p>
          <small>如果TA不想做，就停下来，不要用活动催TA恢复情绪。</small>
        </div>
      ) : null}
      <div className="action-row">
        <button className="primary-button" type="button" disabled={!selected} onClick={() => advance({ type: "COMPLETE_MOOD_SHIFT" })}>就做这个</button>
        <button className="text-action" type="button" onClick={() => advance({ type: "SKIP_MOOD_SHIFT" })}>现在不适合一起做</button>
      </div>
    </FocusCard>
  );
}

const bookmarkThemes = [
  { id: "tide", label: "浅潮", background: "#E8F7F5", wave: "#3F9F99" },
  { id: "sea-glass", label: "海玻璃", background: "#D8EFEB", wave: "#317F7A" },
  { id: "morning-mist", label: "晨雾", background: "#EEF4F3", wave: "#5EAAA4" },
  { id: "sand", label: "沙岸", background: "#F2E8D7", wave: "#4B9C96" },
  { id: "after-rain", label: "雨后", background: "#E2EDF0", wave: "#3F8E91" },
] as const;

function validatePositiveNote(value?: string) {
  const note = (value ?? "").trim();
  if (note.length < 8) {
    return { valid: false, message: "再具体一点：TA做了什么，让你感受到什么？" };
  }
  if (/你每次|你总是|你从来|终于|但是|可是|应该|必须|都是你的错|过分|讨厌|不许|希望你以后/.test(note)) {
    return {
      valid: false,
      message: "这句话更适合留到关系修复区。这里先只记录一件你真正想珍惜的事。",
    };
  }
  return { valid: true, message: "这句话可以存进关系书签。" };
}

function wrapCanvasText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const character of paragraph) {
      const candidate = line + character;
      if (line && context.measureText(candidate).width > maxWidth) {
        lines.push(line);
        line = character;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

function drawCanvasWaves(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  variant: number,
) {
  const baseY = height * 0.79;
  for (let layer = 0; layer < 3; layer += 1) {
    const amplitude = width * (0.025 + layer * 0.008);
    const wavelength = width * (0.48 + variant * 0.07 + layer * 0.08);
    context.beginPath();
    for (let x = 0; x <= width; x += 4) {
      const y =
        baseY +
        layer * width * 0.055 +
        Math.sin((x / wavelength) * Math.PI * 2 + layer * 1.3 + variant) * amplitude;
      if (x === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.globalAlpha = 0.48 - layer * 0.11;
    context.strokeStyle = color;
    context.lineWidth = Math.max(2, width / 360);
    context.stroke();
  }
  context.globalAlpha = 1;
}

function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function exportBookmarkCard(
  note: string,
  theme: (typeof bookmarkThemes)[number],
  waveVariant: number,
  format: "bookmark" | "wallpaper",
) {
  const canvas = document.createElement("canvas");
  canvas.width = format === "bookmark" ? 720 : 1080;
  canvas.height = format === "bookmark" ? 1800 : 1920;
  const context = canvas.getContext("2d");
  if (!context) return;

  const { width, height } = canvas;
  context.fillStyle = theme.background;
  context.fillRect(0, 0, width, height);

  for (let index = 0; index < 1100; index += 1) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    context.fillStyle = `rgba(17,23,22,${Math.random() * 0.018})`;
    context.fillRect(x, y, 1.5, 1.5);
  }

  const margin = width * 0.105;
  context.fillStyle = theme.wave;
  context.font = `700 ${Math.round(width * 0.026)}px Inter, sans-serif`;
  context.fillText("给关系存一笔", margin, height * 0.1);

  context.fillStyle = "#111716";
  context.font = `400 ${Math.round(width * 0.061)}px "Songti SC", STSong, serif`;
  const lines = wrapCanvasText(context, note, width - margin * 2);
  const lineHeight = width * 0.096;
  const textHeight = lines.length * lineHeight;
  let y = Math.max(height * 0.24, (height - textHeight) * 0.43);
  for (const line of lines.slice(0, 11)) {
    context.fillText(line, margin, y);
    y += lineHeight;
  }

  drawCanvasWaves(context, width, height, theme.wave, waveVariant);
  context.fillStyle = "#111716";
  context.globalAlpha = 0.7;
  context.font = `500 ${Math.round(width * 0.022)}px Inter, sans-serif`;
  context.fillText(
    new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "long", day: "numeric" }).format(new Date()),
    margin,
    height * 0.94,
  );
  context.textAlign = "right";
  context.fillText("先连接，再解决", width - margin, height * 0.94);
  context.globalAlpha = 1;
  downloadCanvas(
    canvas,
    format === "bookmark" ? "潮汐书签.png" : "潮汐书签_手机壁纸.png",
  );
}

function RelationshipDeposit({
  flow,
  headingRef,
  replace,
  advance,
  goHome,
}: {
  flow: FlowState;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  replace: (action: FlowAction) => void;
  advance: (action: FlowAction) => void;
  goHome: () => void;
}) {
  const [isListening, setIsListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("");
  const [exportMessage, setExportMessage] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const { context } = flow;
  const positiveNote = context.positiveNote ?? "";
  const bookmarkWave = Number.isFinite(context.bookmarkWave) ? context.bookmarkWave : 0;
  const validation = validatePositiveNote(positiveNote);
  const themeIndex = Math.max(
    0,
    bookmarkThemes.findIndex((theme) => theme.id === context.bookmarkTheme),
  );
  const theme = bookmarkThemes[themeIndex];

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceMessage("当前浏览器不支持语音输入，请改用键盘。");
      return;
    }
    const recognition = new Recognition();
    const original = positiveNote.trim();
    recognition.lang = "zh-CN";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let transcript = "";
      for (let index = 0; index < event.results.length; index += 1) {
        transcript += event.results[index][0]?.transcript ?? "";
      }
      replace({
        type: "UPDATE_POSITIVE_NOTE",
        value: `${original}${original && transcript ? " " : ""}${transcript}`,
      });
    };
    recognition.onend = () => {
      setIsListening(false);
      setVoiceMessage("语音已经转成文字，你可以继续修改。");
    };
    recognition.onerror = () => {
      setIsListening(false);
      setVoiceMessage("没有听清，可以再试一次或改用键盘。");
    };
    recognitionRef.current = recognition;
    setIsListening(true);
    setVoiceMessage("正在听。只说一件你真正想珍惜的事。");
    recognition.start();
  };

  const exportCard = (format: "bookmark" | "wallpaper") => {
    if (!validation.valid) return;
    exportBookmarkCard(
      positiveNote.trim(),
      theme,
      bookmarkWave,
      format,
    );
    setExportMessage(format === "bookmark" ? "书签已经导出。" : "手机壁纸已经导出。");
  };

  return (
    <FocusCard quiet>
      <span className="eyebrow">这是可选的</span>
      <h1 ref={headingRef} tabIndex={-1}>给关系存一笔</h1>
      <p className="lead">只记下一件你真正认可、感谢或想珍惜的事。</p>
      <div className="deposit-layout">
        <div className="deposit-editor">
          <div className="input-toolbar">
            <label className="field-label" htmlFor="positive-note">积极记录</label>
            <button className="voice-button" type="button" aria-pressed={isListening} onClick={toggleVoice}>
              {isListening ? <Square aria-hidden="true" size={15} /> : <Mic aria-hidden="true" size={17} />}
              {isListening ? "停止录音" : "语音输入"}
            </button>
          </div>
          <textarea
            id="positive-note"
            value={positiveNote}
            onChange={(event) => replace({ type: "UPDATE_POSITIVE_NOTE", value: event.target.value })}
            placeholder={"我看见TA...\n这让我感到...\n我想记住..."}
            maxLength={120}
          />
          <div className="note-meta">
            <span className={validation.valid ? "note-valid" : ""}>{validation.message}</span>
            <small>{positiveNote.length}/120</small>
          </div>
          <p className="voice-status" aria-live="polite">{voiceMessage}</p>
          <div className="bookmark-customize">
            <button type="button" onClick={() => replace({ type: "SET_BOOKMARK_THEME", value: bookmarkThemes[(themeIndex + 1) % bookmarkThemes.length].id })}>
              <RefreshCw aria-hidden="true" size={16} />换一种颜色
            </button>
            <button type="button" onClick={() => replace({ type: "SET_BOOKMARK_WAVE", value: (bookmarkWave + 1) % 3 })}>
              <RefreshCw aria-hidden="true" size={16} />换一组海浪
            </button>
          </div>
        </div>
        <BookmarkPreview note={positiveNote} theme={theme} wave={bookmarkWave} />
      </div>
      <div className="export-actions">
        <button className="primary-button" type="button" disabled={!validation.valid} onClick={() => exportCard("bookmark")}>
          <Download aria-hidden="true" size={18} />导出书签
        </button>
        <button className="secondary-button" type="button" disabled={!validation.valid} onClick={() => exportCard("wallpaper")}>导出手机壁纸</button>
      </div>
      <p className="export-status" aria-live="polite">{exportMessage}</p>
      <div className="optional-footer-actions">
        <button className="text-action" type="button" onClick={() => advance({ type: "OPEN_NEXT_TIME_PLAN" })}>看看下次怎么稳住自己</button>
        <button className="text-action" type="button" onClick={goHome}>到首页</button>
      </div>
    </FocusCard>
  );
}

function BookmarkPreview({
  note,
  theme,
  wave,
}: {
  note: string;
  theme: (typeof bookmarkThemes)[number];
  wave: number;
}) {
  return (
    <div
      className="bookmark-preview"
      style={{
        "--bookmark-background": theme.background,
        "--bookmark-wave": theme.wave,
      } as React.CSSProperties}
      aria-label={`${theme.label}主题书签预览`}
    >
      <span>给关系存一笔</span>
      <blockquote>{note.trim() || "你想记住的积极时刻，会出现在这里"}</blockquote>
      <div className={`bookmark-waves bookmark-waves-${wave}`} aria-hidden="true"><i /><i /><i /></div>
      <footer><small>{new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric" }).format(new Date())}</small><small>先连接，再解决</small></footer>
    </div>
  );
}

function buildNextTimePlan(context: FlowState["context"]) {
  const signal =
    context.intensity === "losing-control"
      ? "心跳加快、声音变大，开始只想马上证明自己"
      : context.intensity === "arguing"
        ? "开始打断、重复解释，想立刻纠正每个细节"
        : "肩膀发紧、话变少，或者开始在心里防御";
  const action = context.channel === "text"
    ? "先把手机放下，停止连续发送，让呼气慢下来"
    : context.completedActions.includes("pause:prepared")
      ? "离开争吵位置，喝几口水，让呼气比吸气更长"
      : "脚踩地面，肩膀放松，声音降低，停两秒再说";
  const phrase = context.channel === "text"
    ? "“我现在有点急，等我平复一下再回来听你好好说。”"
    : "“我现在有点上头。我想先停一下，不是要离开。”";
  return { signal, action, phrase, readiness: "TA说话的时候，我现在能先听完吗？" };
}

function exportPlanCard(plan: ReturnType<typeof buildNextTimePlan>) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const context = canvas.getContext("2d");
  if (!context) return;
  context.fillStyle = "#E8F7F5";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#3F9F99";
  context.font = "700 28px Inter, sans-serif";
  context.fillText("下一次的我", 90, 110);
  const items = [
    ["我开始升级的信号", plan.signal],
    ["我先做", plan.action],
    ["我可以先说", plan.phrase],
    ["返回条件", plan.readiness],
  ];
  let y = 220;
  for (const [label, value] of items) {
    context.fillStyle = "#3F9F99";
    context.font = "700 24px Inter, sans-serif";
    context.fillText(label, 90, y);
    y += 52;
    context.fillStyle = "#111716";
    context.font = '400 38px "Songti SC", STSong, serif';
    for (const line of wrapCanvasText(context, value, 900)) {
      context.fillText(line, 90, y);
      y += 58;
    }
    y += 48;
  }
  drawCanvasWaves(context, canvas.width, canvas.height, "#3F9F99", 1);
  downloadCanvas(canvas, "下一次怎么稳住自己.png");
}

function NextTimePlan({
  flow,
  headingRef,
  advance,
  goHome,
}: {
  flow: FlowState;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  advance: (action: FlowAction) => void;
  goHome: () => void;
}) {
  const [exported, setExported] = useState(false);
  const plan = buildNextTimePlan(flow.context);
  return (
    <FocusCard quiet>
      <span className="eyebrow">这是可选的</span>
      <h1 ref={headingRef} tabIndex={-1}>下一次怎么稳住自己</h1>
      <p className="lead">这张卡只提醒你自己的信号和动作，不判断TA。</p>
      <div className="next-time-card">
        <div><span>我开始升级的信号</span><p>{plan.signal}</p></div>
        <div><span>我先做</span><p>{plan.action}</p></div>
        <div><span>我可以先说</span><p>{plan.phrase}</p></div>
        <div><span>返回条件</span><p>{plan.readiness}</p></div>
        <div className="next-time-waves" aria-hidden="true"><i /><i /></div>
      </div>
      <div className="export-actions">
        <button className="primary-button" type="button" onClick={() => { exportPlanCard(plan); setExported(true); }}>
          <Download aria-hidden="true" size={18} />导出提醒卡
        </button>
        <button className="secondary-button" type="button" onClick={() => advance({ type: "OPEN_RELATIONSHIP_DEPOSIT" })}>给关系存一笔</button>
      </div>
      <p className="export-status" aria-live="polite">{exported ? "提醒卡已经导出。" : ""}</p>
      <button className="text-action standalone" type="button" onClick={goHome}>到首页</button>
    </FocusCard>
  );
}

type SpeechRecognitionResultLike = {
  0: { transcript: string };
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

function ConflictInput({
  flow,
  headingRef,
  replace,
  advance,
}: {
  flow: FlowState;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  replace: (action: FlowAction) => void;
  advance: (action: FlowAction) => void;
}) {
  const { context } = flow;
  const [isListening, setIsListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const urgent = context.intensity === "losing-control";
  const classification = getSituationClassification(
    context.description,
    context.intensity,
    context.channel,
  );

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceMessage("当前浏览器不支持语音输入，请改用键盘。");
      return;
    }

    const recognition = new Recognition();
    const original = context.description.trim();
    recognition.lang = "zh-CN";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let transcript = "";
      for (let index = 0; index < event.results.length; index += 1) {
        transcript += event.results[index][0]?.transcript ?? "";
      }
      replace({
        type: "UPDATE_DESCRIPTION",
        value: `${original}${original && transcript ? " " : ""}${transcript}`.slice(0, 500),
      });
    };
    recognition.onend = () => {
      setIsListening(false);
      setVoiceMessage("语音已经转成文字，你可以继续修改。");
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      setVoiceMessage(
        event.error === "not-allowed"
          ? "没有获得麦克风权限，请允许后再试。"
          : "没有听清，可以再试一次或改用键盘。",
      );
    };

    recognitionRef.current = recognition;
    setVoiceMessage("正在听，你可以直接说刚刚发生了什么。");
    setIsListening(true);
    try {
      recognition.start();
    } catch {
      setIsListening(false);
      setVoiceMessage("语音输入没有启动，请再试一次。");
    }
  };

  return (
    <FocusCard intensity={context.intensity}>
      <span className="eyebrow">先记下刚刚发生的事</span>
      <h1 ref={headingRef} tabIndex={-1}>刚刚发生了什么？</h1>
      <p className="lead">{urgent ? "不用讲完整。写下或说出最关键的一句。" : "不用分析原因，描述刚才发生了的事。"}</p>
      <div className="input-toolbar">
        <label className="field-label" htmlFor="conflict-description">一句短描述</label>
        <button
          className="voice-button"
          type="button"
          aria-pressed={isListening}
          onClick={toggleVoice}
        >
          {isListening ? <Square aria-hidden="true" size={15} /> : <Mic aria-hidden="true" size={17} />}
          {isListening ? "停止录音" : "语音输入"}
        </button>
      </div>
      <textarea
        id="conflict-description"
        value={context.description}
        onChange={(event) => replace({ type: "UPDATE_DESCRIPTION", value: event.target.value })}
        placeholder="比如：TA说我答应的事又没做到，我一直解释，结果越说TA越生气。"
        maxLength={500}
        autoFocus
      />
      <p className="voice-status" aria-live="polite">{voiceMessage}</p>
      <fieldset className="choice-fieldset">
        <legend>现在有多激烈？</legend>
        <div className="segmented-options">
          {intensityOptions.map((option) => (
            <button key={option.id} type="button" aria-pressed={context.intensity === option.id} onClick={() => replace({ type: "SET_INTENSITY", value: option.id })}>{option.label}</button>
          ))}
        </div>
      </fieldset>
      <fieldset className="choice-fieldset">
        <legend>你们在哪里沟通？</legend>
        <div className="segmented-options">
          {channelOptions.map((option) => (
            <button key={option.id} type="button" aria-pressed={context.channel === option.id} onClick={() => replace({ type: "SET_CHANNEL", value: option.id })}>{option.label}</button>
          ))}
        </div>
      </fieldset>
      {context.description.trim().length >= 2 ? (
        <div className="situation-classification" aria-live="polite">
          <span>按表面情况初步归类</span>
          <strong>{classification.label}</strong>
          <p>{classification.goal}</p>
          <small>这不是对TA真实原因的判断。</small>
        </div>
      ) : null}
      <div className="action-row">
        <button className="primary-button" type="button" disabled={context.description.trim().length < 2} onClick={() => advance({ type: "COMPLETE_MICRO_ACTION", actionId: "input:capture" })}>记录好了，给我下一步</button>
        {urgent ? <PauseAction onClick={() => advance({ type: "PREPARE_PAUSE" })} /> : null}
      </div>
    </FocusCard>
  );
}

const physicalOptions: Array<{ id: PhysicalConnectionChoice; label: string }> = [
  { id: "embrace", label: "抱一会儿" },
  { id: "pat", label: "轻轻拍拍背" },
  { id: "hold-hand", label: "牵一下手" },
  { id: "sit-close", label: "坐近一点" },
  { id: "no-touch", label: "现在先不碰TA" },
];

const physicalInstructions: Record<PhysicalConnectionChoice, string> = {
  embrace: "抱住以后先别急着说话。可以轻轻拍拍背，停一会儿。",
  pat: "先确认TA愿意，再轻轻拍几下。不要一边拍一边继续解释。",
  "hold-hand": "先伸出手让TA选择。TA没有回应，就不要继续。",
  "sit-close": "坐近一点，保持安静。让TA决定要不要继续靠近。",
  "no-touch": "不碰TA也可以。可以安静待在附近，先不继续追问。",
};

function PhysicalConnection({
  flow,
  headingRef,
  replace,
  advance,
}: {
  flow: FlowState;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  replace: (action: FlowAction) => void;
  advance: (action: FlowAction) => void;
}) {
  const choice = flow.context.physicalConnectionChoice;
  return (
    <FocusCard>
      <span className="eyebrow">这是可选的</span>
      <h1 ref={headingRef} tabIndex={-1}>想靠近一点吗？</h1>
      <p className="lead">如果TA也愿意，可以不用急着再说什么。</p>
      <div className="physical-options" role="group" aria-label="身体联结方式">
        {physicalOptions.map((option) => (
          <button key={option.id} type="button" aria-pressed={choice === option.id} onClick={() => replace({ type: "SELECT_PHYSICAL_CONNECTION", value: option.id })}>{option.label}</button>
        ))}
      </div>
      {choice ? <p className="physical-instruction" role="status">{physicalInstructions[choice]}</p> : null}
      <p className="consent-note">只有TA愿意时才靠近。如果TA躲开、身体变紧，或说不要，立刻停下。</p>
      <button className="primary-button" type="button" disabled={!choice} onClick={() => advance({ type: "COMPLETE_PHYSICAL_CONNECTION" })}>{choice === "no-touch" ? "现在先不碰TA" : "做完了"}</button>
    </FocusCard>
  );
}

function BranchCard({
  branch,
  headingRef,
  onDone,
  onPause,
}: {
  branch: (typeof reactionBranches)[ReactionId];
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onDone: () => void;
  onPause: () => void;
}) {
  return (
    <FocusCard>
      <span className="eyebrow">现在这样回应</span>
      <h1 ref={headingRef} tabIndex={-1}>{branch.title}</h1>
      <SayThisCard>“{branch.phrase}”</SayThisCard>
      <div className="branch-detail">
        <div><span>接下来做</span><p>{branch.action}</p></div>
        {branch.avoid ? <div><span>先不要</span><p>{branch.avoid}</p></div> : null}
      </div>
      <div className="action-row">
        <button className="primary-button" type="button" onClick={onDone}>这个动作做完了</button>
        <PauseAction onClick={onPause} />
      </div>
    </FocusCard>
  );
}

function PauseAction({ onClick, standalone = false }: { onClick: () => void; standalone?: boolean }) {
  return (
    <button className={`text-action${standalone ? " standalone" : ""}`} type="button" onClick={onClick}>
      <Pause aria-hidden="true" size={16} />先暂停一下
    </button>
  );
}
