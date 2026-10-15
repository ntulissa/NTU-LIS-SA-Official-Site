import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { useIsDesktop, fitLine } from "../general/shared";
import { defineText, useI18n, type Lang } from "../i18n";

// ─────────────────────────────────────────────────────────────────────────
// 部門適性測驗（獨立分頁 · 路由 #/dept-quiz）
// 1. 開場：五顆部門球＋說明＋「開始測驗」
// 2. 作答：8 題單選，每個選項對五個部門加權計分；選完自動下一題，可返回上一題、鍵盤 1–5 作答
// 3. 分析中：五顆球繞圈的過場動畫（若有設定 AI_ENDPOINT，會同時請後端 AI 產生個人化分析）
// 4. 結果：最適合的部門＋分析文字＋五部門契合度長條＋第二推薦＋加入我們／部門介紹／重測
//
// ★ 題目、選項權重、結果文案都在下面的《資料區》，直接改文字就好。
// ★ 英文版：每個中文欄位旁邊都有對應的 xxxEn（qEn / textEn / traitEn / nameEn / descEn…）；
//   介面上的按鈕、提示語在下面的 TEXT。
// ─────────────────────────────────────────────────────────────────────────

const zhHead = "'Chiron Hei HK Text','Noto Sans TC', sans-serif";
const zhBody = "'Noto Sans TC', sans-serif";
const mono   = "'Ubuntu Sans Mono','Noto Sans TC', monospace";
const GRADIENT = "linear-gradient(90deg, #D14B4B 0%, #2F9EBD 100%)";

const JOIN_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdzPM3pqgnH_osifNrCSB61iGVVZxB1FmxhWsEqZQeOdBMY0w/viewform?usp=header";
const BACK_HREF = "#/join"; // 「回到加入我們」的連結，依你的路由調整

// 選填：真正的 AI 分析。填入你自己的後端網址（例如 Vercel / Cloudflare 的 serverless function），
// 前端會 POST { dept, fits, answers }，後端回 { summary: string }。
// 空字串＝不呼叫，直接用下方規則產生分析文字（完全免費、離線可用）。
// ⚠️ 千萬不要把 API key 寫在前端，一定要放在後端。
const AI_ENDPOINT = "";

const ANALYZE_MS = 2600; // 分析過場最短時間(ms)

// ══════════════════════════════════════════════════════════════
// 中英文字（介面文字）
// ══════════════════════════════════════════════════════════════
const TEXT = defineText({
  zh: {
    introTitle: "你屬於哪個部門？",
    introBody1: (n: number) => `回答 ${n} 個生活小情境，我們會綜合評估你的特質，`,
    introBody2: "找出最適合你的系學會部門。",
    start: "開始測驗",
    prevQ: "上一題",
    status: ["解讀你的回答…", "比對五大部門的特質…", "計算契合度…", "產生你的專屬建議…"],
    resultLead: "你最適合的部門是",
    fit: "契合度",
    join: "加入我們",
    meet: (dept: string) => `認識${dept}`,
    retry: "再測一次",
    back: "← 回到加入我們",
    disclaimer: "測驗結果僅供參考，實際分配仍以面談與個人意願為主。",
  },
  en: {
    introTitle: "Which department are you?",
    introBody1: (n: number) => `Answer ${n} everyday scenarios and we'll weigh up your strengths `,
    introBody2: "to find the department that suits you best.",
    start: "Start the quiz",
    prevQ: "Previous question",
    status: ["Reading your answers…", "Comparing the five departments…", "Calculating your match…", "Writing your personal suggestion…"],
    resultLead: "Your best match is",
    fit: "match",
    join: "Join us",
    meet: (dept: string) => `About ${dept}`,
    retry: "Retake",
    back: "← Back to Join Us",
    disclaimer: "Results are for reference only — placement is decided through the interview and your own preference.",
  },
});

// ══════════════════════════════════════════════════════════════
// ★★ 資料區 ★★
// ══════════════════════════════════════════════════════════════
type DeptKey = "gen" | "eve" | "aca" | "ima" | "sp";

