// ════════════════════════════════════════════════════════════════
// 各種服務 · 資料檔（Services.tsx 從這裡讀取，資料與呈現分離）
// ────────────────────────────────────────────────────────────────
// 改「哪些格子、放哪、什麼顏色、詳情頁內容」都在這個檔；Services.tsx 只負責畫。
//   type:"dept"    部門名稱格（填滿部門色 + 顯示 imports/services/<dept>.svg）
//   type:"service" 業務格（外框部門色、hover 才填色；點擊進 #/service/<slug>）
//   佈局：12 欄 × 8 列；gc/gr = CSS grid-column / grid-row 字串，例："3 / span 3"
//   vertical:true  = 直排文字（窄長格用）
//   詳情頁欄位：en 英文標題、intro 介紹、note 便利貼、href 相關網址（沒填＝顯示「準備中」膠囊）
// ════════════════════════════════════════════════════════════════

export type Dept = "gen" | "eve" | "aca" | "ima" | "sp";

// 五個部門色（Bento 格線色、詳情頁背景色都吃這裡）— 你的正式色票
export const DEPT_COLORS: Record<Dept, string> = {
  gen: "#915E3E", // 行政（棕）
  eve: "#9F353A", // 活動（紅）
  aca: "#42602D", // 學術（綠）
  ima: "#572A3F", // 美宣（紫）
  sp:  "#23658A", // 體育（藍）
};

export type Cell =
  | { type: "dept"; dept: Dept; gc: string; gr: string }
  | {
      type: "service"; dept: Dept; slug: string; zh: string; gc: string; gr: string;
      vertical?: boolean; en: string; intro: string; note: string; href?: string;
    };

