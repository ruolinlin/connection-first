"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, BookHeart, BookOpen, Check, ChevronRight,
  Heart, HeartHandshake, Info, Menu, Moon, Pause, PencilLine,
  Quote, RotateCcw, Sparkles, Sun, X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type View = "home" | "quick" | "practice" | "dictionary" | "journal";
type Card = { title: string; note?: string; icon?: string };

const steps = [
  "发生了什么", "关系翻译器", "她可能经历着什么", "她现在更需要什么",
  "你的回应", "现在不要做什么", "修复关系", "一起解决问题",
];

const situations = ["她提高了声音", "她哭了", "她一直说没事", "她说算了", "她转身离开", "她不看我", "她沉默了", "我沉默了", "我们面对面", "我们在微信聊天"];
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
  { title: "被理解", note: "先复述她的感受，不急着给结论。" },
  { title: "被重视", note: "停下手里的事，把注意力交给此刻。" },
  { title: "被陪伴", note: "留在她身边，允许安静存在。" },
  { title: "被回应", note: "用简短的话告诉她：你听见了。" },
  { title: "被尊重", note: "不替她定义感受，也不逼她马上说。" },
  { title: "安全感", note: "让她知道冲突不会让你突然离开。" },
];

const bodyGuides = [
  ["👀", "眼神", "自然看向对方，避免一直低头。", "我还在这里。"],
  ["🙂", "表情", "放松面部，不苦笑，也不皱眉审视。", "你可以靠近我。"],
  ["🤲", "姿态", "放下抱胸，身体朝向对方。", "我愿意听。"],
  ["🔊", "声音", "慢一点、轻一点，留一点停顿。", "此刻不需要争赢。"],
  ["🫁", "呼吸", "吸气四拍，呼气六拍，重复三次。", "先让身体安全下来。"],
];