type DeptInfo = {
  name: string; en: string; color: string; href: string; persona: string; desc: string; gains: string[];
  // 英文版
  nameEn: string; personaEn: string; descEn: string; gainsEn: string[];
};
const DEPTS: Record<DeptKey, DeptInfo> = {
  gen: { name: "行政部", en: "GENERAL AFFAIRS", color: "#915E3E", href: "#/dept/gen", persona: "系學會的定海神針",
         desc: "你重視秩序與細節，能把一團混亂整理成清楚的流程。行政部掌管預算、文書與各項庶務，是所有活動能順利上路的後盾。",
         gains: ["預算編列與財務管理", "行政流程與文書實務", "統籌規劃與細節掌控"],
         nameEn: "General Affairs", personaEn: "The association's anchor",
         descEn: "You value order and detail, and can turn chaos into a clear process. General Affairs handles the budget, paperwork and logistics — the backbone that keeps every event on track.",
         gainsEn: ["Budgeting & finance", "Admin & paperwork", "Planning & attention to detail"] },
  eve: { name: "活動部", en: "EVENTS AFFAIRS", color: "#9F353A", href: "#/dept/eve", persona: "全場氣氛的點火者",
         desc: "你天生有感染力，喜歡和人互動、把點子變成現場的笑聲。活動部負責迎新、系烈等大型活動，是最貼近全系同學的舞台。",
         gains: ["大型活動企劃與執行", "跨單位溝通協調", "臨場應變與團隊領導"],
         nameEn: "Events", personaEn: "The one who lights up the room",
         descEn: "You're naturally infectious — you love being around people and turning ideas into laughter. Events runs orientation and the department's biggest gatherings, the stage closest to every LIS student.",
         gainsEn: ["Planning big events", "Coordinating across teams", "Thinking on your feet & leading"] },
  aca: { name: "學術部", en: "ACADEMIC AFFAIRS", color: "#42602D", href: "#/dept/aca", persona: "好奇心驅動的知識策展人",
         desc: "你享受探索與整理知識，也樂於把資訊分享給需要的人。學術部負責選課資訊、講座與學習資源，讓大家在圖資系走得更順。",
         gains: ["課程資訊蒐集與統整", "學術領域知識拓展", "溝通合作與應變能力"],
         nameEn: "Academic Affairs", personaEn: "A curiosity-driven knowledge curator",
         descEn: "You enjoy exploring and organising knowledge, and love passing it on to people who need it. Academic Affairs covers course info, talks and study resources, making everyone's path through LIS a little smoother.",
         gainsEn: ["Curating course info", "Broadening your academic horizons", "Teamwork & adaptability"] },
  ima: { name: "形象宣傳部", en: "IMAGE & PUBLICITY", color: "#572A3F", href: "#/dept/ima", persona: "讓世界看見圖資的造型師",
         desc: "你有敏銳的美感，也懂得用畫面說故事。形象宣傳部負責視覺設計、社群經營與攝影剪輯，決定系學會被看見的樣子。",
         gains: ["視覺設計與品牌經營", "社群企劃與文案撰寫", "攝影剪輯實戰經驗"],
         nameEn: "Image & Publicity", personaEn: "The stylist who shows LIS to the world",
         descEn: "You have a sharp eye and know how to tell a story with images. Image & Publicity handles visual design, social media, photography and video — it shapes how the association is seen.",
         gainsEn: ["Visual design & branding", "Social media & copywriting", "Photo & video experience"] },
  sp:  { name: "體育部", en: "SPORTS AFFAIRS", color: "#23658A", href: "#/dept/sp", persona: "永遠充滿電的行動派",
         desc: "你行動力十足、享受流汗與團隊拼搏的感覺。體育部負責系隊與各項賽事，把大家凝聚在同一個場上。",
         gains: ["系隊與賽事籌辦經驗", "團隊合作與體能挑戰", "跨系交流人脈"],
         nameEn: "Sports", personaEn: "The always-charged go-getter",
         descEn: "You're a doer who loves breaking a sweat and pushing hard as a team. Sports runs the department teams and tournaments, bringing everyone together on the same court.",
         gainsEn: ["Running teams & tournaments", "Teamwork & physical challenges", "Friends across departments"] },
};
const ORDER: DeptKey[] = ["gen", "eve", "aca", "ima", "sp"];

