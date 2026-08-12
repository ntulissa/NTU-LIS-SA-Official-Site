import { useState } from "react";
import imgBuildingHistory from "@/imports/OurHistory/de7749452570d864c1f5c584765f093ab16a6d89.png";
import imgMeiji from "@/imports/Presidents/53.png";
import imgHongLingYa from "@/imports/CurrentTeam/53vp.png";
import { Reveal } from "./shared";

type DeptDef = {
  name: string;
  color: string; // 部門色（hover 時套用到外框）
  renderIcon: (playing: boolean) => React.ReactNode; // playing=true 時播放動畫
  href?: string; // 點擊進入的部門獨立頁（有填才可點）
};

const ICON_SIZE: React.CSSProperties = { width: "clamp(64px,6.6vw,104px)", height: "auto" }; // icon 尺寸（再放大）
const FIGURE_IMAGE_HEIGHT = "85vh";
const FIGURE_TOP_PADDING = "-12vh";
const INFO_TOP_OFFSET = "40vh";
const INFO_RIGHT_OFFSET = "4vw";
const INFO_MAX_WIDTH = "22vw";
const ROLE_FONT_SIZE = "clamp(0.72rem, 2.4vw, 1.3vw)";
const NAME_FONT_SIZE = "clamp(2rem, 8vw, 5vw)";
const ROMAN_FONT_SIZE = "clamp(0.8rem, 2.8vw, 1.3vw)";
const YEAR_FONT_SIZE = "clamp(0.72rem, 2.4vw, 0.95vw)";
const ROLE_MARGIN_BOTTOM = "5vh";
const NAME_MARGIN_BOTTOM = "3vh";
const ROMAN_MARGIN_BOTTOM = "3vh";
const TOGGLE_BOTTOM_OFFSET = "20vh";
const TOGGLE_RIGHT_OFFSET = "4vw";

/* ── 行政部：橫向滾珠算盤（可動）──────────────────────────────────
   珠子平常靜止；playing=true（滑鼠 hover）時才撥動，移開會平順滑回。
   想調速度：改 animation 的 3.2s；想調撥動幅度：改各珠的 d 值。 */
function AbacusIcon({ playing }: { playing: boolean }) {
  const rows = [
    { y: 30, beads: [{ x: 30, d: 13 }, { x: 40, d: 13 }, { x: 50, d: 13 }, { x: 60, d: 13 }], row: 0.0 },
    { y: 50, beads: [{ x: 30, d: 9 }, { x: 40, d: 9 }, { x: 62, d: -9 }, { x: 72, d: -9 }], row: 0.5 },
    { y: 70, beads: [{ x: 34, d: 17 }, { x: 46, d: 17 }], row: 1.0 },
  ];
  return (
    <svg viewBox="0 0 100 100" style={ICON_SIZE} className={playing ? "abx abx-play" : "abx"}>
      <style>{`
        .abx .abx-bead { transform-box: fill-box; transform-origin: center; transition: transform .35s ease; }
        @keyframes abxFlick {
          0%, 12%  { transform: translateX(0); }
          24%      { transform: translateX(calc(var(--d) * 1.09)); }
          31%      { transform: translateX(var(--d)); }
          63%      { transform: translateX(var(--d)); }
          77%      { transform: translateX(0); }
          100%     { transform: translateX(0); }
        }
        .abx-play .abx-bead { animation: abxFlick 3.2s cubic-bezier(0.22,1,0.36,1) infinite; }
      `}</style>
      {/* 左右框柱 */}
      <rect x={14} y={13} width={7} height={74} rx={3.5} fill="#fff" />
      <rect x={79} y={13} width={7} height={74} rx={3.5} fill="#fff" />
      {/* 三條橫桿 */}
      {rows.map((r) => (
        <rect key={`rail-${r.y}`} x={21} y={r.y - 2} width={58} height={4} rx={2} fill="#fff" fillOpacity={0.85} />
      ))}
      {/* 珠子（直立膠囊） */}
      {rows.map((r) =>
        r.beads.map((b, i) => (
          <rect
            key={`b-${r.y}-${i}`}
            className="abx-bead"
            x={b.x - 3.5}
            y={r.y - 8.5}
            width={7}
            height={17}
            rx={3.5}
            fill="#fff"
            style={{ "--d": `${b.d}px`, animationDelay: `${r.row + i * 0.05}s` } as React.CSSProperties}
          />
        ))
      )}
    </svg>
  );
}

