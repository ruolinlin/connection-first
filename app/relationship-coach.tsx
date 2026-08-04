"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, BookHeart, BookOpen, Check, ChevronRight,
  Heart, HeartHandshake, Info, Menu, Moon, Pause, PencilLine,
  Quote, RotateCcw, Sparkles, Sun, X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import contentData from "./content-data.json";

type View = "home" | "quick" | "practice" | "dictionary" | "journal";
type Card = { title: string; note?: string; icon?: string };
const content = contentData as Record<string, string>;
const c = (id: string) => content[id] ?? "";

const steps = [
  c("WORK-01"), c("WORK-02"), c("WORK-03"), c("WORK-04"),
  c("WORK-05"), c("WORK-06"), c("WORK-07"), c("WORK-08"),
];

const situations = ["TA提高了声音", "TA哭了", "TA一直说没事", "TA说算了", "TA转身离开", "TA不看我", "TA沉默了", "我沉默了", "我们面对面", "我们在微信聊天"];
const translations: Record<string, string[]> = {
  "随便": ["我已经不知道怎么表达。", "我希望你主动理解。", "我觉得继续说也没有用。"],
  "没事": ["我还没有准备好把感受说出来。", "我不确定说出来会不会被理解。", "我希望你能多停留一会儿。"],
  "你忙吧": ["我不想成为你的负担。", "我也许有些失落，但不知道怎么开口。", "我希望你能让我感到自己也重要。"],
  "算了": ["我已经有些疲惫了。", "我担心再说下去也不会被听见。", "我想先停下来保护自己。"],
  "都行": ["我不确定自己的意见会不会被重视。", "我可能已经没有力气继续争取。", "我希望你也能照顾到我的感受。"],
};

const emotions: Card[] = [
  { icon: "😔", title: "委屈", note: "我努力表达了，却没有被理解。" },
  { icon: "😞", title: "失望", note: "我在意的期待落空了。" },
  { icon: "😢", title: "伤心", note: "我觉得自己好像不重要。" },
  { icon: "😟", title: "没有安全感", note: "我担心我们的关系越来越远。" },
  { icon: "😣", title: "挫败", note: "为什么我们好像总会回到这里。" },
  { icon: "🥺", title: "孤单", note: "即使你在身边，我也像是一个人。" },
];

const needs: Card[] = [
  { title: "被理解", note: "先复述TA的感受，不急着给结论。" },
  { title: "被重视", note: "停下手里的事，把注意力交给此刻。" },
  { title: "被陪伴", note: "留在TA身边，允许安静存在。" },
  { title: "被回应", note: "用简短的话告诉TA：你听见了。" },
  { title: "被尊重", note: "不替TA定义感受，也不逼TA马上说。" },
  { title: "安全感", note: "让TA知道冲突不会让你突然离开。" },
];

const bodyGuides = [
  ["👀", "眼神", "自然看向对方，避免一直低头。", "我还在这里。"],
  ["🙂", "表情", "放松面部，不苦笑，也不皱眉审视。", "你可以靠近我。"],
  ["🤲", "姿态", "放下抱胸，身体朝向对方。", "我愿意听。"],
  ["🔊", "声音", "慢一点、轻一点，留一点停顿。", "此刻不需要争赢。"],
  ["🫁", "呼吸", "吸气四拍，呼气六拍，重复三次。", "先让身体安全下来。"],
];

const donts = [
  ["不要马上解释", "TA现在需要被回应，不是被分析。"],
  ["不要争论事实", "争对错会让情绪更孤单。"],
  ["不要打断", "把一句话听完，是最小的尊重。"],
  ["不要突然离开", "如果需要暂停，先说明多久后回来。"],
  ["不要长时间沉默", "一句“我在整理，但我没有离开”会更安全。"],
];

const repairs = [
  ["我想理解你。", "把目标从赢得争论，重新放回理解彼此。"],
  ["我刚刚没有回应好。", "承担自己的部分，让对方不必继续证明受伤。"],
  ["谢谢你愿意告诉我。", "肯定表达本身，让坦诚变得更安全。"],
  ["我们不是敌人。", "提醒彼此：你们共同面对问题，而不是互相对抗。"],
];

const conflictTypes = [
  {
    id: "unheard", label: "没有被听见", icon: "👂", hint: c("TYPE-01-A"),
    signals: ["不听", "没听", "解释", "提高", "声音", "吵", "反复", "道理"],
    first: [c("TYPE-01-1"), c("TYPE-01-2"), c("TYPE-01-3")],
    out: [c("TYPE-01-4"), c("TYPE-01-5"), c("TYPE-01-6")],
    next: [c("TYPE-01-7"), c("TYPE-01-8"), c("TYPE-01-9")],
    opening: c("TYPE-01-10"),
  },
  {
    id: "neglected", label: "感到不被重视", icon: "💔", hint: c("TYPE-02-A"),
    signals: ["手机", "忙", "忘", "失约", "迟到", "不重要", "忽略", "陪"],
    first: [c("TYPE-02-1"), c("TYPE-02-2"), c("TYPE-02-3")],
    out: [c("TYPE-02-4"), c("TYPE-02-5"), c("TYPE-02-6")],
    next: [c("TYPE-02-7"), c("TYPE-02-8"), c("TYPE-02-9")],
    opening: c("TYPE-02-10"),
  },
  {
    id: "unsafe", label: "担心关系失去安全感", icon: "🫂", hint: c("TYPE-03-A"),
    signals: ["离开", "分手", "算了", "哭", "不爱", "冷战", "删除", "拉黑", "安全"],
    first: [c("TYPE-03-1"), c("TYPE-03-2"), c("TYPE-03-3")],
    out: [c("TYPE-03-4"), c("TYPE-03-5"), c("TYPE-03-6")],
    next: [c("TYPE-03-7"), c("TYPE-03-8"), c("TYPE-03-9")],
    opening: c("TYPE-03-10"),
  },
  {
    id: "boundary", label: "边界或尊重受到影响", icon: "🛡️", hint: c("TYPE-04-A"),
    signals: ["打断", "尊重", "控制", "讽刺", "骂", "逼", "隐私", "边界"],
    first: [c("TYPE-04-1"), c("TYPE-04-2"), c("TYPE-04-3")],
    out: [c("TYPE-04-4"), c("TYPE-04-5"), c("TYPE-04-6")],
    next: [c("TYPE-04-7"), c("TYPE-04-8"), c("TYPE-04-9")],
    opening: c("TYPE-04-10"),
  },
  {
    id: "pressure", label: "压力累积后的爆发", icon: "🌧️", hint: c("TYPE-05-A"),
    signals: ["工作", "累", "压力", "家里", "孩子", "睡", "疲惫", "小事", "突然"],
    first: [c("TYPE-05-1"), c("TYPE-05-2"), c("TYPE-05-3")],
    out: [c("TYPE-05-4"), c("TYPE-05-5"), c("TYPE-05-6")],
    next: [c("TYPE-05-7"), c("TYPE-05-8"), c("TYPE-05-9")],
    opening: c("TYPE-05-10"),
  },
];