// 每個選項：text＝選項文字；w＝對各部門加分；trait＝選到時用來組分析文字的特質短句
//   英文版：textEn＝選項文字；traitEn＝接在「you …」後面的短句（例如 "plan things out before you start"）
type Option = { text: string; w: Partial<Record<DeptKey, number>>; trait: string; textEn: string; traitEn: string };
const QUESTIONS: { q: string; qEn: string; options: Option[] }[] = [
  { q: "系上要辦迎新，你第一個想做的是？", qEn: "The department is planning orientation. What's the first thing you'd do?", options: [
    { text: "列好預算和待辦清單，確保每筆錢都花在刀口上", w: { gen: 3 }, trait: "做事前會先把規劃想清楚",
      textEn: "Draw up the budget and a to-do list so every dollar is well spent", traitEn: "think things through before you start" },
    { text: "設計闖關遊戲、當關主，讓新生嗨起來", w: { eve: 3 }, trait: "喜歡帶動現場氣氛",
      textEn: "Design the games and host a station to get the freshmen hyped", traitEn: "love getting a crowd going" },
    { text: "整理一份「新生必看」選課與學習攻略", w: { aca: 3 }, trait: "樂於整理資訊幫助別人",
      textEn: "Put together a must-read course and study guide for freshmen", traitEn: "enjoy organising information to help others" },
    { text: "設計主視覺、拍一支宣傳影片", w: { ima: 3 }, trait: "習慣用視覺說故事",
      textEn: "Design the key visual and shoot a promo video", traitEn: "tell stories through visuals" },
    { text: "規劃大地遊戲的跑跳關卡，順便招募系隊", w: { sp: 3, eve: 1 }, trait: "精力充沛又愛動",
      textEn: "Plan the outdoor challenges — and recruit for the department teams", traitEn: "are full of energy and love to move" },
  ]},
  { q: "朋友最常怎麼形容你？", qEn: "How do your friends usually describe you?", options: [
    { text: "可靠、細心，交給你就放心", w: { gen: 3 }, trait: "給人可靠踏實的安全感",
      textEn: "Reliable and careful — anything left with you is in safe hands", traitEn: "make people feel they can count on you" },
    { text: "很會聊天，有你在就不冷場", w: { eve: 3 }, trait: "擅長與人互動",
      textEn: "A great talker — never an awkward silence when you're around", traitEn: "are great with people" },
    { text: "問你什麼幾乎都查得到答案", w: { aca: 3 }, trait: "對知識充滿好奇",
      textEn: "Whatever they ask, you can find the answer", traitEn: "are endlessly curious" },
    { text: "很有品味，穿搭和拍照都好看", w: { ima: 3 }, trait: "對美感很敏銳",
      textEn: "Stylish — great outfits and great photos", traitEn: "have a sharp eye for aesthetics" },
    { text: "精力旺盛，好像永遠不會累", w: { sp: 3 }, trait: "有源源不絕的行動力",
      textEn: "Full of energy — you never seem to get tired", traitEn: "have energy to spare" },
  ]},
  { q: "突然多出兩小時空堂，你會？", qEn: "You suddenly have a two-hour gap between classes. You…", options: [
    { text: "把待辦清單清一輪", w: { gen: 2, aca: 1 }, trait: "善用時間、有條不紊",
      textEn: "Clear your to-do list", traitEn: "make good use of your time" },
    { text: "揪一群人去吃東西聊天", w: { eve: 2, sp: 1 }, trait: "喜歡和大家在一起",
      textEn: "Round up friends to grab food and chat", traitEn: "love being with other people" },
    { text: "窩在圖書館看有興趣的書", w: { aca: 3 }, trait: "享受獨自鑽研",
      textEn: "Curl up in the library with a book you're into", traitEn: "enjoy digging deep on your own" },
    { text: "逛展覽、滑 Pinterest 找靈感", w: { ima: 3 }, trait: "隨時在收集靈感",
      textEn: "Visit an exhibition or scroll Pinterest for inspiration", traitEn: "are always collecting inspiration" },
    { text: "去球場打球或上健身房", w: { sp: 3 }, trait: "熱愛運動",
      textEn: "Hit the court or the gym", traitEn: "love sport" },
  ]},
  { q: "分組報告時，你通常負責？", qEn: "In a group project, you usually…", options: [
    { text: "訂時程、分工，最後整合所有人的東西", w: { gen: 3 }, trait: "擅長統籌與掌控進度",
      textEn: "Set the timeline, split the work and pull it all together", traitEn: "are good at coordinating and keeping things on schedule" },
    { text: "上台報告，負責把大家的心血講得精彩", w: { eve: 3 }, trait: "不怕站上舞台",
      textEn: "Present it — and make everyone's hard work shine", traitEn: "aren't afraid of the spotlight" },
    { text: "查資料、寫內容，讓報告有料", w: { aca: 3 }, trait: "重視內容的深度",
      textEn: "Do the research and write the content", traitEn: "care about depth and substance" },
    { text: "排版做簡報，讓報告一看就很專業", w: { ima: 3 }, trait: "在意呈現的質感",
      textEn: "Design the slides so it looks professional at a glance", traitEn: "care about how things look and feel" },
    { text: "哪裡缺人補哪裡，衝刺期熬夜我來", w: { sp: 2, eve: 1 }, trait: "願意扛下重任、衝第一線",
      textEn: "Fill whatever gap there is — and pull the late nights", traitEn: "step up and take on the heavy lifting" },
  ]},
  { q: "哪一種成就感最讓你開心？", qEn: "Which kind of win makes you happiest?", options: [
    { text: "活動結算，帳目收支完美打平", w: { gen: 3 }, trait: "追求精準與完整",
      textEn: "The event's books balance perfectly", traitEn: "aim for precision and completeness" },
    { text: "活動結束，大家說「好好玩，明年還要來」", w: { eve: 3 }, trait: "在意大家玩得開不開心",
      textEn: "People say \"That was so fun — we're coming back next year!\"", traitEn: "care whether everyone's having a good time" },
    { text: "學弟妹說你整理的資料超有用", w: { aca: 3 }, trait: "喜歡分享知識的成就感",
      textEn: "Juniors tell you your notes were a lifesaver", traitEn: "love the feeling of sharing what you know" },
    { text: "你的作品被很多人按讚、分享", w: { ima: 3 }, trait: "希望作品被看見",
      textEn: "Your work gets loads of likes and shares", traitEn: "want your work to be seen" },
    { text: "系隊比賽贏球，全隊抱在一起", w: { sp: 3 }, trait: "享受團隊拼搏",
      textEn: "The team wins and everyone piles into a hug", traitEn: "thrive on pushing hard as a team" },
  ]},
  { q: "大學四年，你最想練起來的能力是？", qEn: "Which skill do you most want to build at university?", options: [
    { text: "財務與行政實務，出社會很實用", w: { gen: 3 }, trait: "看重實務能力",
      textEn: "Finance and admin — super useful after graduation", traitEn: "value practical skills" },
    { text: "企劃與主持，能撐起一整場活動", w: { eve: 3 }, trait: "想挑戰大型企劃",
      textEn: "Planning and hosting — enough to carry a whole event", traitEn: "want to take on big projects" },
    { text: "研究與知識管理，把資訊變成洞見", w: { aca: 3 }, trait: "想把專業學得更深",
      textEn: "Research and knowledge management — turning information into insight", traitEn: "want to go deeper into your field" },
    { text: "設計、攝影剪輯，累積自己的作品集", w: { ima: 3 }, trait: "想累積創作作品",
      textEn: "Design, photography and editing — building your portfolio", traitEn: "want to build a body of creative work" },
    { text: "帶領團隊、籌辦賽事的領導力", w: { sp: 2, eve: 1 }, trait: "想練就帶人的能力",
      textEn: "Leadership — leading a team and running tournaments", traitEn: "want to learn how to lead people" },
  ]},
  { q: "活動前一天突然下大雨，你的第一反應是？", qEn: "It suddenly pours the day before an event. Your first move?", options: [
    { text: "立刻盤點備案，算算改地點會不會超支", w: { gen: 3 }, trait: "遇到狀況先冷靜盤點",
      textEn: "Check the backup plan and see if moving venues blows the budget", traitEn: "stay calm and take stock when things go wrong" },
    { text: "馬上想一個雨天也能玩的新玩法", w: { eve: 3 }, trait: "臨場反應快、點子多",
      textEn: "Come up with a new rainy-day version on the spot", traitEn: "think fast and never run out of ideas" },
    { text: "查氣象和可借的室內場地，找出最佳解", w: { aca: 2, gen: 1 }, trait: "習慣用資料找解方",
      textEn: "Check the forecast and available indoor rooms to find the best option", traitEn: "use data to find solutions" },
    { text: "做一張清楚又好看的公告圖通知大家", w: { ima: 3 }, trait: "懂得把訊息傳達清楚",
      textEn: "Make a clear, good-looking notice to let everyone know", traitEn: "know how to get a message across clearly" },
    { text: "二話不說，帶頭搬器材換場地", w: { sp: 3 }, trait: "行動永遠比想的快",
      textEn: "Start hauling the equipment to the new venue, no questions asked", traitEn: "act before anyone else has finished thinking" },
  ]},
  { q: "你理想中的週末是？", qEn: "Your ideal weekend is…", options: [
    { text: "整理房間、規劃好下週行程", w: { gen: 3 }, trait: "喜歡生活井然有序",
      textEn: "Tidying your room and planning next week", traitEn: "like an orderly life" },
    { text: "參加派對或音樂祭，認識新朋友", w: { eve: 3 }, trait: "喜歡熱鬧、結交新朋友",
      textEn: "A party or music festival, meeting new people", traitEn: "love a lively crowd and making new friends" },
    { text: "聽一場講座或看一部紀錄片", w: { aca: 3 }, trait: "持續充實自己",
      textEn: "A talk or a documentary", traitEn: "keep learning" },
    { text: "帶著相機散步，找間好拍的咖啡廳", w: { ima: 3 }, trait: "習慣記錄生活中的美",
      textEn: "A walk with your camera, hunting for a photogenic café", traitEn: "capture the beauty in everyday life" },
    { text: "爬山、打球、跑步，流一身汗", w: { sp: 3 }, trait: "喜歡戶外與挑戰",
      textEn: "Hiking, ball games, running — working up a sweat", traitEn: "love the outdoors and a challenge" },
  ]},
];