const donts = [
  ["不要马上解释", "她现在需要被回应，不是被分析。"],
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
    id: "unheard", label: "没有被听见", icon: "👂", hint: "她反复说同一件事、提高音量，或觉得你只是在解释。",
    signals: ["不听", "没听", "解释", "提高", "声音", "吵", "反复", "道理"],
    first: ["先停下解释，放低声音，只回应她此刻的感受。", "用一句短话确认：“我听见这件事真的让你很难受。”", "说完停五秒，不追加“但是”。"],
    out: ["邀请她只说最难受的一个瞬间，不要求讲完整件事。", "如果情绪仍很高，问：“你想让我抱抱你、陪你坐会儿，还是给你一点空间？”", "做三轮慢呼吸：你先示范，不命令她冷静。"],
    next: ["等声音和语速都慢下来，再复述你听见的重点。", "确认：“我理解得对吗？还有哪一点我漏掉了？”", "最后只讨论一个具体、可执行的小改变。"],
    opening: "我刚刚一直在解释，没有真正听见你。你现在最难受的那一点，我想先听懂。",
  },
  {
    id: "neglected", label: "感到不被重视", icon: "💔", hint: "常见于失约、忙碌、看手机、忘记重要的事。",
    signals: ["手机", "忙", "忘", "失约", "迟到", "不重要", "忽略", "陪"],
    first: ["先把注意力完整交给她：放下手机，身体转向她。", "承认影响，不先强调自己的理由。", "说清楚你没有打算让她独自承受。"],
    out: ["把抽象的“你根本不在乎我”翻译成一个具体落空的期待。", "问：“你原本最希望我怎么做？”", "如果她不想说，约定一个明确的回来时间，不让等待悬空。"],
    next: ["为具体行为道歉，而不是只说“对不起让你想多了”。", "提出一个可验证的补救动作和完成时间。", "之后主动兑现一次，让安全感来自行动。"],
    opening: "这件事让你感觉自己没有被我放在心上。先不说我的理由，我想知道你原本最期待我怎么做。",
  },
  {
    id: "unsafe", label: "担心关系失去安全感", icon: "🫂", hint: "她追问、哭泣、说“算了”，或担心你会离开。",
    signals: ["离开", "分手", "算了", "哭", "不爱", "冷战", "删除", "拉黑", "安全"],
    first: ["先明确关系立场：“我没有要离开，我们可以慢慢说。”", "避免突然消失、摔门或用分手威胁结束争执。", "如果必须暂停，给出具体返回时间并准时回来。"],
    out: ["帮助她把“关系要完了”的担心和眼前这件事分开。", "一起确认此刻安全的事实：你还在、愿意听、问题可以稍后谈。", "用触碰前先询问，不默认拥抱一定有效。"],
    next: ["情绪降低后，讨论什么行为会触发不安全感。", "共同约定暂停规则：怎么说、多久、如何回来。", "用持续的小兑现代替一次很大的保证。"],
    opening: "我知道你现在可能很怕我们越来越远。我没有要离开，我会留在这里和你把这件事慢慢说清楚。",
  },
  {
    id: "boundary", label: "边界或尊重受到影响", icon: "🛡️", hint: "涉及被打断、否定、控制、讽刺，或个人空间被侵犯。",
    signals: ["打断", "尊重", "控制", "讽刺", "骂", "逼", "隐私", "边界"],
    first: ["立即停止正在造成伤害的行为，不要求她先证明自己受伤。", "承认边界：“刚才那句话越界了。”", "保持适当距离，询问她现在希望你留下还是暂时离开。"],
    out: ["把人身评价改写成具体行为，避免“你太敏感”。", "让她重新拥有选择：是否继续、何时继续、以什么方式继续。", "若现场已不安全，优先分开并寻求可信任的人协助。"],
    next: ["明确道歉中不加入辩解。", "共同写下一条以后都要遵守的边界。", "若同类伤害反复发生，仅靠沟通话术不够，需要专业支持。"],
    opening: "刚才我的做法越过了你的边界。你不用马上原谅我，我会先停下来，也尊重你现在需要的距离。",
  },
  {
    id: "pressure", label: "压力累积后的爆发", icon: "🌧️", hint: "导火索很小，但背后可能积累了疲惫、工作或家庭压力。",
    signals: ["工作", "累", "压力", "家里", "孩子", "睡", "疲惫", "小事", "突然"],
    first: ["先降低环境刺激：关掉电视、停止追问、递一杯水。", "不要把爆发立刻定义成针对你。", "用稳定语气说：“我们先让这一刻轻一点。”"],
    out: ["帮助她从“所有事情都很糟”缩小到眼前最需要处理的一件。", "先照顾身体：坐下、喝水、慢呼气、短暂走动。", "问她此刻需要陪伴、实际帮助，还是独处。"],
    next: ["当天只处理最紧急的一件事，其余另约时间。", "把可分担的任务具体分配，而不是泛泛说“别想太多”。", "第二天再回看：这次爆发之前，有哪些早期信号？"],
    opening: "你好像已经撑了很久。我们先不急着把所有问题解决，我陪你把眼前最难的这一件放下来。",
  },
];

const liveStates = [
  { id:"unhappy", icon:"😞", label:"她说“我不开心”", action:"先停下正在做的事，看向她。不要急着判断这件事值不值得不开心。", words:"对不起，我刚刚的做法让你不开心了。我想先听你说，不为自己辩解。", avoid:"不要说“对不起行了吧”“但我也不是故意的”。" },
  { id:"loud", icon:"🔥", label:"她声音很大", action:"你先把声音降低一半，身体不要逼近她。", words:"我先不解释。我听见你真的很生气，我在这里。", avoid:"不要说“你先冷静”。" },
  { id:"crying", icon:"💧", label:"她在哭", action:"停下手里的事，递纸巾或水；拥抱前先问。", words:"你不用现在把话说清楚。我先陪你，等你愿意再说。", avoid:"不要追问“到底怎么了”。" },
  { id:"silent", icon:"🌫️", label:"她不说话", action:"给她一点空间，但明确告诉她你不会消失。", words:"我不逼你现在说。我在旁边，等你准备好；半小时后我再来问你。", avoid:"不要用更长的沉默惩罚她。" },
  { id:"leaving", icon:"🚪", label:"她想离开", action:"不要拦门、拉扯或追着解释，让出身体空间。", words:"我尊重你现在想离开。你安全到达后告诉我一声，我们今晚九点再联系，可以吗？", avoid:"不要威胁分手或阻止她离开。" },
  { id:"wechat", icon:"💬", label:"正在微信争吵", action:"停止连续发送长消息，把沟通从“轰炸”变成一个清楚邀请。", words:"文字越说越乱。我不是不回应。你愿意的话，我们十分钟后打个电话；也可以明天再谈。", avoid:"不要刷屏、撤回、阴阳怪气。" },
  { id:"both", icon:"⚡", label:"我们都很激动", action:"暂停二十分钟，各自去不同空间，让身体先降速。", words:"我怕我们继续说会互相伤害。我想暂停二十分钟，八点四十我一定回来。", avoid:"暂停不能变成失联。" },
];

