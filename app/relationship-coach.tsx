"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, BookHeart, BookOpen, Check, ChevronRight,
  Heart, HeartHandshake, Info, Menu, Moon, Pause, PencilLine,
  Quote, RotateCcw, Sparkles, Sun, X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type View = "home" | "practice" | "dictionary" | "journal";
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
    <span><b>先连接，再解决</b>{!compact && <small>Connection First</small>}</span>
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
        <button onClick={begin} className={view === "practice" ? "active" : ""}>开始练习</button>
        <button onClick={() => go("dictionary")} className={view === "dictionary" ? "active" : ""}>情绪词典</button>
        <button onClick={() => go("journal")} className={view === "journal" ? "active" : ""}>关系练习册</button>
      </nav>
      <div className="header-actions">
        <button className="icon-button" onClick={() => setDark(!dark)} aria-label={dark ? "切换浅色模式" : "切换深色模式"}>{dark ? <Sun size={18}/> : <Moon size={18}/>}</button>
        <button className="icon-button mobile-menu" onClick={() => setMenu(!menu)} aria-label="打开导航">{menu ? <X size={20}/> : <Menu size={20}/>}</button>
      </div>
      <AnimatePresence>{menu && <motion.nav initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} className="mobile-nav">
        <button onClick={() => go("home")}>首页</button><button onClick={begin}>开始练习</button><button onClick={() => go("dictionary")}>情绪词典</button><button onClick={() => go("journal")}>关系练习册</button>
      </motion.nav>}</AnimatePresence>
    </header>

    <main>
      <AnimatePresence mode="wait">
        {view === "home" && <Home key="home" begin={begin} go={go}/>} 
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
      <button className="primary large" onClick={begin}>开始一次练习 <ArrowRight size={17}/></button>
      <div className="scroll-cue"><span>先不用急着解决</span><i/></div>
    </section>
    <section className="principles page-width">
      {[ ["❤️","先连接，再解决。","先让彼此重新站在一起。"], ["👂","先理解，再解释。","被听见之后，解释才有入口。"], ["🤝","情绪稳定以后，问题才容易解决。","慢一点，反而更靠近答案。"] ].map((p,i)=><motion.article initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.1}} key={p[1]}><span>{p[0]}</span><h3>{p[1]}</h3><p>{p[2]}</p></motion.article>)}
    </section>
    <section className="path-section page-width">
      <div className="section-heading"><span>一次完整的练习</span><h2>从“我不知道说什么”<br/>到“我知道怎样陪伴”</h2><p>不生成标准答案，只把复杂的冲突拆成一个个能练习的小动作。</p></div>
      <div className="path-list">{steps.map((s,i)=><div key={s}><span>0{i+1}</span><b>{s}</b>{i < steps.length-1 && <i/>}</div>)}</div>
    </section>
    <section className="translator-teaser page-width">
      <div><span className="kicker">关系翻译器</span><h2>“没事”背后，<br/>也许有很多还没说出口的话。</h2><p>我们不替对方下结论，只帮你看见更多可能，然后温和地确认。</p><button className="text-button" onClick={begin}>试着理解一次 <ArrowRight size={16}/></button></div>
      <div className="quote-stack"><div className="quote-card back"/><div className="quote-card"><Quote size={22}/><small>她说</small><strong>“算了。”</strong><hr/><small>她也许在说</small><p>“我担心再说下去，也不会被听见。”</p><span>这只是一种可能</span></div></div>
    </section>
    <section className="home-modules page-width"><button onClick={() => go("dictionary")}><BookOpen/><span><b>情绪词典</b><small>为说不清的感受，找到更准确的名字。</small></span><ChevronRight/></button><button onClick={() => go("journal")}><PencilLine/><span><b>关系练习册</b><small>冲突过去以后，把经历慢慢变成能力。</small></span><ChevronRight/></button></section>
  </motion.div>;
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
