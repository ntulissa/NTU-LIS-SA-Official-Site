import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, X, ArrowRight } from "lucide-react";
import { Reveal } from "./shared";
import {
  EVENTS,
  DEPTS,
  DEPT_MAP,
  LEAD_COLOR,
  type DeptKey,
  type Dept,
  type CalEvent,
  eventStart,
  eventEnd,
  spansMultipleDays,
  eventDayKeys,
  isSchoolOnly,
  isOngoing,
  accentColorOf,
  deptDescOf,
  ymd,
} from "./events";

// ── Presented by NTU LIS SA 圖片 ──────────────────────────────────
// 你放在 src/imports/Calendar/ 底下的 SVG。用 "@" 別名（＝src），跟 HeroSection
// 的 `@/imports/HomePage-1/...` 同一種寫法，才不會因為檔案層級不同而算錯相對路徑。
// ★ 若你的檔名不是「Presented by NTU LISSA.svg」，把下面這行的檔名改成你實際的即可。
//   （若 TS 報「找不到模組」，在 vite-env.d.ts 補一行 declare module "*.svg"; 即可。）
import presentedBySrc from "@/imports/Calendar/Presented by NTU LISSA.svg";

/**
 * 系學會行事曆頁（CALENDAR）── 版型／呈現邏輯
 * ─────────────────────────────────────────────────────────────
 * ● 上半部「下一場活動」：自動抓最近五場「即將到來」的系學會活動（排除純學校日程），
 *   由近到遠橫向排列，可左右捲動；清單左右緣用漸層遮罩讓卡片柔和淡出。
 *   每張卡：部門色外框（跨部門＝正副會長黃）、左下角部門色圓點、右側倒數。
 *   ★ 點任一張卡 → 展開「活動資訊 Modal」（見下方 EventModal）。
 * ● 下半部「行事曆」：月曆 + 七個部門 Toggle（名稱包在膠囊內，開關某部門是否顯示）。
 *   當日＝紅藍漸層外框空心圓；有活動的日子＝部門色實心圓（跨部門＝黃、學校＝白）；
 *   滑到該日跳出小卡列出當天活動。切換月份有淡出淡入動畫。
 *
 * ★ 要改活動內容，請改隔壁的 events.ts；要調「大小／間距／位置」，改下面的常數區。
 */

// ══════════════════════════════════════════════════════════════════════════
// 手動調整區（改這裡就能調各元素大小／間距／位置；clamp(最小, 隨螢幕縮放, 最大)）
// ══════════════════════════════════════════════════════════════════════════
// ── 上方「下一場活動」卡片 ──
const CARD_WIDTH = "clamp(280px, 30vw, 420px)"; // 每張卡寬度
const CARD_MIN_HEIGHT = 176;                    // 卡片最小高度（px）
const CARD_PADDING = "26px 28px 22px";          // 卡片內距（上 左右 下）
const CARD_GAP = 20;                            // 卡片之間的間距（px）
const CARD_RADIUS = 18;                         // 卡片圓角（px）
const CARD_BORDER_W = 1.5;                      // 卡片外框粗細（px）
const CARD_TITLE_SIZE = "clamp(1.05rem, 1.6vw, 1.4rem)"; // 活動標題字級
const CARD_DATE_SIZE = "clamp(0.78rem, 0.95vw, 0.92rem)"; // 日期字級
const CARD_DOT_SIZE = 14;   // 左下角部門圓點直徑（px）
const CARD_DOT_GAP = 7;     // 圓點之間距（px）
const CARD_DOT_INSET_X = 28; // 圓點距卡片左緣（px）
const CARD_DOT_INSET_Y = 24; // 圓點距卡片下緣（px）
const COUNT_NUM_SIZE = "clamp(2.4rem, 4vw, 3.4rem)";   // 倒數數字字級
const COUNT_UNIT_SIZE = "clamp(0.72rem, 0.95vw, 0.92rem)"; // 「天後」字級
const COUNT_INSET_X = 28;   // 倒數距卡片右緣（px）
const COUNT_INSET_Y = 16;   // 倒數距卡片下緣（px）
const EDGE_FADE = 72;       // 清單左右「漸層遮罩」寬度（px）；數字越大淡出範圍越寬
const ARROW_SIZE = 44;      // 左右捲動箭頭圓鈕直徑（px）

// ── 「進行中」卡片（活動當天）：整格填滿部門色；左下角圓點用深灰膠囊包起，右下角顯示「進行中」──
const ONGOING_LABEL = "進行中";                          // 右下角文字
const ONGOING_LABEL_SIZE = "clamp(0.95rem, 1.3vw, 1.2rem)"; // 「進行中」字級
const ONGOING_PILL_BG = "#151515";       // 圓點外層深灰膠囊底色
const ONGOING_PILL_PAD_X = 11;           // 膠囊左右內距（px）
const ONGOING_PILL_PAD_Y = 8;            // 膠囊上下內距（px）
const ONGOING_PILL_RADIUS = 999;         // 膠囊圓角（px；999＝全圓角膠囊）
// 註：膠囊的實際位置＝跟著左下角圓點走（圓點用 CARD_DOT_INSET_X/Y 定位，膠囊淡入包住它）。