const liveStates = [
  { id:"unhappy", icon:"😞", label:c("LIVE-01-A").replace(/^😞\s*/, ""), action:c("LIVE-01-B"), words:c("LIVE-01-C"), avoid:c("LIVE-01-D") },
  { id:"loud", icon:"🔥", label:c("LIVE-02-A").replace(/^🔥\s*/, ""), action:c("LIVE-02-B"), words:c("LIVE-02-C"), avoid:c("LIVE-02-D") },
  { id:"crying", icon:"💧", label:c("LIVE-03-A").replace(/^💧\s*/, ""), action:c("LIVE-03-B"), words:c("LIVE-03-C"), avoid:c("LIVE-03-D") },
  { id:"silent", icon:"🌫️", label:c("LIVE-04-A").replace(/^🌫️\s*/, ""), action:c("LIVE-04-B"), words:c("LIVE-04-C"), avoid:c("LIVE-04-D") },
  { id:"leaving", icon:"🚪", label:c("LIVE-05-A").replace(/^🚪\s*/, ""), action:c("LIVE-05-B"), words:c("LIVE-05-C"), avoid:c("LIVE-05-D") },
  { id:"wechat", icon:"💬", label:c("LIVE-06-A").replace(/^💬\s*/, ""), action:c("LIVE-06-B"), words:c("LIVE-06-C"), avoid:c("LIVE-06-D") },
  { id:"both", icon:"⚡", label:c("LIVE-07-A").replace(/^⚡\s*/, ""), action:c("LIVE-07-B"), words:c("LIVE-07-C"), avoid:c("LIVE-07-D") },
];

const repairGestures = [
  { icon:"🍫", title:"巧克力＋手写信", when:c("REPAIR-01-A"), do:c("REPAIR-01-B"), avoid:c("REPAIR-01-C") },
  { icon:"💐", title:"一束花或小礼物", when:c("REPAIR-02-A"), do:c("REPAIR-02-B"), avoid:c("REPAIR-02-C") },
  { icon:"🍜", title:"一顿熟悉的饭", when:c("REPAIR-03-A"), do:c("REPAIR-03-B"), avoid:c("REPAIR-03-C") },
  { icon:"🚶", title:"一次没有任务的散步", when:c("REPAIR-04-A"), do:c("REPAIR-04-B"), avoid:c("REPAIR-04-C") },
  { icon:"🗓️", title:"兑现一个小承诺", when:c("REPAIR-05-A"), do:c("REPAIR-05-B"), avoid:c("REPAIR-05-C") },
  { icon:"📷", title:"重访一个共同记忆", when:c("REPAIR-06-A"), do:c("REPAIR-06-B"), avoid:c("REPAIR-06-C") },
];

const dictionary = [
  ["委屈", c("EMO-01-1"), c("EMO-01-2"), c("EMO-01-3"), c("EMO-01-4")],
  ["失望", c("EMO-02-1"), c("EMO-02-2"), c("EMO-02-3"), c("EMO-02-4")],
  ["羞愧", c("EMO-03-1"), c("EMO-03-2"), c("EMO-03-3"), c("EMO-03-4")],
  ["害怕", c("EMO-04-1"), c("EMO-04-2"), c("EMO-04-3"), c("EMO-04-4")],
  ["愧疚", c("EMO-05-1"), c("EMO-05-2"), c("EMO-05-3"), c("EMO-05-4")],
  ["孤独", c("EMO-06-1"), c("EMO-06-2"), c("EMO-06-3"), c("EMO-06-4")],
  ["焦虑", c("EMO-07-1"), c("EMO-07-2"), c("EMO-07-3"), c("EMO-07-4")],
  ["无助", c("EMO-08-1"), c("EMO-08-2"), c("EMO-08-3"), c("EMO-08-4")],
  ["期待", c("EMO-09-1"), c("EMO-09-2"), c("EMO-09-3"), c("EMO-09-4")],
  ["安心", c("EMO-10-1"), c("EMO-10-2"), c("EMO-10-3"), c("EMO-10-4")],
];

const flowExtras: Record<string, { goal:string; avoid:string; still:string; repair:string }> = {
  unheard: { goal:"停止重复争论，让双方重新听见彼此。", avoid:"你每次都是这样，根本没办法沟通。", still:"我愿意继续谈，但我们现在可能都需要先缓一下。等我们能够比较平静地说话时再继续。", repair:"先复述你听见的重点，再确认有没有遗漏。" },
  neglected: { goal:"让TA重新感受到被重视，并看到一个具体补救。", avoid:"我这么忙还不是为了我们，你别想太多。", still:"我知道现在解释只会让你更难受。我先停下来，等你愿意时，我想听听你原本期待我怎么做。", repair:"为具体行为道歉，并约定一个可以观察到的改变。" },
  unsafe: { goal:"先稳定关系安全感，再处理眼前的问题。", avoid:"你再这样，我们就别谈了。", still:"我没有要消失，也没有要放弃我们。我需要先缓二十分钟，之后会回来继续。", repair:"确认彼此不会突然失联，并共同约定下一次暂停的方式。" },
  boundary: { goal:"立即停止越界行为，把选择权还给对方。", avoid:"你太敏感了，我又没有什么意思。", still:"我先停下来，不继续逼你回应。你可以决定什么时候、用什么方式继续谈。", repair:"明确承认越界的具体行为，并形成双方都同意的边界。" },
  pressure: { goal:"先降低刺激和身体压力，一次只处理一件事。", avoid:"这么点小事有什么好生气的。", still:"我们现在不用解决所有事情。先停一下，等身体慢下来，再选最重要的一件谈。", repair:"分担一个具体任务，并在第二天回顾这次爆发前的早期信号。" },
};

