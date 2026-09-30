import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal } from "./shared";
import { EVENTS, eventEnd, isSchoolOnly, accentColorOf, ymd, type CalEvent } from "./events";
import { BENTO, DEPT_COLORS, serviceBySlug, type ServiceCell } from "../department-pages/servicesData";
// ↑ 本檔請放在 src/components/sections/（跟 CalendarPage.tsx 同一層）。
//   若放別的地方，改上面三行的相對路徑即可。

/**
 * 首頁「近一個月的系學會活動」
 * ─────────────────────────────────────────────────────────────
 * ● 自動從 events.ts 抓「今天起 60 天內」的系學會活動（排除純學校日程、已結束的活動）。
 * ● 每場活動會自動對應到 servicesData.ts 的某項服務：
 *     - 卡片底色＝該服務的部門色
 *     - 圖片＝imports/services/ 裡以該服務 slug 命名的圖（例：bbq.png）
 *     - 「深入了解」→ #/service/<slug>（Services.tsx 的詳情頁）
 * ● 對應方式：活動標題裡有出現服務名稱（例：「系烤活動 2026」含「系烤活動」→ bbq），
 *   或符合下方 ALIASES 的關鍵字。都對不到的活動 → 連到行事曆頁、用部門色、不放圖。
 * ● 最後一格固定是「探索更多活動」→ 系學會行事曆（#/calendar）。
 */

// ══════════════════════════════════════════════════════════════════
// ✏️ 手動調整區
// ══════════════════════════════════════════════════════════════════
const SECTION_TITLE = "每月有活動，圖資生活不孤單";
const DAYS_AHEAD = 60;   // 抓未來幾天內的活動
const MAX_CARDS = 8;     // 最多顯示幾張活動卡（不含「探索更多活動」）
const BTN_LABEL = "深入了解";

// 「探索更多活動」卡
const EXPLORE_TITLE = "探索更多活動";
const EXPLORE_DESC = "找不到有興趣的活動？都幫你整理好了！";
const EXPLORE_LINK = "#/calendar";

// 卡片尺寸（clamp(最小, 隨螢幕縮放, 最大)）
const CARD_W = "clamp(270px, 34vw, 560px)"; // 卡片寬
const CARD_RATIO = "7 / 8";                 // 寬 / 高 比例
const CARD_RADIUS = 24;                     // 圓角（px）
const CARD_GAP = 28;                        // 卡片間距（px）

// 關鍵字 → 服務 slug（活動標題沒有完整出現服務名稱時用；不分大小寫）
// 例：活動叫「LIS Talks: 系友講座」→ 其實已含「系友講座」，這裡只是多一層保險。
const ALIASES: [keyword: string, slug: string][] = [
  ["LIS Talk", "alumni"],
  ["講座", "alumni"],
  ["系烤", "bbq"],
  ["BBQ", "bbq"],
  ["宿營", "camp"],
  ["聖誕", "xmas"],
  ["迎新", "orientation"],
  ["LIS Night", "lis-night"],
  ["LIS Week", "lis-week"],
  ["杜鵑", "azalea"],
  ["參訪", "corp"],
  ["LIS Cup", "lis-cup"],
  ["系服", "ooty"],
];

// 每項服務在卡片上的一句話標語（slug → 文字）。沒填的會改顯示該服務的英文名。
const TAGLINES: Record<string, string> = {
  alumni: "在學長姐的視野裡，看見自己未來的無限可能",
  bbq: "月色下升起的炭火，把秋夜的微風與相遇",
  "lis-cup": "球場上，圖資人盡情揮灑汗水與青春", 
};
// ══════════════════════════════════════════════════════════════════

const zhDisplay = "'Chiron Hei HK Text', 'Noto Sans TC', sans-serif";
const zhFont = "'Noto Sans TC', sans-serif";
const BRAND_BORDER = "linear-gradient(180deg, #D14B4B 0%, #2F9EBD 100%)";

