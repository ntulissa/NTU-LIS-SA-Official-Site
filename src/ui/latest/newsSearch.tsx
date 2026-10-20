import { useDeferredValue, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Search, X } from "lucide-react";
import { ANNOUNCEMENTS, type Announcement } from "./news.ts";
import { defineText, useI18n } from "../i18n";

// ══════════════════════════════════════════════════════════════════════════
// 公告搜尋 & 新公告特效（共用模組）
// 放置位置：src/ui/latest/newsSearch.tsx（跟 news.ts、News.tsx 同一層）
//
// 誰在用：
//   ・首頁搜尋區  home-page/AnnouncementSearch.tsx
//   ・公告列表頁  latest/News.tsx
//   → 改這裡，兩邊會一起變。
//
// 搜尋範圍（資料庫＝ news.ts，中英文欄位都會搜）：
//   標題（最重要）＞ 主責部門 category ＞ 摘要／內文／作者／日期
// 結果排序：一週內新公告 ＞ 關鍵字符合次數 ＞ 公告日期（詳見 search()）
//   ・多個關鍵字用空白隔開 ＝ 每個關鍵字都要符合（例：「行政部 鑰匙」）
//   ・忽略大小寫、全形半形、空白（「第53屆」也找得到「第 53 屆」）
//   ・符合的字用紅藍漸層底色標亮；關鍵字只在內文時，卡片改顯示內文那一段
//
// 新公告：發布 NEW_DAYS 天內 → 卡片外框旋轉紅藍漸層、日期改顯示「NEW」
// ══════════════════════════════════════════════════════════════════════════

// ✏️ 可調整的數字
export const NEW_DAYS = 7;          // 幾天內的公告算「NEW」
const NEW_SPIN_SECONDS = 4;         // 新公告外框轉一圈幾秒（數字越大轉越慢）

export const GRADIENT = "linear-gradient(90deg, #D14B4B 0%, #2F9EBD 100%)";
export const zhDisplay = "'Chiron Hei HK Text', 'Noto Sans TC', sans-serif";
const zhFont = "'Noto Sans TC', sans-serif";

export const SEARCH_TEXT = defineText({
  zh: {
    placeholder: "請搜尋部門名稱或其他關鍵字",
    searchLabel: "搜尋公告",
    clear: "清除搜尋",
    resultPrefix: "共 ",
    resultSuffix: " 篇相關公告",
    noResult: "沒有結果",
    noResultHint: "換個關鍵字試試，或直接看看所有公告",
    newLabel: "新公告，發布於",
  },
  en: {
    placeholder: "Search by department or keyword",
    searchLabel: "Search announcements",
    clear: "Clear search",
    resultPrefix: "",
    resultSuffix: " matching results",
    noResult: "No results",
    noResultHint: "Try another keyword, or browse all announcements",
    newLabel: "New, posted on",
  },
});

// ── 搜尋邏輯 ──────────────────────────────────────────────────────────────

// 統一格式：全形→半形、轉小寫、拿掉所有空白
const norm = (s: string) => s.normalize("NFKC").toLowerCase().replace(/\s+/g, "");

// 每篇公告預先整理好要搜的文字（資料是固定的，只需算一次）
const INDEX = ANNOUNCEMENTS.map((a) => ({
  item: a,
  title: norm([a.title, a.titleEn ?? ""].join(" ")),
  category: norm([a.category, a.categoryEn ?? ""].join(" ")),
  body: norm(
    [
      a.excerpt,
      a.excerptEn ?? "",
      ...a.paragraphs,
      ...(a.paragraphsEn ?? []),
      a.author,
      a.authorEn ?? "",
      a.date,
    ].join(" ")
  ),
}));

const byDateDesc = (a: Announcement, b: Announcement) => b.date.localeCompare(a.date);

// 關鍵字在一段文字裡出現幾次
const countOf = (hay: string, t: string) => hay.split(t).length - 1;

// 每個欄位的權重：出現在標題比出現在內文重要
const WEIGHT = { title: 10, category: 6, body: 1 };

