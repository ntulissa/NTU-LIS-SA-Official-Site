import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { ArrowLeft, MapPin } from "lucide-react";
import { useIsDesktop } from "../general/shared";
import { defineText, useI18n } from "../i18n";

/**
 * 小圖盃完整賽程頁（網址 /lis-cup，英文 /en/lis-cup）
 * ─────────────────────────────────────────────────────────────
 * ● 左上：回上頁（位置跟公告文章頁 Article.tsx 一模一樣）
 * ● 左邊：比賽 icon（src/imports/home-page/events/）＋ 日期、時間、地點（點地點開 Google 地圖）
 * ● 右邊：組別分頁（男單／女單…）＋ 賽程
 *     - 單打（4 人，A、B 組勝者爭冠）→ 左右對稱的對戰表
 *     - 循環賽、只有一場的組別 → 一場一列的對戰卡
 * ● 底部：羽球 ⇄ 排球 切換開關，大小、位置都跟首頁 Hero 的頁碼一模一樣
 *   （從 Hero 點「完整賽程」進來，開關會剛好出現在頁碼原本的位置）
 *   網址加 ?sport=volleyball 可以直接打開排球
 *
 * ★ 要更新賽程、比賽結果 → 改下面的 SPORTS
 */

// ══════════════════════════════════════════════════════════════════
// ✏️ 手動調整區
// ══════════════════════════════════════════════════════════════════
type Sport = "badminton" | "volleyball";

// 底部開關左右順序（照設計稿：左排球、右羽球）
const TOGGLE_ORDER: Sport[] = ["badminton", "volleyball"];
const DEFAULT_SPORT: Sport = "badminton"; // 一進來先顯示哪一項

const PAGE_BG = "#661A1A"; // 紅土球場底色

// 隊伍：單打直接寫名字；雙打寫 { name: 隊名, members: "隊員 & 隊員" }
type Team = string | { name: string; members?: string };

type Match = {
  group?: string;     // 組別代號，例如 "A" → 顯示「A 組」
  a: Team;
  b: Team;
  winner?: "a" | "b"; // 比完填上，輸的那邊會變淡
};

type Category = {
  id: string;
  zh: string; // 分頁名稱（會自動加「賽事」）
  en: string;
  // bracket：淘汰賽對戰表（第 1 場勝者 vs 第 2 場勝者…，場數要是 1、2、4、8）
  // list   ：一場一列（循環賽、或只有一場時用）
  format: "bracket" | "list";
  matches: Match[];
  champion?: string; // 淘汰賽冠軍（填名字），會顯示在對戰表中間
};

type SportInfo = {
  icon: string;    // icon 檔名（放在 src/imports/home-page/events/）
  date: string;    // 比賽日期 YYYY-MM-DD（星期幾會自動算）
  time: string;
  place: { zh: string; en: string };
  mapQuery: string; // Google 地圖搜尋字
  open: boolean;    // false＝尚未開放報名（右邊只顯示「敬請期待」）
  categories: Category[];
};