const repairGestures = [
  { icon:"🍫", title:"巧克力＋手写信", when:"适合：她喜欢小仪式，冲突已经缓和，你需要表达“我认真想过”。", do:"选她平时喜欢的口味。信只写三件事：我看见你哪里受伤、我承担什么、我接下来会怎么改。", avoid:"不要写成自我辩护，也不要用昂贵礼物催她原谅。" },
  { icon:"💐", title:"一束她会喜欢的花", when:"适合：纪念日被忽略、缺少重视感，或关系修复后表达在意。", do:"选她喜欢的花或颜色，附一句具体的话：“这束花不是替代道歉，是想让你知道我记得你喜欢洋桔梗。”", avoid:"如果她不喜欢花、对花粉敏感，或曾说过不想收到，就不要送。" },
  { icon:"🍜", title:"一顿熟悉的饭", when:"适合：她疲惫、压力累积，真正需要的是被照顾和减轻负担。", do:"做或买她舒服时会吃的东西，同时主动接手一件具体家务。", avoid:"不要边照顾边要求她马上开心起来。" },
  { icon:"🚶", title:"一次没有任务的散步", when:"适合：两个人面对面容易紧张，但并肩走路更容易开口。", do:"先约二十分钟，只听感受，不在散步中逼着达成结论。", avoid:"不要把散步变成移动的批评会议。" },
  { icon:"🗓️", title:"兑现一个小承诺", when:"适合：同类冲突反复发生，语言已经不再有说服力。", do:"把改变写得可观察：每天晚饭后二十分钟不看手机；迟到提前告知。连续做到，而不是只做一天。", avoid:"不要承诺“以后再也不会”，要承诺你真正做得到的事。" },
  { icon:"📷", title:"重访一个共同记忆", when:"适合：关系已恢复安全，需要重新积累“我们是一队”的感觉。", do:"一起看一张照片、回到熟悉的小店，聊聊当时彼此欣赏的地方。", avoid:"不要在冲突未处理时，用怀旧跳过对方的受伤。" },
];

const dictionary = [
  ["委屈", "付出或心意没有被看见", "语气变硬、反复讲同一件事、掉眼泪", "被理解、被公平对待", "先承认：这件事让你很不好受。"],
  ["失望", "期待落空后的难过", "冷下来、说“算了”、减少期待", "可靠、被重视", "问问她原本期待发生什么。"],
  ["羞愧", "觉得自己不够好，害怕被否定", "躲开眼神、自嘲、急于辩解", "被接纳、保有尊严", "区分行为和人：这件事没做好，不等于你不好。"],
  ["害怕", "预感重要的人或事可能失去", "追问、退缩、身体紧绷", "安全、确定、陪伴", "给清晰承诺，也尊重她需要的距离。"],
  ["愧疚", "意识到自己的行为伤到了别人", "道歉、回避、过度补偿", "修复、被允许改正", "接住道歉，再一起讨论怎样弥补。"],
  ["孤独", "渴望连接，却感到没有人真正靠近", "沉默、刷手机、说“没关系”", "陪伴、归属", "放下任务感，安静地待一会儿。"],
  ["焦虑", "对未来不确定，脑中反复预演坏结果", "反复确认、失眠、急躁", "确定感、可控感", "一起把下一小步说清楚。"],
  ["无助", "尝试过，却看不到改变的办法", "放弃、麻木、说“随便”", "支持、选择感", "先问：你希望我陪你，还是一起想办法？"],
  ["期待", "相信好的事情可能发生", "主动计划、频繁确认、变得兴奋", "回应、参与", "明确回应，不让期待悬空。"],
  ["安心", "感到自己被接纳，关系是稳定的", "身体放松、愿意分享、能开玩笑", "信任、稳定", "珍惜这个时刻，说出你也感到靠近。"],
];

