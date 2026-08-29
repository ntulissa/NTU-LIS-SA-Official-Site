// ══════════════════════════════════════════════════════════════════════════
// 系學會行事曆「資料」（內容）。上方「下一場活動」五張卡片與下方月曆共用這一份，
// 你只要維護這支檔案，畫面會自動更新（上方自動抓最近五場即將到來的系學會活動）。
// 放置位置建議：src/components/sections/events.ts
//   （呈現邏輯／版型在同資料夾的 CalendarPage.tsx，一般不用動。）
//
// 每一筆活動 = 一個 CalEvent 物件，欄位說明：
//   title   活動名稱。
//   date    日期，格式 "YYYY-MM-DD"（如 "2026-09-07"）。
//   time?   時間，24 小時制 "HH:mm"（如 "14:00"）。可省略；省略＝當天整天、倒數以 00:00 計。
//   depts   這個活動屬於哪些部門（陣列，至少一個）。用下方 DeptKey 的「key」。
//           ▸ 跨多個部門（像「系學會發表會」全部門都參與）就把它們全列進去，
//             卡片外框與月曆圓點會自動變成「正副會長」的黃色。
//           ▸ 學校日程（考試週、放假等）用 "school"，只會出現在月曆、不會進上方卡片。
//
// ── 部門與顏色（key ↔ 中文 ↔ 色碼；與全站部門色一致，可自由調整）──────────
//   lead   正副會長   #A27F00        admin  行政      #915E3E
//   event  活動       #9F353A        acad   學術      #42602D
//   image  形象宣傳   #572A3F        sport  體育      #8C7B6B
//   school 學校日程   #FFFFFF（白）
// ══════════════════════════════════════════════════════════════════════════

// ── 部門型別與色盤 ──────────────────────────────────────────────
export type DeptKey = "lead" | "admin" | "event" | "acad" | "image" | "sport" | "school";

export type Dept = {
  key: DeptKey;
  zh: string;   // 中文名（Toggle 標籤用）
  color: string; // 代表色
};

// 順序＝月曆上方 Toggle 由左到右的排列順序。
export const DEPTS: Dept[] = [
  { key: "lead",   zh: "正副會長", color: "#A27F00" },
  { key: "admin",  zh: "行政",     color: "#915E3E" },
  { key: "event",  zh: "活動",     color: "#9F353A" },
  { key: "acad",   zh: "學術",     color: "#42602D" },
  { key: "image",  zh: "形象宣傳", color: "#572A3F" },
  { key: "sport",  zh: "體育",     color: "#8C7B6B" },
  { key: "school", zh: "學校日程", color: "#FFFFFF" },
];

export const DEPT_MAP: Record<DeptKey, Dept> = DEPTS.reduce(
  (m, d) => { m[d.key] = d; return m; },
  {} as Record<DeptKey, Dept>
);

// 「跨多部門」時要用的顏色＝正副會長黃（上方卡片外框、月曆圓點都吃這個）。
export const LEAD_COLOR = DEPT_MAP.lead.color;

// ── 活動型別 ────────────────────────────────────────────────
export type CalEvent = {
  title: string;
  date: string;   // "YYYY-MM-DD"
  time?: string;  // "HH:mm"（可省略）
  depts: DeptKey[]; // 一或多個部門；跨多部門會自動用正副會長黃
};

// ── 活動清單（可自由增減、順序不拘，畫面會自動依時間排序）───────────────
// ★ 要新增活動：複製一行，改 title / date / time / depts 即可。
//   ▸ 全部門活動 → depts 填多個（如發表會）；月曆該日與卡片外框會變黃。
//   ▸ 學校日程   → depts: ["school"]，只在月曆顯示、不進上方卡片。
export const EVENTS: CalEvent[] = [
  {
    title: "B14~15 系學會發表會",
    date: "2026-09-07",
    time: "14:00",
    depts: ["lead", "admin", "event", "acad", "image", "sport"], // 全部門 → 黃色
  },
  {
    title: "新生迎新活動 2026",
    date: "2026-09-20",
    time: "12:30",
    depts: ["event"],
  },
  {
    title: "系友職涯講座",
    date: "2026-10-20",
    time: "18:30",
    depts: ["acad"],
  },
  {
    title: "小圖盃體育賽",
    date: "2026-11-08",
    time: "09:00",
    depts: ["sport"],
  },
  {
    title: "系學會形象攝影日",
    date: "2026-11-22",
    time: "13:00",
    depts: ["image", "admin"], // 兩個部門 → 也算跨部門，用黃色
  },
  // ── 學校日程範例（只在月曆顯示，不進上方卡片）──
  { title: "上學期期中考週", date: "2026-11-09", depts: ["school"] },
  { title: "校慶放假",       date: "2026-11-14", depts: ["school"] },
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
