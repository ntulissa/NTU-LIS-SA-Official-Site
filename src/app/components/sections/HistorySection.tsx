import { useState } from "react";
import imgBuildingHistory from "@/imports/OurHistory/de7749452570d864c1f5c584765f093ab16a6d89.png";
import svgHistoryPaths from "@/imports/OurHistory/svg-qfpi1b2b0n";
import { Reveal } from "./shared";

const HISTORY_EVENTS = [
  { date: "1974", title: "圖書資訊學系正式創立", tag: "建系紀念 1974", link: "#" },
  { date: "1990s", title: "學生自治雛型萌芽", tag: "自治萌芽期", link: "#" },
  { date: "2022.09.01", title: "系學會正式成立暨創立大會", tag: "創會紀念 2022", link: "#" },
  { date: "2023.03.18", title: "學術交流座談：AI 與圖書館", tag: "學術交流 2023", link: "#" },
  { date: "2024.05.01", title: "小圖盃首屆系際運動會", tag: "圖資運動會 2024", link: "#" },
  { date: "2025.10.15", title: "系學會年度成果展暨頒獎典禮", tag: "年度成果展 2025", link: "#" },
  { date: "2026.04.29", title: "圖資之夜睽違四年再次舉辦", tag: '圖資之夜 2026 "Vellichor"', link: "#" },
];

