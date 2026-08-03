import { useState } from "react";
import imgBuildingHistory from "@/imports/OurHistory/de7749452570d864c1f5c584765f093ab16a6d89.png";
import imgMeiji from "@/imports/CurrentTeam/ec7393ec630e93b1f986ef8fe7dd4a9ffc5f9745.png";
import imgHongLingYa from "@/imports/___2026-07-22_15.31.56-removebg-preview.png";
import svgTeamPaths from "@/imports/CurrentTeam/svg-75tsnwzvfd";
import { Reveal } from "./shared";

type DeptDef = {
  name: string;
  abbr: string;
  hoverBg: string;
  icon: React.ReactNode;
};

const ICON_SIZE: React.CSSProperties = { width: "clamp(36px,3.5vw,54px)", height: "auto" };
const FIGURE_IMAGE_HEIGHT = "85vh";
const FIGURE_TOP_PADDING = "-12vh";
const INFO_TOP_OFFSET = "40vh";
const INFO_RIGHT_OFFSET = "4vw";
const INFO_MAX_WIDTH = "22vw";
const ROLE_FONT_SIZE = "1.3vw";
const NAME_FONT_SIZE = "5vw";
const ROMAN_FONT_SIZE = "1.3vw";
const YEAR_FONT_SIZE = "0.95vw";
const ROLE_MARGIN_BOTTOM = "5vh";
const NAME_MARGIN_BOTTOM = "3vh";
const ROMAN_MARGIN_BOTTOM = "3vh";
const TOGGLE_BOTTOM_OFFSET = "20vh";
const TOGGLE_RIGHT_OFFSET = "4vw";

const DEPTS: DeptDef[] = [
  { name: "行政部", abbr: "GEN.", hoverBg: "#915E3E", icon: <svg viewBox="0 0 113 102" fill="none" style={ICON_SIZE}><path d={svgTeamPaths.p1a21b8c0} fill="white" /></svg> },
  { name: "活動部", abbr: "EVE.", hoverBg: "#9F353A", icon: <svg viewBox="0 0 102 102" fill="none" style={ICON_SIZE}><path d={svgTeamPaths.p69aaf00} fill="white" /><path d={svgTeamPaths.p33873100} fill="white" /></svg> },
  { name: "學術部", abbr: "ACA.", hoverBg: "#42602D", icon: <svg viewBox="0 0 75 93" fill="none" style={ICON_SIZE}><path d={svgTeamPaths.p27314300} fill="white" /></svg> },
  { name: "形象宣傳部", abbr: "IMA.", hoverBg: "#572A3F", icon: <svg viewBox="0 0 121 110" fill="none" style={ICON_SIZE}><path d={svgTeamPaths.p209bcf80} fill="none" stroke="white" strokeWidth="5" strokeLinejoin="round" /><path d={svgTeamPaths.p68b8000} fill="none" stroke="white" strokeWidth="5" /></svg> },
  { name: "體育部", abbr: "SP.", hoverBg: "#554236", icon: <svg viewBox="0 0 69 104" fill="none" style={ICON_SIZE}><path d={svgTeamPaths.p2b1ed5c0} fill="white" /></svg> },
];

const LEADERS = [
  { title: "會長", name: "黃子芸", roman: "TZU-YUN, HUANG", year: "圖資三", img: imgMeiji as string },
  { title: "副會長", name: "洪聆雅", roman: "LING-YA, HUNG", year: "圖資三", img: imgHongLingYa as string },
];

function DeptCard({ dept }: { dept: DeptDef }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="flex flex-col items-center gap-[clamp(5px,0.6vw,9px)]">
      <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className="relative rounded-[14px] aspect-square w-full overflow-hidden cursor-pointer border transition-all duration-300" style={{ background: hovered ? dept.hoverBg : "rgba(255,255,255,0.03)", borderColor: hovered ? "transparent" : "rgba(255,255,255,0.2)" }}>
        <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300" style={{ opacity: hovered ? 0.14 : 1 }}>
          {dept.icon}
        </div>
        <div className="absolute inset-0 flex items-center justify-center transition-all duration-300" style={{ opacity: hovered ? 1 : 0, transform: hovered ? "translateY(0)" : "translateY(7px)" }}>
          <span style={{ fontFamily: "'Ubuntu Sans Mono', monospace", fontWeight: 700, fontSize: "clamp(1.1rem,2vw,34px)", color: "white", letterSpacing: "0.04em" }}>
            {dept.abbr}
          </span>
        </div>
      </div>
      <span className="text-white text-center leading-tight" style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 500, fontSize: "clamp(0.65rem,0.82vw,13px)" }}>
        {dept.name}
      </span>
    </div>
  );
}

