import { ArrowRight, RotateCcw } from "lucide-react";
import { PageEyebrow, Reveal } from "../general/shared";
import { defineText, useI18n } from "../i18n";
import {
  useAnnouncementSearch,
  SearchStyles,
  SearchBox,
  ResultStatus,
  NoResults,
  DateOrNew,
  cardProps,
  isNew,
  highlight,
  makeSnippet,
  bigPillClass,
  SEARCH_TEXT,
} from "./newsSearch";

// 畫面文字（中英兩份）。公告內容本身的英文寫在 news.ts 的 titleEn / excerptEn…
const TEXT = defineText({
  zh: { readMore: "閱讀全文", all: "所有公告" },
  en: { readMore: "Read more", all: "All announcements" },
});

// 公告列表。兩種用法：
//   <News />            → 主頁捲動版（維持原本外觀）
//   <News standalone /> → 獨立列表頁（#/news）；多留頂部空間清掉固定 Header、撐滿一屏
// 資料來源＝ news.ts；每張卡的「閱讀全文」連到該篇文章頁 #/news/<slug>。
//
// 搜尋（跟首頁搜尋區共用 ./newsSearch.tsx）：
//   ・沒輸入 → 顯示全部公告（照 news.ts 順序）
//   ・有輸入 → 即時搜尋，依相關度排序；符合的字會標亮
//   ・搜不到 → 「沒有結果」＋「清除搜尋」按鈕
//   ・一週內新公告 → 旋轉紅藍漸層外框＋「NEW」
//
// 手機版排版（依 Figma）：
//   ┌───────────────────────────────┐
//   │ 標題  [分類]                   │
//   │ 摘要                           │
//   │                                │
//   │ 🕒 日期             [閱讀全文 →] │  ← 日期與按鈕同一列
//   └───────────────────────────────┘
// 字級：手機版整體放大一點；桌機（lg 以上）維持原本大小。
export default function News({ standalone = false }: { standalone?: boolean } = {}) {
  const { pick, localize, track } = useI18n();
  const tx = pick(TEXT);
  const stx = pick(SEARCH_TEXT);
  const { query, setQuery, searching, results, pattern, today } = useAnnouncementSearch();

  return (
    <section
      id="news"
      className={`relative bg-black px-5 sm:px-8 md:px-14 ${
        // 上內距兩種模式都用 --page-content-top（globals.css），卡片才不會壓到頁面小標題。
        standalone ? "pt-[var(--page-content-top)] pb-20 lg:pb-28 min-h-screen" : "pt-[var(--page-content-top)] pb-16 sm:pb-20 md:pb-24"
      }`}
    >
      <SearchStyles />

      <div className="max-w-[1400px] mx-auto">
        <PageEyebrow title="newsUpdates" />

        {/* 搜尋框（置中、比首頁小一號） */}
        <Reveal>
          <SearchBox value={query} onChange={setQuery} compact className="max-w-[820px] mx-auto mb-8 sm:mb-12" />
        </Reveal>

        <ResultStatus searching={searching} count={results.length} idle={tx.all} />

        {results.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            {results.map((raw, i) => {
              const item = localize(raw);
              const snippet = makeSnippet(item, pattern);
              const fresh = isNew(item.date, today);
              return (
                <div
                  key={item.slug}
                  {...cardProps(
                    fresh,
                    i,
                    "rounded-2xl p-6 md:p-8 flex flex-col justify-between gap-8 min-h-[200px] lg:min-h-[240px]",
                    "border border-white/10 hover:border-white/20 transition-colors duration-200",
                    // ＝ rgba(255,255,255,0.04) 疊在黑底上的顏色（要不透明，新公告外框才不會透進來）
                    "#0a0a0a"
                  )}
                >
                  {/* 上半：標題＋分類、摘要 */}
                  <div>
                    <div className="flex items-center gap-x-3 gap-y-2 mb-4 flex-wrap">
                      <p
                        className="text-white"
                        style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 700, fontSize: "clamp(1.2rem, 2vw, 1.3rem)", letterSpacing: track("0.09em", "0.01em") }}
                      >
                        {highlight(item.title, pattern)}
                      </p>
                      <span
                        className="shrink-0 text-white/70 text-[0.8rem] lg:text-xs px-3 py-0.5"
                        style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 400, letterSpacing: track("0.1em", "0.03em"), border: "1px solid transparent", borderRadius: "41px", background: "linear-gradient(#0d0d0d, #0d0d0d) padding-box, linear-gradient(90deg, #D14B4B 0%, #2F9EBD 100%) border-box" }}
                      >
                        {highlight(item.category, pattern)}
                      </span>
                    </div>
                    <p
                      className={`text-white/35 leading-relaxed text-[1rem] lg:text-[0.88rem] ${snippet !== item.excerpt ? "line-clamp-3" : ""}`}
                      style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 500, letterSpacing: track("0.06em", "0.005em") }}
                    >
                      {highlight(snippet, pattern)}
                    </p>
                  </div>

                  {/* 下半：日期或 NEW（左）＋閱讀全文（右），所有尺寸都同一列 */}
                  <div className="flex items-center justify-between gap-3">
                    <DateOrNew
                      date={item.date}
                      fresh={fresh}
                      iconClass="w-4 h-4 lg:w-3.5 lg:h-3.5"
                      dateClass="text-[0.95rem] lg:text-xs"
                      newClass="text-[0.95rem] lg:text-sm"
                    />
                    <a
                      href={`#/news/${item.slug}`}
                      className="shrink-0 inline-flex items-center justify-center gap-2 bg-white text-black px-5 py-2 rounded-full text-[0.95rem] lg:text-sm hover:bg-white/90 transition-all duration-200 group"
                      style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 700, letterSpacing: track("0.08em") }}
                    >
                      {tx.readMore}
                      <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <NoResults
            action={
              <button
                type="button"
                onClick={() => setQuery("")}
                className={bigPillClass}
                style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 700, letterSpacing: track("0.1em", "0.01em") }}
              >
                {stx.clear}
                <RotateCcw className="w-5 h-5 md:w-6 md:h-6 group-hover:-rotate-45 transition-transform" />
              </button>
            }
          />
        )}
      </div>
    </section>
  );
}