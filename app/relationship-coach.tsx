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
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);
  const [scenario, setScenario] = useState("");
  const [conflictType, setConflictType] = useState("unheard");
  const [analyzed, setAnalyzed] = useState(false);
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
  const quickStart = () => { setAnalyzed(false); go("quick"); };
  const analyzeScenario = () => {
    const ranked = conflictTypes.map(type => ({ type, score: type.signals.filter(word => scenario.includes(word)).length }));
    ranked.sort((a, b) => b.score - a.score);
    setConflictType(ranked[0].score > 0 ? ranked[0].type.id : "unheard");
    setAnalyzed(true);
    setTimeout(() => document.getElementById("quick-result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };
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
        <button onClick={quickStart} className={view === "quick" ? "active" : ""}>{c("NAV-04")}</button>
        <button onClick={() => go("dictionary")} className={view === "dictionary" ? "active" : ""}>{c("NAV-05")}</button>
        <button onClick={() => go("journal")} className={view === "journal" ? "active" : ""}>{c("NAV-06")}</button>
      </nav>
      <div className="header-actions">
        <button className="icon-button" onClick={() => setDark(!dark)} aria-label={dark ? "切换浅色模式" : "切换深色模式"}>{dark ? <Sun size={18}/> : <Moon size={18}/>}</button>
        <button className="icon-button mobile-menu" onClick={() => setMenu(!menu)} aria-label="打开导航">{menu ? <X size={20}/> : <Menu size={20}/>}</button>
      </div>
      <AnimatePresence>{menu && <motion.nav initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} className="mobile-nav">
        <button onClick={() => go("home")}>{c("NAV-03")}</button><button onClick={quickStart}>{c("NAV-04")}</button><button onClick={() => go("dictionary")}>{c("NAV-05")}</button><button onClick={() => go("journal")}>{c("NAV-06")}</button>
      </motion.nav>}</AnimatePresence>
    </header>

    <main>
      <AnimatePresence mode="wait">
        {view === "home" && <Home key="home" begin={quickStart} go={go}/>} 
        {view === "quick" && <QuickCoach key="quick" scenario={scenario} setScenario={setScenario} conflictType={conflictType} setConflictType={setConflictType} analyzed={analyzed} analyze={analyzeScenario} deep={begin}/>} 
        {view === "practice" && <Practice key={`practice-${step}`} step={step} setStep={setStep} selected={selected} choose={choose} phrase={phrase} setPhrase={setPhrase} customPhrase={customPhrase} setCustomPhrase={setCustomPhrase} activeTranslation={activeTranslation} previous={previous} next={next}/>} 
        {view === "dictionary" && <Dictionary key="dictionary" search={search} setSearch={setSearch} items={filteredDictionary}/>} 
        {view === "journal" && <Journal key="journal" journal={journal} setJournal={setJournal} save={saveJournal} saved={saved} begin={begin}/>} 
      </AnimatePresence>
    </main>
    <footer><Brand/><p>{c("HOME-19")}</p><span>{c("HOME-20")}</span></footer>
  </div>;
}

function Home({ begin, go }: { begin: () => void; go: (v: View) => void }) {
  return <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
    <section className="hero">
      <div className="eyebrow"><Sparkles size={14}/> {c("HOME-01")}</div>
      <h1>{c("HOME-02")}<br/><em>{c("HOME-03")}</em></h1>
      <p>{c("HOME-04")}</p>
      <button className="primary large" onClick={begin}>{c("HOME-05")} <ArrowRight size={17}/></button>
      <div className="scroll-cue"><span>{c("HOME-06")}</span><i/></div>
    </section>
    <section className="principles page-width">
      {[ ["❤️",c("HOME-07"),c("HOME-08")], ["👂",c("HOME-09"),c("HOME-10")], ["🤝",c("HOME-11"),c("HOME-12")] ].map((p,i)=><motion.article initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.1}} key={p[1]}><span>{p[0]}</span><h3>{p[1]}</h3><p>{p[2]}</p></motion.article>)}
    </section>
    <section className="path-section page-width">
      <div className="section-heading"><span>一张情境急救卡</span><h2>{c("HOME-13")}</h2><p>写下具体情况，判断冲突属于哪一类，再得到三组可以马上执行的建议。</p></div>
      <div className="path-list">{[c("HOME-14"),c("HOME-15"),c("HOME-16")].map((s,i)=><div key={s}><span>0{i+1}</span><b>{s}</b>{i < 2 && <i/>}</div>)}</div>
    </section>
    <section className="translator-teaser page-width">
      <div><span className="kicker">关系翻译器</span><h2>“没事”背后，<br/>也许有很多还没说出口的话。</h2><p>我们不替对方下结论，只帮你看见更多可能，然后温和地确认。</p><button className="text-button" onClick={begin}>分析一个具体情境 <ArrowRight size={16}/></button></div>
      <div className="quote-stack"><div className="quote-card back"/><div className="quote-card"><Quote size={22}/><small>TA说</small><strong>“算了。”</strong><hr/><small>TA也许在说</small><p>“我担心再说下去，也不会被听见。”</p><span>这只是一种可能</span></div></div>
    </section>
    <section className="home-modules page-width"><button onClick={() => go("dictionary")}><BookOpen/><span><b>{c("NAV-05")}</b><small>{c("HOME-17")}</small></span><ChevronRight/></button><button onClick={() => go("journal")}><PencilLine/><span><b>{c("NAV-06")}</b><small>{c("HOME-18")}</small></span><ChevronRight/></button></section>
  </motion.div>;
}

