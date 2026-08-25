import { useRef, useState } from "react";
import { PiggyBank } from "lucide-react";
import imgLissaLogo from "@/imports/LISSA_Logo.png";
import svgPaths from "@/imports/BentoGrid-1/svg-lp3prmbugu";
// ── ABOUT 卡（第 53 屆）中間的系學會 Logo（SVG，清晰不糊）──────────
// 放到  src/imports/BentoGrid/NTULISSAlogo.svg（檔名需一致）。
// 左右的大數字 5、3 不再用 SVG，改由程式碼「疊三層」堆出立體旋轉效果（見下方 Rotating3DNumber）。
import aboutLogo from "@/imports/BentoGrid/NTULISSAlogo.svg";
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

// ── 「下一場活動」卡片：標籤／Donut／標題 的間距、圓環大小、標題大小 ────────────────
// 這張卡片「首頁捲動版」與「獨立頁（#/overview）」共用同一份排版，改這裡兩邊會一起變。
//
// ⚠ 重要觀念（為什麼調大反而更擠）：這三個元素是「一整組、垂直置中」放進固定高度的格子。
//   把 GAP 或 RING 調大 → 這一組會變高變寬 → 格子大小沒變，四周留白反而更少 = 看起來更擠。
//   想要「更有呼吸感」→ 反過來把數字調小（讓這一組變小、四周留白變多）。目前刻意收小，讓它在格子裡浮起來。
const NEXT_LABEL_GAP = 20; // 「UP NEXT 下一場活動」標籤 → Donut 圓環 的距離（px）
const NEXT_TITLE_GAP = 35; // Donut 圓環 → 活動標題 的距離（px）
// Donut 圓環直徑：clamp(最小, 隨螢幕縮放, 最大)。整組太高頂到卡片上下 → 先把最大值（140px）往下調。
const NEXT_RING_SIZE = "clamp(200px, 10vw, 300px)";
// 活動標題字級：clamp(最小, 隨螢幕縮放, 最大)。標題太寬快貼到卡片左右 → 把最大值（1.85rem）調小就會空出左右留白。
const NEXT_TITLE_SIZE = "clamp(1rem, 2.2vw, 1.85rem)";

// ── 首頁捲動版最上方的大標題（YOUR CAMPUS PORTAL ＋「－關於我們・資訊總覽」小標）─────
// false＝整塊隱藏，把上方空間全讓給下面的格子（獨立頁 #/overview 本來就沒有這塊，兩邊更一致）。
// 想讓標題回來 → 改成 true。
// ※ 注意：格子高度已改成「兩個版本一致」——整個 section 都佔滿一屏（min-h-[100svh]）、格子用 flex-1 撐滿剩餘高度。
//   關著（預設 false）時，首頁捲動版與獨立頁的格子大小完全相同；若改成 true 打開標題，
//   標題會佔掉一點高度，首頁版的格子會比獨立頁「略矮一點點」（想完全一致就維持關閉）。
const SHOW_HOME_HEADER = false;

// ABOUT 卡的大字屆數（保留備用；5、3 由 Rotating3DNumber 直接以「5」「3」呈現）。
const SESSION_NO = "53";
// 中間系學會 Logo 的高度（SVG，用 height 控制、寬度自動）。
const ABOUT_LOGO_H = "clamp(60px, 10vw, 128px)";
// ── 左右「立體旋轉數字」（三層堆疊 + 3D rotateY）。想調整全在這裡 ─────────────
const ABOUT_NUM_SIZE = "clamp(4rem, 11vw, 9rem)"; // 數字字級（整體大小）
const NUM3D_LAYERS = 3;   // 疊幾層＝你要的「三個一樣的數字」
const NUM3D_DEPTH = 6;    // 每層之間的厚度（px；越大越立體）
const NUM3D_BASE = 18;    // 平常轉動的基準角度（deg；讓它「不會轉到正面變平」）
const NUM3D_SWING = 14;   // 左右來回擺動幅度（deg）
const NUM3D_SPEED = 6;    // 來回一次的秒數（越大越慢）