// ══════════════════════════════════════════════════════════════════
// ★★ 展開版「活動資訊 Modal」手動調整區（點開卡片後彈出）★★
//    ▸ 把「背景框」當畫布：下面每個元素都用「相對背景框左上角」的
//      X（左，px）/ Y（上，px）絕對定位，大小也都用 px。想搬到哪就改該元素的 _X / _Y。
//    ▸ 座標系：X 從框左緣算起、Y 從框上緣算起，往右／往下為正（同一般螢幕座標）。
//    ▸ 背景框是固定尺寸（MODAL_W × MODAL_H）；螢幕比框小時整個框會「等比例縮小」，
//      你設的 X/Y/大小都維持不變、不會跑版。
// ══════════════════════════════════════════════════════════════════
// ── 背景框本身 ──
const MODAL_W = 700;                        // 背景框寬（px）
const MODAL_H = 600;                        // 背景框高（px）
const MODAL_RADIUS = 16;                    // 背景框圓角（px）
const MODAL_USE_ACCENT_BG = true;           // true＝底色用該活動部門色（跨部門＝黃）；false＝用固定色
const MODAL_BG_FIXED = "#A17F2A";           // MODAL_USE_ACCENT_BG=false 時的固定底色
const MODAL_BACKDROP = "rgba(0,0,0,0.72)";  // 背後遮罩顏色（越不透明越暗）
const MODAL_BACKDROP_BLUR = 2;              // 背後模糊（px；0＝不模糊）

// ── 活動名稱──
const TITLE_X = 25;    // 左（px）
const TITLE_Y = 46;    // 上（px）
const TITLE_W = 620;   // 文字區塊寬（px）；超過會自動換行
const TITLE_SIZE = 54; // 字級（px）

// ── 時間──
const TIME_X = 26;     // 左（px）
const TIME_Y = 135;    // 上（px）
const TIME_SIZE = 20;  // 字級（px）

// ── 地點──
const LOC_X = 240;     // 左（px）
const LOC_Y = 135;     // 上（px）
const LOC_SIZE = 20;   // 文字字級（px）
const LOC_ICON = 24;   // icon 大小（px）
const LOC_ICON_GAP = 8;// icon 與文字間距（px）

// ── 活動介紹文案──
const DESC_X = 26;     // 左（px）
const DESC_Y = 226;    // 上（px）
const DESC_W = 680;    // 文案區塊寬（px）；決定何時換行
const DESC_SIZE = 18;  // 字級（px）
const DESC_LH = 2.0;   // 行高（倍數）

// ── 報名參加按鈕（左上角＝X/Y；樣式完全比照 HeroSection，內部大小走它的 Tailwind）──
const BTN_X = 26;      // 左（px）
const BTN_Y = 420;     // 上（px）
const SIGNUP_LABEL = "報名參加"; // 按鈕文字
const BTN_ICON = 16;   // 箭頭大小（px；同 HeroSection）

// ── 主責部門膠囊──
const DEPT_X = 26;         // 左（px）
const DEPT_Y = 525;        // 上（px）
const DEPT_DOT_SIZE = 15;  // 圓點直徑（px）
const DEPT_DOT_GAP = 7;    // 圓點間距（px）
const DEPT_PILL_BG = "#0E0E0E"; // 圓點外層深色膠囊底色
const DEPT_PILL_PAD_X = 14; // 膠囊左右內距（px）
const DEPT_PILL_PAD_Y = 9;  // 膠囊上下內距（px）
const DEPT_DESC_SIZE = 18;  // 敘述字級（px）
const DEPT_DESC_GAP = 12;   // 膠囊與敘述文字間距（px）
const DEPT_DESC_SLIDE_MS = 320; // 敘述向右滑出動畫時間（ms）

// ── Presented by NTU LIS SA 圖片（左上角＝X/Y；預設放右下角）──
const PRES_X = 470;    // 左（px）
const PRES_Y = 525;    // 上（px）
const PRES_W = 200;    // 圖片寬（px）
const PRES_OPACITY = 0.98; // 透明度（0~1）

// ── 右上角關閉鈕（X）──
const CLOSE_X = 620;   // 左（px）
const CLOSE_Y = 55;    // 上（px）
const CLOSE_SIZE = 46; // 直徑（px）
const CLOSE_BG = "#0E0E0E"; // 底色
const CLOSE_ICON = 22; // X 圖示大小（px）

// ── 下方「行事曆」──
const TOGGLE_GAP_X = 66;    // Toggle 之間的橫向間距（px）← 你要拉大就改這裡
const TOGGLE_GAP_Y = 16;    // Toggle 換行後的直向間距（px）
const TOGGLE_HEIGHT = 36;   // Toggle 膠囊高度（px）
const TOGGLE_KNOB = 24;     // Toggle 內部色點直徑（px）
const TOGGLE_PAD_R = 20;    // Toggle 右內距（label 到右緣，px）
const TOGGLE_FONT = "clamp(0.85rem, 1vw, 1rem)"; // Toggle 內文字字級
const TOGGLES_MB = 68;      // Toggle 區與月曆的距離（px）

const WEEK_FONT = "clamp(0.95rem, 1.2vw, 1.1rem)";  // 星期（日一二…）字級
const MONTH_FONT = "clamp(1.05rem, 1.4vw, 1.25rem)"; // 「九月, 2026」字級
const CAL_CELL_H = "clamp(56px, 7vw, 78px)";  // 每個日期格高度
const CAL_CIRCLE = "clamp(44px, 5.2vw, 58px)"; // 日期圓／實心圓直徑
const CAL_NUM_SIZE = "clamp(1.2rem, 1.7vw, 1.7rem)"; // 日期數字字級
const TODAY_RING_W = 2.5;   // 當日紅藍漸層外框粗細（px）
const RANGE_BAR_OPACITY = 0.3;  // 跨多天活動「連續色條」的透明度（0~1；越大越實）
const RANGE_BAR_RATIO = 1;      // 色條高度＝日期圓直徑的幾成。設 1＝與圓等高、連成平滑膠囊；
                                // 設小於 1（如 0.8）＝中間色條較細，變成「珠鍊」感。

