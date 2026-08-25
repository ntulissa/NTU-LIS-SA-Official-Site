import { useRef, useState } from "react";
import { ArrowRight, PiggyBank } from "lucide-react";
import imgLissaLogo from "@/imports/LISSA_Logo.png";
import svgPaths from "@/imports/BentoGrid-1/svg-lp3prmbugu";
import { Reveal, monoBold, monoSemi, useCountdown } from "./shared";

// ══════════════════════════════════════════════════════════════════════════
// 資訊總覽 BentoGrid（重製版・比照 Figma 新設計）
// 字體／顏色沿用現有網站樣式（紅→青品牌漸層、Noto Sans TC / Ubuntu Mono）。
//
// ★ 之後最常改的東西集中在這裡：
//   NEXT_EVENT：下一場活動名稱與時間（倒數圓環吃這個）。
//   LINKS：各卡片點擊目標。support 目前為 null＝不連結（會費／贊助整合後再接）。
//   SESSION_NO：ABOUT 卡的大字屆數（目前 53）。
//   CHAT_LINES：學術資源卡的聊天泡泡文字。
//   MEMBER_DOTS：工作團隊卡的彩色圓點顏色序列。
//   社群卡（IG/FB/Threads）：等 SVG 文字 logo 上傳後，換掉 SocialCard 內的圖示即可。
// ══════════════════════════════════════════════════════════════════════════

const NEXT_EVENT = {
  name: "B14~15 系學會發表會",
  time: new Date("2026-09-07T14:30:00+08:00"),
};
const COUNTDOWN_TARGET = NEXT_EVENT.time;
// 倒數圓環的「滿環」對應天數：距離活動 ≥ 這個天數時環是滿的，越接近越空。改這裡調整視覺節奏。
const RING_FULL_DAYS = 30;

// ABOUT 卡的大字屆數。
const SESSION_NO = "53";

// 各卡片點擊目標。support=null 代表暫不連結（會費＋贊助整合後再接）。
const LINKS = {
  calendar: "#calendar",
  about: "#about",
  news: "#news",
  resources: "#resources",
  team: "#team",
  support: null as string | null,
};

// 學術資源卡的聊天泡泡（from＝對方藍色泡泡靠右；to＝自己灰色泡泡靠左）。
const CHAT_LINES = [
  { side: "in" as const, text: "學長學姊您好，請問你們有家產可以借我嗎……" },
  { side: "out" as const, text: "哪一門課？我這裡很多" },
];

// 工作團隊卡的彩色圓點（前段用各部門色，後段轉深灰，模擬「已招／待補」的牆面）。
const DEPT_COLORS = ["#D9A441", "#B07C43", "#5E8C3C", "#C24A4F", "#9C4A6E", "#2F9EBD", "#8C7B6B", "#C24A4F"];
const MEMBER_DOTS: string[] = Array.from({ length: 40 }, (_, i) => {
  if (i < 16) return DEPT_COLORS[i % DEPT_COLORS.length];
  if (i < 24) return "#4A4A4A";
  return "#2C2C2C";
});

const BRAND_GRADIENT = "linear-gradient(to right, #D14B4B, #2F9EBD)";
const zhBody = "'Noto Sans TC', sans-serif";

// 卡片共用外觀。
const BENTO_CARD = "group relative overflow-hidden rounded-[14px] flex flex-col";
// 卡片底色：統一深灰。要整體換色改這一行即可。
const BENTO_BG: React.CSSProperties = {
  background: "#151515",
};

// 右側小卡的底部置中標籤（英＋中），比照新設計。
function CardCaption({ en, zh }: { en: string; zh: string }) {
  return (
    <div className="mt-auto flex items-center justify-center gap-2 pt-3">
      <span className="text-white/90 tracking-[0.24em] whitespace-nowrap" style={{ ...monoSemi, fontSize: "clamp(10px, 1vw, 15px)" }}>
        {en}
      </span>
      <span className="text-white/90 whitespace-nowrap" style={{ fontFamily: zhBody, fontWeight: 700, fontSize: "clamp(11px, 1.05vw, 16px)", letterSpacing: "0.14em" }}>
        {zh}
      </span>
    </div>
  );
}

// hover 時右下角浮出的箭頭（只有可點的卡片會用）。
function HoverArrow() {
  return (
    <span
      className="absolute right-3 bottom-3 flex items-center justify-center rounded-full bg-white opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0"
      style={{ width: "clamp(28px,2.6vw,40px)", height: "clamp(28px,2.6vw,40px)" }}
    >
      <ArrowRight className="text-black" style={{ width: "clamp(13px,1.2vw,18px)", height: "auto" }} />
    </span>
  );
}