// 各卡片點擊目標。support=null 代表暫不連結（會費＋贊助整合後再接）。
const LINKS = {
  calendar: "#calendar",
  about: "#about", // ★ 暫時擱置：ABOUT 卡目前「不連結」（等「學會發展歷程」公告頁做好再接）。要接時見下方 ABOUT 卡的 TODO。
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

// ── 「平常隱藏、hover 才平滑展開」的文字（標籤／說明）──────────────────────────
// 作法：外層 grid 的 grid-template-rows 由 0fr（收合）→ 1fr（展開），高度會平滑變化；
//       搭配卡片本身的 flex 置中，卡片內其他元素（圖示／圓環／標題）會自動、平順地重新置中。
// 觸發：hover 由卡片外框的 .group 觸發（BENTO_CARD 已含 group）。
// ★ 手機／觸控（沒有 hover 的裝置）：用 @media(hover:hover) 包住「隱藏」邏輯 → 這些裝置「一律直接顯示」文字，
//   不會發生「碰不到 hover 就永遠看不到說明」的問題。
// ★ 想調動畫速度：改 duration-500（毫秒）。想讓某段文字永遠顯示：就別用這個元件包它。
// ★ 尊重「減少動態」：motion-reduce 時不做過場（直接切換）。
function HoverReveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`grid grid-rows-[1fr] opacity-100 transition-all duration-500 ease-out [@media(hover:hover)]:grid-rows-[0fr] [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:grid-rows-[1fr] [@media(hover:hover)]:group-hover:opacity-100 motion-reduce:transition-none ${className}`}
    >
      <div className="overflow-hidden min-h-0">{children}</div>
    </div>
  );
}

// 右側小卡的底部置中標籤（英＋中）。平常隱藏，hover 才平滑展開（見 HoverReveal）；mt-auto 讓它貼在卡片底部。
function CardCaption({ en, zh }: { en: string; zh: string }) {
  return (
    <HoverReveal className="mt-auto">
      <div className="flex items-center justify-center gap-2 pt-3">
        <span className="text-white/90 tracking-[0.24em] whitespace-nowrap" style={{ ...monoSemi, fontSize: "clamp(10px, 1vw, 15px)" }}>
          {en}
        </span>
        <span className="text-white/90 whitespace-nowrap" style={{ fontFamily: zhBody, fontWeight: 700, fontSize: "clamp(11px, 1.05vw, 16px)", letterSpacing: "0.14em" }}>
          {zh}
        </span>
      </div>
    </HoverReveal>
  );
}

