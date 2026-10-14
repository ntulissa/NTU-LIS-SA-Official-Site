import { ArrowRight } from "lucide-react";
import { PageEyebrow, Reveal } from "../general/shared";
import { ANNOUNCEMENTS } from "./news.ts";
import { defineText, useI18n } from "../i18n";

// 畫面文字（中英兩份）。公告內容本身的英文寫在 news.ts 的 titleEn / excerptEn…
const TEXT = defineText({
  zh: { readMore: "閱讀全文" },
  en: { readMore: "Read more" },
});

// 公告列表。兩種用法：
//   <News />            → 主頁捲動版（維持原本外觀）
//   <News standalone /> → 獨立列表頁（#/news）；多留頂部空間清掉固定 Header、撐滿一屏
// 資料來源＝ news.ts；每張卡的「閱讀全文」連到該篇文章頁 #/news/<slug>。
//
// 手機版排版（依 Figma）：
//   ┌───────────────────────────────┐
//   │ 標題  [分類]                   │
//   │ 摘要                           │
//   │                                │
//   │ 🕒 日期             [閱讀全文 →] │  ← 日期與按鈕同一列（原本是上下堆疊）
//   └───────────────────────────────┘
// 字級：手機版整體放大一點；桌機（lg 以上）維持原本大小。
export default function News({ standalone = false }: { standalone?: boolean } = {}) {
  const { pick, localize, track } = useI18n();
  const tx = pick(TEXT);
  return (
    <section
      id="news"
      className={`relative bg-black px-5 sm:px-8 md:px-14 ${
        // 上內距兩種模式都用 --page-content-top（globals.css），卡片才不會壓到頁面小標題。
        standalone ? "pt-[var(--page-content-top)] pb-20 lg:pb-28 min-h-screen" : "pt-[var(--page-content-top)] pb-16 sm:pb-20 md:pb-24"
      }`}
    >
      <div className="max-w-[1400px] mx-auto">
        <PageEyebrow title="newsUpdates" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {ANNOUNCEMENTS.map((raw, i) => {
            const item = localize(raw);
            return (
              <Reveal key={item.slug} delay={i * 60}>
                <div
                  className="rounded-2xl border border-white/10 p-6 md:p-8 flex flex-col justify-between gap-8 min-h-[200px] lg:min-h-[240px] hover:border-white/20 transition-colors duration-200"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  {/* 上半：標題＋分類、摘要 */}
                  <div>
                    <div className="flex items-center gap-x-3 gap-y-2 mb-4 flex-wrap">
                      <p
                        className="text-white"
                        style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 700, fontSize: "clamp(1.2rem, 2vw, 1.3rem)", letterSpacing: track("0.09em", "0.01em") }}
                      >
                        {item.title}
                      </p>
                      <span
                        className="shrink-0 text-white/70 text-[0.8rem] lg:text-xs px-3 py-0.5"
                        style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 400, letterSpacing: track("0.1em", "0.03em"), border: "1px solid transparent", borderRadius: "41px", background: "linear-gradient(#0d0d0d, #0d0d0d) padding-box, linear-gradient(90deg, #D14B4B 0%, #2F9EBD 100%) border-box" }}
                      >
                        {item.category}
                      </span>
                    </div>
                    <p
                      className="text-white/35 leading-relaxed text-[1rem] lg:text-[0.88rem]"
                      style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 500, letterSpacing: track("0.06em", "0.005em") }}
                    >
                      {item.excerpt}
                    </p>
                  </div>

                  {/* 下半：日期（左）＋閱讀全文（右），所有尺寸都同一列 */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {/* 實心時鐘圖示（依 Figma） */}
                      <svg viewBox="0 0 16 16" className="w-4 h-4 lg:w-3.5 lg:h-3.5 shrink-0" aria-hidden="true">
                        <circle cx="8" cy="8" r="7" fill="white" fillOpacity="0.35" />
                        <path d="M8 4.5V8l2.5 2" fill="none" stroke="black" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span
                        className="text-white/35 text-[0.95rem] lg:text-xs truncate"
                        style={{ fontFamily: "'Ubuntu Sans Mono', monospace", letterSpacing: "0.08em" }}
                      >
                        {item.date}
                      </span>
                    </div>
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
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}