// ══════════════════════════════════════════════════════════════════════════
// 系學會行事曆「資料」（內容）。上方「下一場活動」五張卡片與下方月曆共用這一份，
// 你只要維護這支檔案，畫面會自動更新（上方自動抓最近五場即將到來的系學會活動）。
// 放置位置建議：src/components/sections/events.ts
//   （呈現邏輯／版型在同資料夾的 CalendarPage.tsx，一般不用動。）
//
// 每一筆活動 = 一個 CalEvent 物件，欄位說明：
//   title   活動名稱。
//   date    （開始）日期，格式 "YYYY-MM-DD"（如 "2026-09-07"）。
//   end?    結束日期（含當天），格式同 date。★ 只有「跨多天」的活動要填；單日活動省略即可。
//           例：圖資週 09/22～09/24 → date:"2026-09-22", end:"2026-09-24"。
//           月曆會自動把這幾天連成一條色條（頭尾實心圓、中間坐在色條上）。
//   time?   時間，24 小時制 "HH:mm"（如 "14:00"）。可省略；省略＝當天整天、倒數以 00:00 計。
//   depts   這個活動屬於哪些部門（陣列，至少一個）。用下方 DeptKey 的「key」。
//           ▸ 跨多個部門（像「系學會發表會」全部門都參與）就把它們全列進去，
//             卡片外框與月曆圓點會自動變成「正副會長」的黃色。
//           ▸ 學校日程（考試週、放假等）用 "school"，只會出現在月曆、不會進上方卡片。
//
// ── 展開版活動資訊（點開卡片後的 Modal 才會用到；以下欄位都可省略）─────────────
//   location?  地點文字（如 "臺大二活 205 教室"）。有填才會顯示「地點」那一行。
//   mapUrl?    Google Map 連結。★ 留空也沒關係（先佔位）；有填時，地點文字會變成可點連結。
//   desc?      活動介紹文案。要斷行就用 \n（例："第一行\n第二行"），畫面會照著換行。
//   signup?    是否顯示「報名參加」按鈕。沒有報名表單就設 false 或整個省略（＝不顯示按鈕）。
//   signupUrl? 報名表單連結。signup 為 true 且有填時，按下按鈕會另開這個連結。
//
// ── 部門與顏色（key ↔ 中文 ↔ 色碼；與全站部門色一致，可自由調整）──────────
//   lead   正副會長   #A27F00        admin  行政      #915E3E
//   event  活動       #9F353A        acad   學術      #42602D
//   image  形象宣傳   #572A3F        sport  體育      #23658A
//   school 學校日程   #FFFFFF（白）
// ══════════════════════════════════════════════════════════════════════════

// ── 部門型別與色盤 ──────────────────────────────────────────────
export type DeptKey = "pres" | "gen" | "eve" | "aca" | "ima" | "sp" | "school";

export type Dept = {
  key: DeptKey;
  zh: string;   // 中文名（Toggle 標籤用）
  color: string; // 代表色
};

// 順序＝月曆上方 Toggle 由左到右的排列順序。
export const DEPTS: Dept[] = [
  { key: "pres",   zh: "正副會長", color: "#A27F00" },
  { key: "gen",    zh: "行政", color: "#915E3E" },
  { key: "eve",    zh: "活動",     color: "#9F353A" },
  { key: "aca",    zh: "學術",     color: "#42602D" },
  { key: "ima",    zh: "形象宣傳", color: "#572A3F" },
  { key: "sp",     zh: "體育",     color: "#23658A" },
  { key: "school", zh: "學校日程", color: "#FFFFFF" },
];

export const DEPT_MAP: Record<DeptKey, Dept> = DEPTS.reduce(
  (m, d) => { m[d.key] = d; return m; },
  {} as Record<DeptKey, Dept>
);

// 「跨多部門」時要用的顏色＝正副會長黃（上方卡片外框、月曆圓點都吃這個）。
export const LEAD_COLOR = DEPT_MAP.pres.color;

// 真正的系學會部門數（不含學校日程）；用來判斷「是否涵蓋全部門」。
export const REAL_DEPT_COUNT = DEPTS.filter((d) => d.key !== "school").length; // 6

// ── 活動型別 ────────────────────────────────────────────────
export type CalEvent = {
  title: string;
  date: string;   // 開始日期 "YYYY-MM-DD"
  end?: string;   // 結束日期（含當天）"YYYY-MM-DD"；只有跨多天活動要填，單日省略
  time?: string;  // "HH:mm"（可省略）
  depts: DeptKey[]; // 一或多個部門；跨多部門會自動用正副會長黃

  // ── 展開版活動資訊（點開卡片後顯示；皆可省略）──
  location?: string;  // 地點文字
  mapUrl?: string;    // Google Map 連結（可留空佔位）
  desc?: string;      // 活動介紹文案（\n 可斷行）
  signup?: boolean;   // 是否顯示「報名參加」按鈕
  signupUrl?: string; // 報名表單連結
};

