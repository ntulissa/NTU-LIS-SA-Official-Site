import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { PageEyebrow, Reveal } from "./shared";

// ─────────────────────────────────────────────────────────────────────────
// 關於我們（AboutUsSection · 取代舊 HistorySection，錨點仍為 #about）
// 仿 Apple 展覽頁：白色卡片橫向並排，可左右滑動／按鈕切換。
//   ① SINCE 1974        ：since1974.svg ＋ 創立敘述
//   ② 避風港            ：碼頭 ntulissaport.svg ＋ 流動波浪 ＋ 小船搖晃漂移
//   ③ 向心力            ：六顆部門色球繞著 ntulissa 旋轉
//   ④ 橋樑              ：斜張橋 ＋ 橋中間放六色煙火（雪梨跨年風）
//   ⑤ 玩？              ：玩.svg ＋ 會擺動的問號
//   ⑥ 連結              ：認識現任團隊／認識歷屆團隊／加入我們
//
// 素材（缺檔不會壞，會顯示替代圖）：
//   src/imports/AboutUs/since1974.svg、ntulissaport.svg、玩.svg
//   src/imports/JoinUs/ntulissa.svg
// ★ 尺寸、動畫速度都集中在《版面常數區》。
// ─────────────────────────────────────────────────────────────────────────

const zhHead = "'Chiron Hei HK Text','Noto Sans TC', sans-serif";
const zhBody = "'Noto Sans TC', sans-serif";
const mono   = "'Ubuntu Sans Mono','Noto Sans TC', monospace";

// ── 素材自動讀取（舊版 Vite 請把 query/import 換成 as:"url"）──
const ASSETS = import.meta.glob(["/src/**/AboutUs/*.{svg,png,webp}"], {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
function asset(folder: string, ...files: string[]): string | undefined {
  for (const f of files) {
    const hit = Object.keys(ASSETS).find((p) => p.endsWith(`/${folder}/${f}`));
    if (hit) return ASSETS[hit];
  }
  return undefined;
}

// ══════════════════════════════════════════════════════════════
// ★★ 版面常數區 ★★
// ══════════════════════════════════════════════════════════════
const EYEBROW = "關於我們・學會簡介";
const HEADING = { text: "你想知道的臺大圖資系學會", size: 48 };
const CARD = {
  w: "min(600px, max(min(78vw, 380px), 34vw))", // 卡片寬：桌機約 34vw、手機約 78vw、最大 600px
  ratio: "700 / 760",             // 卡片寬高比
  gap: 28,                        // 卡片間距(px)
  radius: 20,                     // 圓角(px)
};
const CARD_TEXT = { size: 24, lh: 2, ls: "0.2em" }; // 卡片敘述文字（Chiron Hei 700）
const SHOW_QMARK = true;          // 若 玩.svg 已經包含「？」，改成 false
const FIREWORK_EVERY = 520;       // 煙火發射間隔(ms)
const ORBIT_SEC = 22;             // 向心力：繞一圈秒數

// 正副會長 ＋ 五部門色（與 TeamSection / JoinUs 一致）
const SIX = ["#A27F00", "#915E3E", "#9F353A", "#42602D", "#572A3F", "#23658A"];

// 第六張卡的連結
const LINKS = [
  { label: "認識現任團隊", sub: "第 53 屆系學會", href: "#/current-team" },
  { label: "認識歷屆團隊", sub: "了解臺大圖資系學會自創立以來各屆團隊事蹟", href: "#/presidents" },
  { label: "加入我們", sub: "加入工作團隊", href: "#/join" },
];

// ══════════════════════════════════════════════════════════════
// 共用
// ══════════════════════════════════════════════════════════════
function useInView<T extends Element>(threshold = 0.25) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

function CardText({ children, align = "center" }: { children: ReactNode; align?: "center" | "left" }) {
  return (
    <p
      className="text-black"
      style={{ fontFamily: zhHead, fontWeight: 700, fontSize: `clamp(14px, 1.45vw, ${CARD_TEXT.size}px)`, lineHeight: CARD_TEXT.lh, letterSpacing: CARD_TEXT.ls, textAlign: align }}
    >
      {children}
    </p>
  );
}

// 卡片外殼：上方視覺（撐滿剩餘高度）＋ 下方文字
function Card({ visual, text, bleed = false }: { visual: ReactNode; text?: ReactNode; bleed?: boolean }) {
  return (
    <article
      className="ab-card relative shrink-0 bg-white overflow-hidden flex flex-col"
      style={{ width: CARD.w, aspectRatio: CARD.ratio, borderRadius: CARD.radius, scrollSnapAlign: "start" }}
    >
      <div className={`flex-1 min-h-0 flex items-center justify-center ${bleed ? "" : "px-[8%]"}`}>{visual}</div>
      {text && <div className="px-[8%] pb-[9%]">{text}</div>}
    </article>
  );
}

// ══════════════════════════════════════════════════════════════
// ① SINCE 1974
// ══════════════════════════════════════════════════════════════
function SinceVisual() {
  const src = asset("AboutUs", "since1974.svg", "since1974.png");
  if (src) return <img src={src} alt="SINCE 1974 民國六十三年" className="ab-rise w-[62%] h-auto select-none" draggable={false} />;
  return (
    <div className="ab-rise text-black text-center select-none">
      <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 700, fontSize: "clamp(18px,2.2vw,40px)", letterSpacing: "0.2em" }}>SINCE</p>
      <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 700, fontSize: "clamp(56px,7vw,130px)", letterSpacing: "0.1em", lineHeight: 1.1 }}>1974</p>
      <p style={{ fontFamily: "'Noto Serif TC', serif", fontWeight: 900, fontSize: "clamp(16px,1.8vw,32px)", letterSpacing: "0.1em" }}>民國六十三年</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ② 避風港：碼頭 ＋ 波浪 ＋ 小船