// 讀 imports/services/ 裡的圖（同 Services.tsx 的寫法）
const SERVICE_ASSETS = import.meta.glob("/src/**/services/**/*.{svg,png,jpg,jpeg,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
function assetBySlug(slug: string): string | undefined {
  const hit = Object.keys(SERVICE_ASSETS).find((p) => {
    const f = (p.split("/").pop() || "").replace(/\.[^.]+$/, "");
    return f === slug;
  });
  return hit ? SERVICE_ASSETS[hit] : undefined;
}

// 服務依名稱長度排序（長的先比對，避免「迎新」搶走「迎新宿營」）
const SERVICES_BY_NAME = (BENTO.filter((c) => c.type === "service") as ServiceCell[])
  .slice()
  .sort((a, b) => b.zh.length - a.zh.length);

function findService(e: CalEvent): ServiceCell | undefined {
  // 若 events.ts 的活動有寫 service: "bbq"，優先使用
  const explicit = (e as CalEvent & { service?: string }).service;
  if (explicit) return serviceBySlug(explicit);

  const title = e.title.toLowerCase();
  const byName = SERVICES_BY_NAME.find((s) => title.includes(s.zh.toLowerCase()));
  if (byName) return byName;
  const alias = ALIASES.find(([k]) => title.includes(k.toLowerCase()));
  return alias ? serviceBySlug(alias[1]) : undefined;
}

type CardItem = {
  key: string;
  title: string;
  tagline: string;
  color: string;
  img?: string;
  href: string;
};

// ── 活動卡 ──
function EventCard({ item }: { item: CardItem }) {
  return (
    <a
      href={item.href}
      className="group relative shrink-0 snap-start flex flex-col items-center text-center overflow-hidden transition-transform duration-300 hover:-translate-y-1.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
      style={{
        width: CARD_W,
        aspectRatio: CARD_RATIO,
        background: item.color,
        borderRadius: CARD_RADIUS,
        padding: "clamp(20px, 3vw, 44px) clamp(18px, 2.4vw, 36px)",
      }}
    >
      {/* 圖片區 */}
      <div className="flex-1 w-full min-h-0 flex items-center justify-center">
        {item.img ? (
          <img
            src={item.img}
            alt=""
            draggable={false}
            className="max-w-[88%] max-h-full object-contain select-none transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : null}
      </div>

      <h3
        className="text-white mt-4"
        style={{ fontFamily: zhDisplay, fontWeight: 900, fontSize: "clamp(1.25rem, 2.2vw, 2.1rem)", letterSpacing: "0.06em", lineHeight: 1.25 }}
      >
        {item.title}
      </h3>
      <p
        className="text-white/80 mt-3 line-clamp-2"
        style={{ fontFamily: zhFont, fontWeight: 700, fontSize: "clamp(0.82rem, 1.1vw, 1.05rem)", letterSpacing: "0.1em", lineHeight: 1.6 }}
      >
        {item.tagline}
      </p>

      <span
        className="mt-6 sm:mt-10 inline-flex items-center gap-2 bg-white text-black rounded-full px-5 sm:px-6 py-2.5 group-hover:bg-white/90 transition-colors"
        style={{ fontFamily: zhFont, fontWeight: 700, fontSize: "clamp(0.85rem, 1.1vw, 1.05rem)", letterSpacing: "0.1em" }}
      >
        {BTN_LABEL}
        <ArrowRight size={18} strokeWidth={2.6} className="transition-transform duration-200 group-hover:translate-x-1" />
      </span>
    </a>
  );
}

// ── 最後一格：探索更多活動（紅藍漸層外框） ──
function ExploreCard() {
  return (
    <a
      href={EXPLORE_LINK}
      className="group relative shrink-0 snap-start flex flex-col items-center text-center overflow-hidden transition-transform duration-300 hover:-translate-y-1.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
      style={{
        width: CARD_W,
        aspectRatio: CARD_RATIO,
        borderRadius: CARD_RADIUS,
        border: "3px solid transparent",
        background: `linear-gradient(#000, #000) padding-box, ${BRAND_BORDER} border-box`,
        padding: "clamp(20px, 3vw, 44px) clamp(18px, 2.4vw, 36px)",
      }}
    >
      <div className="flex-1 w-full min-h-0 flex items-center justify-center">
        <ArrowRight
          strokeWidth={1.6}
          className="text-white transition-transform duration-500 group-hover:translate-x-3"
          style={{ width: "55%", height: "auto", maxHeight: "100%" }}
        />
      </div>
      <h3
        className="text-white mt-4"
        style={{ fontFamily: zhDisplay, fontWeight: 900, fontSize: "clamp(1.25rem, 2.2vw, 2.1rem)", letterSpacing: "0.06em", lineHeight: 1.25 }}
      >
        {EXPLORE_TITLE}
      </h3>
      <p
        className="text-white/80 mt-3 line-clamp-2"
        style={{ fontFamily: zhFont, fontWeight: 700, fontSize: "clamp(0.82rem, 1.1vw, 1.05rem)", letterSpacing: "0.1em", lineHeight: 1.6 }}
      >
        {EXPLORE_DESC}
      </p>
      <span
        className="mt-6 sm:mt-10 inline-flex items-center gap-2 bg-white text-black rounded-full px-5 sm:px-6 py-2.5 group-hover:bg-white/90 transition-colors"
        style={{ fontFamily: zhFont, fontWeight: 700, fontSize: "clamp(0.85rem, 1.1vw, 1.05rem)", letterSpacing: "0.1em" }}
      >
        {BTN_LABEL}
        <ArrowRight size={18} strokeWidth={2.6} className="transition-transform duration-200 group-hover:translate-x-1" />
      </span>
    </a>
  );
}

export default function UpcomingEventsSection() {
  // ── 抓今天起 DAYS_AHEAD 天內的系學會活動 ──
  const items = useMemo<CardItem[]>(() => {
    const now = new Date();
    const todayStr = ymd(now);
    const limit = new Date(now);
    limit.setDate(limit.getDate() + DAYS_AHEAD);
    const limitStr = ymd(limit);

    return EVENTS
      .filter((e) => !isSchoolOnly(e))
      .filter((e) => eventEnd(e) >= todayStr && e.date <= limitStr) // 還沒結束、且 30 天內開始
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, MAX_CARDS)
      .map((e, i) => {
        const svc = findService(e);
        return {
          key: `${e.title}-${e.date}-${i}`,
          title: e.title,
          tagline: svc ? TAGLINES[svc.slug] ?? svc.en : "",
          color: svc ? DEPT_COLORS[svc.dept] : accentColorOf(e),
          img: svc ? assetBySlug(svc.slug) : undefined,
          href: svc ? `#/service/${svc.slug}` : EXPLORE_LINK,
        };
      });
  }, []);

  // ── 左右箭頭（桌機才顯示；手機直接用手指滑） ──
  const scroller = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const sync = () => {
      setCanLeft(el.scrollLeft > 4);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [items.length]);

  const scrollByDir = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: "smooth" });
  };

  const arrowClass =
    "hidden md:flex absolute top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white text-black items-center justify-center shadow-lg hover:scale-105 transition-transform";

  return (
    <section id="upcoming" className="relative bg-black py-20 sm:py-28">
      <style>{`
        .upc-scroll::-webkit-scrollbar { height: 0; }
        .upc-scroll { scrollbar-width: none; }
      `}</style>

      <Reveal>
        <h2
          className="text-white text-center px-5 mb-10 sm:mb-16"
          style={{ fontFamily: zhDisplay, fontWeight: 700, fontSize: "clamp(1.2rem, 4vw, 3rem)", letterSpacing: "0.06em", lineHeight: 1.3 }}
        >
          {SECTION_TITLE}
        </h2>
      </Reveal>

      <Reveal delay={80}>
        <div className="relative">
          <div
            ref={scroller}
            className="upc-scroll flex overflow-x-auto snap-x snap-mandatory px-5 sm:px-8 md:px-14 scroll-px-5 sm:scroll-px-8 md:scroll-px-14 pb-4 pt-2"
            style={{ gap: CARD_GAP }}
          >
            {items.map((item) => (
              <EventCard key={item.key} item={item} />
            ))}
            <ExploreCard />
            {/* 右側留白，讓最後一張卡能完整捲到定位 */}
            <div className="shrink-0 w-px" aria-hidden="true" />
          </div>

          {canLeft && (
            <button type="button" onClick={() => scrollByDir(-1)} aria-label="上一個活動" className={`${arrowClass} left-4`}>
              <ChevronLeft size={24} strokeWidth={2.4} />
            </button>
          )}
          {canRight && (
            <button type="button" onClick={() => scrollByDir(1)} aria-label="下一個活動" className={`${arrowClass} right-4`}>
              <ChevronRight size={24} strokeWidth={2.4} />
            </button>
          )}
        </div>
      </Reveal>
    </section>
  );
}