const SPORTS: Record<Sport, SportInfo> = {
  badminton: {
    icon: "lis-cup-badminton.svg",
    date: "2026-11-17",
    time: "16:00",
    place: { zh: "臺大新體 1F 多功能球場", en: "1F, NTU Sports Center" },
    mapQuery: "臺大綜合體育館",
    open: true,
    categories: [
      {
        id: "ms", zh: "男單", en: "Men's Singles", format: "bracket",
        matches: [
          { group: "A", a: "陳品元", b: "邱奕懷" },
          { group: "B", a: "成書宇", b: "陳昫翰" },
        ],
      },
      {
        id: "ws", zh: "女單", en: "Women's Singles", format: "bracket",
        matches: [
          { group: "A", a: "黃金淳", b: "劉瑩茜" },
          { group: "B", a: "謝君兒", b: "陳戀芊" },
        ],
      },
      {
        // 三隊循環賽
        id: "md", zh: "男雙", en: "Men's Doubles", format: "list",
        matches: [
          { group: "A", a: { name: "羅司家", members: "邱奕懷 & 成書宇" }, b: { name: "已報名", members: "陳昫翰 & 陳品元" } },
          { group: "B", a: { name: "羅司家", members: "邱奕懷 & 成書宇" }, b: { name: "啊～是 Hung-You, LEE 來了", members: "曾柏翰 & 陳秉逸" } },
          { group: "C", a: { name: "已報名", members: "陳昫翰 & 陳品元" }, b: { name: "啊～是 Hung-You, LEE 來了", members: "曾柏翰 & 陳秉逸" } },
        ],
      },
      {
        id: "xd", zh: "混雙", en: "Mixed Doubles", format: "list",
        matches: [
          { group: "A", a: { name: "喬治羽明治", members: "黃子芸 & 曾柏翰" }, b: { name: "資資", members: "蕭忻緹 & 陳品元" } },
        ],
      },
    ],
  },
  volleyball: {
    icon: "lis-cup-volleyball.svg",
    date: "2026-11-29",
    time: "13:00",
    place: { zh: "臺大排球場", en: "NTU Volleyball Courts" },
    mapQuery: "臺灣大學 排球場",
    open: false,
    categories: [],
  },
};

const TEXT = defineText({
  zh: {
    pageTitle: "2026 小圖盃完整賽程",
    back: "回上頁",
    sports: { badminton: "羽球", volleyball: "排球" },
    sportSwitch: "切換比賽項目",
    categorySuffix: "賽事",
    group: (g: string) => `${g} 組`,
    weekdays: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
    notOpen: "排球賽尚未開放報名，敬請期待",
    tbd: "對戰組合即將公布",
    champion: "冠軍",
    vs: "VS",
    openMap: "在 Google 地圖開啟",
  },
  en: {
    pageTitle: "LIS Cup 2026 Full Schedule",
    back: "Back",
    sports: { badminton: "Badminton", volleyball: "Volleyball" },
    sportSwitch: "Switch sport",
    categorySuffix: "",
    group: (g: string) => `Group ${g}`,
    weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    notOpen: "Volleyball sign-ups aren't open yet. Stay tuned!",
    tbd: "Matchups coming soon",
    champion: "Champion",
    vs: "VS",
    openMap: "Open in Google Maps",
  },
});

// ── 版面：上方留白、左右留白、回上頁位置，全部跟 Article.tsx 一樣 ──
const LAYOUT = {
  padX: "clamp(20px, 5vw, 56px)",     // = Article 的 LAYOUT.padX
  padTop: "clamp(96px, 12vh, 130px)", // = Article 的 LAYOUT.padTop
};
const BACK = { size: "0.9rem", x: -25, y: 15 }; // = Article 的 BACK（桌機才套用 x/y 位移）

// ── 底部開關：大小要跟 Hero 的頁碼完全一樣（數字照抄 Hero.tsx 的 Pagination）──
//   ★ Hero 輪播的頁數改了（目前 5 頁），這裡的 HERO_DOTS 也要一起改，兩邊寬度才會一樣。
const HERO_DOTS = 5;
const PILL = {
  bg: "#CCCCCC",
  padY: "clamp(13px, 1.1vw, 16px)",
  padX: "clamp(16px, 1.6vw, 22px)",
  dot: "clamp(9px, 0.8vw, 12px)",
  active: "clamp(28px, 2.6vw, 38px)",
  gap: "clamp(10px, 1vw, 14px)",
};
const PILL_W = `calc(2 * ${PILL.padX} + ${PILL.active} + ${HERO_DOTS - 1} * ${PILL.dot} + ${HERO_DOTS - 1} * ${PILL.gap})`;
const PILL_H = `calc(2 * ${PILL.padY} + ${PILL.dot})`;
const KNOB_INSET = 5; // 黑色滑塊離外框的距離（px）