function QuickCoach({ scenario, setScenario, conflictType, setConflictType, analyzed, analyze, deep }: any) {
  const [liveState, setLiveState] = useState("unhappy");
  const [copied, setCopied] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(20 * 60);
  useEffect(() => {
    if (!timerRunning || secondsLeft <= 0) return;
    const timer = window.setInterval(() => setSecondsLeft(value => value - 1), 1000);
    return () => window.clearInterval(timer);
  }, [timerRunning, secondsLeft]);
  const current = conflictTypes.find(type => type.id === conflictType) || conflictTypes[0];
  const live = liveStates.find(state => state.id === liveState) || liveStates[0];
  const examples = [
    "我一直在看手机，TA说我根本不在乎TA，然后哭了",
    "TA说了好几遍，我还是一直解释，TA声音越来越大",
    "我们吵架后我想出门，TA说算了，你走吧",
  ];
  return <motion.section className="quick-page page-width" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>
    <div className="quick-intro live-intro">
      <span className="eyebrow"><Sparkles size={14}/> {c("LIVE-HEAD-01")}</span>
      <h1>{c("LIVE-HEAD-02")}</h1>
      <p>{c("LIVE-HEAD-03")}</p>
    </div>
    <div className="live-state-grid">{liveStates.map(state => <button key={state.id} className={liveState===state.id?"active":""} onClick={()=>setLiveState(state.id)}><span>{state.icon}</span>{state.label}</button>)}</div>
    <motion.div key={live.id} className="now-card" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <header><span>现在，只做这三件事</span><small>大约 30 秒</small></header>
      {live.id==="unhappy" && <div className="apology-first"><span>第一反应</span><strong>先说“对不起”</strong><small>为TA已经受到的影响道歉，不必等到先证明自己有错。</small></div>}
      <div className="now-steps"><article><i>1</i><small>身体先做</small><p>{live.action}</p></article><article className="say-now"><i>2</i><small>只说这一句</small><p>“{live.words}”</p><button onClick={()=>{navigator.clipboard?.writeText(live.words);setCopied(true);setTimeout(()=>setCopied(false),1500)}}>{copied?<Check size={14}/>:<Quote size={14}/>} {copied?"已复制":"复制这句话"}</button></article><article className="avoid-now"><i>3</i><small>此刻不要</small><p>{live.avoid}</p></article></div>
      <div className="now-footer"><Pause size={15}/><span>{c("LIVE-FOOT-01")}</span></div>
    </motion.div>

    <section className="emergency-protocol" aria-labelledby="emergency-title">
      <header><span>{c("ER-00-01")}</span><h2 id="emergency-title">{c("ER-00-02")}</h2><p>{c("ER-00-03")}</p></header>
      <div className="danger-check"><b>{c("ER-01-01")}</b><p>{c("ER-01-02")}</p><small>{c("ER-01-03")}</small></div>
      <div className="protocol-grid">
        <article><span>01</span><h3>立即停损</h3><p>{c("ER-02-01")}</p><b>{c("ER-02-02")}</b><blockquote>{c("ER-02-03")}</blockquote><small>{c("ER-02-04")}</small></article>
        <article><span>02</span><h3>降低刺激</h3><p>{c("ER-03-01")}</p><b>{c("ER-03-02")}</b><blockquote>{c("ER-03-03")}</blockquote><small>{c("ER-03-04")}</small></article>
        <article><span>03</span><h3>明确暂停</h3><p>{c("ER-04-01")}</p><blockquote>{c("ER-04-02")}</blockquote><b>{c("ER-04-03")}</b><small>{c("ER-04-04")}</small></article>
        <article><span>04</span><h3>按时回来</h3><p>{c("ER-05-01")}</p><b>{c("ER-05-02")}</b><blockquote>{c("ER-05-03")}</blockquote></article>
      </div>
      <div className="pause-timer"><div><small>20 分钟暂停</small><strong>{String(Math.floor(secondsLeft / 60)).padStart(2,"0")}:{String(secondsLeft % 60).padStart(2,"0")}</strong><p>{secondsLeft === 0 ? "现在适合回来继续聊了吗？" : c("ER-07-01")}</p></div><button className="secondary" onClick={() => { if (secondsLeft === 0) setSecondsLeft(20 * 60); setTimerRunning(value => !value); }}>{secondsLeft === 0 ? "重新计时" : timerRunning ? "暂停计时" : "开始计时"}</button></div>
      <div className="emergency-strip">{c("ER-07-02")}</div>
    </section>

    <div className="after-divider"><span>TA稍微平静以后</span><p>再用具体情境判断：这次冲突真正需要修复什么。</p></div>
    <div className="scenario-box compact">
      <textarea value={scenario} onChange={e => {setScenario(e.target.value);}} placeholder="例如：晚饭时我一直在看手机。TA说我根本不在乎TA，然后哭了。我解释说是在处理工作，TA更生气了……" aria-label="描述具体发生的情况"/>
      <div className="scenario-bottom"><small>{scenario.length} 字 · 不需要写得完整</small><button className="primary" onClick={analyze} disabled={scenario.trim().length < 6}>帮我理清楚 <ArrowRight size={16}/></button></div>
    </div>
    {!analyzed && <div className="example-row"><span>也可以从例子开始</span>{examples.map(example => <button key={example} onClick={() => setScenario(example)}>{example}<ChevronRight size={14}/></button>)}</div>}

    <AnimatePresence>{analyzed && <motion.div id="quick-result" className="quick-result" initial={{opacity:0,y:24}} animate={{opacity:1,y:0}}>
      <div className="classification">
        <div><span>{current.icon}</span><div><small>这更像是</small><h2>{current.label}</h2><p>{current.hint}</p></div></div>
        <label>如果不准确，你可以自己选择</label>
        <div className="type-pills">{conflictTypes.map(type => <button key={type.id} className={type.id===conflictType?"active":""} onClick={()=>setConflictType(type.id)}><span>{type.icon}</span>{type.label}</button>)}</div>
        <div className="possibility-note"><Info size={15}/><span>{c("TRANS-01")}</span></div>
      </div>

      <div className="three-actions">
        <ActionColumn number="01" tone="calm" icon="🌿" title="先让情绪慢下来" subtitle="目标不是让TA停止生气，而是让这一刻重新安全" items={current.first}/>
        <ActionColumn number="02" tone="space" icon="🫧" title="帮助TA抽离出来" subtitle="从情绪漩涡，回到身体和眼前的一件事" items={current.out}/>
        <ActionColumn number="03" tone="next" icon="🧭" title="下一步怎么做" subtitle="只解决一个小问题，不一次翻完所有旧账" items={current.next}/>
      </div>

      <div className="opening-card"><div><Quote size={19}/><span>现在可以这样开始</span></div><p>“{current.opening}”</p><small>说完先停下来，观察TA是否愿意继续。不要把整段话一次背完。</small></div>
      <div className="safety-note"><span>{c("LIVE-FOOT-02")}</span><p>{c("LIVE-FOOT-03")}</p></div>
      <div className="quick-end"><button className="secondary" onClick={()=>{setScenario(""); document.querySelector("main")?.scrollIntoView({behavior:"smooth"})}}><RotateCcw size={15}/> 分析另一个情境</button><button className="text-button" onClick={deep}>想更深入地练习八个步骤 <ArrowRight size={15}/></button></div>
    </motion.div>}</AnimatePresence>

    <section className="repair-gestures">
      <div className="repair-heading"><span className="eyebrow"><Heart size={14}/> 冲突过去以后</span><h2>稳固关系，靠的是“小而准确”的在意</h2><p>{c("ER-06-03")}</p></div>
      <div className="gesture-grid">{repairGestures.map(gesture => <article key={gesture.title}><span>{gesture.icon}</span><h3>{gesture.title}</h3><dl><div><dt>什么时候适合</dt><dd>{gesture.when.replace("适合：","")}</dd></div><div><dt>怎么做更有效</dt><dd>{gesture.do}</dd></div><div className="gesture-avoid"><dt>不要这样做</dt><dd>{gesture.avoid}</dd></div></dl></article>)}</div>
      <div className="gift-rule"><HeartHandshake size={21}/><div><b>最有效的组合</b><p>{c("REPAIR-RULE")}</p></div></div>
    </section>
  </motion.section>;
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