// ══════════════════════════════════════════════════════════════
// 計分
// ══════════════════════════════════════════════════════════════
// traitOpts＝對第一名加分最多的三個選項（畫面上依目前語言組分析文字）；ai＝後端 AI 回傳的分析（有設定 AI_ENDPOINT 才有）
type Result = { top: DeptKey; second: DeptKey; fits: Record<DeptKey, number>; traitOpts: Option[]; ai?: string };

function evaluate(answers: number[]): Result {
  const score = { gen: 0, eve: 0, aca: 0, ima: 0, sp: 0 } as Record<DeptKey, number>;
  const max = { gen: 0, eve: 0, aca: 0, ima: 0, sp: 0 } as Record<DeptKey, number>;
  QUESTIONS.forEach((qq, qi) => {
    ORDER.forEach((d) => { max[d] += Math.max(...qq.options.map((o) => o.w[d] ?? 0)); });
    const opt = qq.options[answers[qi]];
    if (opt) ORDER.forEach((d) => { score[d] += opt.w[d] ?? 0; });
  });
  // 契合度：35%～100%（全部沒選到該部門也保留基本分，避免看起來像 0 分）
  const fits = {} as Record<DeptKey, number>;
  ORDER.forEach((d) => { fits[d] = Math.round(35 + (65 * score[d]) / (max[d] || 1)); });
  // 排序；同分時看「成就感」那題（第 5 題），再看第 1 題
  const tieBreak = (d: DeptKey) => (QUESTIONS[4].options[answers[4]]?.w[d] ?? 0) * 10 + (QUESTIONS[0].options[answers[0]]?.w[d] ?? 0);
  const ranked = [...ORDER].sort((a, b) => score[b] - score[a] || tieBreak(b) - tieBreak(a));
  const [top, second] = ranked;
  // 取對第一名加分最多的三個特質
  const traitOpts = QUESTIONS.map((qq, qi) => qq.options[answers[qi]])
    .filter((o): o is Option => !!o && (o.w[top] ?? 0) > 0)
    .sort((a, b) => (b.w[top] ?? 0) - (a.w[top] ?? 0))
    .slice(0, 3);
  return { top, second, fits, traitOpts };
}