/* ── 活動部：吉他撥弦 + 音符（可動）──────────────────────────────
   弦平常靜止；playing=true（hover）時撥弦震動、音符往右上飄出淡入淡出。
   想調速度：改兩組 animation 的 2.4s。 */
function GuitarIcon({ playing }: { playing: boolean }) {
  const strings = [41.5, 44, 46.5];
  const notes = [
    { cx: 64, cy: 54, delay: 0.1 },
    { cx: 70, cy: 48, delay: 0.85 },
    { cx: 60, cy: 50, delay: 1.6 },
  ];
  return (
    <svg viewBox="0 0 100 100" style={ICON_SIZE} className={playing ? "gtr gtr-play" : "gtr"}>
      <style>{`
        .gtr .gtr-string { transform-box: fill-box; transform-origin: center; }
        @keyframes gtrStrum {
          0%{transform:translateX(0)} 5%{transform:translateX(1.7px)} 10%{transform:translateX(-1.5px)}
          15%{transform:translateX(1px)} 20%{transform:translateX(-.6px)} 27%,100%{transform:translateX(0)}
        }
        .gtr-play .gtr-string { animation: gtrStrum 2.4s ease-out infinite; }
        .gtr .gtr-note { transform-box: fill-box; transform-origin: center; opacity: 0; }
        @keyframes gtrNote {
          0%{opacity:0;transform:translate(0,0) scale(.6)}
          16%{opacity:1;transform:translate(2px,-5px) scale(1)}
          72%,100%{opacity:0;transform:translate(13px,-26px) scale(1)}
        }
        .gtr-play .gtr-note { animation: gtrNote 2.4s ease-out infinite; }
      `}</style>
      {/* 琴身（白色實心：上下兩橢圓疊出葫蘆形） */}
      <ellipse cx={44} cy={72} rx={20} ry={17} fill="#fff" />
      <ellipse cx={44} cy={55} rx={15} ry={13} fill="#fff" />
      {/* 琴頸 + 琴頭 */}
      <rect x={41} y={18} width={6} height={40} rx={3} fill="#fff" />
      <rect x={38.5} y={12} width={11} height={9} rx={2} fill="#fff" />
      {/* 音孔 + 琴橋（深色） */}
      <circle cx={44} cy={70} r={6} fill="#0b0b0b" />
      <rect x={39} y={80} width={10} height={2.4} rx={1} fill="#0b0b0b" />
      {/* 三條弦（會震動） */}
      {strings.map((x, i) => (
        <rect key={`s${i}`} className="gtr-string" x={x - 0.5} y={15} width={1} height={66} rx={0.5} fill="#0b0b0b" style={{ animationDelay: `${i * 0.05}s` }} />
      ))}
      {/* 音符（右上飄出） */}
      {notes.map((n, i) => (
        <g key={`n${i}`} className="gtr-note" style={{ animationDelay: `${n.delay}s` }}>
          <ellipse cx={n.cx} cy={n.cy} rx={3.1} ry={2.4} fill="#fff" transform={`rotate(-20 ${n.cx} ${n.cy})`} />
          <rect x={n.cx + 2.2} y={n.cy - 9} width={1.5} height={9} fill="#fff" />
          <path d={`M ${n.cx + 3.7} ${n.cy - 9} q 4 1.5 2 6`} stroke="#fff" strokeWidth={1.4} fill="none" />
        </g>
      ))}
    </svg>
  );
}

/* ── 學術部：羽毛筆寫字 + 墨水線（可動）──────────────────────────
   平常靜止（墨水線隱藏）；playing=true（hover）時羽毛筆輕移、墨水線被一筆筆寫出來。
   想調速度：改兩組 animation 的 2.6s。 */