const POP_WIDTH = "min(240px, 72vw)"; // hover 小卡寬度
const MONTH_FADE_MS = 190;  // 換月「淡出／淡入」單程時間（ms）；數字越大越慢
// ══════════════════════════════════════════════════════════════════════════

// ── 字型（與全站一致）──────────────────────────────────────────
const zhDisplay = "'Chiron Hei HK Text', 'Noto Sans TC', sans-serif";
const zhFont = "'Noto Sans TC', sans-serif";
const monoFont = "'Ubuntu Sans Mono', monospace";
const roundFont = "'SF Pro Rounded', ui-rounded, 'Noto Sans TC', sans-serif"; // 倒數／日期數字

const BRAND_GRAD = "linear-gradient(90deg, #D14B4B 0%, #2F9EBD 100%)";
const CARD_BG = "#151515";
const MONTHS_ZH = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
const WEEK_ZH = ["日", "一", "二", "三", "四", "五", "六"];

const pad = (n: number) => `${n}`.padStart(2, "0");
function withAlpha(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(f.slice(0, 2), 16), g = parseInt(f.slice(2, 4), 16), b = parseInt(f.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
// 很淺的顏色（如學校日程白色）用深色數字，維持可讀性。
function isLight(hex: string): boolean {
  const h = hex.replace("#", "");
  if (h.length < 6) return hex.toUpperCase() === "#FFF";
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.72;
}
// 小卡右側文字：跨多天顯示日期範圍（如 9/22–24）；單日顯示時間（或「整天」）。
function spanText(e: CalEvent): string {
  if (spansMultipleDays(e)) {
    const s = new Date(`${e.date}T00:00:00+08:00`);
    const en = new Date(`${eventEnd(e)}T00:00:00+08:00`);
    return s.getMonth() === en.getMonth()
      ? `${s.getMonth() + 1}/${s.getDate()}–${en.getDate()}`
      : `${s.getMonth() + 1}/${s.getDate()}–${en.getMonth() + 1}/${en.getDate()}`;
  }
  return e.time ?? "整天";
}

// 展開卡上方那一行「日期（＋跨日範圍）＋時間」字串。
function modalDateText(e: CalEvent): string {
  const dt = eventStart(e);
  const dateStr = `${dt.getFullYear()}.${pad(dt.getMonth() + 1)}.${pad(dt.getDate())}`;
  const en = new Date(`${eventEnd(e)}T00:00:00+08:00`);
  const rangeStr = spansMultipleDays(e) ? ` ～ ${pad(en.getMonth() + 1)}.${pad(en.getDate())}` : "";
  const timeStr = e.time ? `  ${e.time}` : "";
  return `${dateStr}${rangeStr}${timeStr}`;
}

// ── 漸層外框膠囊標題（下一場活動 / 行事曆）─────────────────────────
function PillLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full" style={{ padding: "1.5px", background: BRAND_GRAD }}>
      <span
        className="rounded-full bg-black px-6 py-2 text-white"
        style={{ fontFamily: zhFont, fontWeight: 900, fontSize: "clamp(0.95rem,1.2vw,1.1rem)", letterSpacing: "0.22em", paddingLeft: "calc(1.5rem + 0.22em)" }}
      >
        {children}
      </span>
    </span>
  );
}

// ── 倒數（每秒更新；天→小時→分鐘→秒自動切換）──────────────────────
function Countdown({ target }: { target: Date }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const DAY = 86400000, HOUR = 3600000, MIN = 60000;
  const rem = Math.max(0, target.getTime() - now);
  let value: number, unit: string;
  if (rem >= DAY)       { value = Math.floor(rem / DAY);  unit = "天後"; }
  else if (rem >= HOUR) { value = Math.floor(rem / HOUR); unit = "小時後"; }
  else if (rem >= MIN)  { value = Math.floor(rem / MIN);  unit = "分鐘後"; }
  else                  { value = Math.floor(rem / 1000); unit = "秒後"; }

  return (
    <div className="flex items-end gap-1.5 leading-none">
      <span className="text-white tabular-nums" style={{ fontFamily: roundFont, fontWeight: 800, fontSize: COUNT_NUM_SIZE, letterSpacing: "0.02em" }}>
        {value}
      </span>
      <span className="text-white/85 mb-2" style={{ fontFamily: zhDisplay, fontWeight: 700, fontSize: COUNT_UNIT_SIZE, letterSpacing: "0.2em" }}>
        {unit}
      </span>
    </div>
  );
}