const conflictAnalysis: Record<string, {
  situation: string;
  causes: string[];
  userState: string;
  otherState: string;
  body: string[];
  words: string[];
  actions: string[];
}> = {
  unheard: {
    situation: "双方正在重复表达立场，但重要的感受还没有被听见。",
    causes: ["回应太快，理解还没发生就开始解释", "双方都在证明自己没有错", "旧问题被带进了眼前这次对话"],
    userState: "你可能很想解释清楚，也可能觉得自己被误解。",
    otherState: "TA可能感到委屈、挫败，正在用更强烈的方式争取被听见。",
    body: ["先停止继续组织反驳", "肩膀放松，身体朝向TA", "把音量降低一档，语速放慢"],
    words: ["对不起，我刚才一直在解释，没有先听你。", "你最希望我先听懂的是哪一件事？"],
    actions: ["把手机放下，完整听完一分钟", "复述你听到的重点，请TA纠正", "一次只谈这一件事，不翻旧账"],
  },
  neglected: {
    situation: "冲突表面是某件小事，核心可能是TA感到自己没有被放在心上。",
    causes: ["期待没有被说清或没有被回应", "忙碌、失约或注意力分散造成累积失落", "道歉停留在语言，没有出现可见的改变"],
    userState: "你可能觉得自己已经很努力，或不理解为什么这件事这么严重。",
    otherState: "TA可能失望、委屈，并担心自己在关系里不重要。",
    body: ["停下手里的事，真正转向TA", "保持自然眼神，不边听边看手机", "先点头确认，不用苦笑化解尴尬"],
    words: ["对不起，这件事让你觉得自己没有被重视。", "我先不解释。你原本希望我怎么做？"],
    actions: ["指出一个你愿意立即补救的具体行为", "把重要约定写进日程并兑现", "事后用一件符合TA偏好的小行动表达重视"],
  },
  unsafe: {
    situation: "眼前的冲突可能触发了对失去关系、被抛下或突然失联的担心。",
    causes: ["一方突然离开、沉默或提到分开", "过去的冷战或失联经验被再次触发", "暂停没有说明时间，让距离感被放大"],
    userState: "你可能想逃离现场，或者害怕说得越多错得越多。",
    otherState: "TA可能焦虑、害怕，用追问、哭泣或强烈表达确认关系还在不在。",
    body: ["保持可见、稳定的姿态，不突然转身离开", "呼气比吸气稍长，先稳住自己的身体", "如果TA接受，保持合适距离陪在现场"],
    words: ["对不起，我刚才的反应让你更没有安全感。", "我不会突然消失。需要暂停的话，我会告诉你什么时候回来。"],
    actions: ["给出明确、能做到的返回时间", "暂停期间不拉黑、不失联、不发刺激性信息", "回来后先确认关系，再讨论事件"],
  },
  boundary: {
    situation: "冲突中可能出现了打断、逼迫、讽刺、控制或其他越过边界的行为。",
    causes: ["急于获得回应，忽略了TA是否愿意继续", "把情绪当成攻击，开始反击或贬低", "双方对隐私、空间或说话方式的边界不同"],
    userState: "你可能感到被拒绝、被挑战，想立刻得到答案。",
    otherState: "TA可能愤怒、害怕或羞耻，需要重新获得选择权和尊重。",
    body: ["立刻停止靠近、挡路或持续追问", "双手保持自然可见，给TA足够空间", "不用眼神逼迫TA马上回应"],
    words: ["对不起，我刚才越过了你的边界。", "我先停下来。你可以决定什么时候、用什么方式继续。"],
    actions: ["停止当前越界行为，不附带条件", "允许TA离开或联系可信任的人", "之后明确商量双方都能接受的边界"],
  },
  pressure: {
    situation: "这次爆发可能不只来自眼前的小事，而是疲惫和压力累积后的溢出。",
    causes: ["睡眠不足、工作或家庭任务长期堆积", "双方都在高负荷状态下讨论复杂问题", "早期的不舒服没有被说出，直到一次性爆发"],
    userState: "你可能也很累，只想尽快结束或解决全部问题。",
    otherState: "TA可能已经超负荷，暂时没有能力处理更多信息。",
    body: ["先把手里的动作停下来，坐稳或站稳", "放松下颌和双手，做三次延长呼气", "减少声音、灯光和持续追问等刺激"],
    words: ["对不起，我没有早点看见你已经撑得很辛苦。", "我们现在不用解决所有事情，先让身体缓下来。"],
    actions: ["先暂停二十分钟，并约定回来时间", "主动分担一个最具体的现实任务", "平静后只选最重要的一件事讨论"],
  },
};

const descriptionExamples = [
  "TA觉得我一直看手机，没有认真听，然后声音越来越大。",
  "TA哭着说算了，转身走了，我不知道要不要追。",
  "我们为了家务反复争吵，两个人都很累，越说越激动。",
];

const pauseSignals = [
  "双方已经无法听完对方说话",
  "音量持续升高",
  "出现侮辱、威胁或攻击性表达",
  "身体发抖、心跳加快或无法思考",
  "对话开始重复，没有新的信息",
  "一方已经明确表示不想继续",
  "继续交流可能造成安全风险",
];