function Brand({ compact = false }: { compact?: boolean }) {
  return <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="回到顶部">
    <span className="brand-mark"><HeartHandshake size={19} strokeWidth={1.7}/></span>
    <span><b>拆弹行动</b>{!compact && <small>先连接，再解决</small>}</span>
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
  const activeTranslation = translations[phrase] || ["这句话可能在保护一种还没准备好说出的感受。", "她也许希望你先停下来，确认她此刻的体验。", "比起猜测，更重要的是温和地向她确认。"];
  const filteredDictionary = useMemo(() => dictionary.filter(item => item.join("").includes(search.trim())), [search]);

  const saveJournal = () => {
    localStorage.setItem("connection-first-journal", JSON.stringify(journal));
    setSaved(true); setTimeout(() => setSaved(false), 1800);
  };

  return <div className="app-shell">
    <header className="topbar">
      <Brand compact />
      <nav className="desktop-nav" aria-label="主导航">
        <button onClick={() => go("home")} className={view === "home" ? "active" : ""}>首页</button>
        <button onClick={quickStart} className={view === "quick" ? "active" : ""}>情境分析</button>
        <button onClick={() => go("dictionary")} className={view === "dictionary" ? "active" : ""}>情绪词典</button>
        <button onClick={() => go("journal")} className={view === "journal" ? "active" : ""}>关系练习册</button>
      </nav>
      <div className="header-actions">
        <button className="icon-button" onClick={() => setDark(!dark)} aria-label={dark ? "切换浅色模式" : "切换深色模式"}>{dark ? <Sun size={18}/> : <Moon size={18}/>}</button>
        <button className="icon-button mobile-menu" onClick={() => setMenu(!menu)} aria-label="打开导航">{menu ? <X size={20}/> : <Menu size={20}/>}</button>
      </div>
      <AnimatePresence>{menu && <motion.nav initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} className="mobile-nav">
        <button onClick={() => go("home")}>首页</button><button onClick={quickStart}>情境分析</button><button onClick={() => go("dictionary")}>情绪词典</button><button onClick={() => go("journal")}>关系练习册</button>
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
    <footer><Brand/><p>不是替你回答，而是陪你学会回应。</p><span>建议仅用于关系教育，不替代专业心理咨询。</span></footer>
  </div>;
}

