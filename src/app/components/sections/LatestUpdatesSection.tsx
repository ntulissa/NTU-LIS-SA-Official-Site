import { ArrowRight } from "lucide-react";
import { Reveal } from "./shared";
import { ANNOUNCEMENTS } from "./announcements";

// 公告列表。兩種用法：
//   <LatestUpdatesSection />            → 主頁捲動版（維持原本外觀）
//   <LatestUpdatesSection standalone /> → 獨立列表頁（#/news）；多留頂部空間清掉固定 Header、撐滿一屏
// 資料來源＝ announcements.ts；每張卡的「閱讀全文」連到該篇文章頁 #/news/<slug>。
export default function LatestUpdatesSection({ standalone = false }: { standalone?: boolean } = {}) {
  return (
    <section
      id="news"
      className={`bg-black px-5 sm:px-8 md:px-14 ${
        standalone ? "pt-28 sm:pt-32 lg:pt-32 pb-20 lg:pb-28 min-h-screen" : "py-16 sm:py-20 md:py-24"
      }`}
    >
      <div className="max-w-[1400px] mx-auto">
        <Reveal>
          <p
            className="text-white/30 text-xs tracking-widest mb-4"
            style={{
              fontSize: "14px",
              fontFamily: "'Ubuntu Sans Mono', monospace",
              background: "linear-gradient(90deg, #FFF 0%, #595959 34.13%, #FFF 67.79%, #3A3A3A 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundSize: "220% 100%",
            }}
          >
            — 最新動態・近期公告
          </p>
          <h2 className="font-bold leading-none mb-12" style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>
            <span className="text-white block">LATEST</span>
            <span style={{ color: "#D14B4B" }} className="block">UPDATES</span>
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {ANNOUNCEMENTS.map((item, i) => (
            <Reveal key={item.slug} delay={i * 60}>
              <div
                className="rounded-2xl border border-white/10 p-5 sm:p-6 md:p-8 flex flex-col justify-between gap-5 sm:gap-6 hover:border-white/20 transition-colors duration-200"
                style={{ background: "rgba(255,255,255,0.04)", minHeight: "240px" }}
              >
                <div>
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <p className="text-white" style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 700, fontSize: "clamp(1rem, 2vw, 1.3rem)", letterSpacing: "0.09em" }}>
                      {item.title}
                    </p>
                    <span
                      className="shrink-0 text-white/70 text-xs px-3 py-0.5"
                      style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 400, letterSpacing: "0.1em", border: "1px solid transparent", borderRadius: "41px", background: "linear-gradient(#0d0d0d, #0d0d0d) padding-box, linear-gradient(90deg, #D14B4B 0%, #2F9EBD 100%) border-box" }}
                    >
                      {item.category}
                    </span>
                  </div>
                  <p className="text-white/35 leading-relaxed" style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 500, fontSize: "0.88rem" }}>
                    {item.excerpt}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 16 16" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="1.5" className="w-3.5 h-3.5">
                      <circle cx="8" cy="8" r="6.5" />
                      <path d="M8 4.5V8l2.5 2" strokeLinecap="round" />
                    </svg>
                    <span className="text-white/35 text-xs" style={{ fontFamily: "'Ubuntu Sans Mono', monospace" }}>
                      {item.date}
                    </span>
                  </div>
                  <a
                    href={`#/news/${item.slug}`}
                    className="inline-flex items-center justify-center gap-2 bg-white text-black px-5 py-2 rounded-full text-sm hover:bg-white/90 transition-all duration-200 group w-fit"
                    style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 700, letterSpacing: "0.08em" }}
                  >
                    閱讀全文
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}