export default function HistorySection() {
  const total = HISTORY_EVENTS.length;
  const [activeIdx, setActiveIdx] = useState(total - 1);
  const [animPhase, setAnimPhase] = useState<"shown" | "hiding" | "showing">("shown");
  const [animDir, setAnimDir] = useState<"up" | "down">("down");

  function goTo(nextIdx: number, dir: "up" | "down") {
    if (animPhase !== "shown" || nextIdx < 0 || nextIdx >= total) return;
    setAnimDir(dir);
    setAnimPhase("hiding");
    setTimeout(() => {
      setActiveIdx(nextIdx);
      setAnimPhase("showing");
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimPhase("shown")));
    }, 220);
  }

  const ev = HISTORY_EVENTS[activeIdx];
  const contentStyle: React.CSSProperties = (() => {
    const ease = "opacity 220ms ease, transform 220ms ease";
    if (animPhase === "shown") return { opacity: 1, transform: "translateY(0)", transition: ease };
    if (animPhase === "hiding") return { opacity: 0, transform: `translateY(${animDir === "down" ? "-28px" : "28px"})`, transition: ease };
    return { opacity: 0, transform: `translateY(${animDir === "down" ? "28px" : "-28px"})`, transition: "none" };
  })();

  const showPrev = activeIdx > 0;
  const showNext = activeIdx < total - 1;

  return (
    <section id="about" className="bg-black overflow-hidden min-h-screen">
      <div className="relative w-full flex min-h-screen">
        <img
          src={imgBuildingHistory}
          alt=""
          aria-hidden="true"
          className="absolute object-cover pointer-events-none select-none"
          style={{ top: "clamp(40px,11.4vw,197px)", right: 0, height: "clamp(300px,46.1vw,796px)", width: "auto", opacity: 0.15 }}
        />

        <div className="flex flex-col justify-between py-[clamp(60px,11.4vw,197px)] px-[clamp(24px,4.3vw,74px)] shrink-0 relative z-10" style={{ width: "clamp(320px,48vw,820px)" }}>
          <div>
            <Reveal>
                          <p className="text-white/30 text-xs tracking-widest mb-5" style={{ fontFamily: "'Ubuntu Sans Mono', monospace" }}>
                            — ABOUT US 關於我們・學會發展歷程
                          </p>
                        </Reveal>
            <Reveal>
              <h2 className="leading-none mb-[clamp(20px,2.5vw,42px)]" style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 700, fontSize: "clamp(2.5rem,3.5vw,60px)" }}>
                <span className="text-white">OUR</span><br />
                <span style={{ color: "#d14b4b" }}>HISTORY</span>
              </h2>
            </Reveal>

            <Reveal delay={70}>
              <div style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 500, fontSize: "clamp(0.72rem,0.95vw,16px)", letterSpacing: "0.16em", lineHeight: 2.1, color: "white" }}>
                <p className="mb-[1.6em]">
                  臺大圖資系學會創立於 1974 年（民國 63 年），是國立臺灣大學圖書資訊學系的學生自治核心。我們不僅是系上活動與學術的推手，更是每一位圖資人在臺大四年的堅實後盾與避風港。
                </p>
                <p className="mb-[1.6em]">
                  從迎新宿營到小圖盃的熱血揮汗，從系友講座的職涯啟蒙，再到系館學輔室的空間維護，我們致力於凝聚系上向心力，扮演學生與系辦、教師間的橋樑。
                </p>
                <p className="mb-[0.6em]">我們持續在課業、體育系隊與生活事務中，探索</p>
                <p className="font-black mb-[0.6em]" style={{ fontSize: "clamp(1rem,1.5vw,24px)", letterSpacing: "0.08em", background: "linear-gradient(to right, #d14b4b, #2f9ebd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", color: "transparent" }}>
                  「系學會可以這樣玩？」
                </p>
                <p>的無限可能。</p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={200} className="pt-[clamp(24px,3.5vw,56px)]">
            <a href="#" className="inline-flex items-center gap-3 bg-white text-black hover:bg-white/90 transition-colors duration-200 group w-fit" style={{ borderRadius: "49px", fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 700, fontSize: "clamp(0.85rem, 1.5vw, 1.1rem)", padding: "clamp(12px,1.2vw,20px) clamp(20px,2vw,32px)", letterSpacing:"0.2rem" }}>
              探索更多圖資系學會歷史
              <svg viewBox="0 0 30 24" fill="none" className="shrink-0 group-hover:translate-x-1 transition-transform duration-200" style={{ width: "clamp(16px,1.4vw,22px)", height: "auto" }}>
                <path d={svgHistoryPaths.p8ea180} fill="black" />
              </svg>
            </a>
          </Reveal>
        </div>

        <div className="relative shrink-0 flex flex-col items-center" style={{ width: "clamp(60px,8vw,140px)" }}>
          <div className="absolute inset-x-0 flex justify-center" style={{ top: "clamp(60px,11.4vw,197px)", bottom: "clamp(60px,11.4vw,197px)" }}>
            <div className="w-[3px] h-full" style={{ background: "linear-gradient(to bottom, rgba(209,75,75,0.6) 0%, rgba(209,75,75,1) 50%, rgba(47,158,189,1) 50%, rgba(47,158,189,0.6) 100%)" }} />
          </div>
          <div className="absolute text-white/40" style={{ top: "clamp(60px,11.4vw,197px)", left: "calc(50% + 10px)", fontFamily: "'Ubuntu Sans Mono', monospace", fontWeight: 700, fontSize: "clamp(9px,1vw,17px)", letterSpacing: "3px", whiteSpace: "nowrap" }}>1974</div>
          <div className="absolute text-white" style={{ bottom: "clamp(60px,11.4vw,197px)", left: "calc(50% + 10px)", fontFamily: "'Ubuntu Sans Mono', monospace", fontWeight: 700, fontSize: "clamp(9px,1vw,17px)", letterSpacing: "3px", whiteSpace: "nowrap" }}>2026</div>
          {showPrev && <div className="absolute rounded-full bg-white/30" style={{ top: "calc(50% - clamp(52px,6vw,100px))", left: "50%", transform: "translate(-50%, -50%)", width: "clamp(8px,0.8vw,12px)", height: "clamp(8px,0.8vw,12px)" }} />}
          <div className="absolute rounded-full border-[3px] border-white" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "clamp(28px,3vw,50px)", height: "clamp(28px,3vw,50px)", background: "black", zIndex: 2 }} />
          {showNext && <div className="absolute rounded-full bg-white/30" style={{ top: "calc(50% + clamp(52px,6vw,100px))", left: "50%", transform: "translate(-50%, -50%)", width: "clamp(8px,0.8vw,12px)", height: "clamp(8px,0.8vw,12px)" }} />}
        </div>

        <div className="flex-1 relative flex flex-col items-start justify-center py-[clamp(60px,11.4vw,197px)] px-[clamp(20px,3.5vw,60px)]">
          <button onClick={() => goTo(activeIdx - 1, "up")} disabled={animPhase !== "shown" || activeIdx === 0} className="mb-[clamp(16px,2.5vw,40px)] transition-opacity duration-150 hover:opacity-70 disabled:opacity-20 disabled:cursor-default" aria-label="上一站：較早的事件">
            <svg viewBox="0 0 41 25" fill="none" style={{ width: "clamp(22px,2.4vw,38px)", height: "auto", transform: "rotate(180deg)" }}>
              <path d={svgHistoryPaths.p16919e00} fill="white" />
            </svg>
          </button>

          <div style={contentStyle}>
            <p style={{ fontFamily: "'Ubuntu Sans Mono', monospace", fontWeight: 700, fontSize: "clamp(1rem,2vw,36px)", letterSpacing: "6.4px", color: "rgba(255,255,255,0.5)", marginBottom: "clamp(6px,1vw,16px)" }}>{ev.date}</p>
            <p style={{ fontFamily: "'Ubuntu Sans Mono', monospace", fontWeight: 700, fontSize: "clamp(1.1rem,2.3vw,40px)", letterSpacing: "4px", color: "white", marginBottom: "clamp(16px,2.5vw,42px)", lineHeight: 1.3 }}>{ev.title}</p>
            <a href={ev.link} className="inline-flex items-center gap-3 group hover:bg-[#bfbfbf] transition-colors duration-200" style={{ background: "#d9d9d9", borderRadius: "999px", fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 500, fontSize: "clamp(0.65rem,0.87vw,15px)", letterSpacing: "2.4px", color: "#000", padding: "clamp(6px,0.7vw,10px) clamp(14px,1.4vw,22px)" }}>
              {ev.tag}
              <svg viewBox="0 0 18 14" fill="none" className="shrink-0 group-hover:translate-x-0.5 transition-transform duration-200" style={{ width: "14px", height: "auto" }}>
                <path d={svgHistoryPaths.p2c5e9200} fill="black" />
              </svg>
            </a>
          </div>

          <button onClick={() => goTo(activeIdx + 1, "down")} disabled={animPhase !== "shown" || activeIdx === total - 1} className="mt-[clamp(16px,2.5vw,40px)] transition-opacity duration-150 hover:opacity-70 disabled:opacity-20 disabled:cursor-default" aria-label="下一站：較新的事件">
            <svg viewBox="0 0 41 25" fill="none" style={{ width: "clamp(22px,2.4vw,38px)", height: "auto" }}>
              <path d={svgHistoryPaths.p16919e00} fill="white" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}