function Home({ begin, go }: { begin: () => void; go: (v: View) => void }) {
  return <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
    <section className="hero">
      <div className="eyebrow"><Sparkles size={14}/> 一本安静的关系练习册</div>
      <h1>很多关系，<br/>不是输给了冲突。<br/><em>而是输给了不会回应。</em></h1>
      <p>当你不知道如何回应爱的人时，<br className="mobile-br"/>让我们一步一步陪你。</p>
      <button className="primary large" onClick={begin}>她正在生气，马上用 <ArrowRight size={17}/></button>
      <div className="scroll-cue"><span>30 秒找到现在该做的事</span><i/></div>
    </section>
    <section className="principles page-width">
      {[ ["❤️","先连接，再解决。","先让彼此重新站在一起。"], ["👂","先理解，再解释。","被听见之后，解释才有入口。"], ["🤝","情绪稳定以后，问题才容易解决。","慢一点，反而更靠近答案。"] ].map((p,i)=><motion.article initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.1}} key={p[1]}><span>{p[0]}</span><h3>{p[1]}</h3><p>{p[2]}</p></motion.article>)}
    </section>
    <section className="path-section page-width">
      <div className="section-heading"><span>一张情境急救卡</span><h2>不用走很长的流程，<br/>先处理眼前这一刻</h2><p>写下具体情况，判断冲突属于哪一类，再得到三组可以马上执行的建议。</p></div>
      <div className="path-list">{["让情绪先慢下来","帮助她从情绪中抽离","决定下一步怎么做"].map((s,i)=><div key={s}><span>0{i+1}</span><b>{s}</b>{i < 2 && <i/>}</div>)}</div>
    </section>
    <section className="translator-teaser page-width">
      <div><span className="kicker">关系翻译器</span><h2>“没事”背后，<br/>也许有很多还没说出口的话。</h2><p>我们不替对方下结论，只帮你看见更多可能，然后温和地确认。</p><button className="text-button" onClick={begin}>分析一个具体情境 <ArrowRight size={16}/></button></div>
      <div className="quote-stack"><div className="quote-card back"/><div className="quote-card"><Quote size={22}/><small>她说</small><strong>“算了。”</strong><hr/><small>她也许在说</small><p>“我担心再说下去，也不会被听见。”</p><span>这只是一种可能</span></div></div>
    </section>
    <section className="home-modules page-width"><button onClick={() => go("dictionary")}><BookOpen/><span><b>情绪词典</b><small>为说不清的感受，找到更准确的名字。</small></span><ChevronRight/></button><button onClick={() => go("journal")}><PencilLine/><span><b>关系练习册</b><small>冲突过去以后，把经历慢慢变成能力。</small></span><ChevronRight/></button></section>
  </motion.div>;
}