// ── 倒數圓環 ─────────────────────────────────────────────────────────────
// 角度定義：0° 在正上方（12 點），順時針遞增。
//   圓點段：從頂端順時針畫，佔比 = days / RING_FULL_DAYS（比例自動依天數偵測）。
//   實線段：剩下的部分（紅→藍漸層），順時針接回頂端。
function ringPoint(deg: number, r = 42) {
  const rad = (deg * Math.PI) / 180;
  return { x: 50 + r * Math.sin(rad), y: 50 - r * Math.cos(rad) };
}

function CountdownRing({ days }: { days: number }) {
  const R = 42;
  const dottedFrac = Math.max(0, Math.min(1, days / RING_FULL_DAYS));
  const dottedAngle = dottedFrac * 360;

  // 圓點（每 DOT_STEP 度一顆，從頂端順時針排到 dottedAngle）。
  const DOT_STEP = 10;
  const dots: { x: number; y: number }[] = [];
  if (dottedFrac > 0.0001) {
    for (let a = 0; a <= dottedAngle + 0.001; a += DOT_STEP) {
      dots.push(ringPoint(a, R));
    }
  }

  // 實線漸層弧（dottedAngle → 頂端）。
  let solid: React.ReactNode = null;
  if (dottedFrac <= 0.0001) {
    solid = <circle cx="50" cy="50" r={R} fill="none" stroke="url(#ringGrad)" strokeWidth="6" strokeLinecap="round" />;
  } else if (dottedFrac < 0.9999) {
    const p1 = ringPoint(dottedAngle, R);
    const p2 = ringPoint(359.99, R);
    const large = 360 - dottedAngle > 180 ? 1 : 0;
    solid = (
      <path d={`M ${p1.x} ${p1.y} A ${R} ${R} 0 ${large} 1 ${p2.x} ${p2.y}`} fill="none" stroke="url(#ringGrad)" strokeWidth="6" strokeLinecap="round" />
    );
  }

  return (
    // 圓環尺寸縮小一點，確保「標籤＋圓環＋標題」整組塞得進卡片、標題不被裁。
    <div className="relative flex items-center justify-center" style={{ width: "clamp(130px, 12vw, 200px)", aspectRatio: "1 / 1" }}>
      {/* 圓點循環閃現動畫（每顆錯開，形成繞圈的流動波） */}
      <style>{`@keyframes ringDotWave { 0%,100% { opacity: 0.15; } 50% { opacity: 0.9; } }`}</style>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        <defs>
          {/* 漸層以 userSpaceOnUse 定位，並用 animateTransform 緩慢旋轉 → 紅藍色彩繞著弧線流動、循環播放。 */}
          <linearGradient id="ringGrad" gradientUnits="userSpaceOnUse" x1="50" y1="8" x2="50" y2="92">
            <stop offset="0%" stopColor="#D14B4B" />
            <stop offset="100%" stopColor="#2F9EBD" />
            <animateTransform attributeName="gradientTransform" type="rotate" from="0 50 50" to="360 50 50" dur="9s" repeatCount="indefinite" />
          </linearGradient>
        </defs>
        {solid}
        {dots.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={1.5}
            fill="#ffffff"
            style={{ animation: "ringDotWave 2.4s ease-in-out infinite", animationDelay: `${i * 0.14}s` }}
          />
        ))}
      </svg>
      <div className="relative flex flex-col items-center leading-none">
        {/* 倒數天數字體：Apple 裝置用系統內建 SF Pro Rounded（ui-rounded，免安裝）；其餘退回相近字型。 */}
        <span className="text-white tabular-nums" style={{ fontFamily: "'SF Pro Rounded', ui-rounded, 'Noto Sans TC', sans-serif", fontWeight: 600, fontSize: "clamp(2rem, 4vw, 3.4rem)", letterSpacing: "0.02em" }}>
          {days}
        </span>
        <span className="text-white/60 mt-1.5" style={{ fontFamily: zhBody, fontWeight: 500, fontSize: "clamp(0.7rem, 0.95vw, 0.95rem)", letterSpacing: "0.3em" }}>
          天後
        </span>
      </div>
    </div>
  );
}