function localSummary(lang: Lang, r: Result) {
  const { top, second, fits } = r;
  const t = DEPTS[top];
  const gap = fits[top] - fits[second];

  if (lang === "en") {
    const traits = r.traitOpts.map((o) => o.traitEn);
    const list = traits.length > 1 ? `${traits.slice(0, -1).join(", ")} and ${traits[traits.length - 1]}` : traits[0];
    const traitLine = traits.length
      ? `From your answers, you ${list}. `
      : "You have a wonderfully varied set of strengths — every department has room for you. ";
    const s2 = DEPTS[second].nameEn;
    const secondLine = fits[second] <= 40
      ? ` Your profile is crystal clear — you were made for ${t.nameEn}!`
      : gap <= 8
      ? ` You're also a very close match for ${s2} (${fits[second]}%), so both are worth considering — talk it over with the seniors at your interview!`
      : ` You also share some traits with ${s2}, which will make you a great bridge when departments work together.`;
    return `${traitLine}${t.descEn}${secondLine}`;
  }

  const traits = r.traitOpts.map((o) => o.trait);
  const traitLine = traits.length
    ? `從你的回答看來，你${traits.slice(0, -1).join("、")}${traits.length > 1 ? "，也" : ""}${traits[traits.length - 1]}。`
    : "你的特質相當多元，每個部門都有你發揮的空間。";
  const secondLine = fits[second] <= 40
    ? `你的特質非常鮮明，簡直是為${t.name}而生！`
    : gap <= 8
    ? `另外，你和${DEPTS[second].name}的契合度也非常接近（${fits[second]}%），兩個部門都很值得考慮，面談時可以和學長姐聊聊！`
    : `你也帶有一些${DEPTS[second].name}的特質，未來跨部門合作時會是很棒的橋樑。`;
  return `${traitLine}${t.desc}${secondLine}`;
}

async function fetchAiSummary(r: Result, answers: number[], lang: Lang): Promise<string | null> {
  if (!AI_ENDPOINT) return null;
  try {
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), 9000);
    const res = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: ctrl.signal,
      body: JSON.stringify({
        lang, // "zh-TW" 或 "en"：請後端用這個語言回覆
        dept: DEPTS[r.top].name,
        second: DEPTS[r.second].name,
        fits: Object.fromEntries(ORDER.map((d) => [DEPTS[d].name, r.fits[d]])),
        answers: QUESTIONS.map((qq, i) => ({ q: qq.q, a: qq.options[answers[i]]?.text })),
      }),
    });
    window.clearTimeout(timer);
    if (!res.ok) return null;
    const data = (await res.json()) as { summary?: string };
    return typeof data.summary === "string" && data.summary.trim() ? data.summary.trim() : null;
  } catch {
    return null;
  }
}