/**
 * 搜尋結果的排序（依序比較，前一項一樣才看下一項）：
 *   1) 一週內的新公告排最前面
 *   2) 符合程度：關鍵字出現越多次越前面（標題 ×10、分類 ×6、摘要／內文 ×1）
 *   3) 公告日期：越新越前面
 */
function search(terms: string[], today: Date): Announcement[] {
  const scored: { item: Announcement; fresh: boolean; score: number }[] = [];
  for (const row of INDEX) {
    let score = 0;
    let allMatch = true;
    for (const t of terms) {
      const s =
        countOf(row.title, t) * WEIGHT.title +
        countOf(row.category, t) * WEIGHT.category +
        countOf(row.body, t) * WEIGHT.body;
      if (s === 0) {
        allMatch = false; // 有一個關鍵字完全沒出現 → 這篇不算
        break;
      }
      score += s;
    }
    if (allMatch) scored.push({ item: row.item, fresh: isNew(row.item.date, today), score });
  }
  return scored
    .sort(
      (a, b) =>
        Number(b.fresh) - Number(a.fresh) || // 1) 新公告優先
        b.score - a.score ||                 // 2) 符合越多越前面
        byDateDesc(a.item, b.item)           // 3) 日期越新越前面
    )
    .map((r) => r.item);
}

/**
 * 搜尋狀態 hook。
 *   emptyLimit 有填（例：4）→ 沒輸入時顯示最新 N 篇（依日期排序）
 *   emptyLimit 沒填        → 沒輸入時顯示全部（照 news.ts 的順序）
 */
export function useAnnouncementSearch(emptyLimit?: number) {
  const [query, setQuery] = useState("");
  // 讓打字保持順暢：搜尋結果晚一拍更新
  const deferred = useDeferredValue(query);
  const today = useMemo(() => new Date(), []);

  const terms = useMemo(() => deferred.split(/\s+/).map(norm).filter(Boolean), [deferred]);
  const searching = terms.length > 0;
  const results = useMemo(() => {
    if (searching) return search(terms, today);
    if (emptyLimit) return [...ANNOUNCEMENTS].sort(byDateDesc).slice(0, emptyLimit);
    return ANNOUNCEMENTS;
  }, [terms, searching, emptyLimit, today]);
  const pattern = useMemo(() => (searching ? buildPattern(deferred) : null), [deferred, searching]);

  return { query, setQuery, searching, results, pattern, today };
}

// ── 是否為新公告（發布 NEW_DAYS 天內，含今天）──────────────────────────────
// 日期格式同 news.ts："2026.10.17"
export function isNew(date: string, today: Date): boolean {
  const [y, m, d] = date.split(".").map(Number);
  if (!y || !m || !d) return false;
  const posted = new Date(y, m - 1, d);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.round((start.getTime() - posted.getTime()) / 86_400_000);
  return diffDays >= 0 && diffDays < NEW_DAYS;
}

// ── 標亮 & 摘要片段 ────────────────────────────────────────────────────────

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function buildPattern(raw: string): string | null {
  const parts = raw
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length) // 長的先比對，避免被短的切斷
    .map(escapeRe);
  return parts.length ? parts.join("|") : null;
}

