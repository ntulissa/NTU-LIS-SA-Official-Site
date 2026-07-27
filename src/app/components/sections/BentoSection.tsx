import { ArrowRight } from "lucide-react";
import imgBentoBuilding1 from "@/imports/BentoGrid-1/de7749452570d864c1f5c584765f093ab16a6d89.png";
import svgPaths from "@/imports/BentoGrid-1/svg-lp3prmbugu";
import { Reveal, cardBase, monoBold, monoMed, monoSemi, pad, pad2, useCountdown } from "./shared";

const NEXT_EVENT = {
  name: "B14~15 系學會發表會",
  time: new Date("2026-09-07T14:30:00+08:00"),
};
const COUNTDOWN_TARGET = NEXT_EVENT.time;

const BENTO_CARD = "relative overflow-hidden rounded-[14px] border-4 border-[rgba(255,255,255,0.31)] flex flex-col cursor-pointer hover:opacity-90 transition-opacity duration-200";
const BENTO_BG: React.CSSProperties = {
  background: "linear-gradient(to bottom, rgba(47,158,189,0.44), rgba(209,75,75,0.44))",
};

export default function BentoSection() {
  const time = useCountdown(COUNTDOWN_TARGET);

  return (
    <section className="bg-black px-4 md:px-6 xl:px-8 py-10 md:py-16">
      <div className="max-w-[1680px] mx-auto mb-6">
        <Reveal>
          <p
            className="text-[13px] md:text-[15px] tracking-[2.4px] mb-4"
            style={{
              ...monoMed,
              background: "linear-gradient(to right, #ffffff, #999999)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            －OVERVIEW 資訊總覽
          </p>
          <div style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 700, letterSpacing: "0.6px" }}>
            <p className="text-white leading-none mb-[20px]" style={{ fontSize: "clamp(2rem, 4.5vw, 3.75rem)" }}>
              YOUR
            </p>
            <p className="text-[#2f9ebd] leading-none mb-8" style={{ fontSize: "clamp(2rem, 4.5vw, 3.75rem)" }}>
              CAMPUS PORTAL
            </p>
          </div>
        </Reveal>
      </div>

      <div className="max-w-[1680px] mx-auto flex flex-col lg:flex-row gap-3 lg:gap-4 lg:h-[680px]">
        <div className="flex flex-col gap-3 lg:gap-4 lg:w-[49.8%] shrink-0">
          <Reveal className="flex-[427] flex flex-col min-h-[280px]">
            <div className={`${BENTO_CARD} flex-1 p-5 md:p-6 lg:p-8`} style={BENTO_BG}>
              <p className="text-white tracking-[3.04px] whitespace-nowrap" style={{ ...monoSemi, fontSize: "clamp(11px, 1.2vw, 19px)" }}>
                UP NEXT
              </p>
              <div className="flex items-end gap-1 lg:gap-2 my-auto py-6">
                {([
                  { label: "D", value: pad(time.d) },
                  { label: "H", value: pad2(time.h) },
                  { label: "M", value: pad2(time.m) },
                  { label: "S", value: pad2(time.s) },
                ] as const).map(({ label, value }, i, arr) => (
                  <div key={label} className="contents">
                    <div className="flex flex-col items-center gap-2 flex-1">
                      <div className="bg-[rgba(0,0,0,0.47)] rounded-[17px] w-full flex items-center justify-center py-2 lg:py-3">
                        <span className="text-white tabular-nums" style={{ ...monoSemi, fontWeight: 500, fontSize: "clamp(1.1rem, 3vw, 4rem)", letterSpacing: "0.16em" }}>
                          {value}
                        </span>
                      </div>
                      <span className="text-[rgba(255,255,255,0.4)] tracking-[3.04px]" style={{ ...monoSemi, fontSize: "clamp(10px, 1vw, 16px)" }}>
                        {label}
                      </span>
                    </div>
                    {i < arr.length - 1 && (
                      <span className="text-white mb-[30px] shrink-0" style={{ ...monoMed, fontSize: "clamp(1.1rem, 3vw, 4rem)" }}>
                        :
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[rgba(255,255,255,0.62)] tracking-[3.04px] mb-1 whitespace-nowrap" style={{ ...monoMed, fontSize: "clamp(11px, 1.2vw, 19px)" }}>
                  下一場活動
                </p>
                <p className="text-white whitespace-nowrap overflow-hidden text-ellipsis" style={{ ...monoSemi, fontSize: "clamp(0.85rem, 2.4vw, 2.5rem)", letterSpacing: "6.56px" }}>
                  {NEXT_EVENT.name}
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={60} className="flex-[257] flex flex-col min-h-[160px]">
            <div className={`${BENTO_CARD} flex-1 p-5 md:p-6 lg:p-8`} style={BENTO_BG}>
              <p className="text-white tracking-[3.04px] whitespace-nowrap" style={{ ...monoSemi, fontSize: "clamp(11px, 1.2vw, 19px)" }}>
                ABOUT US
              </p>
              <div className="absolute top-4 bottom-4 right-4" style={{ width: "clamp(60px, 11%, 110px)" }}>
                <div className="relative w-full h-full overflow-hidden" style={{ borderRadius: "57px" }}>
                  <img src={imgBentoBuilding1} alt="" className="absolute max-w-none" style={{ width: "220.8%", height: "102.77%", left: "-60.09%", top: "-2.77%" }} />
                </div>
                <div className="absolute border-2 border-[rgba(255,255,255,0.15)]" style={{ inset: "-2px", borderRadius: "59px" }} />
              </div>
              <div className="mt-auto" style={{ paddingRight: "clamp(70px, 14%, 130px)" }}>
                <p className="text-[rgba(255,255,255,0.62)] tracking-[3.04px] mb-1 whitespace-nowrap overflow-hidden text-ellipsis" style={{ ...monoMed, fontSize: "clamp(10px, 0.85vw, 15px)" }}>
                  探索臺大圖資系學會的歷史脈絡、組織架構與現任幹部陣容
                </p>
                <p className="text-white whitespace-nowrap overflow-hidden text-ellipsis" style={{ ...monoSemi, fontSize: "clamp(0.8rem, 2vw, 2rem)", letterSpacing: "6.56px" }}>
                  B14~15 臺大圖資系學會
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="flex-1 flex flex-col gap-3 lg:gap-4">
          <div className="flex-[260] flex gap-3 lg:gap-4 min-h-[150px]">
            <Reveal delay={80} className="flex-1 flex flex-col">
              <div className={`${BENTO_CARD} flex-1 p-5 md:p-6 justify-between`} style={BENTO_BG}>
                <p className="text-white tracking-[3.04px]" style={{ ...monoSemi, fontSize: "clamp(11px, 1.2vw, 19px)" }}>
                  NEWS
                </p>
                <p className="text-white" style={{ ...monoBold, fontSize: "clamp(1rem, 2vw, 2.1rem)", letterSpacing: "5.6px" }}>
                  最新動態
                </p>
              </div>
            </Reveal>
            <Reveal delay={100} className="flex-1 flex flex-col">
              <div className={`${BENTO_CARD} flex-1 p-5 md:p-6 justify-between`} style={BENTO_BG}>
                <p className="text-white tracking-[3.04px]" style={{ ...monoSemi, fontSize: "clamp(11px, 1.2vw, 19px)" }}>
                  RESOURCES
                </p>
                <p className="text-white" style={{ ...monoBold, fontSize: "clamp(1rem, 2vw, 2.1rem)", letterSpacing: "5.6px" }}>
                  學習資源
                </p>
              </div>
            </Reveal>
          </div>

          <div className="flex-[260] flex gap-3 lg:gap-4 min-h-[150px]">
            <Reveal delay={120} className="flex-1 flex flex-col">
              <div className={`${BENTO_CARD} flex-1 p-5 md:p-6 justify-between`} style={BENTO_BG}>
                <p className="text-white tracking-[3.04px]" style={{ ...monoSemi, fontSize: "clamp(11px, 1.2vw, 19px)" }}>
                  MEMBERS
                </p>
                <div className="flex items-end justify-between">
                  <p className="text-[rgba(255,255,255,0.82)] leading-none" style={{ ...monoBold, fontSize: "clamp(2.5rem, 7.5vw, 6.5rem)", letterSpacing: "0.16em", textShadow: "4px 6px 7.7px black" }}>
                    40
                  </p>
                  <p className="text-[rgba(255,255,255,0.62)] tracking-[3.04px] text-right" style={{ ...monoMed, fontSize: "clamp(10px, 0.85vw, 15px)" }}>
                    工作<br />團隊人數
                  </p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={140} className="flex-1 flex flex-col">
              <div className={`${BENTO_CARD} flex-1 p-5 md:p-6 justify-between`} style={BENTO_BG}>
                <p className="text-white tracking-[3.04px]" style={{ ...monoSemi, fontSize: "clamp(11px, 1.2vw, 19px)" }}>
                  SUPPORT US
                </p>
                <div className="absolute inset-[8%_2%_38%_50%]">
                  <svg className="w-full h-full" fill="none" viewBox="0 0 105.001 102.962" style={{ transform: "rotate(22deg)" }}>
                    <path d={svgPaths.p23be10c0} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.59" strokeWidth="4" />
                    <path d={svgPaths.p2b207700} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.59" strokeWidth="4" />
                    <path d={svgPaths.p208a4580} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.59" strokeWidth="4" />
                  </svg>
                </div>
                <p className="text-white" style={{ ...monoBold, fontSize: "clamp(0.8rem, 1.7vw, 1.8rem)", letterSpacing: "5.6px" }}>
                  系學會費專區
                </p>
              </div>
            </Reveal>
          </div>

          <div className="flex-[154] flex gap-3 lg:gap-4 min-h-[90px]">
            {(
              [
                { label: "INSTAGRAM", path: svgPaths.p372aef00, vb: "0 0 64 64", delay: 160, href: "https://www.instagram.com/ntu_lis_sa?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" },
                { label: "FACEBOOK", path: svgPaths.p1c5aa00, vb: "0 0 64 64", delay: 180, href: "https://www.facebook.com/ntulislis" },
                { label: "THREADS", path: svgPaths.p3455000, vb: "0 0 55 64", delay: 200, href: "https://www.threads.com/@ntu_lis_sa" },
              ] as const
            ).map(({ label, path, vb, delay, href }) => (
              <Reveal key={label} delay={delay} className="flex-1 flex flex-col">
                <a href={href} target="_blank" rel="noopener noreferrer" className={`${BENTO_CARD} flex-1 p-4 md:p-5 justify-between`} style={BENTO_BG}>
                  <p className="text-white tracking-[3.04px] whitespace-nowrap" style={{ ...monoSemi, fontSize: "clamp(9px, 0.9vw, 15px)" }}>
                    {label}
                  </p>
                  <div className="self-end" style={{ width: "clamp(26px, 3.5vw, 44px)", height: "clamp(26px, 3.5vw, 44px)" }}>
                    <svg className="block w-full h-full" fill="none" viewBox={vb}>
                      <path d={path} fill="white" fillOpacity="0.59" />
                    </svg>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
