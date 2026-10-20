import { useDeferredValue, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import { Reveal } from "../general/shared";
import { ANNOUNCEMENTS, type Announcement } from "../latest/news.ts";
import { defineText, useI18n } from "../i18n";

// ══════════════════════════════════════════════════════════════════════════
// 首頁「公告搜尋區」
// 放置位置：src/ui/home-page/AnnouncementSearch.tsx（跟 Hero.tsx 同一層）
//
// 功能：
//   ・沒輸入關鍵字 → 顯示最新 4 篇公告（依日期排序）
//   ・有輸入       → 即時搜尋（邊打邊篩選），依相關度排序
//   ・搜不到       → 顯示「沒有結果」＋「前往近期公告」按鈕（連到 #/news）
//
// 搜尋範圍（資料庫＝ news.ts，中英文欄位都會搜）：
//   標題（最重要）＞ 主責部門 category ＞ 摘要／內文／作者／日期
//   ・多個關鍵字用空白隔開 ＝ 每個關鍵字都要符合（例：「行政部 鑰匙」）
//   ・忽略大小寫、全形半形、空白（「第53屆」也找得到「第 53 屆」）
//   ・符合的字會用紅藍漸層底色標亮；若關鍵字只出現在內文，卡片會改顯示內文那一段
//
// 快捷鍵：按 Esc 清除搜尋。
// ══════════════════════════════════════════════════════════════════════════

const GRADIENT = "linear-gradient(90deg, #D14B4B 0%, #2F9EBD 100%)";
const LATEST_COUNT = 4;
// 跟首頁其他區塊（Upcoming.tsx）同一套標題字體
const zhDisplay = "'Chiron Hei HK Text', 'Noto Sans TC', sans-serif";

const TEXT = defineText({
  zh: {
    heading: "系上發生什麼事？你應該知道",
    placeholder: "請搜尋部門名稱或其他關鍵字",
    searchLabel: "搜尋公告",
    clear: "清除搜尋",
    latest: "最新公告",
    resultPrefix: "共 ",
    resultSuffix: " 篇相關公告",
    readMore: "閱讀全文",
    noResult: "沒有結果",
    noResultHint: "換個關鍵字試試，或直接看看所有公告",
    goNews: "前往近期公告",
  },
  en: {
    heading: "What's happening in LIS? Here's what you should know",
    placeholder: "Search by department or keyword",
    searchLabel: "Search announcements",
    clear: "Clear search",
    latest: "Latest announcements",
    resultPrefix: "",
    resultSuffix: " matching results",
    readMore: "Read more",
    noResult: "No results",
    noResultHint: "Try another keyword, or browse all announcements",
    goNews: "See recent announcements",
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

function latest(n: number): Announcement[] {
  return [...ANNOUNCEMENTS].sort(byDateDesc).slice(0, n);
}

function search(terms: string[]): Announcement[] {
  const scored: { item: Announcement; score: number }[] = [];
  for (const row of INDEX) {
    let score = 0;
    let allMatch = true;
    for (const t of terms) {
      let s = 0;
      if (row.title.includes(t)) s += 10;
      if (row.category.includes(t)) s += 6;
      if (row.body.includes(t)) s += 1;
      if (s === 0) {
        allMatch = false;
        break;
      }
      score += s;
    }
    if (allMatch) scored.push({ item: row.item, score });
  }
  return scored
    .sort((a, b) => b.score - a.score || byDateDesc(a.item, b.item))
    .map((r) => r.item);
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

function highlight(text: string, pattern: string | null): ReactNode {
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
function makeSnippet(item: Announcement, pattern: string | null): string {
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

// ── 元件 ──────────────────────────────────────────────────────────────────

export default function AnnouncementSearch() {
  const { pick, localize, track } = useI18n();
  const tx = pick(TEXT);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  // 讓打字保持順暢：搜尋結果晚一拍更新
  const deferred = useDeferredValue(query);

  const terms = useMemo(
    () => deferred.split(/\s+/).map(norm).filter(Boolean),
    [deferred]
  );
  const searching = terms.length > 0;
  const results = useMemo(
    () => (searching ? search(terms) : latest(LATEST_COUNT)),
    [terms, searching]
  );
  const pattern = useMemo(() => (searching ? buildPattern(deferred) : null), [deferred, searching]);

  const clear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <section
      id="announcements"
      className="relative bg-black px-5 sm:px-8 md:px-14 py-20 sm:py-28"
    >
      {/* 卡片淡入動畫（使用者關閉動畫時不播） */}
      <style>{`
        @keyframes annIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        .ann-in { animation: annIn .4s cubic-bezier(.2,.7,.2,1) both; }
        @media (prefers-reduced-motion: reduce) { .ann-in { animation: none; } }
      `}</style>

      <div className="max-w-[1200px] mx-auto">
        {/* 大標題（樣式同 Upcoming.tsx 的區塊標題） */}
        <Reveal>
          <h2
            className="text-center text-white mb-10 sm:mb-16"
            style={{
              fontFamily: zhDisplay,
              fontWeight: 700,
              fontSize: "clamp(1.2rem, 4vw, 3rem)",
              letterSpacing: track("0.06em", "0.01em"),
              lineHeight: 1.3,
            }}
          >
            {tx.heading}
          </h2>
        </Reveal>

        {/* 搜尋框：無填色＋紅藍漸層外框 */}
        <Reveal delay={80}>
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            inputRef.current?.blur(); // 手機按「搜尋」後收起鍵盤
          }}
          className="max-w-[1100px] mx-auto"
        >
          <div
            className="rounded-full transition-shadow duration-300 focus-within:shadow-[0_0_32px_rgba(47,158,189,0.22)]"
            style={{
              border: "3px solid transparent",
              background: `linear-gradient(#000, #000) padding-box, ${GRADIENT} border-box`,
            }}
          >
            <label className="flex items-center gap-3 sm:gap-4 md:gap-5 h-14 sm:h-16 md:h-[68px] pl-5 pr-3 sm:pl-7 md:pl-10 sm:pr-5 cursor-text">
              <Search
                className="shrink-0 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white/45"
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
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setQuery("");
                }}
                placeholder={tx.placeholder}
                className="flex-1 min-w-0 bg-transparent outline-none text-white placeholder:text-white/35 [&::-webkit-search-cancel-button]:appearance-none"
                style={{
                  fontFamily: "'Noto Sans TC', sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(1rem, 1.8vw, 1.3rem)",
                  letterSpacing: track("0.1em", "0.01em"),
                }}
              />
              {query && (
                <button
                  type="button"
                  onClick={clear}
                  aria-label={tx.clear}
                  className="shrink-0 w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              )}
            </label>
          </div>
        </form>
        </Reveal>

        {/* 結果數：畫面上隱藏（不佔空間），只給螢幕報讀器念出來 */}
        <p aria-live="polite" className="sr-only">
          {searching
            ? results.length > 0
              ? `${tx.resultPrefix}${results.length}${tx.resultSuffix}`
              : tx.noResult
            : tx.latest}
        </p>

        {/* 結果 */}
        {results.length > 0 ? (
          <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 max-w-[1100px] mx-auto">
            {results.map((raw, i) => {
              const item = localize(raw);
              const snippet = makeSnippet(item, pattern);
              return (
                <article
                  key={item.slug}
                  className="ann-in rounded-2xl border border-white/[0.06] hover:border-white/15 transition-colors duration-200 p-6 md:p-8 flex flex-col gap-6 min-h-[210px] lg:min-h-[240px]"
                  style={{ background: "#141414", animationDelay: `${Math.min(i, 8) * 50}ms` }}
                >
                  <h3
                    className="text-center text-white"
                    style={{
                      fontFamily: "'Noto Sans TC', sans-serif",
                      fontWeight: 700,
                      fontSize: "clamp(1.15rem, 2vw, 1.45rem)",
                      letterSpacing: track("0.1em", "0.01em"),
                      lineHeight: 1.5,
                    }}
                  >
                    {highlight(item.title, pattern)}
                  </h3>

                  <p
                    className="text-center text-white/40 line-clamp-2 text-[0.95rem] lg:text-[0.9rem]"
                    style={{
                      fontFamily: "'Noto Sans TC', sans-serif",
                      fontWeight: 500,
                      letterSpacing: track("0.08em", "0.005em"),
                      lineHeight: 2,
                    }}
                  >
                    {highlight(snippet, pattern)}
                  </p>

                  {/* 底部：手機＝日期左、按鈕右；平板以上＝日期靠左、按鈕置中（依 Figma） */}
                  <div className="mt-auto relative flex items-center justify-between sm:justify-center gap-3">
                    <div className="flex items-center gap-2 min-w-0 sm:absolute sm:left-0 sm:top-1/2 sm:-translate-y-1/2">
                      <svg viewBox="0 0 16 16" className="w-4 h-4 shrink-0" aria-hidden="true">
                        <circle cx="8" cy="8" r="7" fill="white" fillOpacity="0.35" />
                        <path d="M8 4.5V8l2.5 2" fill="none" stroke="black" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <time
                        className="text-white/35 text-[0.9rem] sm:text-sm truncate"
                        style={{ fontFamily: "'Ubuntu Sans Mono', monospace", letterSpacing: "0.1em" }}
                      >
                        {item.date}
                      </time>
                    </div>
                    <a
                      href={`#/news/${item.slug}`}
                      className="shrink-0 inline-flex items-center justify-center gap-2 bg-white text-black px-5 py-2 rounded-full text-[0.95rem] lg:text-sm hover:bg-white/90 active:scale-[0.97] transition-all duration-200 group"
                      style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 700, letterSpacing: track("0.08em") }}
                    >
                      {tx.readMore}
                      <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          // 沒有結果
          <div className="ann-in flex flex-col items-center text-center py-20 md:py-28">
            <p
              className="text-white/45"
              style={{
                fontFamily: "'Noto Sans TC', sans-serif",
                fontWeight: 900,
                fontSize: "clamp(2.6rem, 7vw, 5rem)",
                letterSpacing: track("0.12em", "0.02em"),
              }}
            >
              {tx.noResult}
            </p>
            <p
              className="text-white/35 text-sm md:text-base mt-3"
              style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 500, letterSpacing: track("0.08em", "0.01em") }}
            >
              {tx.noResultHint}
            </p>
            <a
              href="#/news"
              className="mt-10 inline-flex items-center gap-3 bg-white text-black px-7 md:px-9 py-3 md:py-4 rounded-full text-base md:text-xl hover:bg-white/90 active:scale-[0.97] transition-all duration-200 group"
              style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 700, letterSpacing: track("0.1em", "0.01em") }}
            >
              {tx.goNews}
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}