// ── 可上下拖曳的漸層條（解壓小玩具・放開回彈到頂端）──────────────────────
function PullBar() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [frac, setFrac] = useState(0); // 0=頂端（休息位）、1=底
  const [dragging, setDragging] = useState(false);

  const onDown = (e: React.PointerEvent) => {
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging || !trackRef.current) return;
    const r = trackRef.current.getBoundingClientRect();
    setFrac(Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)));
  };
  const onUp = () => {
    setDragging(false);
    setFrac(0); // 放開＝回彈到頂端
  };

  return (
    <div className={`${BENTO_CARD} items-center justify-center py-6`} style={BENTO_BG} aria-hidden>
      {/* 軌道 */}
      <div ref={trackRef} className="relative h-full" style={{ width: "6px", maxHeight: "88%" }}>
        <div className="absolute inset-0 rounded-full" style={{ background: "linear-gradient(to bottom, #D14B4B 0%, #2F9EBD 100%)", opacity: 0.9 }} />
        {/* 拖曳把手 */}
        <div
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          className="absolute left-1/2 rounded-full bg-white shadow-lg cursor-grab active:cursor-grabbing touch-none"
          style={{
            width: "clamp(22px, 2vw, 30px)",
            height: "clamp(22px, 2vw, 30px)",
            top: `${frac * 100}%`,
            transform: "translate(-50%, -50%)",
            transition: dragging ? "none" : "top 0.55s cubic-bezier(0.34,1.56,0.64,1)",
            boxShadow: "0 4px 14px rgba(0,0,0,0.45)",
          }}
        />
      </div>
    </div>
  );
}

// ── 社群卡（暫用現有圖示；SVG 文字 logo 上傳後換這裡）────────────────────
function SocialCard({ label, path, vb, href, delay }: { label: string; path: string; vb: string; href: string; delay: number }) {
  return (
    <Reveal key={label} delay={delay} className="flex-1 flex flex-col">
      <a href={href} target="_blank" rel="noopener noreferrer" className={`${BENTO_CARD} flex-1 p-4 md:p-5 cursor-pointer transition-[filter] duration-300 hover:brightness-110`} style={BENTO_BG}>
        {/* TODO：拿到文字 logo SVG 後，把下面這個 <svg> 換成品牌文字 logo，並置中即可。 */}
        <div className="flex-1 flex items-center justify-center">
          <div style={{ width: "clamp(34px, 4.5vw, 60px)", height: "clamp(34px, 4.5vw, 60px)" }}>
            <svg className="block w-full h-full" fill="none" viewBox={vb}>
              <path d={path} fill="white" fillOpacity="0.85" />
            </svg>
          </div>
        </div>
        <CardCaption en={label} zh="" />
      </a>
    </Reveal>
  );
}