const calmMethods = {
  outside: [
    ["延长呼气","缓慢吸气，再用更长的时间呼气。重复三轮。","约 30 秒","不要追求用力深呼吸。"],
    ["感官定位","找出看到的三个物体、听到的两个声音、身体的一个接触点。","约 1 分钟","只描述事实，不分析冲突。"],
    ["脚底压力","感受双脚接触地面，轻轻向下用力，再慢慢放松。","约 30 秒","保持自然，不需要让别人注意。"],
    ["暂时移开视线","看向一个中性的固定物体，减少持续刺激。","约 20 秒","不是翻白眼或故意无视对方。"],
    ["内部提示","在心里重复：我现在不需要立刻回答。","约 10 秒","先让身体慢下来，再决定怎么说。"],
  ],
  home: [
    ["改变空间","暂时离开发生冲突的房间，去安全、安静的空间。","20—30 分钟","先说明什么时候回来。"],
    ["冷水刺激","用凉水清洗面部或手部，把注意力带回身体。","约 30 秒","水温保持舒适，不使用冰水。"],
    ["缓慢活动","低强度走动、伸展或整理物品，释放身体紧张。","5—10 分钟","不要开车、剧烈运动或摔东西。"],
    ["先写，不发送","把想说的话写下来，但暂时不要发送或交给对方。","5 分钟","等平静后重新阅读。"],
    ["设置暂停计时","设定二十或三十分钟，并按约定回来。","20—30 分钟","暂停不能变成无限期失联。"],
    ["身体扫描","依次放松下颌、肩膀、双手和腹部。","约 2 分钟","只观察，不批评自己的反应。"],
  ],
};

function Brand({ compact = false }: { compact?: boolean }) {
  return <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="回到顶部">
    <span className="brand-mark"><HeartHandshake size={19} strokeWidth={1.7}/></span>
    <span><b>拆弹行动</b>{!compact && <small>{c("NAV-01")}</small>}</span>
  </button>;
}

function SelectCard({ item, selected, onClick }: { item: Card; selected: boolean; onClick: () => void }) {
  return <button aria-pressed={selected} onClick={onClick} className={`select-card ${selected ? "selected" : ""}`}>
    {item.icon && <span className="card-emoji">{item.icon}</span>}
    <span className="select-copy"><b>{item.title}</b>{item.note && <small>{item.note}</small>}</span>
    <span className="check">{selected && <Check size={15}/>}</span>
  </button>;
}

export function RelationshipCoach() {
  const [view, setView] = useState<View>("home");
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Record<number, string[]>>({});
  const [phrase, setPhrase] = useState("算了");
  const [customPhrase, setCustomPhrase] = useState("");
  const [dark, setDark] = useState(false);
  const [menu, setMenu] = useState(false);
  const [calmOpen, setCalmOpen] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);
  const [conflictType, setConflictType] = useState("unheard");
  const [journal, setJournal] = useState({ heard: "", defense: "", redo: "" });

  useEffect(() => {
    const stored = localStorage.getItem("connection-first-journal");
    if (stored) setJournal(JSON.parse(stored));
    const mode = localStorage.getItem("connection-first-theme");
    if (mode === "dark" || (!mode && matchMedia("(prefers-color-scheme: dark)").matches)) setDark(true);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("connection-first-theme", dark ? "dark" : "light");
  }, [dark]);

  const choose = (index: number, value: string) => setSelected(prev => {
    const list = prev[index] || [];
    return { ...prev, [index]: list.includes(value) ? list.filter(x => x !== value) : [...list, value] };
  });
  const go = (target: View) => { setView(target); setMenu(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const begin = () => { setStep(0); go("practice"); };
  const quickStart = () => go("quick");
  const next = () => { if (step < 7) { setStep(step + 1); window.scrollTo({ top: 0, behavior: "smooth" }); } else go("journal"); };
  const previous = () => { if (step > 0) setStep(step - 1); else go("home"); };
  const activeTranslation = translations[phrase] || ["这句话可能在保护一种还没准备好说出的感受。", "TA也许希望你先停下来，确认TA此刻的体验。", "比起猜测，更重要的是温和地向TA确认。"];
  const filteredDictionary = useMemo(() => dictionary.filter(item => item.join("").includes(search.trim())), [search]);

  const saveJournal = () => {
    localStorage.setItem("connection-first-journal", JSON.stringify(journal));
    setSaved(true); setTimeout(() => setSaved(false), 1800);
  };

  return <div className="app-shell">
    <header className="topbar">
      <Brand compact />
      <nav className="desktop-nav" aria-label="主导航">
        <button onClick={() => go("home")} className={view === "home" ? "active" : ""}>{c("NAV-03")}</button>
        <button onClick={quickStart} className={view === "quick" ? "active" : ""}>开始判断</button>
        <button onClick={() => setCalmOpen(true)}>快速冷静</button>
        <button onClick={() => go("dictionary")} className={view === "dictionary" ? "active" : ""}>{c("NAV-05")}</button>
        <button onClick={() => go("journal")} className={view === "journal" ? "active" : ""}>{c("NAV-06")}</button>
      </nav>
      <div className="header-actions">
        <button className="icon-button" onClick={() => setDark(!dark)} aria-label={dark ? "切换浅色模式" : "切换深色模式"}>{dark ? <Sun size={18}/> : <Moon size={18}/>}</button>
        <button className="icon-button mobile-menu" onClick={() => setMenu(!menu)} aria-label="打开导航">{menu ? <X size={20}/> : <Menu size={20}/>}</button>
      </div>
      <AnimatePresence>{menu && <motion.nav initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} className="mobile-nav">
        <button onClick={() => go("home")}>{c("NAV-03")}</button><button onClick={quickStart}>开始判断</button><button onClick={() => setCalmOpen(true)}>快速冷静</button><button onClick={() => go("dictionary")}>{c("NAV-05")}</button><button onClick={() => go("journal")}>{c("NAV-06")}</button>
      </motion.nav>}</AnimatePresence>
    </header>

    <main>
      <AnimatePresence mode="wait">
        {view === "home" && <Home key="home" begin={quickStart} go={go} openCalm={() => setCalmOpen(true)}/>} 
        {view === "quick" && <QuickCoach key="quick" conflictType={conflictType} setConflictType={setConflictType} openCalm={() => setCalmOpen(true)} openSafety={() => setSafetyOpen(true)}/>} 
        {view === "practice" && <Practice key={`practice-${step}`} step={step} setStep={setStep} selected={selected} choose={choose} phrase={phrase} setPhrase={setPhrase} customPhrase={customPhrase} setCustomPhrase={setCustomPhrase} activeTranslation={activeTranslation} previous={previous} next={next}/>} 
        {view === "dictionary" && <Dictionary key="dictionary" search={search} setSearch={setSearch} items={filteredDictionary}/>} 
        {view === "journal" && <Journal key="journal" journal={journal} setJournal={setJournal} save={saveJournal} saved={saved} begin={begin}/>} 
      </AnimatePresence>
    </main>
    <div className="fixed-tools"><button onClick={() => setCalmOpen(true)}>快速冷静</button><button className="safety" onClick={() => setSafetyOpen(true)}>我是否处于危险中</button></div>
    <AnimatePresence>{calmOpen && <CalmOverlay close={() => setCalmOpen(false)}/>}</AnimatePresence>
    <AnimatePresence>{safetyOpen && <SafetyOverlay close={() => setSafetyOpen(false)}/>}</AnimatePresence>
    <footer><Brand/><p>{c("HOME-19")}</p><span>{c("HOME-20")}</span></footer>
  </div>;
}