// ── 單張「下一場活動」卡片（可點開）────────────────────────────────
function EventCard({ e, onOpen }: { e: CalEvent; onOpen: () => void }) {
  const accent = accentColorOf(e); // 跨部門＝黃；單一部門＝該色
  const ongoing = isOngoing(e);    // 活動當天（進行中）＝整格填滿部門色
  const [hovered, setHovered] = useState(false);
  const filled = ongoing || hovered; // 進行中「或」滑鼠移上去 → 整張卡片填滿部門色
  const dt = eventStart(e);
  const dateStr = `${dt.getFullYear()}.${pad(dt.getMonth() + 1)}.${pad(dt.getDate())}`;
  // 跨多天：日期後面接「～ MM.DD」；單日則接時間。
  const en = new Date(`${eventEnd(e)}T00:00:00+08:00`);
  const rangeStr = spansMultipleDays(e) ? ` ～ ${pad(en.getMonth() + 1)}.${pad(en.getDate())}` : "";
  const timeStr = e.time ? `　${e.time}` : "";
  const dots = e.depts.map((k) => DEPT_MAP[k]).filter(Boolean);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); onOpen(); } }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="relative shrink-0 flex flex-col cursor-pointer transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      style={{
        width: CARD_WIDTH,
        minHeight: `${CARD_MIN_HEIGHT}px`,
        background: filled ? accent : CARD_BG, // 進行中 / hover＝填滿部門色；否則深灰底
        border: `${CARD_BORDER_W}px solid ${accent}`,
        borderRadius: `${CARD_RADIUS}px`,
        padding: CARD_PADDING,
      }}
    >
      <h3 className="text-white" style={{ fontFamily: zhDisplay, fontWeight: 900, fontSize: CARD_TITLE_SIZE, letterSpacing: "0.02em" }}>
        {e.title}
      </h3>
      <p className="mt-3" style={{ fontFamily: monoFont, fontWeight: 500, fontSize: CARD_DATE_SIZE, letterSpacing: "0.08em", color: filled ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.45)" }}>
        {dateStr}{rangeStr}{timeStr}
      </p>

      {/* 左下角：部門色圓點。圓點位置固定不動；填色時（進行中 / hover）只是深灰膠囊「淡入」包住它，
          所以不會再有位移／跳動。膠囊有內距，故容器左／下先扣掉內距，讓圓點對齊原本的 28 / 24。 */}
      <div
        className="absolute flex items-center"
        style={{
          left: CARD_DOT_INSET_X - ONGOING_PILL_PAD_X,
          bottom: CARD_DOT_INSET_Y - ONGOING_PILL_PAD_Y,
          gap: `${CARD_DOT_GAP}px`,
          padding: `${ONGOING_PILL_PAD_Y}px ${ONGOING_PILL_PAD_X}px`,
          borderRadius: ONGOING_PILL_RADIUS,
          background: filled ? ONGOING_PILL_BG : "transparent", // 只有填色時膠囊才出現
          transition: "background-color 200ms ease",
        }}
      >
        {dots.map((d, i) => (
          <span key={`${d.key}-${i}`} className="rounded-full" style={{ width: CARD_DOT_SIZE, height: CARD_DOT_SIZE, background: d.color, boxShadow: isLight(d.color) ? "inset 0 0 0 1px rgba(0,0,0,0.15)" : "none" }} />
        ))}
      </div>

      {/* 右下角：進行中顯示「進行中」；否則顯示倒數 */}
      <div className="absolute" style={{ right: COUNT_INSET_X, bottom: COUNT_INSET_Y }}>
        {ongoing ? (
          <span className="text-white" style={{ fontFamily: zhDisplay, fontWeight: 900, fontSize: ONGOING_LABEL_SIZE, letterSpacing: "0.14em" }}>
            {ONGOING_LABEL}
          </span>
        ) : (
          <Countdown target={dt} />
        )}
      </div>
    </div>
  );
}

// ── 地點那一行（Location icon ＋ 地點文字；有 mapUrl 就變成 Google Map 連結）──
function LocationLine({ text, url, fg }: { text: string; url?: string; fg: string }) {
  const inner = (
    <span className="inline-flex items-center" style={{ gap: LOC_ICON_GAP, fontFamily: zhDisplay, fontWeight: 800, fontSize: LOC_SIZE, letterSpacing: "0.04em", color: fg, lineHeight: 1 }}>
      <MapPin size={LOC_ICON} strokeWidth={2.2} style={{ flexShrink: 0 }} />
      {text}
    </span>
  );
  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4 decoration-2">
        {inner}
      </a>
    );
  }
  return inner;
}