// ══════════════════════════════════════════════════════════════
const WAVE_P = 90;   // 波長
function wavePath(y: number, x0: number, x1: number, amp = 13) {
  let d = `M${x0} ${y}`;
  for (let x = x0 + 3; x <= x1; x += 3) d += ` L${x} ${(y - amp * Math.sin(((x - x0) / WAVE_P) * 2 * Math.PI)).toFixed(1)}`;
  return d;
}

function HarborVisual() {
  const port = asset("AboutUs", "ntulissaport.svg", "ntulissaport.png");
  const W1 = 205, W2 = 300, X0 = 418, X1 = 955;
  return (
    <svg viewBox="0 0 1000 400" className="w-full h-auto overflow-visible" aria-label="避風港：小船停靠在 ntu lis sa 碼頭">
      <defs>
        <clipPath id="abWaveClip"><rect x={X0 - 2} y="0" width={X1 - X0 + 2} height="400" /></clipPath>
        <linearGradient id="abWaveFade" x1="0" x2="1">
          <stop offset="0.9" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="abWaveMask"><rect x={X0 - 2} y="0" width={X1 - X0 + 2} height="400" fill="url(#abWaveFade)" /></mask>
      </defs>

      {/* 波浪（往碼頭方向流動） */}
      <g clipPath="url(#abWaveClip)" mask="url(#abWaveMask)" fill="none" stroke="#000" strokeWidth="10" strokeLinecap="round">
        <path className="ab-wave" d={wavePath(W1, X0, X1 + WAVE_P * 2)} />
        <path className="ab-wave ab-wave-slow" d={wavePath(W2, X0, X1 + WAVE_P * 2)} />
      </g>

      {/* 小船：左右漂移 ＋ 上下搖晃 */}
      <g className="ab-boat-drift">
        <g className="ab-boat-bob"><g transform="translate(695 250) scale(1.2) translate(-695 -250)">
          <path d="M600 190 L790 190 L765 250 L625 250 Z" fill="#000" />
          <rect x="690" y="70" width="8" height="122" fill="#000" />
          <path className="ab-flag" d="M698 72 L770 104 L698 132 Z" fill="#000" />
        </g></g>
      </g>

      {/* 碼頭（ntulissaport.svg；缺檔時畫替代版） */}
      {port ? (
        <image href={port} x="40" y="60" width="380" height="290" preserveAspectRatio="xMidYMid meet" />
      ) : (
        <g>
          <rect x="45" y="65" width="370" height="280" rx="30" fill="#fff" stroke="#000" strokeWidth="12" />
          <text x="230" y="200" textAnchor="middle" style={{ fontFamily: "cursive", fontSize: 56 }}>ntu lis sa</text>
          {SIX.map((c, i) => <circle key={c} cx={155 + i * 36} cy={245} r={13} fill={c} />)}
        </g>
      )}
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════
// ③ 向心力：六色球繞著 ntulissa 旋轉
// ══════════════════════════════════════════════════════════════
function OrbitVisual() {
  const logo = asset("AboutUs", "ntulissa.svg");
  const R = 190;
  return (
    <svg viewBox="0 0 600 600" className="w-[88%] h-auto" aria-label="六個部門圍繞著 ntu lis sa">
      <g className="ab-orbit" style={{ animationDuration: `${ORBIT_SEC}s` }}>
        {SIX.map((c, i) => {
          const a = (i / SIX.length) * Math.PI * 2 - Math.PI / 2;
          return (
            <g key={c} transform={`translate(${300 + R * Math.cos(a)} ${300 + R * Math.sin(a)}) rotate(${(a * 180) / Math.PI + 90})`}>
              {/* 徑向呼吸：往外、往內輕微浮動 */}
              <g className="ab-breathe" style={{ animationDelay: `${-i * 0.7}s` }}>
                <circle r="26" fill={c} />
              </g>
            </g>
          );
        })}
      </g>
      {logo ? (
        <image href={logo} x="160" y="255" width="280" height="90" preserveAspectRatio="xMidYMid meet" />
      ) : (
        <text x="300" y="315" textAnchor="middle" style={{ fontFamily: "cursive", fontSize: 58 }}>ntu lis sa</text>
      )}
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════
// ④ 橋樑：斜張橋 ＋ 煙火
// ══════════════════════════════════════════════════════════════
type Burst = { id: number; x: number; y: number; c: string; n: number; r: number };
const DECK_Y = 250;

function Firework({ b }: { b: Burst }) {
  const parts = Array.from({ length: b.n }, (_, k) => {
    const a = (k / b.n) * Math.PI * 2 + (k % 2) * 0.12;
    return { dx: Math.cos(a) * b.r, dy: Math.sin(a) * b.r };
  });
  return (
    <g>
      {/* 升空 */}
      <circle className="ab-rocket" cx={b.x} cy={b.y} r="5" fill={b.c} style={{ ["--rise" as string]: `${DECK_Y - b.y}px` } as CSSProperties} />
      {/* 外圈 */}
      {parts.map((p, k) => (
        <circle key={k} className="ab-spark" cx={b.x} cy={b.y} r="7" fill={b.c} style={{ ["--dx" as string]: `${p.dx}px`, ["--dy" as string]: `${p.dy}px` } as CSSProperties} />
      ))}
      {/* 內圈（小點） */}
      {parts.filter((_, k) => k % 2 === 0).map((p, k) => (
        <circle key={`i${k}`} className="ab-spark ab-spark-in" cx={b.x} cy={b.y} r="4" fill={b.c} style={{ ["--dx" as string]: `${p.dx * 0.5}px`, ["--dy" as string]: `${p.dy * 0.5}px` } as CSSProperties} />
      ))}
    </g>
  );
}

function BridgeVisual() {
  const [ref, inView] = useInView<SVGSVGElement>(0.3);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    if (!inView) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let colorIdx = Math.floor(Math.random() * SIX.length);
    const spawn = () => {
      const id = idRef.current++;
      colorIdx = (colorIdx + 1 + Math.floor(Math.random() * 2)) % SIX.length;
      const b: Burst = { id, x: 240 + Math.random() * 520, y: -150 + Math.random() * 190, c: SIX[colorIdx], n: 14 + Math.floor(Math.random() * 6), r: 70 + Math.random() * 45 };
      setBursts((cur) => [...cur.slice(-10), b]);
      window.setTimeout(() => setBursts((cur) => cur.filter((x) => x.id !== id)), 2300);
    };
    spawn();
    const iv = window.setInterval(spawn, FIREWORK_EVERY);
    return () => window.clearInterval(iv);
  }, [inView]);

  // 斜張索：[塔頂 y, 橋面 x]
  const inner = [[20, 500], [55, 385], [95, 265]];
  const outer = [[20, -10], [55, -10], [95, -10]];
  const outerY = [70, 120, 215];
  return (
    <svg ref={ref} viewBox="0 -230 1000 540" className="w-full h-auto" aria-label="斜張橋與煙火">
      {/* 煙火在橋的後面 */}
      {bursts.map((b) => <Firework key={b.id} b={b} />)}

      <g fill="none" stroke="#000" strokeWidth="16" strokeLinecap="butt">
        {/* 左塔 */}
        {inner.map(([ty, dx], i) => <line key={`li${i}`} x1="160" y1={ty} x2={dx} y2={DECK_Y - 12} />)}
        {outer.map(([ty], i) => <line key={`lo${i}`} x1="95" y1={ty} x2="-10" y2={outerY[i]} />)}
        {/* 右塔（鏡像） */}
        {inner.map(([ty, dx], i) => <line key={`ri${i}`} x1="840" y1={ty} x2={1000 - dx} y2={DECK_Y - 12} />)}
        {outer.map(([ty], i) => <line key={`ro${i}`} x1="905" y1={ty} x2="1010" y2={outerY[i]} />)}
      </g>
      {/* 橋面（在塔柱處斷開） */}
      <rect x="-10" y={DECK_Y} width="100" height="24" fill="#000" />
      <rect x="165" y={DECK_Y} width="670" height="24" fill="#000" />
      <rect x="910" y={DECK_Y} width="100" height="24" fill="#000" />
      {/* 塔柱 */}
      <rect x="112" y="0" width="30" height="365" fill="#000" />
      <rect x="858" y="0" width="30" height="365" fill="#000" />
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════
// ⑤ 玩？
// ══════════════════════════════════════════════════════════════
function PlayVisual() {
  const src = asset("AboutUs", "玩.svg", "play.svg", "玩.png");
  return (
    <div className="flex items-end justify-center select-none" style={{ gap: "4%" }}>
      {src ? (
        <img src={src} alt="玩" className="ab-hop h-auto" style={{ width: SHOW_QMARK ? "46%" : "80%" }} draggable={false} />
      ) : (
        <span className="ab-hop text-black" style={{ fontFamily: zhHead, fontWeight: 900, fontSize: "clamp(90px, 12vw, 220px)", lineHeight: 1 }}>玩</span>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ⑥ 連結
// ══════════════════════════════════════════════════════════════
function LinksCard() {
  return (
    <article
      className="ab-card relative shrink-0 bg-white overflow-hidden"
      style={{ width: CARD.w, aspectRatio: CARD.ratio, borderRadius: CARD.radius, scrollSnapAlign: "start" }}
    >
      {/* 內層再包一層：padding 百分比才會以「卡片寬」計算 */}
      <div className="absolute inset-0 flex flex-col justify-center" style={{ padding: "0 7%", gap: "9%" }}>
      {LINKS.map((l) => (
        <div key={l.href}>
          <a
            href={l.href}
            className="inline-flex items-center gap-[0.7em] whitespace-nowrap bg-black text-white rounded-full hover:bg-[#2a2a2a] transition-colors duration-200 group"
            style={{ fontFamily: zhBody, fontWeight: 900, fontSize: "clamp(17px, 2vw, 38px)", letterSpacing: "0.06em", padding: "0.4em 1.1em" }}
          >
            {l.label}
            <ArrowRight strokeWidth={3} className="group-hover:translate-x-1 transition-transform duration-200" style={{ width: "1em", height: "1em" }} />
          </a>
          <p className="text-black mt-[0.9em]" style={{ fontFamily: zhHead, fontWeight: 700, fontSize: "clamp(12px, 1.2vw, 20px)", letterSpacing: "0.18em", paddingLeft: "0.4em" }}>
            {l.sub}
          </p>
        </div>
      ))}
      </div>
    </article>
  );
}

// ══════════════════════════════════════════════════════════════
// 輪播控制鈕（Apple 式圓形箭頭）
// ══════════════════════════════════════════════════════════════
function NavBtn({ dir, disabled, onClick }: { dir: "prev" | "next"; disabled: boolean; onClick: () => void }) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "上一張" : "下一張"}
      className="flex items-center justify-center rounded-full border-2 border-white text-white transition-all duration-200 hover:bg-white hover:text-black disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-white disabled:cursor-default"
      style={{ width: 46, height: 46 }}
    >
      <Icon size={24} strokeWidth={2.4} />
    </button>
  );
}

// ══════════════════════════════════════════════════════════════
export default function AboutUsSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = () => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft + el.clientWidth > el.scrollWidth - 8);
  };
  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const step = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".ab-card");
    const w = card ? card.offsetWidth + CARD.gap : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * w, behavior: "smooth" });
  };

  return (
    <section id="about" className="bg-black relative min-h-screen flex flex-col justify-center pt-[var(--page-content-top)] pb-16 overflow-hidden">
      <style>{`
        .ab-track { scrollbar-width: none; -ms-overflow-style: none; }
        .ab-track::-webkit-scrollbar { display: none; }
        .ab-card { transition: transform .5s cubic-bezier(0.22,1,0.36,1); }
        @media (hover: hover) { .ab-card:hover { transform: scale(1.012); } }

        /* ① */
        @keyframes abRise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        .ab-rise { animation: abRise 1s cubic-bezier(0.22,1,0.36,1) both; }

        /* ② 波浪／小船 */
        @keyframes abWave { from { transform: translateX(0); } to { transform: translateX(-${WAVE_P}px); } }
        .ab-wave { animation: abWave 2.4s linear infinite; }
        .ab-wave-slow { animation-duration: 3.4s; }
        @keyframes abDrift { 0%,100% { transform: translateX(28px); } 50% { transform: translateX(-34px); } }
        .ab-boat-drift { animation: abDrift 9s ease-in-out infinite; }
        @keyframes abBob { 0%,100% { transform: translateY(0) rotate(-2.5deg); } 50% { transform: translateY(7px) rotate(2.5deg); } }
        .ab-boat-bob { transform-box: fill-box; transform-origin: 50% 90%; animation: abBob 2.4s ease-in-out infinite; }
        @keyframes abFlag { 0%,100% { transform: skewY(0deg) scaleX(1); } 50% { transform: skewY(6deg) scaleX(.9); } }
        .ab-flag { transform-box: fill-box; transform-origin: 0 50%; animation: abFlag 1.2s ease-in-out infinite; }

        /* ③ 繞行 */
        @keyframes abSpin { to { transform: rotate(360deg); } }
        .ab-orbit { transform-box: view-box; transform-origin: 300px 300px; animation: abSpin 22s linear infinite; }
        @keyframes abBreathe { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-18px); } }
        .ab-breathe { animation: abBreathe 3.2s ease-in-out infinite; }

        /* ④ 煙火 */
        @keyframes abRocket { 0% { transform: translateY(var(--rise)); opacity: 1; } 100% { transform: translateY(0); opacity: 1; } }
        .ab-rocket { opacity: 0; animation: abRocket .55s cubic-bezier(0.3,0.6,0.5,1) forwards, abHide .1s .55s forwards; }
        @keyframes abHide { to { opacity: 0; } }
        @keyframes abSpark {
          0%   { transform: translate(0,0) scale(1); opacity: 1; }
          65%  { transform: translate(var(--dx), var(--dy)) scale(.9); opacity: .95; }
          100% { transform: translate(var(--dx), calc(var(--dy) + 26px)) scale(.4); opacity: 0; }
        }
        .ab-spark { opacity: 0; transform-box: fill-box; transform-origin: center; animation: abSpark 1.5s cubic-bezier(0.1,0.7,0.3,1) .55s forwards; }
        .ab-spark-in { animation-duration: 1.2s; }

        /* ⑤ 玩？ */
        @keyframes abHop { 0%,70%,100% { transform: translateY(0); } 78% { transform: translateY(-7%); } 86% { transform: translateY(0); } 92% { transform: translateY(-2.5%); } }
        .ab-hop { animation: abHop 3.2s ease-in-out infinite; transform-origin: bottom center; }
        @keyframes abQ { 0%,100% { transform: rotate(-6deg); } 50% { transform: rotate(10deg); } }
        .ab-qmark { transform-origin: 50% 90%; animation: abQ 2.2s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .ab-rise, .ab-wave, .ab-boat-drift, .ab-boat-bob, .ab-flag, .ab-orbit, .ab-breathe, .ab-hop, .ab-qmark { animation: none !important; }
        }
      `}</style>

      {/* 標題 */}
      <div className="px-[clamp(20px,4.3vw,74px)]">
        <PageEyebrow text={EYEBROW} />
        <Reveal delay={60}>
          <h2 className="text-white text-center mt-[clamp(20px,5vh,64px)] mb-[clamp(24px,6vh,72px)]" style={{ fontFamily: zhHead, fontWeight: 900, fontSize: `clamp(24px, 3vw, ${HEADING.size}px)`, letterSpacing: "0.16em", paddingLeft: "0.16em" }}>
            {HEADING.text}
          </h2>
        </Reveal>
      </div>

      {/* 卡片輪播 */}
      <Reveal delay={120}>
        <div
          ref={trackRef}
          onScroll={update}
          className="ab-track flex overflow-x-auto overscroll-x-contain py-3"
          style={{ gap: CARD.gap, scrollSnapType: "x mandatory", paddingLeft: "clamp(20px,4.3vw,74px)", paddingRight: "clamp(20px,4.3vw,74px)", scrollPaddingLeft: "clamp(20px,4.3vw,74px)" }}
        >
          <Card visual={<SinceVisual />} text={<CardText>創立於 1974 年（民國 63 年）</CardText>} />
          <Card visual={<HarborVisual />} text={<CardText align="left">提供臺大圖資系同學各種服務，做你大學四年的避風港。</CardText>} />
          <Card visual={<OrbitVisual />} text={<CardText>舉辦活動、體育系隊<br />熱血揮汗，凝聚系上的每份向心力。</CardText>} />
          <Card bleed visual={<BridgeVisual />} text={<CardText>公共空間、學術活動<br />搭起同學們與系辦溝通的橋樑。</CardText>} />
          <Card visual={<PlayVisual />} text={<CardText>系學會帶你一起探索<br />課業、系隊與大學生涯的無限可能</CardText>} />
          <LinksCard />
          {/* 右側留白，讓最後一張能完整滑入 */}
          <div className="shrink-0" style={{ width: 1 }} aria-hidden />
        </div>
      </Reveal>

      {/* 左右切換 */}
      <div className="flex items-center justify-center gap-5 mt-[clamp(20px,4vh,44px)]">
        <NavBtn dir="prev" disabled={atStart} onClick={() => step(-1)} />
        <NavBtn dir="next" disabled={atEnd} onClick={() => step(1)} />
      </div>
    </section>
  );
}