// ══════════════════════════════════════════════════════════════
// UI 元件
// ══════════════════════════════════════════════════════════════
function Eyebrow({ text }: { text: string }) {
  return (
    <p className="tracking-widest select-none" style={{ fontSize: "14px", fontFamily: "'Ubuntu Sans Mono', monospace", background: "linear-gradient(90deg, #FFF 0%, #595959 34.13%, #FFF 67.79%, #3A3A3A 100%)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundSize: "220% 100%" }}>
      — {text}
    </p>
  );
}

function PillButton({ children, onClick, href, variant = "solid", external }: { children: React.ReactNode; onClick?: () => void; href?: string; variant?: "solid" | "outline"; external?: boolean }) {
  const { track } = useI18n();
  const cls = `inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full transition-all duration-200 group ${variant === "solid" ? "bg-white text-black hover:bg-white/90" : "border border-white/50 text-white hover:bg-white/5"}`;
  const style: CSSProperties = { fontFamily: zhBody, fontWeight: variant === "solid" ? 900 : 500, fontSize: "17px", letterSpacing: track("0.1em", "0.02em") };
  return href ? (
    <a href={href} className={cls} style={style} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{children}</a>
  ) : (
    <button type="button" onClick={onClick} className={cls} style={style}>{children}</button>
  );
}

// 五顆球：idle＝輕浮動；orbit＝分析中繞圈
function Balls({ mode, size = 44 }: { mode: "idle" | "orbit"; size?: number }) {
  if (mode === "orbit") {
    return (
      <div className="relative" style={{ width: size * 4.4, height: size * 4.4 }} aria-hidden>
        <div className="dq-orbit absolute inset-0">
          {ORDER.map((d, i) => {
            const a = (i / ORDER.length) * Math.PI * 2 - Math.PI / 2;
            const r = size * 1.55;
            return (
              <span key={d} className="dq-pulse absolute rounded-full" style={{ width: size, height: size, left: `calc(50% + ${Math.cos(a) * r}px - ${size / 2}px)`, top: `calc(50% + ${Math.sin(a) * r}px - ${size / 2}px)`, background: DEPTS[d].color, boxShadow: `0 0 26px -6px ${DEPTS[d].color}`, animationDelay: `${i * 0.18}s` }} />
            );
          })}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center" style={{ gap: size * 0.55 }} aria-hidden>
      {ORDER.map((d, i) => (
        <span key={d} className="dq-float block rounded-full" style={{ width: size, height: size, background: DEPTS[d].color, boxShadow: `0 0 26px -8px ${DEPTS[d].color}`, animationDelay: `${-i * 0.45}s` }} />
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
export default function Survey() {
  const { pick, lang, isEn } = useI18n();
  const tx = pick(TEXT);
  const [stage, setStage] = useState<"intro" | "quiz" | "analyzing" | "result">("intro");
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState<number[]>(() => Array(QUESTIONS.length).fill(-1));
  const [result, setResult] = useState<Result | null>(null);
  const [statusIdx, setStatusIdx] = useState(0);
  const advanceTimer = useRef<number>(0);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [stage]);
  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  const start = () => { setAnswers(Array(QUESTIONS.length).fill(-1)); setQi(0); setResult(null); setStage("quiz"); };

  const choose = (oi: number) => {
    const next = answers.map((v, i) => (i === qi ? oi : v));
    setAnswers(next);
    window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => {
      if (qi < QUESTIONS.length - 1) setQi(qi + 1);
      else analyze(next);
    }, 380);
  };

  const analyze = async (ans: number[]) => {
    setStage("analyzing");
    setStatusIdx(0);
    const r = evaluate(ans);
    const [ai] = await Promise.all([fetchAiSummary(r, ans, lang), new Promise((res) => window.setTimeout(res, ANALYZE_MS))]);
    setResult(ai ? { ...r, ai } : r);
    setStage("result");
  };

  // 分析中的狀態文字輪播
  const STATUS = tx.status;
  useEffect(() => {
    if (stage !== "analyzing") return;
    const iv = window.setInterval(() => setStatusIdx((i) => Math.min(i + 1, STATUS.length - 1)), ANALYZE_MS / STATUS.length);
    return () => window.clearInterval(iv);
  }, [stage, STATUS.length]);

  // 鍵盤：1–5 作答、← 上一題
  useEffect(() => {
    if (stage !== "quiz") return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= QUESTIONS[qi].options.length) choose(n - 1);
      if (e.key === "ArrowLeft" && qi > 0) setQi(qi - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const isDesktop = useIsDesktop();
  const q = QUESTIONS[qi];
  const answeredCount = useMemo(() => answers.filter((a) => a >= 0).length, [answers]);

  return (
    <div className="bg-black min-h-screen text-white">
      <style>{`
        @keyframes dqFloat { 0%,100% { transform: translateY(-8px); } 50% { transform: translateY(8px); } }
        .dq-float { animation: dqFloat 3.2s ease-in-out infinite; }
        @keyframes dqSpin { to { transform: rotate(360deg); } }
        .dq-orbit { animation: dqSpin 3.6s linear infinite; }
        @keyframes dqPulse { 0%,100% { transform: scale(.82); } 50% { transform: scale(1.08); } }
        .dq-pulse { animation: dqPulse 1.2s ease-in-out infinite; }
        @keyframes dqIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        .dq-in { animation: dqIn .6s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes dqBar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .dq-bar { transform-origin: left; animation: dqBar 1.1s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes dqPop { 0% { transform: scale(0); } 70% { transform: scale(1.08); } 100% { transform: scale(1); } }
        .dq-pop { animation: dqPop .8s cubic-bezier(0.22,1,0.36,1) both; }
        .dq-opt { transition: background-color .2s, color .2s, border-color .2s, transform .2s; }
        .dq-opt:hover { border-color: rgba(255,255,255,.7); }
        .dq-opt:active { transform: scale(.985); }
        @media (prefers-reduced-motion: reduce) { .dq-float, .dq-orbit, .dq-pulse, .dq-in, .dq-bar, .dq-pop { animation: none !important; } }
      `}</style>

      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 md:px-14 pt-28 pb-20 min-h-screen flex flex-col">
        {/* ── 開場 ── */}
        {stage === "intro" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center dq-in">
            <Balls mode="idle" size={isDesktop ? 52 : 40} />
            <h1 className="mt-14" style={{ fontFamily: zhHead, fontWeight: 900, fontSize: isEn ? (isDesktop ? "clamp(40px, 5.4vw, 76px)" : "clamp(30px, 9vw, 44px)") : isDesktop ? "clamp(40px, 6vw, 84px)" : fitLine("你屬於哪個部門？", "clamp(40px, 6vw, 84px)", { min: 26, ls: 0.12 }), letterSpacing: isEn ? "0.005em" : "0.12em", paddingLeft: isEn ? undefined : "0.12em", lineHeight: isEn ? 1.15 : 1.25 }}>
              {tx.introTitle}
            </h1>
            <p className="mt-8 text-white/80" style={{ fontFamily: zhBody, fontWeight: 500, fontSize: "clamp(15px, 1.5vw, 20px)", letterSpacing: isEn ? "0.01em" : "0.08em", lineHeight: isEn ? 1.7 : 2 }}>
              {tx.introBody1(QUESTIONS.length)}<br className="hidden sm:block" />
              {tx.introBody2}
            </p>
            <div className="mt-12"><PillButton onClick={start}>{tx.start}<ArrowRight size={20} strokeWidth={2.6} className="group-hover:translate-x-1 transition-transform" /></PillButton></div>
          </div>
        )}

        {/* ── 作答 ── */}
        {stage === "quiz" && (
          <div className="flex-1 flex flex-col justify-center py-10">
            {/* 進度 */}
            <div className="flex items-center gap-5">
              <button type="button" onClick={() => qi > 0 && setQi(qi - 1)} disabled={qi === 0} aria-label={tx.prevQ} className="text-white disabled:opacity-20 hover:opacity-70 transition-opacity">
                <ArrowLeft size={24} strokeWidth={2.6} />
              </button>
              <div className="relative flex-1 h-[8px] rounded-full" style={{ background: "#3A3A3A" }}>
                <div className="absolute left-0 top-0 bottom-0 rounded-full" style={{ width: `${(answeredCount / QUESTIONS.length) * 100}%`, background: GRADIENT, transition: "width .5s cubic-bezier(0.22,1,0.36,1)" }} />
              </div>
              <span className="text-white/60 tabular-nums" style={{ fontFamily: mono, fontSize: "14px", letterSpacing: "0.14em" }}>
                {String(qi + 1).padStart(2, "0")} / {String(QUESTIONS.length).padStart(2, "0")}
              </span>
            </div>

            <div key={qi} className="dq-in">
              <h2 className="mt-10 sm:mt-14 mb-8 sm:mb-10" style={{ fontFamily: zhHead, fontWeight: 900, fontSize: isEn ? (isDesktop ? "clamp(24px, 3vw, 40px)" : "clamp(21px, 5.8vw, 28px)") : isDesktop ? "clamp(26px, 3.4vw, 46px)" : fitLine(q.q, "clamp(26px, 3.4vw, 46px)", { min: 20, ls: 0.08 }), letterSpacing: isEn ? "0.005em" : "0.08em", lineHeight: isEn ? 1.3 : 1.5 }}>
                {isEn ? q.qEn : q.q}
              </h2>
              <div className="flex flex-col gap-4">
                {q.options.map((o, oi) => {
                  const sel = answers[qi] === oi;
                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => choose(oi)}
                      className="dq-opt w-full text-left rounded-[18px] border px-4 sm:px-6 py-4 sm:py-5 flex items-center gap-4 sm:gap-5"
                      style={{ borderColor: sel ? "#fff" : "rgba(255,255,255,0.22)", background: sel ? "#fff" : "transparent", color: sel ? "#000" : "#fff" }}
                    >
                      <span className="shrink-0 flex items-center justify-center rounded-full" style={{ width: 32, height: 32, border: `1.5px solid ${sel ? "#000" : "rgba(255,255,255,0.5)"}`, fontFamily: mono, fontSize: "14px" }}>
                        {oi + 1}
                      </span>
                      <span style={{ fontFamily: zhBody, fontWeight: 700, fontSize: "clamp(15px, 1.5vw, 19px)", letterSpacing: isEn ? "0.005em" : "0.06em", lineHeight: isEn ? 1.45 : 1.6 }}>{isEn ? o.textEn : o.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── 分析中 ── */}
        {stage === "analyzing" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <Balls mode="orbit" size={40} />
            <p key={statusIdx} className="dq-in mt-12" style={{ fontFamily: zhHead, fontWeight: 900, fontSize: "clamp(18px, 2vw, 26px)", letterSpacing: isEn ? "0.02em" : "0.2em" }}>
              {STATUS[statusIdx]}
            </p>
            <p className="mt-4 text-white/40" style={{ fontFamily: mono, fontSize: "13px", letterSpacing: "0.3em" }}>ANALYZING</p>
          </div>
        )}

        {/* ── 結果 ── */}
        {stage === "result" && result && (() => {
          const t = DEPTS[result.top];
          const tName = isEn ? t.nameEn : t.name;
          const summary = result.ai ?? localSummary(lang, result);
          return (
            <div className="flex-1 flex flex-col items-center pt-8">
              <p className="dq-in text-white/70" style={{ fontFamily: zhBody, fontWeight: 500, fontSize: "18px", letterSpacing: isEn ? "0.04em" : isDesktop ? "0.3em" : "0.2em", paddingLeft: isEn ? undefined : isDesktop ? "0.3em" : "0.2em" }}>{tx.resultLead}</p>
              <div className="dq-pop rounded-full mt-10" style={{ width: "clamp(120px, 14vw, 180px)", height: "clamp(120px, 14vw, 180px)", background: t.color, boxShadow: `0 0 90px -10px ${t.color}` }} />
              <h1 className="dq-in mt-10 text-center" style={{ fontFamily: zhHead, fontWeight: 900, fontSize: isEn ? (isDesktop ? "clamp(40px, 5vw, 68px)" : fitLine(tName, "clamp(34px, 9vw, 48px)", { min: 26, ls: 0.01 })) : isDesktop ? "clamp(44px, 6vw, 80px)" : fitLine(t.name, "clamp(44px, 6vw, 80px)", { min: 30, ls: 0.18 }), letterSpacing: isEn ? "0.01em" : "0.18em", paddingLeft: isEn ? undefined : "0.18em", lineHeight: isEn ? 1.1 : undefined, animationDelay: ".25s" }}>{tName}</h1>
              <p className="dq-in mt-2" style={{ fontFamily: mono, fontWeight: 500, fontSize: "clamp(13px, 1.3vw, 18px)", letterSpacing: "0.24em", animationDelay: ".3s" }}>{isEn ? t.name : t.en}</p>
              <span className="dq-in mt-7 rounded-full px-5 py-2 text-center" style={{ border: "1.5px solid rgba(255,255,255,.6)", fontFamily: zhBody, fontWeight: 700, fontSize: isDesktop ? "15px" : "14px", letterSpacing: isEn ? "0.02em" : isDesktop ? "0.16em" : "0.08em", animationDelay: ".4s" }}>
                {isEn ? `“${t.personaEn}” · ${result.fits[result.top]}% ${tx.fit}` : `「${t.persona}」・${tx.fit} ${result.fits[result.top]}%`}
              </span>

              {/* 分析 */}
              <div className="dq-in w-full mt-14 rounded-[28px] p-[2px]" style={{ background: "linear-gradient(180deg, #D14B4B 0%, #2F9EBD 100%)", animationDelay: ".5s" }}>
                <div className="rounded-[26px] px-5 sm:px-12 py-8 sm:py-10" style={{ background: "#141414" }}>
                  <p className="text-white/50 mb-5" style={{ fontFamily: mono, fontSize: "13px", letterSpacing: "0.3em" }}>ANALYSIS</p>
                  <p style={{ fontFamily: zhBody, fontWeight: 500, fontSize: "clamp(15px, 1.5vw, 19px)", letterSpacing: isEn ? "0.005em" : "0.08em", lineHeight: isEn ? 1.8 : 2.1, textAlign: isEn ? "left" : "justify" }}>{summary}</p>
                  <div className="flex flex-wrap gap-3 mt-8">
                    {(isEn ? t.gainsEn : t.gains).map((g) => (
                      <span key={g} className="rounded-full px-4 py-1.5" style={{ background: t.color, fontFamily: zhBody, fontWeight: 700, fontSize: "14px", letterSpacing: isEn ? "0.01em" : "0.1em" }}>{g}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 五部門契合度 */}
              <div className="w-full mt-14">
                <p className="text-white/50 mb-6" style={{ fontFamily: mono, fontSize: "13px", letterSpacing: "0.3em" }}>MATCH</p>
                <div className="flex flex-col gap-4">
                  {[...ORDER].sort((a, b) => result.fits[b] - result.fits[a]).map((d, i) => (
                    <div key={d} className="flex items-center gap-4">
                      <span className={`shrink-0 ${isEn ? "w-[7.6em] sm:w-[9em]" : "w-[5.6em] sm:w-[6.5em]"}`} style={{ fontFamily: zhBody, fontWeight: 700, fontSize: isDesktop ? "15px" : "14px", letterSpacing: isEn ? "0" : isDesktop ? "0.1em" : "0.04em", lineHeight: 1.25, opacity: d === result.top ? 1 : 0.75 }}>{isEn ? DEPTS[d].nameEn : DEPTS[d].name}</span>
                      <div className="relative flex-1 h-[14px] rounded-full overflow-hidden" style={{ background: "#262626" }}>
                        <div className="dq-bar absolute left-0 top-0 bottom-0 rounded-full" style={{ width: `${result.fits[d]}%`, background: DEPTS[d].color, animationDelay: `${0.6 + i * 0.12}s` }} />
                      </div>
                      <span className="shrink-0 w-[3.2em] text-right tabular-nums" style={{ fontFamily: mono, fontSize: "15px" }}>{result.fits[d]}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 行動 */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-12 sm:mt-16">
                <PillButton href={JOIN_FORM_URL} external>{tx.join}<ArrowRight size={20} strokeWidth={2.6} className="group-hover:translate-x-1 transition-transform" /></PillButton>
                <PillButton href={t.href} variant="outline">{tx.meet(tName)}</PillButton>
                <PillButton onClick={start} variant="outline"><RotateCcw size={17} strokeWidth={2.4} />{tx.retry}</PillButton>
              </div>
              <a href={BACK_HREF} className="mt-10 text-white/45 hover:text-white/80 transition-colors" style={{ fontFamily: zhBody, fontSize: "14px", letterSpacing: isEn ? "0.02em" : "0.14em" }}>{tx.back}</a>
              <p className="mt-8 text-white/30 text-center" style={{ fontFamily: zhBody, fontSize: "12px", letterSpacing: "0.08em" }}>
                {tx.disclaimer}
              </p>
            </div>
          );
        })()}
      </div>
    </div>
  );
}