// ── 展開版「活動資訊 Modal」────────────────────────────────────────
// 背景框＝固定尺寸畫布（MODAL_W × MODAL_H）；每個元素都用「相對框左上角」的
// left(X)/top(Y) 絕對定位，可自由搬移。螢幕太小時整個框等比例縮小、位置不變。
function EventModal({ e, onClose }: { e: CalEvent; onClose: () => void }) {
  const accent = accentColorOf(e);
  const bg = MODAL_USE_ACCENT_BG ? accent : MODAL_BG_FIXED;
  const light = isLight(bg);
  const fg = light ? "#111" : "#fff";                       // 標題／時間／地點文字色
  const descColor = light ? "rgba(0,0,0,0.88)" : "rgba(255,255,255,0.95)"; // 文案文字色
  const [pillHover, setPillHover] = useState(false);
  const [scale, setScale] = useState(1);

  const dots = e.depts.map((k) => DEPT_MAP[k]).filter(Boolean);
  const deptDesc = deptDescOf(e);

  // Esc 關閉 ＋ 開啟時鎖住背景捲動
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => { if (ev.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  // 螢幕比背景框小時，整個框等比例縮小（你設的 X/Y/大小都維持不變）。
  useEffect(() => {
    const calc = () => {
      const m = 32; // 視窗四周留白（px）
      const s = Math.min(1, (window.innerWidth - m) / MODAL_W, (window.innerHeight - m) / MODAL_H);
      setScale(s > 0 ? s : 1);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  return (
    // 背景遮罩：點空白處關閉
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: MODAL_BACKDROP, backdropFilter: MODAL_BACKDROP_BLUR ? `blur(${MODAL_BACKDROP_BLUR}px)` : undefined, WebkitBackdropFilter: MODAL_BACKDROP_BLUR ? `blur(${MODAL_BACKDROP_BLUR}px)` : undefined }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={e.title}
    >
      {/* 背景框（＝畫布容器）：固定尺寸；所有元素以此為原點用絕對定位擺放。點自己不關閉。 */}
      <div
        className="relative cal-modal-in"
        style={{ width: MODAL_W, height: MODAL_H, background: bg, borderRadius: MODAL_RADIUS, color: fg, transform: `scale(${scale})`, transformOrigin: "center center" }}
        onClick={(ev) => ev.stopPropagation()}
      >
        {/* 關閉鈕（X）：zIndex 拉到最高，整顆都保證可以點（不會被其他元素的方框蓋住） */}
        <button
          type="button"
          onClick={onClose}
          aria-label="關閉"
          className="absolute flex items-center justify-center rounded-full text-white hover:scale-105 transition-transform"
          style={{ left: CLOSE_X, top: CLOSE_Y, width: CLOSE_SIZE, height: CLOSE_SIZE, background: CLOSE_BG, zIndex: 30 }}
        >
          <X size={CLOSE_ICON} strokeWidth={2.6} />
        </button>

        {/* 活動名稱（Chiron Hei HK Text）。pointer-events-none：純文字，方框不攔點擊。 */}
        <h3
          className="absolute pointer-events-none"
          style={{ left: TITLE_X, top: TITLE_Y, width: TITLE_W, fontFamily: zhDisplay, fontWeight: 900, fontSize: TITLE_SIZE, lineHeight: 1.1, letterSpacing: "0.04em" }}
        >
          {e.title}
        </h3>

        {/* 時間（Chiron Hei HK Text）*/}
        <span
          className="absolute whitespace-nowrap pointer-events-none"
          style={{ left: TIME_X, top: TIME_Y, fontFamily: zhDisplay, fontWeight: 700, fontSize: TIME_SIZE, letterSpacing: "0.05em", lineHeight: 1, opacity: 0.7 }}
        >
          {modalDateText(e)}
        </span>

        {/* 地點（Location icon ＋ 文字，Chiron Hei HK Text）*/}
        {e.location && (
          <div className="absolute" style={{ left: LOC_X, top: LOC_Y, fontFamily: zhDisplay, fontWeight: 700, lineHeight: 1, opacity: 0.7 }}>
            <LocationLine text={e.location} url={e.mapUrl || undefined} fg={fg} />
          </div>
        )}

        {/* 活動介紹文案（Noto Sans）*/}
        {e.desc && (
          <p
            className="absolute pointer-events-none"
            style={{ left: DESC_X, top: DESC_Y, width: DESC_W, fontFamily: zhFont, fontWeight: 500, letterSpacing: "0.09em", fontSize: DESC_SIZE, lineHeight: DESC_LH, color: descColor, whiteSpace: "pre-line" }}
          >
            {e.desc}
          </p>
        )}

        {/* 報名參加按鈕（左上角＝BTN_X/BTN_Y；樣式完全比照 HeroSection；只有 signup=true 才出現）*/}
        {e.signup && (
          <a
            href={e.signupUrl || "#"}
            target={e.signupUrl ? "_blank" : undefined}
            rel={e.signupUrl ? "noopener noreferrer" : undefined}
            className="absolute inline-flex items-center gap-3 bg-white text-black px-6 sm:px-7 py-3 rounded-full hover:bg-white/90 transition-all duration-200 group w-fit max-w-full"
            style={{
              left: BTN_X, top: BTN_Y,
              fontFamily: zhDisplay, // ★ 依你要求：Chiron Hei HK Text（HeroSection 原本用 Noto Sans）
              fontWeight: 700,
              fontSize: "clamp(0.85rem, 1.5vw, 1.1rem)",
              letterSpacing: "0.06em",
            }}
          >
            {SIGNUP_LABEL}
            <ArrowRight size={BTN_ICON} className="group-hover:translate-x-1 transition-transform duration-200" />
          </a>
        )}

        {/* 主責部門膠囊（左上角＝DEPT_X/DEPT_Y；hover 敘述向右滑出）*/}
        <div
          className="absolute flex items-center"
          style={{ left: DEPT_X, top: DEPT_Y, gap: DEPT_DESC_GAP }}
          onMouseEnter={() => setPillHover(true)}
          onMouseLeave={() => setPillHover(false)}
        >
          <div
            className="flex items-center shrink-0"
            style={{ gap: DEPT_DOT_GAP, background: DEPT_PILL_BG, padding: `${DEPT_PILL_PAD_Y}px ${DEPT_PILL_PAD_X}px`, borderRadius: 999, cursor: "default" }}
          >
            {dots.map((d, i) => (
              <span key={`${d.key}-${i}`} className="rounded-full" style={{ width: DEPT_DOT_SIZE, height: DEPT_DOT_SIZE, background: d.color, boxShadow: isLight(d.color) ? "inset 0 0 0 1px rgba(0,0,0,0.18)" : "none" }} />
            ))}
          </div>
          {/* 敘述：預設收起（maxWidth 0、透明、微向左），hover 時向右滑出展開 */}
          <span
            className="whitespace-nowrap overflow-hidden"
            style={{
              fontFamily: zhDisplay,
              fontWeight: 800,
              fontSize: DEPT_DESC_SIZE,
              letterSpacing: "0.08em",
              color: fg,
              maxWidth: pillHover ? 520 : 0,
              opacity: pillHover ? 1 : 0,
              transform: pillHover ? "translateX(0)" : "translateX(-10px)",
              transition: `max-width ${DEPT_DESC_SLIDE_MS}ms ease, opacity ${DEPT_DESC_SLIDE_MS}ms ease, transform ${DEPT_DESC_SLIDE_MS}ms ease`,
            }}
          >
            {deptDesc}
          </span>
        </div>

        {/* Presented by NTU LIS SA 圖片（左上角＝PRES_X/PRES_Y）*/}
        <img
          src={presentedBySrc}
          alt="Presented by NTU LIS SA"
          className="absolute select-none pointer-events-none"
          style={{ left: PRES_X, top: PRES_Y, width: PRES_W, opacity: PRES_OPACITY }}
          draggable={false}
        />
      </div>
    </div>
  );
}

// ── 部門開關（Toggle；名稱包在膠囊內）──────────────────────────────
// ON：膠囊底色＝部門色左→右漸層（右側 50% 較淡），左側部門色點，白字。
// OFF：膠囊轉灰、點與字淡化。學校日程為白色，改用中性灰底以保留可讀性。
function Switch({ on, dept, onClick }: { on: boolean; dept: Dept; onClick: () => void }) {
  const light = isLight(dept.color);
  const base = light ? "#8A8A8A" : dept.color; // 白色部門用灰當底色
  const bg = on
    ? `linear-gradient(90deg, ${withAlpha(base, 0.92)} 0%, ${withAlpha(base, 0.42)} 100%)`
    : "rgba(255,255,255,0.07)";
  const knob = on ? (light ? "#FFFFFF" : dept.color) : "rgba(255,255,255,0.28)";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className="inline-flex items-center rounded-full transition-colors duration-200"
      style={{ height: TOGGLE_HEIGHT, background: bg, paddingLeft: 4, paddingRight: TOGGLE_PAD_R, gap: 10 }}
    >
      <span
        className="rounded-full shrink-0 transition-colors duration-200"
        style={{ width: TOGGLE_KNOB, height: TOGGLE_KNOB, background: knob, boxShadow: on ? "0 1px 3px rgba(0,0,0,0.45)" : "none", border: on && light ? "1px solid rgba(0,0,0,0.15)" : "none" }}
      />
      <span
        className="whitespace-nowrap transition-colors duration-200"
        style={{ fontFamily: zhFont, fontWeight: 800, fontSize: TOGGLE_FONT, letterSpacing: "0.1em", color: on ? "#fff" : "rgba(255,255,255,0.4)" }}
      >
        {dept.zh}
      </span>
    </button>
  );
}

export default function CalendarPage() {
  // ── 展開版活動 Modal 的開關狀態 ──
  // ★ 只存「這是 EVENTS 的第幾筆」（索引），不存整包活動物件。
  //   這樣改 events.ts 存檔（Vite 熱更新）後，Modal 會直接讀最新的 EVENTS[openIdx]，
  //   內容即時同步；不用關掉重開。null＝關閉。
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const openEvent = openIdx != null ? EVENTS[openIdx] : null;

  // ── 上方：最近五場系學會活動（排除純學校日程）──
  // 收「進行中或未來」的活動（已完全結束的排除），依開始時間由近到遠；進行中的會排在最前面。
  // 每筆都記住它在 EVENTS 的原始索引（idx），點開時用來定位、讓 Modal 讀最新資料。
  const upcoming = useMemo(() => {
    const todayStr = ymd(new Date());
    return EVENTS
      .map((e, idx) => ({ e, idx }))
      .filter(({ e }) => !isSchoolOnly(e))
      .filter(({ e }) => eventEnd(e) >= todayStr) // 尚未結束（含今天）＝進行中或未來
      .sort((a, b) => eventStart(a.e).getTime() - eventStart(b.e).getTime())
      .slice(0, 5);
  }, []);

  // ── 橫向捲動控制（決定左右漸層遮罩 + 箭頭是否出現）──
  const scroller = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const syncArrows = () => {
    const el = scroller.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };
  useEffect(() => {
    syncArrows();
    const el = scroller.current;
    if (!el) return;
    el.addEventListener("scroll", syncArrows, { passive: true });
    window.addEventListener("resize", syncArrows);
    return () => {
      el.removeEventListener("scroll", syncArrows);
      window.removeEventListener("resize", syncArrows);
    };
  }, [upcoming.length]);
  const scrollByDir = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 440), behavior: "smooth" });
  };

  // 左右漸層遮罩：只在「該側還能捲動」時才淡出，讓卡片柔和消失、不是硬黑邊。
  const maskL = canLeft ? EDGE_FADE : 0;
  const maskR = canRight ? EDGE_FADE : 0;
  const scrollerMask = `linear-gradient(to right, transparent 0, #000 ${maskL}px, #000 calc(100% - ${maskR}px), transparent 100%)`;

  // ── 月曆狀態 ──
  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState(() => ({ y: today.getFullYear(), m: today.getMonth() }));
  const [enabled, setEnabled] = useState<Record<DeptKey, boolean>>(
    () => Object.fromEntries(DEPTS.map((d) => [d.key, true])) as Record<DeptKey, boolean>
  );
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const [fading, setFading] = useState(false); // 換月淡出中

  // 換月：先淡出 → 換月 → 再淡入。
  const goMonth = (delta: number) => {
    setHoverKey(null);
    setFading(true);
    window.setTimeout(() => {
      setView((v) => {
        const d = new Date(v.y, v.m + delta, 1);
        return { y: d.getFullYear(), m: d.getMonth() };
      });
      setFading(false);
    }, MONTH_FADE_MS);
  };

  const todayKey = ymd(today);

  // 該月每一天的活動：跨多天活動會展開到它涵蓋的每一天（用日期字串比對，避開時區誤差）。
  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    const prefix = `${view.y}-${pad(view.m + 1)}-`;
    for (const e of EVENTS) {
      for (const key of eventDayKeys(e)) {
        if (!key.startsWith(prefix)) continue;
        const arr = map.get(key) ?? [];
        arr.push(e);
        map.set(key, arr);
      }
    }
    return map;
  }, [view]);

  // 依 Toggle 算出某一天的「圓色 + 要顯示的活動」；沒有可顯示的就回 null。
  const dayVisual = (key: string): { color: string; events: CalEvent[] } | null => {
    const evs = eventsByDay.get(key);
    if (!evs || !evs.length) return null;
    const visible = evs.filter((e) => e.depts.some((k) => enabled[k]));
    if (!visible.length) return null;
    const keys = new Set<DeptKey>();
    visible.forEach((e) => e.depts.forEach((k) => { if (enabled[k]) keys.add(k); }));
    const color = keys.size > 1 ? LEAD_COLOR : DEPT_MAP[[...keys][0]].color;
    return { color, events: visible };
  };

  // 排出月曆格子（前置空格 + 本月日 + 補到整週的次月灰字）。
  const cells = useMemo(() => {
    const first = new Date(view.y, view.m, 1).getDay(); // 0=日
    const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
    const list: { day: number; inMonth: boolean }[] = [];
    for (let i = 0; i < first; i++) list.push({ day: 0, inMonth: false });
    for (let d = 1; d <= daysInMonth; d++) list.push({ day: d, inMonth: true });
    while (list.length % 7 !== 0) list.push({ day: list.length - first - daysInMonth + 1, inMonth: false });
    return list;
  }, [view]);

  return (
    <section id="calendar" className="relative bg-black min-h-screen px-5 sm:px-8 md:px-12 lg:px-16 pt-24 sm:pt-28 lg:pt-28 pb-16 lg:pb-24">
      <style>{`
        @keyframes calPopIn { from { opacity: 0; transform: translate(-50%, calc(var(--dy) + 6px)); } to { opacity: 1; transform: translate(-50%, var(--dy)); } }
        .cal-pop { animation: calPopIn 0.16s ease-out both; }
        @keyframes calModalIn { from { opacity: 0; } to { opacity: 1; } }
        .cal-modal-in { animation: calModalIn 0.2s ease-out both; }
        .cal-scroll::-webkit-scrollbar { height: 0; }
        .cal-scroll { scrollbar-width: none; }
        @media (prefers-reduced-motion: reduce) { .cal-pop, .cal-modal-in { animation: none; } .cal-fade { transition: none !important; } }
      `}</style>

      <div className="max-w-[1200px] mx-auto">
        {/* 眉標 */}
        <Reveal>
          <p className="mb-6" style={{ fontSize: "14px", fontFamily: monoFont, background: "linear-gradient(90deg, #FFF 0%, #595959 34.13%, #FFF 67.79%, #3A3A3A 100%)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            － 最新動態・系學會行事曆
          </p>
        </Reveal>

        {/* ══════════ 上半：下一場活動 ══════════ */}
        <Reveal delay={40}>
          <div className="mb-6"><PillLabel>下一場活動</PillLabel></div>
        </Reveal>

        <Reveal delay={80}>
          <div className="relative">
            <div
              ref={scroller}
              className="cal-scroll flex overflow-x-auto pb-2"
              style={{ gap: `${CARD_GAP}px`, WebkitMaskImage: scrollerMask, maskImage: scrollerMask }}
            >
              {upcoming.length > 0 ? (
                upcoming.map(({ e, idx }) => (
                  <EventCard key={`${e.title}-${e.date}-${idx}`} e={e} onOpen={() => setOpenIdx(idx)} />
                ))
              ) : (
                <div className="text-white/40 py-10" style={{ fontFamily: zhFont, letterSpacing: "0.1em" }}>
                  目前沒有即將到來的活動，敬請期待。
                </div>
              )}
            </div>

            {/* 左右捲動箭頭（有需要才出現） */}
            {canLeft && (
              <button type="button" onClick={() => scrollByDir(-1)} aria-label="上一個活動"
                className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                style={{ width: ARROW_SIZE, height: ARROW_SIZE }}>
                <ChevronLeft size={22} strokeWidth={2.4} />
              </button>
            )}
            {canRight && (
              <button type="button" onClick={() => scrollByDir(1)} aria-label="下一個活動"
                className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                style={{ width: ARROW_SIZE, height: ARROW_SIZE }}>
                <ChevronRight size={22} strokeWidth={2.4} />
              </button>
            )}
          </div>
        </Reveal>

        {/* ══════════ 下半：行事曆 ══════════ */}
        <div className="mt-16 lg:mt-20">
          <Reveal>
            <div className="mb-6"><PillLabel>行事曆</PillLabel></div>
          </Reveal>

          {/* 部門 Toggle（名稱包在膠囊內） */}
          <Reveal delay={40}>
            <div className="flex flex-wrap" style={{ columnGap: TOGGLE_GAP_X, rowGap: TOGGLE_GAP_Y, marginBottom: TOGGLES_MB }}>
              {DEPTS.map((d) => (
                <Switch key={d.key} on={enabled[d.key]} dept={d} onClick={() => setEnabled((p) => ({ ...p, [d.key]: !p[d.key] }))} />
              ))}
            </div>
          </Reveal>

          {/* 月份切換 */}
          <Reveal delay={80}>
            <div className="flex items-center justify-center gap-7 mb-5">
              <button type="button" onClick={() => goMonth(-1)} aria-label="上個月" className="text-white/70 hover:text-white transition-colors">
                <ChevronLeft size={22} strokeWidth={2.4} />
              </button>
              <span
                className="cal-fade text-white tabular-nums text-center"
                style={{ fontFamily: monoFont, fontWeight: 700, fontSize: MONTH_FONT, letterSpacing: "0.12em", minWidth: "8.5em", opacity: fading ? 0 : 1, transition: `opacity ${MONTH_FADE_MS}ms ease` }}
              >
                {MONTHS_ZH[view.m]}, {view.y}
              </span>
              <button type="button" onClick={() => goMonth(1)} aria-label="下個月" className="text-white/70 hover:text-white transition-colors">
                <ChevronRight size={22} strokeWidth={2.4} />
              </button>
            </div>
          </Reveal>

          <div className="h-px bg-white/15 mb-5" />

          {/* 星期列 */}
          <div className="grid grid-cols-7 text-center mb-3">
            {WEEK_ZH.map((w) => (
              <span key={w} className="text-white" style={{ fontFamily: zhDisplay, fontWeight: 800, fontSize: WEEK_FONT, letterSpacing: "0.18em" }}>
                {w}
              </span>
            ))}
          </div>

          {/* 日期格（換月時整塊淡出→淡入） */}
          <div className="cal-fade grid grid-cols-7" style={{ opacity: fading ? 0 : 1, transition: `opacity ${MONTH_FADE_MS}ms ease` }}>
            {cells.map((c, i) => {
              if (!c.inMonth) {
                return (
                  <div key={i} className="flex items-center justify-center" style={{ height: CAL_CELL_H }}>
                    {c.day > 0 && <span className="text-white/20" style={{ fontFamily: roundFont, fontWeight: 700, fontSize: CAL_NUM_SIZE }}>{c.day}</span>}
                  </div>
                );
              }
              const key = `${view.y}-${pad(view.m + 1)}-${pad(c.day)}`;
              const vis = dayVisual(key);
              const isToday = key === todayKey;
              const light = vis ? isLight(vis.color) : false;
              const firstWeek = i < 7;

              // 跨多天活動：找出涵蓋這天的多日活動，決定色條要往左／右延伸。
              const multi = vis ? vis.events.find(spansMultipleDays) : undefined;
              const isStart = multi ? key === multi.date : false;
              const isEnd = multi ? key === eventEnd(multi) : false;
              const extendLeft = !!multi && !isStart;  // 色條往左半格延伸（接左邊那天）
              const extendRight = !!multi && !isEnd;   // 色條往右半格延伸（接右邊那天）
              const hasSingle = vis ? vis.events.some((e) => !spansMultipleDays(e)) : false;
              // 有實心圓：單日活動、或跨日活動的頭／尾；中間日子只坐在色條上、不加圓。
              const hasCircle = !!vis && (!multi || isStart || isEnd || hasSingle);

              return (
                <div
                  key={i}
                  className="flex items-center justify-center relative"
                  style={{ height: CAL_CELL_H }}
                  onMouseEnter={() => vis && setHoverKey(key)}
                  onMouseLeave={() => setHoverKey((k) => (k === key ? null : k))}
                >
                  {/* 跨多天活動的連續色條（半透明；相鄰格互相接起來像一條膠囊） */}
                  {multi && (extendLeft || extendRight) && (
                    <div
                      className="absolute pointer-events-none"
                      style={{
                        top: "50%",
                        transform: "translateY(-50%)",
                        height: `calc(${CAL_CIRCLE} * ${RANGE_BAR_RATIO})`,
                        // 方角、與相鄰格無縫接起；兩端的圓帽由實心圓提供，整體＝一顆平滑膠囊。
                        left: extendLeft ? 0 : "50%",
                        right: extendRight ? 0 : "50%",
                        borderRadius: 0,
                        background: withAlpha(vis!.color, RANGE_BAR_OPACITY),
                      }}
                    />
                  )}

                  <div
                    className="relative flex items-center justify-center rounded-full"
                    style={{
                      width: CAL_CIRCLE,
                      height: CAL_CIRCLE,
                      background: hasCircle ? vis!.color : "transparent",
                      cursor: vis ? "pointer" : "default",
                    }}
                  >
                    {/* 當日：紅藍漸層外框空心圓（有活動時疊在實心圓外緣） */}
                    {isToday && (
                      <span
                        className="absolute rounded-full pointer-events-none"
                        style={{
                          inset: `-${TODAY_RING_W + 0.5}px`,
                          padding: `${TODAY_RING_W}px`,
                          background: BRAND_GRAD,
                          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                          WebkitMaskComposite: "xor",
                          maskComposite: "exclude",
                        }}
                      />
                    )}
                    <span
                      className="tabular-nums leading-none relative"
                      style={{ fontFamily: roundFont, fontWeight: 700, fontSize: CAL_NUM_SIZE, color: hasCircle ? (light ? "#111" : "#fff") : "#fff" }}
                    >
                      {c.day}
                    </span>
                  </div>

                  {/* Hover 小卡：列出當天（可顯示的）活動 */}
                  {hoverKey === key && vis && (
                    <div
                      className="cal-pop absolute left-1/2 z-20 rounded-2xl border border-white/12 shadow-2xl shadow-black/60"
                      style={{
                        // 第一週往下展開、其餘往上展開，避免超出容器上緣。
                        ["--dy" as string]: firstWeek ? "0%" : "-100%",
                        top: firstWeek ? "calc(100% + 8px)" : "-8px",
                        transform: `translate(-50%, ${firstWeek ? "0%" : "-100%"})`,
                        width: POP_WIDTH,
                        background: "#1c1c1e",
                        padding: "12px 14px",
                      }}
                    >
                      {vis.events.map((ev, j) => (
                        <div key={`${ev.title}-${j}`} className="flex items-center gap-2.5 py-1">
                          <span className="rounded-full shrink-0" style={{ width: 9, height: 9, background: accentColorOf(ev), boxShadow: isLight(accentColorOf(ev)) ? "inset 0 0 0 1px rgba(0,0,0,0.2)" : "none" }} />
                          <span className="text-white/90 truncate" style={{ fontFamily: zhFont, fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.03em" }}>
                            {ev.title}
                          </span>
                          <span className="ml-auto text-white/45 shrink-0" style={{ fontFamily: monoFont, fontSize: "0.72rem", letterSpacing: "0.04em" }}>
                            {spanText(ev)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══════════ 展開版活動資訊 Modal（點卡片才出現）══════════ */}
      {openEvent && <EventModal e={openEvent} onClose={() => setOpenIdx(null)} />}
    </section>
  );
}