import { ArrowRight } from "lucide-react";
import { Reveal } from "../general/shared";
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
  zhDisplay,
} from "../latest/newsSearch";

// ══════════════════════════════════════════════════════════════════════════
// 首頁「公告搜尋區」
// 放置位置：src/ui/home-page/AnnouncementSearch.tsx（跟 Hero.tsx 同一層）
//
//   ・沒輸入關鍵字 → 顯示最新 4 篇公告（依日期排序）
//   ・有輸入       → 即時搜尋，依相關度排序
//   ・搜不到       → 「沒有結果」＋「前往近期公告」按鈕（連到 #/news）
//   ・一週內新公告 → 旋轉紅藍漸層外框＋「NEW」
//
// 搜尋邏輯、搜尋框、NEW 特效都在 ../latest/newsSearch.tsx（跟 News.tsx 共用）。
// ══════════════════════════════════════════════════════════════════════════

const LATEST_COUNT = 4;

const TEXT = defineText({
  zh: {
    heading: "系上發生什麼事？你應該知道",
    latest: "最新公告",
    readMore: "閱讀全文",
    goNews: "前往近期公告",
  },
  en: {
    heading: "What's happening in LIS? Update here.",
    latest: "Latest announcements",
    readMore: "Read more",
    goNews: "See recent announcements",
  },
});

export default function AnnouncementSearch() {
  const { pick, localize, track } = useI18n();
  const tx = pick(TEXT);
  const { query, setQuery, searching, results, pattern, today } = useAnnouncementSearch(LATEST_COUNT);

  return (
    <section id="announcements" className="relative bg-black px-5 sm:px-8 md:px-14 py-20 sm:py-28">
      <SearchStyles />

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

        <Reveal delay={80}>
          <SearchBox value={query} onChange={setQuery} className="max-w-[1100px] mx-auto" />
        </Reveal>

        <ResultStatus searching={searching} count={results.length} idle={tx.latest} />

        {results.length > 0 ? (
          <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 max-w-[1100px] mx-auto">
            {results.map((raw, i) => {
              const item = localize(raw);
              const snippet = makeSnippet(item, pattern);
              const fresh = isNew(item.date, today);
              return (
                <article
                  key={item.slug}
                  {...cardProps(
                    fresh,
                    i,
                    "rounded-2xl p-6 md:p-8 flex flex-col gap-6 min-h-[210px] lg:min-h-[240px]",
                    "border border-white/[0.06] hover:border-white/15 transition-colors duration-200",
                    "#141414"
                  )}
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
                    <DateOrNew
                      date={item.date}
                      fresh={fresh}
                      className="sm:absolute sm:left-0 sm:top-1/2 sm:-translate-y-1/2"
                    />
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
          <NoResults
            action={
              <a
                href="#/news"
                className={bigPillClass}
                style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 700, letterSpacing: track("0.1em", "0.01em") }}
              >
                {tx.goNews}
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
              </a>
            }
          />
        )}
      </div>
    </section>
  );
}