// 對戰表格子尺寸
const SLOT_W = "clamp(104px, 11vw, 190px)";        // 選手名字框寬
const SLOT_H = "clamp(42px, 6vh, 68px)";           // 選手名字框高
const CONN_W = "clamp(28px, 4vw, 72px)";           // 對戰線寬
const LINE = 3;                                     // 對戰線粗細（px）
// ══════════════════════════════════════════════════════════════════

const zhDisplay = "'Chiron Hei HK Text', 'Noto Sans TC', sans-serif";
const zhFont = "'Noto Sans TC', sans-serif";
const roundFont = "'SF Pro Rounded', ui-rounded, 'Noto Sans TC', sans-serif";

// 玻璃材質＋一點陰影
const GLASS: CSSProperties = {
  background: "linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
  border: "1px solid rgba(255,255,255,0.14)",
  boxShadow: "0 14px 30px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.10)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  borderRadius: 22,
};

const ICON_ASSETS = import.meta.glob("/src/imports/home-page/events/**/*.{svg,png,jpg,jpeg,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
function icon(file: string): string | undefined {
  const hit = Object.keys(ICON_ASSETS).find((p) => p.endsWith(`/${file}`));
  return hit ? ICON_ASSETS[hit] : undefined;
}

type Tx = (typeof TEXT)["zh"];
const teamName = (t: Team) => (typeof t === "string" ? t : t.name);
const teamMembers = (t: Team) => (typeof t === "string" ? undefined : t.members);

// ── 淘汰賽：對戰組合 → 樹狀結構 ──
type BNode = { name: string | null; lost?: boolean; children?: [BNode, BNode] };

function buildBracket(cat: Category): BNode | null {
  if (cat.matches.length === 0) return null;
  // 第一輪
  let level: BNode[] = cat.matches.map((m) => {
    const a: BNode = { name: teamName(m.a) }, b: BNode = { name: teamName(m.b) };
    if (m.winner === "a") b.lost = true;
    if (m.winner === "b") a.lost = true;
    return { name: m.winner ? teamName(m[m.winner]) : null, children: [a, b] };
  });
  // 之後每一輪（目前只用得到冠軍）
  while (level.length > 1) {
    const next: BNode[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const a = level[i], b = level[i + 1];
      const w = level.length === 2 ? cat.champion ?? null : null;
      if (w) {
        if (a.name && a.name !== w) a.lost = true;
        if (b?.name && b.name !== w) b.lost = true;
      }
      next.push({ name: w, children: [a, b ?? { name: null }] });
    }
    level = next;
  }
  return level[0];
}

function Slot({ node, champion }: { node: BNode; champion?: boolean }) {
  return (
    <div
      className="shrink-0 flex items-center justify-center rounded-xl text-center px-2"
      style={{
        width: SLOT_W,
        height: SLOT_H,
        visibility: node.name ? "visible" : "hidden", // 還沒產生的晉級者：留位置但不顯示
        background: champion ? "#FFFFFF" : "#1B1B1B",
        color: champion ? "#000" : "#fff",
        opacity: node.lost ? 0.45 : 1,
        boxShadow: "0 8px 18px -6px rgba(0,0,0,0.6)",
        fontFamily: zhDisplay,
        fontWeight: 700,
        fontSize: "clamp(0.85rem, 1.25vw, 1.25rem)",
        letterSpacing: "0.12em",
        lineHeight: 1.2,
      }}
    >
      {node.name}
    </div>
  );
}

// 「⊐」形對戰線
function Connector({ side }: { side: "left" | "right" }) {
  const left = side === "left";
  return (
    <div className="relative shrink-0 self-stretch" style={{ width: CONN_W }} aria-hidden="true">
      <span
        className="absolute"
        style={{
          top: "25%", bottom: "25%", width: "50%",
          [left ? "left" : "right"]: 0,
          borderTop: `${LINE}px solid #fff`,
          borderBottom: `${LINE}px solid #fff`,
          [left ? "borderRight" : "borderLeft"]: `${LINE}px solid #fff`,
        }}
      />
      <span className="absolute" style={{ top: `calc(50% - ${LINE / 2}px)`, width: "50%", [left ? "right" : "left"]: 0, borderTop: `${LINE}px solid #fff` }} />
    </div>
  );
}

function Branch({ node, side }: { node: BNode; side: "left" | "right" }) {
  if (!node.children) {
    return <div className="flex-1 flex items-center justify-center"><Slot node={node} /></div>;
  }
  return (
    <div className={`flex-1 flex items-stretch ${side === "right" ? "flex-row-reverse" : ""}`}>
      <div className="flex flex-col">
        {node.children.map((c, i) => (
          <div key={i} className="flex-1 basis-0 flex"><Branch node={c} side={side} /></div>
        ))}
      </div>
      <Connector side={side} />
      <div className="flex items-center"><Slot node={node} /></div>
    </div>
  );
}

function BracketView({ category, tx }: { category: Category; tx: Tx }) {
  const root = useMemo(() => buildBracket(category), [category]);
  if (!root) return <Message text={tx.tbd} />;
  // 只有一場 → 沒有左右兩邊，改用對戰卡
  if (!root.children || !root.children[0].children) return <MatchList category={category} tx={tx} />;
  const [l, r] = root.children;
  return (
    <div className="h-full overflow-x-auto">
      <div className="h-full min-w-[620px] flex items-stretch justify-between px-[clamp(16px,4vw,72px)] py-[clamp(16px,5vh,72px)]">
        <div className="flex"><Branch node={l} side="left" /></div>
        <div className="flex flex-col items-center justify-center gap-3">
          {root.name && (
            <span className="text-white/80" style={{ fontFamily: zhFont, fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.2em" }}>{tx.champion}</span>
          )}
          <Slot node={root} champion />
        </div>
        <div className="flex"><Branch node={r} side="right" /></div>
      </div>
    </div>
  );
}

// ── 對戰卡：一場一列（循環賽、手機版都用這個）──
function TeamBox({ team, lost }: { team: Team; lost?: boolean }) {
  const members = teamMembers(team);
  return (
    <div
      className="h-full rounded-xl px-3 py-2.5 lg:py-3 flex flex-col items-center justify-center text-center text-white"
      style={{ background: "#1B1B1B", opacity: lost ? 0.45 : 1, boxShadow: "0 8px 18px -6px rgba(0,0,0,0.6)" }}
    >
      <span style={{ fontFamily: zhDisplay, fontWeight: 700, fontSize: "clamp(0.9rem, 1.3vw, 1.2rem)", letterSpacing: "0.08em", lineHeight: 1.35 }}>{teamName(team)}</span>
      {members && (
        <span className="text-white/60 mt-1" style={{ fontFamily: zhFont, fontWeight: 500, fontSize: "clamp(0.72rem, 0.95vw, 0.9rem)", letterSpacing: "0.06em" }}>{members}</span>
      )}
    </div>
  );
}

function MatchList({ category, tx }: { category: Category; tx: Tx }) {
  if (category.matches.length === 0) return <Message text={tx.tbd} />;
  return (
    <div className="h-full overflow-y-auto flex">
      <div className="m-auto w-full max-w-[880px] flex flex-col gap-[clamp(10px,2.4vh,26px)] p-[clamp(14px,2.6vw,36px)]">
        {category.matches.map((m, i) => (
          <div key={i}>
            {m.group && (
              <p className="text-white/70 mb-1.5" style={{ fontFamily: zhFont, fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.2em" }}>{tx.group(m.group)}</p>
            )}
            <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2 sm:gap-4">
              <TeamBox team={m.a} lost={m.winner === "b"} />
              <span className="self-center text-white/60 px-1" style={{ fontFamily: zhFont, fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.1em" }}>{tx.vs}</span>
              <TeamBox team={m.b} lost={m.winner === "a"} />
            </div>
          </div>
        ))}
        {category.champion && (
          <div className="text-center mt-2">
            <p className="text-white/70 mb-2" style={{ fontFamily: zhFont, fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.2em" }}>{tx.champion}</p>
            <div className="inline-block rounded-xl bg-white text-black px-6 py-3" style={{ fontFamily: zhDisplay, fontWeight: 700, letterSpacing: "0.12em" }}>{category.champion}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function Message({ text }: { text: string }) {
  return (
    <div className="h-full min-h-[220px] flex items-center justify-center text-center px-6">
      <p className="text-white" style={{ fontFamily: zhDisplay, fontWeight: 700, fontSize: "clamp(1.05rem, 2vw, 1.8rem)", letterSpacing: "0.12em", lineHeight: 1.6 }}>
        {text}
      </p>
    </div>
  );
}

// ── 底部切換開關（羽球 ⇄ 排球）：外框跟 Hero 頁碼一樣大 ──
function SportSwitch({ sport, onChange, tx, track }: { sport: Sport; onChange: (s: Sport) => void; tx: Tx; track: (zh: string, en?: string) => string }) {
  const idx = TOGGLE_ORDER.indexOf(sport);
  return (
    <div role="radiogroup" aria-label={tx.sportSwitch} className="relative grid grid-cols-2 rounded-full" style={{ background: PILL.bg, width: PILL_W, height: PILL_H }}>
      <span
        className="absolute rounded-full bg-black transition-transform duration-300 ease-out"
        style={{ top: KNOB_INSET, bottom: KNOB_INSET, left: KNOB_INSET, width: `calc(50% - ${KNOB_INSET}px)`, transform: `translateX(${idx * 100}%)` }}
        aria-hidden="true"
      />
      {TOGGLE_ORDER.map((s) => {
        const active = s === sport;
        return (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(s)}
            className="relative z-10 rounded-full flex items-center justify-center whitespace-nowrap transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            style={{
              color: active ? "#fff" : "rgba(0,0,0,0.55)",
              fontFamily: zhFont,
              fontWeight: 700,
              fontSize: "clamp(0.7rem, 0.8vw, 0.85rem)",
              letterSpacing: track("0.12em", "0.01em"),
              ["--tw-ring-offset-color" as string]: PILL.bg,
            }}
          >
            {tx.sports[s]}
          </button>
        );
      })}
    </div>
  );
}

// 一進來先打開「第一個已經有賽程」的組別
function firstCategoryId(s: Sport): string {
  const cats = SPORTS[s].categories;
  return (cats.find((c) => c.matches.length > 0) ?? cats[0])?.id ?? "";
}

function readSportFromUrl(): Sport {
  if (typeof window === "undefined") return DEFAULT_SPORT;
  const s = new URLSearchParams(window.location.search).get("sport");
  return s === "badminton" || s === "volleyball" ? s : DEFAULT_SPORT;
}

export default function LIScup() {
  const { pick, track } = useI18n();
  const tx = pick(TEXT);
  const isDesktop = useIsDesktop();
  const [sport, setSport] = useState<Sport>(readSportFromUrl);
  const info = SPORTS[sport];
  const [catId, setCatId] = useState<string>(() => firstCategoryId(readSportFromUrl()));
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  // 換項目：組別回到第一個有賽程的，網址記住目前項目（重新整理或分享連結會停在同一項）
  const changeSport = (s: Sport) => {
    setSport(s);
    setCatId(firstCategoryId(s));
    const url = new URL(window.location.href);
    if (s === DEFAULT_SPORT) url.searchParams.delete("sport");
    else url.searchParams.set("sport", s);
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  };

  useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  // ── 底部開關的位置 ──
  // 平常固定在螢幕底部（跟 Hero 頁碼同一個位置）；捲到本頁最底、Footer 要出現時，改成停在本頁底部，不會蓋到 Footer。
  // 桌機整頁剛好一個螢幕高，一進來就是「停在本頁底部」＝ Hero 頁碼的位置。
  const [docked, setDocked] = useState(true);
  useEffect(() => {
    const update = () => {
      const el = sectionRef.current;
      if (el) setDocked(el.getBoundingClientRect().bottom <= window.innerHeight + 1);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);

  const goBack = () => {
    if (window.history.length > 1) window.history.back();
    else window.location.href = "/";
  };

  const category = info.categories.find((c) => c.id === catId) ?? info.categories[0];
  const hasTabs = info.open && info.categories.length > 0;

  // 分頁可用鍵盤 ← → 切換
  const onTabKey = (e: ReactKeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const n = info.categories.length;
    const j = (i + (e.key === "ArrowRight" ? 1 : -1) + n) % n;
    setCatId(info.categories[j].id);
    tabRefs.current[j]?.focus();
  };

  const [y, m, d] = info.date.split("-").map(Number);
  const weekday = tx.weekdays[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  const dateText = `${m}.${String(d).padStart(2, "0")} ${weekday}`;
  const iconSrc = icon(info.icon);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(info.mapQuery)}`;

  const tabFont = "clamp(0.9rem, 1.25vw, 1.25rem)";

  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col min-h-[100svh] md:h-[100svh] md:min-h-[520px]"
      style={{ background: PAGE_BG }}
    >
      <style>{`
        @keyframes liscupIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .liscup-in { animation: liscupIn 380ms cubic-bezier(0.22,1,0.36,1) both; }
        @media (prefers-reduced-motion: reduce) { .liscup-in { animation: none; } }
      `}</style>
      <h1 className="sr-only">{tx.pageTitle}</h1>

      {/* 內容：桌機剛好塞滿一個螢幕（下方留給開關），格子高度自動跟著螢幕縮放 */}
      <div
        className="flex-1 min-h-0 w-full max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-[minmax(190px,1fr)_3.1fr] md:grid-rows-[auto_minmax(0,1fr)] gap-4 lg:gap-5"
        style={{ paddingLeft: LAYOUT.padX, paddingRight: LAYOUT.padX, paddingTop: LAYOUT.padTop, paddingBottom: `calc(${PILL_H} + clamp(3.5rem, 7vh, 4.5rem))` }}
      >
        {/* ── 回上頁（跟 Article.tsx 同位置、同樣式）── */}
        <div className="flex items-start">
          <button
            type="button"
            onClick={goBack}
            className="group inline-flex items-center gap-2 rounded-full bg-white text-black hover:bg-white/90 transition-colors px-5 py-2"
            style={{ fontFamily: zhFont, fontWeight: 700, fontSize: BACK.size, letterSpacing: track("0.12em"), ...(isDesktop ? { transform: `translate(${BACK.x}px, ${BACK.y}px)` } : {}) }}
          >
            <ArrowLeft size={16} strokeWidth={2.4} className="group-hover:-translate-x-1 transition-transform duration-200" /> {tx.back}
          </button>
        </div>

        {/* ── 組別分頁 ── */}
        <div key={`tabs-${sport}`} className="liscup-in">
          {hasTabs ? (
            <div role="tablist" className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:gap-4">
              {info.categories.map((c, i) => {
                const active = c.id === category?.id;
                return (
                  <button
                    key={c.id}
                    ref={(el) => { tabRefs.current[i] = el; }}
                    type="button"
                    role="tab"
                    id={`liscup-tab-${c.id}`}
                    aria-selected={active}
                    aria-controls="liscup-panel"
                    tabIndex={active ? 0 : -1}
                    onClick={() => setCatId(c.id)}
                    onKeyDown={(e) => onTabKey(e, i)}
                    className="py-3 lg:py-4 whitespace-nowrap transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    style={{
                      ...GLASS,
                      borderRadius: 18,
                      ...(active ? { background: "#fff", color: "#000", border: "1px solid #fff" } : { color: "#fff" }),
                      fontFamily: zhDisplay,
                      fontWeight: 700,
                      fontSize: tabFont,
                      letterSpacing: track("0.4em", "0.02em"),
                      paddingLeft: track("0.4em", "0"),
                    }}
                  >
                    {pick({ zh: `${c.zh}${tx.categorySuffix}`, en: c.en })}
                  </button>
                );
              })}
            </div>
          ) : (
            // 排球沒有分頁：桌機保留這一列的高度，版面才不會跳
            <div className="hidden md:block invisible py-4" aria-hidden="true" style={{ fontSize: tabFont, border: "1px solid transparent" }}>&nbsp;</div>
          )}
        </div>

        {/* ── 左：icon ＋ 時間地點 ── */}
        <div key={`info-${sport}`} className="liscup-in grid grid-cols-2 md:grid-cols-1 md:grid-rows-2 gap-4 lg:gap-5 md:min-h-0">
          <div className="flex items-center justify-center p-4 sm:p-6 min-h-[160px] md:min-h-0" style={GLASS}>
            {iconSrc && <img src={iconSrc} alt={`LIS Cup ${tx.sports[sport]}`} className="max-w-[78%] max-h-[82%] object-contain select-none" draggable={false} />}
          </div>
          <div className="flex flex-col items-center justify-between text-center p-4 sm:p-5 min-h-[160px] md:min-h-0" style={GLASS}>
            <p className="text-white/70" style={{ fontFamily: roundFont, fontWeight: 700, fontSize: "clamp(0.85rem, 1.2vw, 1.25rem)", letterSpacing: track("0.14em", "0.06em") }}>
              {dateText}
            </p>
            <p className="text-white tabular-nums" style={{ fontFamily: roundFont, fontWeight: 800, fontSize: "clamp(2rem, min(4.4vw, 8vh), 4.4rem)", letterSpacing: "0.04em", lineHeight: 1 }}>
              {info.time}
            </p>
            <a
              href={mapUrl}
              title={tx.openMap}
              className="inline-flex items-start gap-1.5 text-white hover:underline underline-offset-4"
              style={{ fontFamily: zhFont, fontWeight: 700, fontSize: "clamp(0.72rem, 0.95vw, 0.95rem)", letterSpacing: track("0.1em", "0.01em"), lineHeight: 1.5 }}
            >
              <MapPin size={18} strokeWidth={2.4} className="shrink-0 mt-0.5" fill="currentColor" stroke={PAGE_BG} />
              {pick(info.place)}
            </a>
          </div>
        </div>

        {/* ── 右：賽程 ── */}
        <div
          key={`panel-${sport}-${category?.id ?? "none"}`}
          id="liscup-panel"
          role={hasTabs && category ? "tabpanel" : undefined}
          aria-labelledby={hasTabs && category ? `liscup-tab-${category.id}` : undefined}
          className="liscup-in md:min-h-0 overflow-hidden"
          style={GLASS}
        >
          {!info.open ? (
            <Message text={tx.notOpen} />
          ) : !category ? (
            <Message text={tx.tbd} />
          ) : (
            <>
              {/* 手機、平板：一律一場一列；桌機（1024px 以上）：淘汰賽用對戰表 */}
              <div className="lg:hidden h-full"><MatchList category={category} tx={tx} /></div>
              <div className="hidden lg:block h-full">
                {category.format === "bracket" ? <BracketView category={category} tx={tx} /> : <MatchList category={category} tx={tx} />}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── 底部切換開關：跟 Hero 頁碼同位置、同大小 ── */}
      <div className={`${docked ? "absolute" : "fixed"} z-30 left-1/2 -translate-x-1/2 bottom-6 sm:bottom-10`}>
        <SportSwitch sport={sport} onChange={changeSport} tx={tx} track={track} />
      </div>
    </section>
  );
}