function QuickCoach({ scenario, setScenario, conflictType, setConflictType, analyzed, analyze, deep }: any) {
  const [liveState, setLiveState] = useState("unhappy");
  const [copied, setCopied] = useState(false);
  const current = conflictTypes.find(type => type.id === conflictType) || conflictTypes[0];
  const live = liveStates.find(state => state.id === liveState) || liveStates[0];
  const examples = [
    "我一直在看手机，她说我根本不在乎她，然后哭了",
    "她说了好几遍，我还是一直解释，她声音越来越大",
    "我们吵架后我想出门，她说算了，你走吧",
  ];
  return <motion.section className="quick-page page-width" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>
    <div className="quick-intro live-intro">
      <span className="eyebrow"><Sparkles size={14}/> 此刻模式 · 不用阅读长内容</span>
      <h1>她现在还在生气吗？</h1>
      <p>先选最接近的现场。你只需要照着做第一张卡，其他事情等会儿再想。</p>
    </div>
    <div className="live-state-grid">{liveStates.map(state => <button key={state.id} className={liveState===state.id?"active":""} onClick={()=>setLiveState(state.id)}><span>{state.icon}</span>{state.label}</button>)}</div>
    <motion.div key={live.id} className="now-card" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <header><span>现在，只做这三件事</span><small>大约 30 秒</small></header>
      {live.id==="unhappy" && <div className="apology-first"><span>第一反应</span><strong>先说“对不起”</strong><small>为她已经受到的影响道歉，不必等到先证明自己有错。</small></div>}
      <div className="now-steps"><article><i>1</i><small>身体先做</small><p>{live.action}</p></article><article className="say-now"><i>2</i><small>只说这一句</small><p>“{live.words}”</p><button onClick={()=>{navigator.clipboard?.writeText(live.words);setCopied(true);setTimeout(()=>setCopied(false),1500)}}>{copied?<Check size={14}/>:<Quote size={14}/>} {copied?"已复制":"复制这句话"}</button></article><article className="avoid-now"><i>3</i><small>此刻不要</small><p>{live.avoid}</p></article></div>
      <div className="now-footer"><Pause size={15}/><span>说完后停十秒。不要为了消除自己的不安，马上继续解释。</span></div>
    </motion.div>

    <div className="after-divider"><span>她稍微平静以后</span><p>再用具体情境判断：这次冲突真正需要修复什么。</p></div>
    <div className="scenario-box compact">
      <textarea value={scenario} onChange={e => {setScenario(e.target.value);}} placeholder="例如：晚饭时我一直在看手机。她说我根本不在乎她，然后哭了。我解释说是在处理工作，她更生气了……" aria-label="描述具体发生的情况"/>
      <div className="scenario-bottom"><small>{scenario.length} 字 · 不需要写得完整</small><button className="primary" onClick={analyze} disabled={scenario.trim().length < 6}>帮我理清楚 <ArrowRight size={16}/></button></div>
    </div>
    {!analyzed && <div className="example-row"><span>也可以从例子开始</span>{examples.map(example => <button key={example} onClick={() => setScenario(example)}>{example}<ChevronRight size={14}/></button>)}</div>}

    <AnimatePresence>{analyzed && <motion.div id="quick-result" className="quick-result" initial={{opacity:0,y:24}} animate={{opacity:1,y:0}}>
      <div className="classification">
        <div><span>{current.icon}</span><div><small>这更像是</small><h2>{current.label}</h2><p>{current.hint}</p></div></div>
        <label>如果不准确，你可以自己选择</label>
        <div className="type-pills">{conflictTypes.map(type => <button key={type.id} className={type.id===conflictType?"active":""} onClick={()=>setConflictType(type.id)}><span>{type.icon}</span>{type.label}</button>)}</div>
        <div className="possibility-note"><Info size={15}/><span>这是一种可能的分类，不代表我们知道她的真实想法。请用温和的询问继续确认。</span></div>
      </div>

      <div className="three-actions">
        <ActionColumn number="01" tone="calm" icon="🌿" title="先让情绪慢下来" subtitle="目标不是让她停止生气，而是让这一刻重新安全" items={current.first}/>
        <ActionColumn number="02" tone="space" icon="🫧" title="帮助她抽离出来" subtitle="从情绪漩涡，回到身体和眼前的一件事" items={current.out}/>
        <ActionColumn number="03" tone="next" icon="🧭" title="下一步怎么做" subtitle="只解决一个小问题，不一次翻完所有旧账" items={current.next}/>
      </div>

      <div className="opening-card"><div><Quote size={19}/><span>现在可以这样开始</span></div><p>“{current.opening}”</p><small>说完先停下来，观察她是否愿意继续。不要把整段话一次背完。</small></div>
      <div className="safety-note"><span>如果现场有威胁、伤害、强迫或失控风险</span><p>优先保证双方安全、拉开距离并联系可信任的人或当地紧急支持。沟通技巧不能代替安全措施。</p></div>
      <div className="quick-end"><button className="secondary" onClick={()=>{setScenario(""); document.querySelector("main")?.scrollIntoView({behavior:"smooth"})}}><RotateCcw size={15}/> 分析另一个情境</button><button className="text-button" onClick={deep}>想更深入地练习八个步骤 <ArrowRight size={15}/></button></div>
    </motion.div>}</AnimatePresence>

    <section className="repair-gestures">
      <div className="repair-heading"><span className="eyebrow"><Heart size={14}/> 冲突过去以后</span><h2>稳固关系，靠的是“小而准确”的在意</h2><p>礼物不是交换原谅。先道歉、先修正行为，再用她真正喜欢的方式表达：我记得你，也愿意为我们花心思。</p></div>
      <div className="gesture-grid">{repairGestures.map(gesture => <article key={gesture.title}><span>{gesture.icon}</span><h3>{gesture.title}</h3><dl><div><dt>什么时候适合</dt><dd>{gesture.when.replace("适合：","")}</dd></div><div><dt>怎么做更有效</dt><dd>{gesture.do}</dd></div><div className="gesture-avoid"><dt>不要这样做</dt><dd>{gesture.avoid}</dd></div></dl></article>)}</div>
      <div className="gift-rule"><HeartHandshake size={21}/><div><b>最有效的组合</b><p><strong>真诚承认</strong>＋<strong>一个她喜欢的小行动</strong>＋<strong>持续兑现的改变</strong></p></div></div>
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
  if (step===0) return <><StepHead n="01" title="发生了什么？" desc="先只描述你看见的，不急着判断谁对谁错。可以多选。"/><div className="chip-grid">{situations.map(s=><button key={s} onClick={()=>choose(0,s)} aria-pressed={(selected[0]||[]).includes(s)} className={(selected[0]||[]).includes(s)?"on":""}>{s}<span>{(selected[0]||[]).includes(s)&&<Check size={14}/>}</span></button>)}</div><Reflection>试着把“她不讲道理”换成“她提高了声音”。<br/>事实越清楚，防御越少。</Reflection></>;
  if (step===1) return <><StepHead n="02" title="关系翻译器" desc="听见一句话背后，也许还藏着什么感受？"/><div className="translator-input"><label>她说</label><div><span>“</span><input value={customPhrase || phrase} onChange={e=>setCustomPhrase(e.target.value)} aria-label="输入她说的话"/><span>”</span></div><div className="phrase-pills">{Object.keys(translations).map(p=><button key={p} onClick={()=>{setPhrase(p);setCustomPhrase("")}} className={!customPhrase&&phrase===p?"active":""}>{p}</button>)}</div></div><div className="translation-result"><span className="kicker">她可能真正想表达的是</span>{activeTranslation.map((t:string,i:number)=><p key={t}><i>{i+1}</i>{t}</p>)}</div><div className="gentle-note"><Info size={17}/><p><b>这不是对她真实想法的判断。</b><br/>以上只是可能性。最重要的下一步，是带着好奇向她确认。</p></div></>;
  if (step===2) return <><StepHead n="03" title="她可能经历着什么？" desc="情绪不是问题，它是关系里正在发生什么的线索。选择一到两种可能。"/><div className="card-grid">{emotions.map(e=><SelectCard key={e.title} item={e} selected={(selected[2]||[]).includes(e.title)} onClick={()=>choose(2,e.title)}/>)}</div><Reflection>不用猜对。你只需要从“她怎么又这样”走向“她是不是很难受”。</Reflection></>;
  if (step===3) return <><StepHead n="04" title="她现在更需要……" desc="先照顾关系里的需要，再讨论事情怎么解决。"/><div className="card-grid needs">{needs.map(e=><SelectCard key={e.title} item={e} selected={(selected[3]||[]).includes(e.title)} onClick={()=>choose(3,e.title)}/>)}</div></>;
  if (step===4) return <><StepHead n="05" title="让回应从身体开始" desc="对方先感受到你的状态，才会听见你的语言。"/><div className="body-list">{bodyGuides.map(x=><article key={x[1]}><span>{x[0]}</span><div><b>{x[1]}</b><p>{x[2]}</p></div><small>{x[3]}</small></article>)}</div><div className="response-flow"><div><span>1</span><small>第一句话</small><strong>“我看到你现在真的很难受。”</strong></div><div className="pause-card"><Pause size={18}/><p><b>停一下。</b> 不要马上解释。给这句话一点落下来的时间。</p></div><div><span>2</span><small>继续回应</small><strong>“我想先理解你的感受。”</strong></div><div><span>3</span><small>温和确认</small><strong>“你愿意告诉我，刚刚最让你难受的是什么吗？”</strong></div></div></>;
  if (step===5) return <><StepHead n="06" title="现在，不要做什么？" desc="有些本能反应很想解决问题，却会让连接断得更快。"/><div className="dont-list">{donts.map(x=><article key={x[0]}><X size={17}/><div><b>{x[0]}</b><p>{x[1]}</p></div></article>)}</div><Reflection>如果你需要暂停，可以说：“我有点乱，想用十分钟整理一下。十分钟后我会回来继续听。”</Reflection></>;
  if (step===6) return <><StepHead n="07" title="给关系一个重新靠近的机会" desc="修复不是认输，而是告诉彼此：关系比这一刻的输赢更重要。"/><div className="repair-list">{repairs.map((x,i)=><article key={x[0]}><span>0{i+1}</span><div><strong>“{x[0]}”</strong><p>{x[1]}</p></div><Heart size={18}/></article>)}</div></>;
  return <><StepHead n="08" title="情绪下降以后，再一起解决问题" desc="把批评变成清楚的表达，把要求变成可以回应的请求。"/><div className="solve-flow">{[["发生了什么","只说具体看见的事","昨晚我分享工作时，你看了几次手机。"],["我有什么感受","说自己的体验，不定义对方","我有点失落，也有些孤单。"],["我在意什么","找到感受背后真正重要的事","因为我很在意我们专心相处的时间。"],["我想提出什么","给出清楚、具体、可商量的请求","下次我分享十分钟时，你愿意先把手机放下吗？"]].map((x,i)=><article key={x[0]}><span>{i+1}</span><div><b>{x[0]}</b><small>{x[1]}</small><p>“{x[2]}”</p></div></article>)}</div><div className="completion"><Sparkles/><div><b>你完成了一次“先连接，再解决”。</b><p>真正的成长，不是每次都回应完美，而是一次比一次更早看见情绪、更愿意回来修复。</p></div></div></>;
}