export function highlight(text: string, pattern: string | null): ReactNode {
  if (!pattern) return text;
  // 有括號的 split：奇數位置就是符合的字
  return text.split(new RegExp(`(${pattern})`, "gi")).map((part, i) =>
    i % 2 === 1 ? (
      <mark
        key={i}
        className="text-white rounded-[4px]"
        style={{
          background: "linear-gradient(90deg, rgba(209,75,75,0.45), rgba(47,158,189,0.45))",
          boxDecorationBreak: "clone",
          WebkitBoxDecorationBreak: "clone",
        }}
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

// 關鍵字在摘要裡 → 顯示摘要；只在內文裡 → 顯示內文中那一段（前面留一點上下文）
export function makeSnippet(item: Announcement, pattern: string | null): string {
  if (!pattern) return item.excerpt;
  const re = new RegExp(pattern, "i");
  if (re.test(item.excerpt)) return item.excerpt;
  for (const p of item.paragraphs) {
    const m = re.exec(p);
    if (m) {
      const start = Math.max(0, m.index - 18);
      return (start > 0 ? "…" : "") + p.slice(start).trim();
    }
  }
  return item.excerpt;
}

// ── 卡片外觀 ──────────────────────────────────────────────────────────────

/** 動畫用 CSS：每個用到搜尋的頁面放一次 <SearchStyles />。 */
export function SearchStyles() {
  return (
    <style>{`
      @keyframes annIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
      .ann-in { animation: annIn .4s cubic-bezier(.2,.7,.2,1) both; }

      /* 新公告：conic-gradient 畫紅藍外框，再轉動角度變數 --ann-angle 做出旋轉效果 */
      @property --ann-angle { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
      @keyframes annSpin { to { --ann-angle: 360deg; } }
      .ann-new {
        border: 2px solid transparent;
        background:
          linear-gradient(var(--ann-bg, #141414), var(--ann-bg, #141414)) padding-box,
          conic-gradient(from var(--ann-angle), #D14B4B, #2F9EBD, #D14B4B) border-box;
        animation: annIn .4s cubic-bezier(.2,.7,.2,1) both, annSpin ${NEW_SPIN_SECONDS}s linear infinite;
      }

      /* 使用者關閉動畫：不播，外框改成靜止的上紅下藍 */
      @media (prefers-reduced-motion: reduce) {
        .ann-in { animation: none; }
        .ann-new {
          animation: none;
          background:
            linear-gradient(var(--ann-bg, #141414), var(--ann-bg, #141414)) padding-box,
            linear-gradient(180deg, #D14B4B, #2F9EBD) border-box;
        }
      }
    `}</style>
  );
}

/**
 * 卡片的 className / style。
 *   base   兩種卡片都有的 class（圓角、內距、排版）
 *   normal 一般卡片才有的 class（灰色外框、hover）
 *   bg     卡片底色（★ 要用不透明的色碼，新公告的漸層外框才不會透進來）
 */
export function cardProps(fresh: boolean, index: number, base: string, normal: string, bg: string) {
  return {
    className: `${base} ${fresh ? "ann-new" : `ann-in ${normal}`}`,
    style: {
      "--ann-bg": bg,
      ...(fresh ? {} : { background: bg }),
      animationDelay: `${Math.min(index, 8) * 50}ms`,
    } as CSSProperties,
  };
}

/** 時鐘＋日期；新公告改顯示白色「NEW」（螢幕報讀器仍會念出日期）。 */
export function DateOrNew({
  date,
  fresh,
  className = "",
  iconClass = "w-4 h-4",
  dateClass = "text-[0.9rem] sm:text-sm",
  newClass = "text-[0.95rem] sm:text-base",
}: {
  date: string;
  fresh: boolean;
  className?: string;
  iconClass?: string;
  dateClass?: string;
  newClass?: string;
}) {
  const { pick } = useI18n();
  const tx = pick(SEARCH_TEXT);
  const iso = date.replace(/\./g, "-");
  return (
    <div className={`flex items-center gap-2 min-w-0 ${className}`}>
      <svg viewBox="0 0 16 16" className={`${iconClass} shrink-0`} aria-hidden="true">
        <circle cx="8" cy="8" r="7" fill="white" fillOpacity={fresh ? 1 : 0.35} />
        <path d="M8 4.5V8l2.5 2" fill="none" stroke="black" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {fresh ? (
        <time dateTime={iso}>
          <span
            aria-hidden="true"
            className={`text-white ${newClass}`}
            style={{ fontFamily: zhDisplay, fontWeight: 900, letterSpacing: "0.15em" }}
          >
            NEW
          </span>
          <span className="sr-only">{`${tx.newLabel} ${date}`}</span>
        </time>
      ) : (
        <time
          dateTime={iso}
          className={`text-white/35 truncate ${dateClass}`}
          style={{ fontFamily: "'Ubuntu Sans Mono', monospace", letterSpacing: "0.1em" }}
        >
          {date}
        </time>
      )}
    </div>
  );
}

// ── 搜尋框 ────────────────────────────────────────────────────────────────

/**
 * 紅藍漸層外框的搜尋框。
 *   compact → 比較小的尺寸（公告列表頁用）
 */
export function SearchBox({
  value,
  onChange,
  compact = false,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  compact?: boolean;
  className?: string;
}) {
  const { pick, track } = useI18n();
  const tx = pick(SEARCH_TEXT);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        inputRef.current?.blur(); // 手機按「搜尋」後收起鍵盤
      }}
      className={className}
    >
      <div
        className="rounded-full transition-shadow duration-300 focus-within:shadow-[0_0_32px_rgba(47,158,189,0.22)]"
        style={{
          border: `${compact ? 2.5 : 3}px solid transparent`,
          background: `linear-gradient(#000, #000) padding-box, ${GRADIENT} border-box`,
        }}
      >
        <label
          className={`flex items-center gap-3 sm:gap-4 cursor-text pr-3 sm:pr-4 ${
            compact
              ? "h-12 sm:h-14 pl-5 sm:pl-6 md:pl-7"
              : "h-14 sm:h-16 md:h-[68px] pl-5 sm:pl-7 md:pl-10 md:gap-5 sm:pr-5"
          }`}
        >
          <Search
            className={`shrink-0 text-white/45 ${compact ? "w-5 h-5 sm:w-6 sm:h-6" : "w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7"}`}
            strokeWidth={2}
            aria-hidden="true"
          />
          <span className="sr-only">{tx.searchLabel}</span>
          <input
            ref={inputRef}
            type="search"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onChange("");
            }}
            placeholder={tx.placeholder}
            className="flex-1 min-w-0 bg-transparent outline-none text-white placeholder:text-white/35 [&::-webkit-search-cancel-button]:appearance-none"
            style={{
              fontFamily: zhFont,
              fontWeight: 700,
              fontSize: compact ? "clamp(0.95rem, 1.4vw, 1.1rem)" : "clamp(1rem, 1.8vw, 1.3rem)",
              letterSpacing: track("0.1em", "0.01em"),
            }}
          />
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                inputRef.current?.focus();
              }}
              aria-label={tx.clear}
              className={`shrink-0 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors ${
                compact ? "w-9 h-9" : "w-9 h-9 md:w-11 md:h-11"
              }`}
            >
              <X className={compact ? "w-5 h-5" : "w-5 h-5 md:w-6 md:h-6"} />
            </button>
          )}
        </label>
      </div>
    </form>
  );
}