// ── 活動清單（可自由增減、順序不拘，畫面會自動依時間排序）───────────────
// ★ 要新增活動：複製一行，改 title / date / time / depts 即可。
//   ▸ 全部門活動 → depts 填多個（如發表會）；月曆該日與卡片外框會變黃。
//   ▸ 學校日程   → depts: ["school"]，只在月曆顯示、不進上方卡片。
//   ▸ 想讓卡片「點得開」有完整資訊 → 補上 location / desc / signup 等欄位。
export const EVENTS: CalEvent[] = [
  {
    title: "新生迎新活動",
    date: "2026-09-20",
    time: "12:30",
    depts: ["eve"],
    location: "臺大二活 205 教室",
    mapUrl: "https://maps.app.goo.gl/Urh4E8u217TbJXLH9",
    desc:
      "想跟圖資系的大家變得更熟、認識漂亮學姐跟帥學長，\n" +
      "或是單純想來吃點心、喝飲料、玩好玩的小組遊戲！\n" +
      "那這場迎新活動就是為你準備的！",
    signup: true,
    signupUrl: "https://forms.gle/nBQ2AgeNh6chaeQ8A",
  },
  {
    title: "LIS Talk: 系友講座",
    date: "2026-10-20",
    time: "18:30",
    depts: ["aca"],
    location: "系館視聽室",
    mapUrl: "",
    desc:
      "邀請畢業系友回來分享職涯與求學經驗，\n" +
      "從資訊產業、圖書館到研究所，帶你看看未來的各種可能。",
    signup: false,
    signupUrl: "",
  },
  {
    title: "LIS Cup 小圖盃",
    date: "2026-11-08",
    time: "09:00",
    depts: ["sp"],
    location: "待定",
    mapUrl: "",
    desc:
      "一年一度的系內運動賽事，\n" +
      "籃球、排球、羽球等你來組隊，一起為榮譽而戰！",
    signup: false,
  },

  // ── 學校日程範例（只在月曆顯示，不進上方卡片）──
  //   期中考週也是跨多天，一樣用 end 表示（純學校日程 → 色條為白色）。
  { title: "期中考週", date: "2026-11-09", end: "2026-11-13", depts: ["school"] },
  { title: "校慶放假",       date: "2026-11-14", depts: ["school"] },
  { title: "課程停修截止日", date: "2026-12-11", depts: ["school"] },
  { title: "中秋節連假", date: "2026-09-25", end: "2026-09-28", depts: ["school"] },
  { title: "國慶連假", date: "2026-10-09", end: "2026-10-11", depts: ["school"] },
  { title: "期末考週", date: "2026-12-21", end: "2026-12-25", depts: ["school"] }


];

// ── 共用小工具（上方卡片與月曆都會用到）──────────────────────────────
// 台灣時區 +08:00；省略 time 視為當天 00:00。
export function eventStart(e: CalEvent): Date {
  return new Date(`${e.date}T${e.time ?? "00:00"}:00+08:00`);
}

// 把 depts 的 key 轉成完整部門物件（過濾掉打錯的 key）。
export function deptsOf(e: CalEvent): Dept[] {
  return e.depts.map((k) => DEPT_MAP[k]).filter(Boolean);
}

// 展開卡「主責部門」膠囊右側的敘述文字：
//   ▸ 涵蓋全部六個系學會部門 → "全部門"
//   ▸ 否則列出部門中文名（用「、」串起，如 "活動、學術"）
//   ▸ 純學校日程 → "學校日程"
export function deptDescOf(e: CalEvent): string {
  const real = Array.from(new Set(e.depts.filter((k) => k !== "school")));
  if (real.length === 0) return "學校日程";
  if (real.length >= REAL_DEPT_COUNT) return "全部門";
  return real.map((k) => DEPT_MAP[k]?.zh).filter(Boolean).join("、");
}

// 是否為「純學校日程」（只有 school）→ 這種不放上方「下一場活動」。
export function isSchoolOnly(e: CalEvent): boolean {
  return e.depts.length > 0 && e.depts.every((k) => k === "school");
}

// 上方卡片的外框色／月曆單一活動的圓色：跨多部門＝黃；單一部門＝該部門色。
export function accentColorOf(e: CalEvent): string {
  const uniq = new Set(e.depts);
  if (uniq.size > 1) return LEAD_COLOR;
  return DEPT_MAP[e.depts[0]]?.color ?? LEAD_COLOR;
}

// 本地日期字串 "YYYY-MM-DD"（用來比對某活動是否落在某一天）。
export function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ── 跨多天活動相關 ──────────────────────────────────────────────
// 結束日（沒填 end＝當天單日）。
export function eventEnd(e: CalEvent): string {
  return e.end ?? e.date;
}

// 是否跨多天（有 end 且和開始日不同）。
export function spansMultipleDays(e: CalEvent): boolean {
  return !!e.end && e.end !== e.date;
}

// 是否「進行中」：今天（含頭尾）落在 date ~ end 之間。單日活動＝就是當天。
// 用 "YYYY-MM-DD" 字串比大小（字典序＝時間序），避開時區換算。
export function isOngoing(e: CalEvent, now: Date = new Date()): boolean {
  const t = ymd(now);
  return t >= e.date && t <= eventEnd(e);
}

// 這個活動涵蓋的每一天（含頭尾）的日期字串陣列，用來標記月曆上每一格。
// 用 UTC 逐日推進，避開夏令／時區造成的日期誤差。
export function eventDayKeys(e: CalEvent): string[] {
  const keys: string[] = [];
  const cur = new Date(`${e.date}T00:00:00Z`);
  const end = new Date(`${eventEnd(e)}T00:00:00Z`);
  // 防呆：end 早於 date 時，至少回開始日一天。
  if (end < cur) return [e.date];
  while (cur <= end) {
    keys.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return keys;
}