// standalone=true：獨立分頁（#/overview），整頁填滿一屏。首頁捲動版維持原樣。
export default function BentoSection({ standalone = false }: { standalone?: boolean }) {
  const time = useCountdown(COUNTDOWN_TARGET);
  // 圓環顯示「天數」；若當天/已過活動，退回顯示 0，避免負數。
  const days = Math.max(0, time.d);

  return (
    <section
      id="overview"
      className={
        standalone
          ? "bg-black px-4 md:px-6 xl:px-8 pt-24 sm:pt-28 lg:pt-28 pb-6 lg:pb-10 min-h-[100svh] flex flex-col"
          : "bg-black px-4 md:px-6 xl:px-8 py-10 md:py-16"
      }
    >
      {/* 標題區塊：獨立頁（standalone / #/overview）隱藏，把整屏高度讓給格子；首頁捲動版維持顯示。 */}
      {!standalone && (
        <div className="max-w-[1680px] w-full mx-auto mb-6">
          <Reveal>
            <p
              className="tracking-[2.4px] mb-4"
              style={{ fontSize: "14px", fontFamily: "'Ubuntu Sans Mono', monospace", background: "linear-gradient(90deg, #FFF 0%, #595959 34.13%, #FFF 67.79%, #3A3A3A 100%)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundSize: "220% 100%" }}
            >
              －關於我們・資訊總覽
            </p>
            <h2 className="leading-none mb-6" style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 700, letterSpacing: "0.6px", fontSize: "clamp(2.5rem, 3.5vw, 60px)" }}>
              <span className="text-white block">YOUR</span>
              <span className="text-[#2f9ebd] block">CAMPUS PORTAL</span>
            </h2>
          </Reveal>
        </div>
      )}

      <div className={`max-w-[1680px] w-full mx-auto flex flex-col lg:flex-row gap-3 lg:gap-4 ${standalone ? "flex-1 min-h-0" : "lg:min-h-[560px] xl:min-h-[620px]"}`}>
        {/* ══ 左半：UP NEXT + 漸層條 / ABOUT 53 ══ */}
        <div className="flex flex-col gap-3 lg:gap-4 lg:w-[49.8%] shrink-0">
          {/* 上排：倒數卡（寬）＋ 漸層條（窄） */}
          <div className="flex-[1.1] flex gap-3 lg:gap-4 min-h-[240px] lg:min-h-[0]">
            <Reveal className="flex-1 flex flex-col">
              {/* 標籤＋圓環＋標題當成一個整體置中；卡片不論高矮都長一樣（首頁／獨立頁統一格式）。 */}
              <a href={LINKS.calendar} aria-label="下一場活動 — 系學會行事曆" className={`${BENTO_CARD} flex-1 p-5 md:p-6 lg:p-8 cursor-pointer items-center justify-center text-center`} style={BENTO_BG}>
                <p className="text-white tracking-[0.24em]" style={{ ...monoSemi, fontSize: "clamp(11px, 1.2vw, 19px)" }}>
                  UP NEXT&nbsp;&nbsp;下一場活動
                </p>
                <div className="my-3 md:my-4">
                  <CountdownRing days={days} />
                </div>
                <p className="text-white whitespace-nowrap overflow-hidden text-ellipsis max-w-full" style={{ fontFamily: "'Chiron Hei HK Text','Noto Sans TC', sans-serif", fontWeight: 900, fontSize: "clamp(1rem, 2.4vw, 2.2rem)", letterSpacing: "0.1em" }}>
                  {NEXT_EVENT.name}
                </p>
                <HoverArrow />
              </a>
            </Reveal>
            {/* 漸層條解壓玩具（固定窄寬） */}
            <div className="shrink-0" style={{ width: "clamp(48px, 5vw, 72px)" }}>
              <div className="h-full">
                <PullBar />
              </div>
            </div>
          </div>

          {/* 下排：ABOUT 53 卡 */}
          <Reveal delay={60} className="flex-[0.9] flex flex-col min-h-[160px] lg:min-h-[0]">
            <a href={LINKS.about} aria-label="關於臺大圖資系學會" className={`${BENTO_CARD} flex-1 p-5 md:p-6 lg:p-8 cursor-pointer`} style={BENTO_BG}>
              <div className="flex-1 flex items-center justify-center gap-4 md:gap-6">
                <span className="text-white leading-none select-none" style={{ ...monoBold, fontSize: "clamp(3.5rem, 10vw, 8rem)", textShadow: "4px 6px 8px rgba(0,0,0,0.55)" }}>
                  5
                </span>
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="overflow-hidden rounded-[40%]" style={{ width: "clamp(48px, 6vw, 90px)", height: "clamp(48px, 6vw, 90px)" }}>
                    <img src={imgLissaLogo} alt="LISSA Logo" className="w-full h-full object-contain" />
                  </div>
                  <p className="text-white text-center leading-tight" style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 700, fontSize: "clamp(0.7rem, 1vw, 1.05rem)", letterSpacing: "0.18em" }}>
                    NTU<br />LIS SA
                  </p>
                </div>
                <span className="text-white leading-none select-none" style={{ ...monoBold, fontSize: "clamp(3.5rem, 10vw, 8rem)", textShadow: "4px 6px 8px rgba(0,0,0,0.55)" }}>
                  3
                </span>
              </div>
              <CardCaption en="ABOUT US" zh="臺大圖資系學會" />
              <HoverArrow />
            </a>
          </Reveal>
        </div>

        {/* ══ 右半 ══ */}
        <div className="flex-1 flex flex-col gap-3 lg:gap-4">
          {/* 右上排：NEWS + RESOURCES */}
          <div className="flex-[1] flex gap-3 lg:gap-4 min-h-[150px] lg:min-h-[0]">
            {/* NEWS：App 圖示 + 紅點 */}
            <Reveal delay={80} className="flex-1 flex flex-col">
              <a href={LINKS.news} aria-label="最新動態" className={`${BENTO_CARD} flex-1 p-5 md:p-6 cursor-pointer`} style={BENTO_BG}>
                <div className="flex-1 flex items-center justify-center">
                  <div className="relative">
                    <div className="rounded-[26%] bg-[#1c1c1e] border border-white/10 flex items-center justify-center" style={{ width: "clamp(64px, 8vw, 120px)", height: "clamp(64px, 8vw, 120px)" }}>
                      <img src={imgLissaLogo} alt="" className="object-contain opacity-90" style={{ width: "62%", height: "62%" }} />
                    </div>
                    {/* 紅色未讀紅點 */}
                    <span className="absolute -top-1.5 -right-1.5 rounded-full flex items-center justify-center text-white" style={{ width: "clamp(20px, 2.2vw, 30px)", height: "clamp(20px, 2.2vw, 30px)", background: "#E5484D", ...monoBold, fontSize: "clamp(10px, 1.1vw, 15px)" }}>
                      5
                    </span>
                  </div>
                </div>
                <CardCaption en="NEWS" zh="最新動態" />
                <HoverArrow />
              </a>
            </Reveal>

            {/* RESOURCES：聊天泡泡 */}
            <Reveal delay={100} className="flex-1 flex flex-col">
              <a href={LINKS.resources} aria-label="學術資源" className={`${BENTO_CARD} flex-1 p-5 md:p-6 cursor-pointer`} style={BENTO_BG}>
                <div className="flex-1 flex flex-col justify-center gap-2.5">
                  {CHAT_LINES.map((c, i) => (
                    <div key={i} className={`flex ${c.side === "in" ? "justify-end" : "justify-start"}`}>
                      <span
                        className="inline-block rounded-2xl px-3 py-2 leading-snug"
                        style={{
                          maxWidth: "82%",
                          fontFamily: zhBody, fontWeight: 500, fontSize: "clamp(0.7rem, 0.95vw, 0.95rem)", letterSpacing: "0.02em",
                          color: c.side === "in" ? "#fff" : "#1a1a1a",
                          background: c.side === "in" ? "rgba(47,158,189,0.85)" : "rgba(255,255,255,0.9)",
                          borderBottomRightRadius: c.side === "in" ? "4px" : undefined,
                          borderBottomLeftRadius: c.side === "out" ? "4px" : undefined,
                        }}
                      >
                        {c.text}
                      </span>
                    </div>
                  ))}
                </div>
                <CardCaption en="RESOURCES" zh="學術資源" />
                <HoverArrow />
              </a>
            </Reveal>
          </div>

          {/* 右中排：MEMBERS 圓點牆 + SUPPORT US 小豬 */}
          <div className="flex-[1] flex gap-3 lg:gap-4 min-h-[150px] lg:min-h-[0]">
            {/* MEMBERS：彩色圓點牆 */}
            <Reveal delay={120} className="flex-1 flex flex-col">
              <a href={LINKS.team} aria-label="工作團隊" className={`${BENTO_CARD} flex-1 p-5 md:p-6 cursor-pointer`} style={BENTO_BG}>
                <div className="flex-1 flex items-center justify-center">
                  <div className="grid gap-1.5 md:gap-2" style={{ gridTemplateColumns: "repeat(8, minmax(0, 1fr))", width: "min(100%, 320px)" }}>
                    {MEMBER_DOTS.map((c, i) => (
                      <span key={i} className="rounded-full aspect-square w-full" style={{ background: c }} />
                    ))}
                  </div>
                </div>
                <CardCaption en="MEMBERS" zh="工作團隊" />
                <HoverArrow />
              </a>
            </Reveal>

            {/* SUPPORT US：小豬撲滿（暫不連結 → 用 div，無 hover 箭頭） */}
            <Reveal delay={140} className="flex-1 flex flex-col">
              <div className={`${BENTO_CARD} flex-1 p-5 md:p-6`} style={BENTO_BG}>
                <div className="flex-1 flex items-center justify-center">
                  <PiggyBank className="text-white/85" strokeWidth={1.4} style={{ width: "clamp(56px, 7vw, 110px)", height: "auto" }} />
                </div>
                <CardCaption en="SUPPORT US" zh="贊助我們" />
              </div>
            </Reveal>
          </div>

          {/* 右下排：社群 */}
          <div className="flex-[0.85] flex gap-3 lg:gap-4 min-h-[90px] lg:min-h-[0]">
            <SocialCard label="INSTAGRAM" path={svgPaths.p372aef00} vb="0 0 64 64" href="https://www.instagram.com/ntu_lis_sa?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" delay={160} />
            <SocialCard label="FACEBOOK" path={svgPaths.p1c5aa00} vb="0 0 64 64" href="https://www.facebook.com/ntulislis" delay={180} />
            <SocialCard label="THREADS" path={svgPaths.p3455000} vb="0 0 55 64" href="https://www.threads.com/@ntu_lis_sa" delay={200} />
          </div>
        </div>
      </div>
    </section>
  );
}