function QuillIcon({ playing }: { playing: boolean }) {
  return (
    <svg viewBox="0 0 100 100" style={ICON_SIZE} className={playing ? "qui qui-play" : "qui"}>
      <style>{`
        .qui .qui-ink { stroke-dasharray: 100; stroke-dashoffset: 100; opacity: 0; }
        @keyframes quiInk {
          0%{stroke-dashoffset:100;opacity:0} 6%{opacity:1}
          52%{stroke-dashoffset:0;opacity:1} 80%{stroke-dashoffset:0;opacity:1}
          92%,100%{stroke-dashoffset:0;opacity:0}
        }
        .qui-play .qui-ink { animation: quiInk 2.6s ease-in-out infinite; }
        .qui .qui-feather { transform-box: view-box; transform-origin: 27px 78px; }
        @keyframes quiWrite {
          0%{transform:rotate(0) translate(0,0)} 10%{transform:rotate(2deg) translate(-1px,0)}
          52%{transform:rotate(-3deg) translate(6px,1px)} 80%{transform:rotate(-3deg) translate(6px,1px)}
          100%{transform:rotate(0) translate(0,0)}
        }
        .qui-play .qui-feather { animation: quiWrite 2.6s ease-in-out infinite; }
      `}</style>
      <g className="qui-feather">
        {/* 羽毛葉片 */}
        <path d="M30 74 C 44 82, 76 56, 76 24 C 60 40, 34 56, 30 74 Z" fill="#fff" />
        {/* 中央羽軸 */}
        <path d="M22 84 L 74 26" stroke="#0b0b0b" strokeWidth={2.4} strokeLinecap="round" fill="none" />
        {/* 羽枝紋理 */}
        <path d="M48 45 l 12 -6 M42 54 l 12 -6 M55 39 l 11 -5 M38 62 l 10 -5" stroke="#0b0b0b" strokeWidth={1.6} strokeLinecap="round" fill="none" />
        {/* 筆尖 */}
        <path d="M22 84 L 26 76 L 30 82 Z" fill="#fff" stroke="#0b0b0b" strokeWidth={1.4} strokeLinejoin="round" />
        <circle cx={26.5} cy={80} r={1.1} fill="#0b0b0b" />
      </g>
      {/* 墨水線（會被寫出來） */}
      <path className="qui-ink" d="M26 86 q 12 -7 24 -2 q 12 5 22 -3 q 7 -5 14 -2" pathLength={100} stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/* ── 形象宣傳部：復古拍立得，快門閃光 + 底片洗出（可動）────────────
   平常靜止（底片藏在機身後）；playing=true（hover）時閃光一下、底片從槽口滑出、停留後淡出重來。
   想調速度：改兩組 animation 的 3s。 */
function CameraIcon({ playing }: { playing: boolean }) {
  return (
    <svg viewBox="0 0 100 100" style={ICON_SIZE} className={playing ? "cam cam-play" : "cam"}>
      <style>{`
        .cam .cam-photo { transform-box: fill-box; transform-origin: center; opacity: 0; }
        @keyframes camPrint {
          0%,10%{transform:translateY(0);opacity:1}
          44%{transform:translateY(26px);opacity:1}
          82%{transform:translateY(26px);opacity:1}
          93%,100%{transform:translateY(26px);opacity:0}
        }
        .cam-play .cam-photo { animation: camPrint 3s cubic-bezier(0.22,1,0.36,1) infinite; }
        .cam .cam-flash { opacity: 0; }
        @keyframes camFlash { 0%,6%{opacity:0} 9%{opacity:.9} 17%{opacity:0} 100%{opacity:0} }
        .cam-play .cam-flash { animation: camFlash 3s ease-out infinite; }
      `}</style>
      {/* 底片照片（在機身後面，會往下滑出） */}
      <g className="cam-photo">
        <rect x={37} y={50} width={26} height={22} rx={2} fill="#fff" />
        <rect x={39.5} y={52.5} width={21} height={12.5} rx={1} fill="#7a7a7a" />
      </g>
      {/* 頂部條 */}
      <rect x={21} y={13} width={58} height={15} rx={4} fill="#fff" />
      <rect x={55} y={16.5} width={20} height={8} rx={2} fill="#0b0b0b" />
      {/* 主機身 */}
      <rect x={18} y={29} width={64} height={46} rx={5} fill="#fff" />
      {/* 鏡頭 */}
      <circle cx={50} cy={49} r={12} fill="#0b0b0b" />
      <circle cx={50} cy={49} r={8.5} fill="#fff" />
      <circle cx={50} cy={49} r={5.5} fill="#0b0b0b" />
      {/* 閃光燈方塊 */}
      <rect x={64} y={34} width={10} height={9} rx={1.5} fill="#0b0b0b" />
      {/* 三個小點 */}
      <circle cx={27} cy={41} r={1.7} fill="#0b0b0b" />
      <circle cx={32.5} cy={41} r={1.7} fill="#0b0b0b" />
      <circle cx={38} cy={41} r={1.7} fill="#0b0b0b" />
      {/* 出片槽 */}
      <rect x={26} y={70.5} width={48} height={2.6} rx={1.3} fill="#0b0b0b" />
      {/* 快門閃光 */}
      <circle className="cam-flash" cx={50} cy={49} r={15} fill="#fff" />
    </svg>
  );
}

/* ── 體育部：側面籃框 + 籃球投進（可動）─────────────────────────
   側面視角：籃板右側直立、籃框一條水平線、側面網子。靜止時球在左下；
   playing=true（hover）時籃球以自然拋物線飛入（上升減速、下墜加速）、落進框、穿過網。
   想調速度：改兩組 animation 的 2.4s。 */
function BasketballIcon({ playing }: { playing: boolean }) {
  return (
    <svg viewBox="0 0 100 100" style={ICON_SIZE} className={playing ? "bkt bkt-play" : "bkt"}>
      <style>{`
        .bkt .bkt-ball { transform-box: fill-box; transform-origin: center; }
        /* 水平等速前進；上升減速、下墜加速。起點/終點都在畫面外→重置看不到，全程不透明、不閃 */
        @keyframes bktShoot {
          0%  { transform: translate(0,0); }
          10% { transform: translate(7.6px,-31.6px); }
          20% { transform: translate(15.2px,-55.3px); }
          30% { transform: translate(22.8px,-71.1px); }
          40% { transform: translate(30.4px,-79px); }
          50% { transform: translate(38px,-79px); }
          60% { transform: translate(45.6px,-71.1px); }
          70% { transform: translate(53.2px,-55.3px); }
          80% { transform: translate(60.8px,-31.6px); }
          90% { transform: translate(68.4px,0); }
          100%{ transform: translate(76px,39.5px); }
        }
        .bkt-play .bkt-ball { animation: bktShoot 2.4s linear infinite; }
        .bkt .bkt-net { transform-box: fill-box; transform-origin: 58px 44px; }
        @keyframes bktSwish { 0%,72%{transform:scaleY(1)} 80%{transform:scaleY(1.26)} 92%{transform:scaleY(1)} 100%{transform:scaleY(1)} }
        .bkt-play .bkt-net { animation: bktSwish 2.4s linear infinite; }
      `}</style>
      {/* 籃板（右側直立） */}
      <rect x={76} y={16} width={7} height={42} rx={2} fill="#fff" />
      {/* 網子（側面） */}
      <g className="bkt-net" stroke="#fff" strokeWidth={1.3} fill="none" strokeLinecap="round">
        <path d="M45 45 L55 60 M52 45 L57 60 M60 45 L60 60 M68 45 L63 60 M74 45 L65 60" />
        <path d="M50 51 L69 51 M54 56 L64 56" />
      </g>
      {/* 籃框（側面：一條水平直線） */}
      <path d="M43 44 L76 44" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" fill="none" />
      {/* 籃球（從畫面外左下拋入；全程不透明，加淡色邊避免糊在白網上） */}
      <g className="bkt-ball">
        <circle cx={-10} cy={88} r={7.5} fill="#fff" stroke="#0b0b0b" strokeWidth={1} />
        <path d="M-10 80.5 L-10 95.5 M-17.5 88 L-2.5 88" stroke="#0b0b0b" strokeWidth={1.2} fill="none" />
        <path d="M-15 82 Q -11.5 88 -15 94 M-5 82 Q -8.5 88 -5 94" stroke="#0b0b0b" strokeWidth={1.2} fill="none" />
      </g>
    </svg>
  );
}

const DEPTS: DeptDef[] = [
  // 點行政部格子 → 行政部獨立頁（#/dept/general）。其餘部門頁建立後，把 href 填上即可。
  { name: "行政部", color: "#915E3E", renderIcon: (playing) => <AbacusIcon playing={playing} />, href: "#/dept/general" },
  { name: "活動部", color: "#9F353A", renderIcon: (playing) => <GuitarIcon playing={playing} /> },
  { name: "學術部", color: "#42602D", renderIcon: (playing) => <QuillIcon playing={playing} /> },
  { name: "形象宣傳部", color: "#572A3F", renderIcon: (playing) => <CameraIcon playing={playing} /> },
  { name: "體育部", color: "#554236", renderIcon: (playing) => <BasketballIcon playing={playing} /> },
];

const LEADERS = [
  { title: "會長", name: "黃子芸", roman: "TZU-YUN, HUANG", year: "圖資三", img: imgMeiji as string },
  { title: "副會長", name: "洪聆雅", roman: "LING-YA, HUNG", year: "圖資三", img: imgHongLingYa as string },
];

function DeptCard({ dept }: { dept: DeptDef }) {
  const [hovered, setHovered] = useState(false);
  // 有 href 就用 <a> 讓格子可點進部門頁；沒有就維持 <div>（不可點）。
  const Box: React.ElementType = dept.href ? "a" : "div";

  return (
    <div className="flex flex-col items-center gap-[clamp(5px,0.6vw,9px)]">
      <Box
        href={dept.href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative rounded-[14px] aspect-square w-full overflow-hidden cursor-pointer border transition-all duration-300 block"
        style={{
          // 內部維持黑（深色），不再整片變色
          background: "rgba(255,255,255,0.03)",
          // 外框：hover 時變成部門色
          borderColor: hovered ? dept.color : "rgba(255,255,255,0.2)",
          // 加一圈同色細描邊 + 柔和外光，讓「外框變色」更明顯（想更低調可移除這行）
          boxShadow: hovered ? `0 0 0 1px ${dept.color}, 0 8px 24px -10px ${dept.color}` : "none",
        }}
      >
        {/* icon 一直顯示；hover 時 playing=true 才播放動畫 */}
        <div className="absolute inset-0 flex items-center justify-center">
          {dept.renderIcon(hovered)}
        </div>
      </Box>
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

        <div className="relative overflow-hidden min-h-[320px] sm:min-h-[460px] lg:flex-1 lg:min-h-[600px] mt-4 lg:mt-0 rounded-[24px] lg:rounded-none">
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
                      <div className="h-full flex-shrink-0 flex items-end justify-center lg:justify-start w-full">
                        <img
                          src={leader.img}
                          alt={leader.name}
                          className="w-auto max-w-full object-contain object-bottom"
                          style={{ height: "clamp(280px, 70vh, 620px)", opacity: isActive ? 1 : 0 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="absolute left-4 right-4 top-4 sm:left-6 sm:right-6 lg:left-auto lg:right-[4vw] lg:top-[40vh] lg:bottom-auto flex flex-col items-start max-w-[min(100%,320px)] lg:max-w-[22vw]">
                <div style={{ padding: "1.5px", background: "linear-gradient(90deg, #D14B4B 0%, #2F9EBD 100%)", borderRadius: "999px", marginBottom: ROLE_MARGIN_BOTTOM }}>
                  <div style={{ background: "#000", borderRadius: "999px", padding: "4px 14px", color: "white", fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 650, fontSize: ROLE_FONT_SIZE, letterSpacing: "0.16em", whiteSpace: "nowrap" }}>
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
                  <span style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 900, fontSize: YEAR_FONT_SIZE, color: "#000", letterSpacing: "0.12em" }}>
                    {activeLeader.year}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute left-4 right-4 bottom-4 sm:left-auto sm:right-6 lg:left-auto lg:right-[4vw] lg:bottom-[20vh] rounded-full border border-white/20 p-[3px] max-w-fit">
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