function Home({ begin, go, openCalm }: { begin: () => void; go: (v: View) => void; openCalm: () => void }) {
  return <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
    <section className="hero action-hero">
      <div className="eyebrow"><Sparkles size={14}/> 拆弹行动 · 冲突处理引导</div>
      <h1>把刚刚发生的事告诉我。<br/><em>先判断，再行动。</em></h1>
      <p>不用先学会判断冲突类型。描述TA说了什么、做了什么，我们会帮你识别情况，并给出身体、语言和行动支持。</p>
      <div className="hero-actions"><button className="primary large" onClick={begin}>开始判断当前冲突 <ArrowRight size={17}/></button><button className="secondary large" onClick={openCalm}>我需要先冷静一下</button></div>
      <small className="hero-assurance">每个页面只完成一个任务，随时可以返回修改选择。</small>
    </section>
    <section className="start-flow page-width" aria-label="使用步骤">
      {[ ["01","描述发生了什么","不用自己判断类型"], ["02","获得三类支持","身体、语言、行动"], ["03","判断是否暂停","避免继续升级冲突"], ["04","缓和关系","决定下一步行动"] ].map(item=><article key={item[0]}><span>{item[0]}</span><div><b>{item[1]}</b><p>{item[2]}</p></div></article>)}
    </section>
    <section className="start-note page-width"><HeartHandshake size={22}/><div><b>不是要求你一次学会所有方法。</b><p>先处理眼前这一刻。冲突平静以后，再回来看情绪词典和关系练习册。</p></div></section>
    <section className="home-modules page-width"><button onClick={() => go("dictionary")}><BookOpen/><span><b>{c("NAV-05")}</b><small>{c("HOME-17")}</small></span><ChevronRight/></button><button onClick={() => go("journal")}><PencilLine/><span><b>{c("NAV-06")}</b><small>{c("HOME-18")}</small></span><ChevronRight/></button></section>
  </motion.div>;
}