export default function TeamSection() {
  const [leaderIdx, setLeaderIdx] = useState(0);
  const activeLeader = LEADERS[leaderIdx] ?? LEADERS[0];

  return (
    <section id="team" className="bg-black min-h-screen overflow-hidden">
      <div className="relative w-full min-h-screen flex flex-col lg:flex-row">
        <div className="flex flex-col justify-center px-5 sm:px-8 md:px-[clamp(24px,4.3vw,74px)] py-16 sm:py-20 lg:py-[clamp(60px,11.4vw,197px)] w-full lg:w-[clamp(300px,54vw,920px)] lg:flex-shrink-0">
          <div>
            <Reveal>
              <p className="text-white/30 text-xs tracking-widest mb-5" style={{ fontFamily: "'Ubuntu Sans Mono', monospace" }}>
                — ABOUT US 關於我們
              </p>
            </Reveal>
            <Reveal delay={50}>
              <h2 className="font-bold leading-none mb-6" style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "clamp(2.8rem,3.5vw,60px)" }}>
                <span className="text-white">CURRENT</span><br />
                <span style={{ color: "#2f9ebd" }}>TEAM</span>
              </h2>
            </Reveal>
            <Reveal delay={90}>
              <p className="text-white mb-10" style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 500, fontSize: "clamp(0.75rem,0.95vw,16px)", lineHeight: 2, letterSpacing: "0.1em", maxWidth: "520px" }}>
                臺大圖資系學會目前由正副會長統領，下轄行政、活動、學術、形象宣傳、體育等五個常設部門（第 52 屆始）：
              </p>
            </Reveal>

            <div className="flex flex-col gap-[clamp(8px,1vw,14px)] max-w-full lg:max-w-[clamp(280px,42vw,700px)]">
              <div className="grid grid-cols-3 gap-[clamp(8px,1vw,14px)]">
                {DEPTS.slice(0, 3).map((dept, i) => (
                  <Reveal key={dept.name} delay={100 + i * 40}>
                    <DeptCard dept={dept} />
                  </Reveal>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-[clamp(8px,1vw,14px)]">
                {DEPTS.slice(3).map((dept, i) => (
                  <Reveal key={dept.name} delay={220 + i * 40}>
                    <DeptCard dept={dept} />
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden min-h-[360px] sm:min-h-[460px] lg:flex-1 lg:min-h-[600px] mt-4 lg:mt-0">
          <img src={imgBuildingHistory} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none" style={{ opacity: 0.06 }} />
          <div className="absolute left-0 right-0" style={{ top: "clamp(20px,3.5vw,74px)", bottom: "clamp(20px,3.5vw,74px)" }}>
            <div className="absolute inset-0 flex items-end">
              <div className="absolute inset-0 flex items-end pointer-events-none select-none">
                {LEADERS.map((leader, i) => {
                  const isActive = i === leaderIdx;
                  return (
                    <div
                      key={leader.title}
                      className="absolute inset-0 flex items-end transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      style={{
                        opacity: isActive ? 1 : 0,
                        transform: isActive ? `translateX(0) translateY(${FIGURE_TOP_PADDING})` : `translateX(18px) translateY(${FIGURE_TOP_PADDING})`,
                        pointerEvents: "none",
                      }}
                    >
                      <div className="h-full flex-shrink-0 flex items-end">
                        <img
                          src={leader.img}
                          alt={leader.name}
                          className="w-auto object-contain object-bottom max-w-none"
                          style={{ height: FIGURE_IMAGE_HEIGHT, opacity: isActive ? 1 : 0 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="absolute left-4 right-4 top-auto bottom-6 sm:left-6 sm:right-6 lg:left-auto lg:right-[4vw] lg:top-[40vh] lg:bottom-auto flex flex-col items-start max-w-[min(100%,320px)] lg:max-w-[22vw]">
                <div style={{ padding: "1.5px", background: "linear-gradient(90deg, #D14B4B 0%, #2F9EBD 100%)", borderRadius: "999px", marginBottom: ROLE_MARGIN_BOTTOM }}>
                  <div style={{ background: "#000", borderRadius: "999px", padding: "4px 14px", color: "white", fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 500, fontSize: ROLE_FONT_SIZE, letterSpacing: "0.16em", whiteSpace: "nowrap" }}>
                    第 53 屆{activeLeader.title}
                  </div>
                </div>
                <p className="text-white leading-none" style={{ fontFamily: "'Chiron Hei HK Text', 'Noto Sans TC', sans-serif", fontWeight: 900, fontSize: NAME_FONT_SIZE, letterSpacing: "0.04em", marginBottom: NAME_MARGIN_BOTTOM }}>
                  {activeLeader.name}
                </p>
                <p style={{ fontFamily: "'Ubuntu Sans Mono', monospace", fontWeight: 400, fontSize: ROMAN_FONT_SIZE, letterSpacing: "0.2em", background: "linear-gradient(90deg, #FFF 0%, #999 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: ROMAN_MARGIN_BOTTOM }}>
                  {activeLeader.roman}
                </p>
                <div style={{ background: "linear-gradient(90deg, #FFF 0%, #999 100%)", borderRadius: "5px", padding: "4px 14px" }}>
                  <span style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 700, fontSize: YEAR_FONT_SIZE, color: "#000", letterSpacing: "0.12em" }}>
                    {activeLeader.year}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute left-4 right-4 bottom-4 sm:left-auto sm:right-6 lg:left-auto lg:right-[4vw] lg:bottom-[20vh] rounded-full border border-white/20 p-[3px]">
            <div className="absolute top-[3px] bottom-[3px] rounded-full bg-white" style={{ width: "calc(50% - 3px)", left: leaderIdx === 0 ? "3px" : "calc(50%)", transition: "left 300ms cubic-bezier(0.4,0,0.2,1)" }} />
            <div className="relative flex">
              {LEADERS.map((l, i) => (
                <button key={l.title} onClick={() => setLeaderIdx(i)} className="relative z-10 px-5 py-2 rounded-full text-center" style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: leaderIdx === i ? 700 : 400, fontSize: "clamp(0.7rem,0.85vw,14px)", color: leaderIdx === i ? "black" : "rgba(255,255,255,0.35)", transition: "color 300ms ease" }}>
                  {l.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