// ── ABOUT 卡：立體旋轉數字（把同一個數字疊 NUM3D_LAYERS 層做出厚度，再用 rotateY 緩緩轉動）──
// 字體：Josefin Sans、font-weight 300（light）。前層最亮、往後越暗＝厚度感。
// 只在一個基準角度附近來回擺（不會轉到正側面變成一條線）；尊重「減少動態」設定。
// 想調整：ABOUT_NUM_SIZE（大小）、NUM3D_DEPTH（厚度）、NUM3D_BASE/SWING（角度）、NUM3D_SPEED（速度）。
function Rotating3DNumber({ ch, phase = 0 }: { ch: string; phase?: number }) {
  const layers = Array.from({ length: NUM3D_LAYERS }, (_, i) => {
    const t = NUM3D_LAYERS <= 1 ? 0 : i / (NUM3D_LAYERS - 1); // 0（最前）→ 1（最後）
    const v = Math.round(255 - t * 150); // 亮度 255（白）→ 105（暗灰）
    return { z: -i * NUM3D_DEPTH, color: `rgb(${v},${v},${v})` };
  });
  return (
    <div
      className="select-none shrink-0"
      aria-hidden
      style={{ perspective: "700px", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, fontSize: ABOUT_NUM_SIZE, lineHeight: 1 }}
    >
      <style>{`
        @keyframes num3dSwing {
          0%, 100% { transform: rotateY(calc((var(--base) + var(--swing)) * 1deg)); }
          50%      { transform: rotateY(calc((var(--base) - var(--swing)) * 1deg)); }
        }
        @media (prefers-reduced-motion: reduce) {
          .num3d-inner { animation: none !important; transform: rotateY(calc(var(--base) * 1deg)); }
        }
      `}</style>
      <div
        className="num3d-inner"
        style={{
          display: "grid",
          transformStyle: "preserve-3d",
          animation: `num3dSwing ${NUM3D_SPEED}s ease-in-out infinite`,
          animationDelay: `${phase}s`,
          "--base": NUM3D_BASE,
          "--swing": NUM3D_SWING,
        } as React.CSSProperties}
      >
        {layers.map((l, i) => (
          <span
            key={i}
            style={{
              gridArea: "1 / 1",
              transform: `translateZ(${l.z}px)`,
              color: l.color,
              textShadow: i === 0 ? "0 4px 12px rgba(0,0,0,0.45)" : undefined,
            }}
          >
            {ch}
          </span>
        ))}
      </div>
    </div>
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

function CountdownRing({ days, size = NEXT_RING_SIZE }: { days: number; size?: string }) {
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
    // 圓環尺寸由 NEXT_RING_SIZE（或傳入的 size）控制，確保「標籤＋圓環＋標題」整組塞得進卡片、標題不被裁。
    <div className="relative flex items-center justify-center" style={{ width: size, aspectRatio: "1 / 1" }}>
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
        <span className="text-white tabular-nums" style={{ fontFamily: "'SF Pro Rounded', ui-rounded, 'Noto Sans TC', sans-serif", fontWeight: 600, fontSize: "clamp(2rem, 4vw, 3.0rem)", letterSpacing: "0.02em" }}>
          {days}
        </span>
        <span className="text-white/60 mt-1.5" style={{ fontFamily: "'Chiron Hei HK Text'", fontWeight: 700, fontSize: "clamp(0.7rem, 0.95vw, 0.95rem)", letterSpacing: "0.3em" ,color:"#FFFFFF" }}>
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

// standalone=true：獨立分頁（#/overview）。註：兩個版本的版面外框與格子大小現在完全一致；
// standalone 目前只用來決定「是否套用首頁標題開關」（見下方 SHOW_HOME_HEADER），不再影響格子高度。
export default function BentoSection({ standalone = false }: { standalone?: boolean }) {
  const time = useCountdown(COUNTDOWN_TARGET);
  // 圓環顯示「天數」；若當天/已過活動，退回顯示 0，避免負數。
  const days = Math.max(0, time.d);

  return (
    // 版面外框：兩個版本（首頁捲動版 & 獨立頁 #/overview）共用同一套 → 整個 section 佔滿一屏（min-h-[100svh]），
    // 讓下面的格子在兩邊都是「完全相同的高度／大小」。以前首頁版用 py-16 + 固定 min-h[560px]，格子才會比獨立頁矮、看起來不一樣。
    // ※ pt-28 是留給固定 Header 的空間（避免最上排卡片被 Header 蓋住）；pb 是底部留白。
    <section
      id="overview"
      className="bg-black px-4 md:px-6 xl:px-8 pt-24 sm:pt-28 lg:pt-28 pb-6 lg:pb-10 min-h-[100svh] flex flex-col"
    >
      {/* 標題區塊：獨立頁（standalone / #/overview）本來就不顯示；首頁捲動版由上方 SHOW_HOME_HEADER 開關控制（目前關閉＝隱藏，把空間讓給格子）。 */}
      {!standalone && SHOW_HOME_HEADER && (
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

      {/* 格子容器：flex-1 撐滿 section 剩餘高度（兩個版本一致）。以前首頁版是寫死的 lg:min-h-[560px]，才會比獨立頁矮。 */}
      <div className="max-w-[1680px] w-full mx-auto flex flex-col lg:flex-row gap-3 lg:gap-4 flex-1 min-h-0">
        {/* ══ 左半：UP NEXT + 漸層條 / ABOUT 53 ══ */}
        <div className="flex flex-col gap-3 lg:gap-4 lg:w-[49.8%] shrink-0">
          {/* 上排：倒數卡（寬）＋ 漸層條（窄） */}
          <div className="flex-[1.1] flex gap-3 lg:gap-4 min-h-[240px] lg:min-h-[0]">
            <Reveal className="flex-1 flex flex-col">
              {/* 標籤＋圓環＋標題當成一個整體置中；卡片不論高矮都長一樣（首頁／獨立頁統一格式）。 */}
              <a href={LINKS.calendar} aria-label="下一場活動 — 系學會行事曆" className={`${BENTO_CARD} flex-1 p-5 md:p-6 lg:p-8 cursor-pointer items-center justify-center text-center`} style={BENTO_BG}>
                {/* 「標籤 → Donut → 標題」整組垂直置中於卡片；首頁捲動版與獨立頁排版完全相同。
                    ▸ 間距/大小：NEXT_LABEL_GAP、NEXT_TITLE_GAP、NEXT_RING_SIZE、NEXT_TITLE_SIZE（都在檔案最上方）。
                    ▸ 覺得整張卡片太擠 → 把上面那些「調小」讓整組浮起來、四周才有留白（不是調大）。
                    ▸「UP NEXT 下一場活動」標籤：桌機平常隱藏、hover 才平滑展開（見 HoverReveal），此時整組自動重新置中；觸控裝置一律顯示。 */}
                <HoverReveal>
                  <p className="text-white tracking-[0.24em]" style={{ ...monoSemi, fontSize: "clamp(11px, 1.2vw, 19px)", marginBottom: NEXT_LABEL_GAP }}>
                    UP NEXT&nbsp;&nbsp;下一場活動
                  </p>
                </HoverReveal>
                <CountdownRing days={days} size={NEXT_RING_SIZE} />
                {/* 標題：維持單行（whitespace-nowrap，比照原型）；已移除 text-ellipsis，改由上方縮小圓環＋間距讓它完整顯示、不再被切。 */}
                <p className="text-white whitespace-nowrap max-w-full" style={{ fontFamily: "'Chiron Hei HK Text','Noto Sans TC', sans-serif", fontWeight: 900, fontSize: NEXT_TITLE_SIZE, letterSpacing: "0.08em", marginTop: NEXT_TITLE_GAP }}>
                  {NEXT_EVENT.name}
                </p>
              </a>
            </Reveal>
            {/* 漸層條解壓玩具（固定窄寬） */}
            <div className="shrink-0" style={{ width: "clamp(48px, 5vw, 72px)" }}>
              <div className="h-full">
                <PullBar />
              </div>
            </div>
          </div>

          {/* 下排：ABOUT 53 卡 —— 中間系學會 Logo（SVG）＋ 左右大數字 5、3（SVG，你的三層堆疊設計）。
              ★ 連結暫時擱置：等「學會發展歷程」公告頁做好後，把下面外層的 <div> 換回
                <a href="#你的公告頁路由" aria-label="…" className={`${BENTO_CARD} flex-1 p-5 md:p-6 lg:p-8 cursor-pointer`} …>
                （記得加回 cursor-pointer），CardCaption 的 hover 展開不受影響。 */}
          <Reveal delay={60} className="flex-[0.9] flex flex-col min-h-[160px] lg:min-h-[0]">
            <div aria-label="關於臺大圖資系學會 — 第 53 屆" className={`${BENTO_CARD} flex-1 p-5 md:p-6 lg:p-8`} style={BENTO_BG}>
              <div className="flex-1 flex items-center justify-center gap-4 md:gap-8">
                {/* 左：立體旋轉數字 5（三層堆疊，見 Rotating3DNumber） */}
                <Rotating3DNumber ch="5" />
                {/* 中：系學會 Logo（SVG）。※ 若這個檔只有中間圖形、沒有「NTU LIS SA／臺大圖資系學會」字樣，跟我說，我再把字樣加回來。 */}
                <img src={aboutLogo} alt="臺大圖資系學會 NTU LIS SA" className="w-auto select-none shrink-0" style={{ height: ABOUT_LOGO_H }} />
                {/* 右：立體旋轉數字 3（與 5 反相擺動，phase 給負值錯開） */}
                <Rotating3DNumber ch="3" phase={-NUM3D_SPEED / 2} />
              </div>
              <CardCaption en="ABOUT US" zh="臺大圖資系學會" />
            </div>
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