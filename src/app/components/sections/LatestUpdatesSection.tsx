import { ArrowRight } from "lucide-react";
import { Reveal } from "./shared";

const NEWS_ITEMS = [
  {
    title: "B14~15 系學會發表會",
    body: "系學會將在開學日舉辦發表會。將帶你快速熟悉系上資源、找到專屬夥伴與「大學生活避風港」的快速通關指南",
    date: "2026.08.12",
  },
  {
    title: "第 52 屆系學會卸任公告",
    body: "親愛的圖資系同學們、老師與系友們：超過一半的大學生涯，四百多個日夜。第 52 屆系學會團隊的旅程，在今天正式劃下圓滿的句點。",
    date: "2026.07.30",
  },
  {
    title: "第53屆正副會長選舉開票結果",
    body: "本會於本月 1 日進行正副會長改選。本次選舉由圖資二黃子芸、圖資二洪聆雅當選。",
    date: "2026.06.01",
  },
  {
    title: "系學會獲得社團評鑑自治組優等",
    body: "在剛落幕的 114 學年度臺大全校社團評鑑中，臺大圖資系學會在全校眾多自治組織中脫穎而出，勇奪「自治性社團組 — 優等」的殊榮",
    date: "2026.05.20",
  },
];

export default function LatestUpdatesSection() {
  return (
    <section id="news" className="bg-black px-6 md:px-14 py-24">
      <div className="max-w-[1400px] mx-auto">
        <Reveal>
          <p className="text-white/30 text-xs tracking-widest mb-4" style={{ fontFamily: "'Ubuntu Sans Mono', monospace" }}>
            — NEWS 最新動態
          </p>
          <h2 className="font-bold leading-none mb-12" style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>
            <span className="text-white block">LATEST</span>
            <span style={{ color: "#D14B4B" }} className="block">UPDATES</span>
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {NEWS_ITEMS.map((item, i) => (
            <Reveal key={item.title} delay={i * 60}>
              <div className="rounded-2xl border border-white/10 p-6 md:p-8 flex flex-col justify-between gap-6 hover:border-white/20 transition-colors duration-200" style={{ background: "rgba(255,255,255,0.04)", minHeight: "220px" }}>
                <div>
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <p className="text-white" style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 700, fontSize: "clamp(1rem, 2vw, 1.3rem)" }}>
                      {item.title}
                    </p>
                    <span className="shrink-0 text-white/70 text-xs px-3 py-0.5" style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 400, letterSpacing: "0.1em", border: "1px solid transparent", borderRadius: "41px", background: "linear-gradient(#0d0d0d, #0d0d0d) padding-box, linear-gradient(90deg, #D14B4B 0%, #2F9EBD 100%) border-box" }}>
                      公告
                    </span>
                  </div>
                  <p className="text-white/35 leading-relaxed" style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 500, fontSize: "0.88rem" }}>
                    {item.body}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 16 16" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="1.5" className="w-3.5 h-3.5">
                      <circle cx="8" cy="8" r="6.5" />
                      <path d="M8 4.5V8l2.5 2" strokeLinecap="round" />
                    </svg>
                    <span className="text-white/35 text-xs" style={{ fontFamily: "'Ubuntu Sans Mono', monospace" }}>
                      {item.date}
                    </span>
                  </div>
                  <a href="#" className="inline-flex items-center gap-2 bg-white text-black px-5 py-2 rounded-full text-sm hover:bg-white/90 transition-all duration-200 group" style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 700, letterSpacing: "0.08em" }}>
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