function QuickCoach({ conflictType, setConflictType, openCalm, openSafety }: any) {
  const [flowStep, setFlowStep] = useState(0);
  const [pauseChecks, setPauseChecks] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [description, setDescription] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const current = conflictTypes.find(type => type.id === conflictType) || conflictTypes[0];
  const extra = flowExtras[current.id];
  const analysis = conflictAnalysis[current.id];
  const repair = repairGestures[Math.max(0, conflictTypes.findIndex(type => type.id === current.id))];
  const pauseRecommended = pauseChecks.length >= 2;
  const descriptionSafetyRisk = /打人|掐|推搡|威胁|刀|武器|不让我走|锁门|自杀|自伤|杀/.test(description);
  const safetyRisk = pauseChecks.includes("继续交流可能造成安全风险") || descriptionSafetyRisk;
  const togglePause = (item: string) => setPauseChecks(list => list.includes(item) ? list.filter(value => value !== item) : [...list, item]);
  const move = (nextStep: number) => { setFlowStep(nextStep); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const copyWords = () => { navigator.clipboard?.writeText(analysis.words.join("\n")); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const analyzeDescription = () => {
    const normalized = description.trim().toLowerCase();
    const ranked = conflictTypes.map((type, index) => ({
      id: type.id,
      index,
      score: type.signals.reduce((score, signal) => score + (normalized.includes(signal.toLowerCase()) ? 1 : 0), 0),
    })).sort((a, b) => b.score - a.score || a.index - b.index);
    setConflictType(ranked[0].score > 0 ? ranked[0].id : "pressure");
    setAnalyzed(true);
    setTimeout(() => document.getElementById("analysis-result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };
  const chooseType = (id: string) => { setConflictType(id); setAnalyzed(true); };

  return <motion.section className="guided-page page-width" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>
    <div className="flow-progress"><div><span style={{width: ((flowStep + 1) * 25) + "%"}}/></div><small>步骤 {flowStep + 1} / 4</small></div>

    {flowStep === 0 && <div className="flow-panel">
      <header className="flow-heading"><span>第一步</span><h1>刚刚发生了什么？</h1><p>不用判断原因，也不用写得完整。像告诉朋友一样，写下TA做了什么、说了什么，以及你做了什么。</p></header>
      <div className="describe-card">
        <label htmlFor="conflict-description">描述这次冲突</label>
        <textarea id="conflict-description" value={description} onChange={event => { setDescription(event.target.value); setAnalyzed(false); }} placeholder="例如：TA觉得我一直看手机，没有认真听。TA提高了声音，我开始解释，然后我们越说越激动……" />
        <div className="describe-footer"><small>建议写 1—5 句话，不需要提供姓名或隐私信息。</small><button className="primary" disabled={!description.trim()} onClick={analyzeDescription}>帮我判断现在的情况 <ArrowRight size={16}/></button></div>
      </div>
      <div className="description-examples"><span>不知道怎么写？试试</span>{descriptionExamples.map(example => <button key={example} onClick={() => { setDescription(example); setAnalyzed(false); }}>{example}</button>)}</div>
      {analyzed && <motion.div id="analysis-result" className="analysis-result" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
        <header><span>{current.icon}</span><div><small>根据描述，初步识别为</small><h2>{current.label}</h2><p>{analysis.situation}</p></div></header>
        <div className="analysis-grid"><article><small>可能的原因</small><ul>{analysis.causes.map(item => <li key={item}>{item}</li>)}</ul></article><article><small>你可能正在经历</small><p>{analysis.userState}</p></article><article><small>TA可能正在经历</small><p>{analysis.otherState}</p></article></div>
        <div className="analysis-note"><Info size={16}/><p>这是根据文字线索做的初步判断，不代表TA的真实想法。接下来可以用简短的话向TA确认。</p></div>
        <div className="analysis-correction"><span>感觉不准确？可以改成</span><div>{conflictTypes.map(type => <button key={type.id} onClick={() => chooseType(type.id)} className={current.id === type.id ? "active" : ""}>{type.icon} {type.label}</button>)}</div></div>
        {descriptionSafetyRisk && <button className="inline-safety" onClick={openSafety}>描述中可能涉及安全风险，先查看安全提示 <ArrowRight size={15}/></button>}
      </motion.div>}
    </div>}

    {flowStep === 1 && <div className="flow-panel">
      <header className="flow-heading"><span>第二步 · {current.icon} {current.label}</span><h1>现在，照着这三步做</h1><p>先调整身体，再说短句，最后做一个具体行动。不要一次解释完整件事。</p></header>
      <section className="support-goal"><small>当前目标</small><b>{extra.goal}</b></section>
      <div className="support-grid">
        <article className="body-support"><header><span>01</span><i>🫁</i></header><small>身体支持</small><h2>先让你的状态降下来</h2><ol>{analysis.body.map((item, index) => <li key={item}><span>{index + 1}</span>{item}</li>)}</ol><button className="text-button" onClick={openCalm}>需要更多冷静方法 <ArrowRight size={14}/></button></article>
        <article className="word-support"><header><span>02</span><i>💬</i></header><small>语言支持</small><h2>短一点，先道歉再确认</h2><div className="word-script">{analysis.words.map(item => <blockquote key={item}>“{item}”</blockquote>)}</div><button onClick={copyWords}>{copied ? <Check size={15}/> : <Quote size={15}/>} {copied ? "已复制" : "复制这两句"}</button></article>
        <article className="action-support"><header><span>03</span><i>🤲</i></header><small>行动支持</small><h2>让TA看见一个具体改变</h2><ol>{analysis.actions.map((item, index) => <li key={item}><span>{index + 1}</span>{item}</li>)}</ol></article>
      </div>
      <div className="support-avoid"><X size={17}/><div><small>现在先不要说</small><p>“{extra.avoid}”</p><span>如果TA仍然很激动： “{extra.still}”</span></div></div>
    </div>}

    {flowStep === 2 && <div className="flow-panel">
      <header className="flow-heading"><span>第三步</span><h1>现在还适合继续沟通吗？</h1><p>请选择正在发生的情况。出现多项时，暂停通常比继续解释更有效。</p></header>
      <div className="pause-checks">{pauseSignals.map(item => <button key={item} onClick={() => togglePause(item)} className={pauseChecks.includes(item) ? "checked" : ""} aria-pressed={pauseChecks.includes(item)}><span>{pauseChecks.includes(item) && <Check size={14}/>}</span>{item}</button>)}</div>
      <div className={"pause-result " + (pauseRecommended ? "recommend" : "continue")}><header><Pause size={20}/><div><small>判断结果</small><h2>{pauseRecommended ? "建议暂停对话" : "可以谨慎继续"}</h2></div></header>{pauseRecommended ? <><p>现在继续沟通可能让冲突进一步升级。暂停不是逃避，而是让双方恢复基本的思考和倾听能力。</p><blockquote>{c("ER-04-02")}</blockquote><div className="pause-how"><article><b>暂停多久</b><p>建议二十分钟；如果仍然无法思考，可以重新约定明确时间。</p></article><article><b>暂停期间</b><p>不要喝酒、追车、继续微信争吵或找人围攻。可以打开“快速冷静”。</p></article><article><b>如何重新开始</b><p>{c("ER-05-03")}</p></article></div><button className="secondary" onClick={openCalm}>打开快速冷静方法</button></> : <><p>目前仍可能继续沟通，但只处理一个问题，并观察音量、身体反应和对方是否愿意继续。</p><blockquote>{extra.still}</blockquote></>}</div>
      {safetyRisk && <button className="inline-safety" onClick={openSafety}>这可能涉及安全风险，查看安全提示 <ArrowRight size={15}/></button>}
    </div>}

    {flowStep === 3 && <div className="flow-panel">
      <header className="flow-heading"><span>第四步 · 冲突缓和以后</span><h1>下一步如何缓和关系？</h1><p>先确认双方已经平静，再修复影响和商量下一次怎么做。</p></header>
      <div className="repair-sequence">{[
        ["确认状态","双方能够降低音量、听完一句话，没有身体威胁。"],
        ["回顾事实","简要说清发生了什么，不一次翻完所有旧账。"],
        ["承认影响",extra.repair],
        ["表达需要","说明自己的感受和真正重视的事情，不定义对方。"],
        ["提出方案","提出一个具体、可讨论、能够做到的改变。"],
        ["确认行动","约定双方接下来各自做什么，以及什么时候检查。"],
      ].map((item,index)=><article key={item[0]}><span>{index + 1}</span><div><b>{item[0]}</b><p>{item[1]}</p></div></article>)}</div>
      <div className="matched-repair"><span>{repair.icon}</span><div><small>适合这类冲突的缓和行动</small><h3>{repair.title}</h3><p>{repair.do}</p><b>注意：{repair.avoid}</b></div></div>
      <div className="third-party"><Info size={18}/><p>如果反复出现威胁、控制、身体冲突，或双方一直无法恢复安全沟通，请优先寻求可信任的人、伴侣咨询或其他现实支持。</p></div>
    </div>}

    <div className="flow-actions">{flowStep > 0 ? <button className="secondary" onClick={() => move(flowStep - 1)}><ArrowLeft size={16}/> 返回上一步</button> : <span/>}{flowStep < 3 ? <button className="primary" disabled={flowStep === 0 && !analyzed} onClick={() => move(flowStep + 1)}>下一步 <ArrowRight size={16}/></button> : <button className="primary" onClick={() => { setPauseChecks([]); setDescription(""); setAnalyzed(false); move(0); }}><RotateCcw size={15}/> 处理另一次冲突</button>}</div>
  </motion.section>;
}

function CalmMethods() {
  const [place, setPlace] = useState<"outside"|"home">("outside");
  return <div className="calm-tool"><div className="calm-tabs" role="tablist"><button role="tab" aria-selected={place === "outside"} className={place === "outside" ? "active" : ""} onClick={() => setPlace("outside")}>我在外面</button><button role="tab" aria-selected={place === "home"} className={place === "home" ? "active" : ""} onClick={() => setPlace("home")}>我在家里</button></div><div className="calm-grid">{calmMethods[place].map(method => <article key={method[0]}><h3>{method[0]}</h3><p>{method[1]}</p><div><span>建议时长</span><b>{method[2]}</b></div><small>{method[3]}</small></article>)}</div></div>;
}

function CalmOverlay({ close }: { close: () => void }) {
  return <motion.div className="overlay" role="dialog" aria-modal="true" aria-labelledby="calm-title" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={event => { if (event.target === event.currentTarget) close(); }}><motion.section className="overlay-card wide" initial={{scale:.97,y:15}} animate={{scale:1,y:0}}><button className="overlay-close" onClick={close} aria-label="关闭快速冷静"><X size={20}/></button><header><span>随时可以打开</span><h2 id="calm-title">先让身体慢下来</h2><p>选择你现在所在的环境，然后只做一种方法。</p></header><CalmMethods/></motion.section></motion.div>;
}

function SafetyOverlay({ close }: { close: () => void }) {
  const risks = ["出现身体伤害或身体威胁","对方限制离开、通讯或求助","存在武器或危险物品","涉及儿童、老人或其他脆弱人员的安全","一方出现自伤、伤人或失控风险","当前环境不适合继续停留"];
  return <motion.div className="overlay" role="dialog" aria-modal="true" aria-labelledby="safety-title" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={event => { if (event.target === event.currentTarget) close(); }}><motion.section className="overlay-card safety-card" initial={{scale:.97,y:15}} animate={{scale:1,y:0}}><button className="overlay-close" onClick={close} aria-label="关闭安全提示"><X size={20}/></button><header><span>安全提示</span><h2 id="safety-title">需要优先关注安全的情况</h2></header><ul>{risks.map(risk => <li key={risk}>{risk}</li>)}</ul><div><b>先离开危险环境并寻求现实支持。</b><p>沟通问题可以在安全得到保障后再处理。此时不要继续优先使用沟通话术，也不要独自处理已经失控的现场。</p></div></motion.section></motion.div>;
}

function ActionColumn({ number, tone, icon, title, subtitle, items }: {number:string;tone:string;icon:string;title:string;subtitle:string;items:string[]}) {
  return <article className={`action-column ${tone}`}><header><span>{number}</span><i>{icon}</i></header><h3>{title}</h3><p>{subtitle}</p><ol>{items.map((item,i)=><li key={item}><span>{i+1}</span>{item}</li>)}</ol></article>;
}

function Practice(props: any) {
  const { step, setStep, selected, choose, phrase, setPhrase, customPhrase, setCustomPhrase, activeTranslation, previous, next } = props;
  return <motion.section className="practice-layout" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>
    <aside className="step-nav" aria-label="练习步骤">
      <div className="step-progress"><span style={{width:`${((step+1)/8)*100}%`}}/></div>
      <small>练习进度 · {step+1}/8</small>
      {steps.map((s,i)=><button key={s} className={i===step?"current":i<step?"done":""} onClick={()=>setStep(i)}><span>{i<step?<Check size={14}/>:i+1}</span><b>{s}</b></button>)}
    </aside>
    <div className="workbook">
      <div className="mobile-progress"><span>第 {step+1} 步，共 8 步</span><div><i style={{width:`${((step+1)/8)*100}%`}}/></div></div>
      <StepContent {...props}/>
      <div className="workbook-actions"><button className="secondary" onClick={previous}><ArrowLeft size={16}/> 上一步</button><button className="primary" onClick={next}>{step===7?"完成并记录":"继续"} <ArrowRight size={16}/></button></div>
    </div>
  </motion.section>;
}

function StepContent({ step, selected, choose, phrase, setPhrase, customPhrase, setCustomPhrase, activeTranslation }: any) {
  if (step===0) return <><StepHead n="01" title={c("WORK-01")} desc="先只描述你看见的，不急着判断谁对谁错。可以多选。"/><div className="chip-grid">{situations.map(s=><button key={s} onClick={()=>choose(0,s)} aria-pressed={(selected[0]||[]).includes(s)} className={(selected[0]||[]).includes(s)?"on":""}>{s}<span>{(selected[0]||[]).includes(s)&&<Check size={14}/>}</span></button>)}</div><Reflection>试着把“TA不讲道理”换成“TA提高了声音”。<br/>事实越清楚，防御越少。</Reflection></>;
  if (step===1) return <><StepHead n="02" title={c("WORK-02")} desc="听见一句话背后，也许还藏着什么感受？"/><div className="translator-input"><label>TA说</label><div><span>“</span><input value={customPhrase || phrase} onChange={e=>setCustomPhrase(e.target.value)} aria-label="输入TA说的话"/><span>”</span></div><div className="phrase-pills">{Object.keys(translations).map(p=><button key={p} onClick={()=>{setPhrase(p);setCustomPhrase("")}} className={!customPhrase&&phrase===p?"active":""}>{p}</button>)}</div></div><div className="translation-result"><span className="kicker">TA可能真正想表达的是</span>{activeTranslation.map((t:string,i:number)=><p key={t}><i>{i+1}</i>{t}</p>)}</div><div className="gentle-note"><Info size={17}/><p>{c("TRANS-01")}</p></div></>;
  if (step===2) return <><StepHead n="03" title={c("WORK-03")} desc="情绪不是问题，它是关系里正在发生什么的线索。选择一到两种可能。"/><div className="card-grid">{emotions.map(e=><SelectCard key={e.title} item={e} selected={(selected[2]||[]).includes(e.title)} onClick={()=>choose(2,e.title)}/>)}</div><Reflection>不用猜对。你只需要从“TA怎么又这样”走向“TA是不是很难受”。</Reflection></>;
  if (step===3) return <><StepHead n="04" title={c("WORK-04")} desc="先照顾关系里的需要，再讨论事情怎么解决。"/><div className="card-grid needs">{needs.map(e=><SelectCard key={e.title} item={e} selected={(selected[3]||[]).includes(e.title)} onClick={()=>choose(3,e.title)}/>)}</div></>;
  if (step===4) return <><StepHead n="05" title={c("WORK-05")} desc="对方先感受到你的状态，才会听见你的语言。"/><div className="body-list">{bodyGuides.map(x=><article key={x[1]}><span>{x[0]}</span><div><b>{x[1]}</b><p>{x[2]}</p></div><small>{x[3]}</small></article>)}</div><div className="response-flow"><div><span>1</span><small>第一句话</small><strong>“我看到你现在真的很难受。”</strong></div><div className="pause-card"><Pause size={18}/><p><b>停一下。</b> 不要马上解释。给这句话一点落下来的时间。</p></div><div><span>2</span><small>继续回应</small><strong>“我想先理解你的感受。”</strong></div><div><span>3</span><small>温和确认</small><strong>“你愿意告诉我，刚刚最让你难受的是什么吗？”</strong></div></div></>;
  if (step===5) return <><StepHead n="06" title={c("WORK-06")} desc="有些本能反应很想解决问题，却会让连接断得更快。"/><div className="dont-list">{donts.map(x=><article key={x[0]}><X size={17}/><div><b>{x[0]}</b><p>{x[1]}</p></div></article>)}</div><Reflection>如果你需要暂停，可以说：“我有点乱，想用十分钟整理一下。十分钟后我会回来继续听。”</Reflection></>;
  if (step===6) return <><StepHead n="07" title={c("WORK-07")} desc="修复不是认输，而是告诉彼此：关系比这一刻的输赢更重要。"/><div className="repair-list">{repairs.map((x,i)=><article key={x[0]}><span>0{i+1}</span><div><strong>“{x[0]}”</strong><p>{x[1]}</p></div><Heart size={18}/></article>)}</div></>;
  return <><StepHead n="08" title={c("WORK-08")} desc="把批评变成清楚的表达，把要求变成可以回应的请求。"/><div className="solve-flow">{[["发生了什么","只说具体看见的事","昨晚我分享工作时，你看了几次手机。"],["我有什么感受","说自己的体验，不定义对方","我有点失落，也有些孤单。"],["我在意什么","找到感受背后真正重要的事","因为我很在意我们专心相处的时间。"],["我想提出什么","给出清楚、具体、可商量的请求","下次我分享十分钟时，你愿意先把手机放下吗？"]].map((x,i)=><article key={x[0]}><span>{i+1}</span><div><b>{x[0]}</b><small>{x[1]}</small><p>“{x[2]}”</p></div></article>)}</div><div className="completion"><Sparkles/><div><b>你完成了一次“先连接，再解决”。</b><p>真正的成长，不是每次都回应完美，而是一次比一次更早看见情绪、更愿意回来修复。</p></div></div></>;
}

function StepHead({ n, title, desc }: { n:string; title:string; desc:string }) { return <div className="step-head"><span>{n}</span><h1>{title}</h1><p>{desc}</p></div> }
function Reflection({ children }: { children: React.ReactNode }) { return <div className="reflection"><BookHeart size={18}/><p>{children}</p></div> }

function Dictionary({ search, setSearch, items }: any) {
  return <motion.section className="module-page page-width" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}><div className="module-hero"><span className="eyebrow"><BookOpen size={14}/> 中文情绪词典</span><h1>为说不清的感受，<br/>找到一个更准确的名字。</h1><p>当你能辨认情绪，就不必只用“烦”“没事”“算了”来保护自己。</p><label className="search"><span>⌕</span><input value={search} onChange={(e:any)=>setSearch(e.target.value)} placeholder="搜索一种情绪或需要……"/><small>{items.length} 个词条</small></label></div><div className="dictionary-grid">{items.map((x:string[])=><article key={x[0]}><header><span>{x[0]}</span><Heart size={16}/></header><dl><div><dt>它是什么意思</dt><dd>{x[1]}</dd></div><div><dt>常见表现</dt><dd>{x[2]}</dd></div><div><dt>背后的需要</dt><dd>{x[3]}</dd></div><div className="how"><dt>可以怎样回应</dt><dd>{x[4]}</dd></div></dl></article>)}</div>{items.length===0&&<div className="empty">还没有找到这个词。试试“委屈”“焦虑”或“安心”。</div>}</motion.section>;
}

function Journal({ journal, setJournal, save, saved, begin }: any) {
  const fields = [["heard",c("JOURNAL-01"),"也许我听见，TA不是在责怪我，而是在说TA很孤单……"],["defense",c("JOURNAL-02"),"当TA说“你总是……”时，我马上想证明自己……"],["redo",c("JOURNAL-03"),"我会先放慢声音，然后告诉TA……"]];
  return <motion.section className="module-page journal-page page-width" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}><div className="module-hero"><span className="eyebrow"><PencilLine size={14}/> 关系练习册</span><h1>冲突已经过去。<br/>现在，把经历慢慢变成能力。</h1><p>不用写得正确，只要诚实地看见自己。这些记录只保存在你的设备上。</p></div><div className="journal-sheet"><div className="date-line"><span>一次关系复盘</span><small>{new Intl.DateTimeFormat("zh-CN", {year:"numeric",month:"long",day:"numeric"}).format(new Date())}</small></div>{fields.map((f,i)=><label key={f[0]}><span>0{i+1}</span><b>{f[1]}</b><textarea value={journal[f[0]]} onChange={e=>setJournal({...journal,[f[0]]:e.target.value})} placeholder={f[2]}/></label>)}<div className="journal-actions"><button className="secondary" onClick={()=>setJournal({heard:"",defense:"",redo:""})}><RotateCcw size={15}/> 清空</button><button className="primary" onClick={save}>{saved?<><Check size={16}/> 已保存</>:<>保存这次练习 <BookHeart size={16}/></>}</button></div></div><div className="journal-end"><HeartHandshake/><div><b>修复，是一项可以慢慢学会的能力。</b><p>下一次，你也许会早一点停下来，早一点看见对方。</p></div><button className="text-button" onClick={begin}>再练习一次 <ArrowRight size={16}/></button></div></motion.section>;
}