function StepHead({ n, title, desc }: { n:string; title:string; desc:string }) { return <div className="step-head"><span>{n}</span><h1>{title}</h1><p>{desc}</p></div> }
function Reflection({ children }: { children: React.ReactNode }) { return <div className="reflection"><BookHeart size={18}/><p>{children}</p></div> }

function Dictionary({ search, setSearch, items }: any) {
  return <motion.section className="module-page page-width" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}><div className="module-hero"><span className="eyebrow"><BookOpen size={14}/> 中文情绪词典</span><h1>为说不清的感受，<br/>找到一个更准确的名字。</h1><p>当你能辨认情绪，就不必只用“烦”“没事”“算了”来保护自己。</p><label className="search"><span>⌕</span><input value={search} onChange={(e:any)=>setSearch(e.target.value)} placeholder="搜索一种情绪或需要……"/><small>{items.length} 个词条</small></label></div><div className="dictionary-grid">{items.map((x:string[])=><article key={x[0]}><header><span>{x[0]}</span><Heart size={16}/></header><dl><div><dt>它是什么意思</dt><dd>{x[1]}</dd></div><div><dt>常见表现</dt><dd>{x[2]}</dd></div><div><dt>背后的需要</dt><dd>{x[3]}</dd></div><div className="how"><dt>可以怎样回应</dt><dd>{x[4]}</dd></div></dl></article>)}</div>{items.length===0&&<div className="empty">还没有找到这个词。试试“委屈”“焦虑”或“安心”。</div>}</motion.section>;
}