/** 結果數：畫面上隱藏（不佔空間），只給螢幕報讀器念出來。 */
export function ResultStatus({ searching, count, idle }: { searching: boolean; count: number; idle: string }) {
  const { pick } = useI18n();
  const tx = pick(SEARCH_TEXT);
  return (
    <p aria-live="polite" className="sr-only">
      {searching ? (count > 0 ? `${tx.resultPrefix}${count}${tx.resultSuffix}` : tx.noResult) : idle}
    </p>
  );
}

/** 「沒有結果」畫面；action＝底下的按鈕（每頁不同）。 */
export function NoResults({ action }: { action: ReactNode }) {
  const { pick, track } = useI18n();
  const tx = pick(SEARCH_TEXT);
  return (
    <div className="ann-in flex flex-col items-center text-center py-20 md:py-28">
      <p
        className="text-white/45"
        style={{ fontFamily: zhFont, fontWeight: 900, fontSize: "clamp(2.6rem, 7vw, 5rem)", letterSpacing: track("0.12em", "0.02em") }}
      >
        {tx.noResult}
      </p>
      <p
        className="text-white/35 text-sm md:text-base mt-3"
        style={{ fontFamily: zhFont, fontWeight: 500, letterSpacing: track("0.08em", "0.01em") }}
      >
        {tx.noResultHint}
      </p>
      <div className="mt-10">{action}</div>
    </div>
  );
}

/** 「沒有結果」底下的白色大按鈕樣式（a 或 button 都能用）。 */
export const bigPillClass =
  "inline-flex items-center gap-3 bg-white text-black px-7 md:px-9 py-3 md:py-4 rounded-full text-base md:text-xl hover:bg-white/90 active:scale-[0.97] transition-all duration-200 group";