export const BENTO: Cell[] = [
  // ── 部門名稱格（填色 + svg）──
  { type: "dept", dept: "gen", gc: "1 / span 2", gr: "1 / span 1" },
  { type: "dept", dept: "eve", gc: "6",          gr: "1 / span 2" },
  { type: "dept", dept: "aca", gc: "1",          gr: "7 / span 2" },
  { type: "dept", dept: "ima", gc: "8 / span 2", gr: "5 / span 1" },
  { type: "dept", dept: "sp",  gc: "12",         gr: "5 / span 2" },

  // ── gen 行政（棕）──
  { type: "service", dept: "gen", slug: "fee",       zh: "系學會費",       gc: "1",          gr: "2 / span 3", vertical: true, en: "MEMBERSHIP FEE",     intro: "（介紹內文佔位）系學會費的用途、繳費方式與福利說明。", note: "一年一次" },
  { type: "service", dept: "gen", slug: "locker",    zh: "系櫃租借",       gc: "2",          gr: "2 / span 3", vertical: true, en: "LOCKER RENTAL",      intro: "（介紹內文佔位）系櫃租借的申請時間、位置與規則。", note: "數量有限" },
  { type: "service", dept: "gen", slug: "studyroom", zh: "學輔室使用申請", gc: "3 / span 3", gr: "1 / span 2", en: "STUDY ROOM BOOKING", intro: "（介紹內文佔位）學輔室的借用流程、開放時段與注意事項。", note: "線上預約" },
  { type: "service", dept: "gen", slug: "aircon",    zh: "學輔室冷氣使用", gc: "3 / span 3", gr: "3 / span 2", en: "STUDY ROOM AIR-CON", intro: "（介紹內文佔位）學輔室冷氣的儲值與使用方式。", note: "記得儲值" },

  // ── eve 活動（紅）──
  { type: "service", dept: "eve", slug: "lis-night",        zh: "圖資之夜", gc: "7 / span 2", gr: "1 / span 2", en: "LIS NIGHT",        intro: "（介紹內文佔位）圖資之夜的活動內容與報名資訊。", note: "年度盛事" },
  { type: "service", dept: "eve", slug: "orientation-camp", zh: "迎新宿營", gc: "9 / span 2", gr: "1",          en: "ORIENTATION CAMP", intro: "（介紹內文佔位）迎新宿營的時間、地點與亮點。", note: "認識同學" },
  { type: "service", dept: "eve", slug: "christmas",        zh: "聖誕大會", gc: "9 / span 2", gr: "2",          en: "CHRISTMAS PARTY",  intro: "（介紹內文佔位）聖誕大會的活動與交換禮物。", note: "溫馨" },
  { type: "service", dept: "eve", slug: "freshman",         zh: "新生迎新", gc: "6",          gr: "3 / span 2", en: "FRESHMAN WELCOME", intro: "（介紹內文佔位）新生迎新的系列活動介紹。", note: "歡迎新生", vertical: true },
  { type: "service", dept: "eve", slug: "bbq",              zh: "系烤活動", gc: "7 / span 2", gr: "3 / span 2", en: "DEPT BBQ",         intro: "（介紹內文佔位）系烤的時間、地點與報名。", note: "揪團烤肉" },
  { type: "service", dept: "eve", slug: "lis-week",         zh: "圖資週",   gc: "9 / span 2", gr: "3 / span 2", en: "LIS WEEK",         intro: "（介紹內文佔位）圖資週的系列活動與擺攤。", note: "整週活動" },

  // ── sp 資訊/公關（藍）上排直式 ──
  { type: "service", dept: "sp", slug: "women-volley", zh: "臺大圖資女排", gc: "11", gr: "1 / span 4", vertical: true, en: "WOMEN'S VOLLEYBALL", intro: "（介紹內文佔位）圖資女排的練球與賽事資訊。", note: "熱血" },
  { type: "service", dept: "sp", slug: "badminton",    zh: "臺大圖資羽球", gc: "12", gr: "1 / span 4", vertical: true, en: "BADMINTON",          intro: "（介紹內文佔位）圖資羽球的練球與賽事資訊。", note: "揮拍" },

  // ── aca 學術（綠）──
  { type: "service", dept: "aca", slug: "textbook",      zh: "教科書代訂", gc: "1 / span 3", gr: "5 / span 2", en: "TEXTBOOK ORDERING SERVICE", intro: "（介紹內文佔位）教科書代訂的登記期限、取書方式與優惠。", note: "10小時後截止", href: "" },
  { type: "service", dept: "aca", slug: "company-visit", zh: "企業參訪",   gc: "4 / span 2", gr: "5 / span 2", en: "COMPANY VISIT",             intro: "（介紹內文佔位）企業參訪的名額、行程與報名。", note: "看看業界" },
  { type: "service", dept: "aca", slug: "alumni-talk",   zh: "系友講座",   gc: "2 / span 2", gr: "7 / span 2", en: "ALUMNI TALK",               intro: "（介紹內文佔位）系友講座的講者與主題。", note: "前輩經驗" },
  { type: "service", dept: "aca", slug: "azalea",        zh: "杜鵑花節",   gc: "4 / span 2", gr: "7 / span 2", en: "AZALEA FESTIVAL",           intro: "（介紹內文佔位）杜鵑花節的擺攤與系所介紹。", note: "招生季" },

  // ── ima 美宣（紫）──
  { type: "service", dept: "ima", slug: "social",     zh: "社群經營", gc: "6", gr: "5 / span 4", vertical: true, en: "SOCIAL MEDIA", intro: "（介紹內文佔位）系學會社群的經營與內容。", note: "追蹤我們" },
  { type: "service", dept: "ima", slug: "dept-shirt", zh: "系服訂購", gc: "7", gr: "5 / span 4", vertical: true, en: "DEPT SHIRT",   intro: "（介紹內文佔位）系服的款式、尺寸與訂購。", note: "限時開賣" },
  { type: "service", dept: "ima", slug: "contact",    zh: "聯絡我們", gc: "8 / span 2", gr: "7 / span 2", en: "CONTACT US", intro: "（介紹內文佔位）各種合作與聯繫管道。", note: "找得到我們" },
  { type: "service", dept: "ima", slug: "souvenir",     zh: "文宣品", gc: "8 / span 2", gr: "6 / span 1", en: "POSTER DESIGN", intro: "（介紹內文佔位）系學會活動的海報設計與製作。", note: "美宣專業" },

  // ── sp 資訊/公關（藍）下排 ──
  { type: "service", dept: "sp", slug: "men-basket", zh: "臺大日文圖資男籃",gc: "10 / span 2", gr: "5 / span 4", vertical: true, en: "MEN'S BASKETBALL", intro: "（介紹內文佔位）圖資男籃的練球與賽事資訊。", note: "上場" },
  { type: "service", dept: "sp", slug: "lis-cup",    zh: "小圖盃",gc: "12 / span 1", gr: "7 / span 2", vertical: true, en: "LIS CUP", intro: "（介紹內文佔位）小圖盃的賽制與報名。", note: "友誼賽" },
];

// 詳情頁用：以 slug 找服務資料
export function serviceBySlug(slug: string) {
  return BENTO.find((c) => c.type === "service" && c.slug === slug) as
    | Extract<Cell, { type: "service" }>
    | undefined;
}