function Journal({ journal, setJournal, save, saved, begin }: any) {
  const fields = [["heard","今天，我真正听见了什么？","也许我听见，她不是在责怪我，而是在说她很孤单……"],["defense","今天，我什么时候开始防御？","当她说“你总是……”时，我马上想证明自己……"],["redo","如果重来一次，我会怎么回应？","我会先放慢声音，然后告诉她……"]];
  return <motion.section className="module-page journal-page page-width" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}><div className="module-hero"><span className="eyebrow"><PencilLine size={14}/> 关系练习册</span><h1>冲突已经过去。<br/>现在，把经历慢慢变成能力。</h1><p>不用写得正确，只要诚实地看见自己。这些记录只保存在你的设备上。</p></div><div className="journal-sheet"><div className="date-line"><span>一次关系复盘</span><small>{new Intl.DateTimeFormat("zh-CN", {year:"numeric",month:"long",day:"numeric"}).format(new Date())}</small></div>{fields.map((f,i)=><label key={f[0]}><span>0{i+1}</span><b>{f[1]}</b><textarea value={journal[f[0]]} onChange={e=>setJournal({...journal,[f[0]]:e.target.value})} placeholder={f[2]}/></label>)}<div className="journal-actions"><button className="secondary" onClick={()=>setJournal({heard:"",defense:"",redo:""})}><RotateCcw size={15}/> 清空</button><button className="primary" onClick={save}>{saved?<><Check size={16}/> 已保存</>:<>保存这次练习 <BookHeart size={16}/></>}</button></div></div><div className="journal-end"><HeartHandshake/><div><b>修复，是一项可以慢慢学会的能力。</b><p>下一次，你也许会早一点停下来，早一点看见对方。</p></div><button className="text-button" onClick={begin}>再练习一次 <ArrowRight size={16}/></button></div></motion.section>;
}
