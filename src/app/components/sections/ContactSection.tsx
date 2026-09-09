import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { Mail } from "lucide-react";
import svgPaths from "@/imports/BentoGrid-1/svg-lp3prmbugu";
import { Reveal } from "./shared";

// ★ 品牌 wordmark SVG（放在 src/imports/contact/ 底下）
//   IG / FB 用 filter 強制白色；交流版右下小 facebook 重用同一個 facebook.svg。
//   Email 用你原設計轉出的 NTU LIS SA.svg（保留原色，不套白色 filter）。
import igWordmark from "@/imports/contact/instagram.svg";
import fbWordmark from "@/imports/contact/facebook.svg";
import emailLogo from "@/imports/contact/NTU LIS SA.svg";

/**
 * 聯絡我們（CONTACT US）— Bento Grid 翻牌版
 * ─────────────────────────────────────────────────────────────
 * 互動：進入時每一格都是深灰 (#151515)，接著各自「隨機、不同步」地開始
 *      垂直翻牌（rotateX，像翻牌時鐘），持續在「Logo 面」與「彩色資訊面」
 *      之間翻動，永不同步 → 呈現亂中有序的美感。
 *
 * ★ 要貼網址的地方都集中在下方 LINKS；已知的我先填好，未知的留空字串。
 *   （community＝臺大圖資系交流版 FB，尚未有連結，留白給你貼）
 * 社群 icon 沿用全站同一組（@/imports/BentoGrid-1，與 Footer / Bento 一致）。
 */

// ── 要貼的網址都在這裡 ────────────────────────────────────────
const LINKS = {
  instagram: "https://www.instagram.com/ntu_lis_sa?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==", // 已知
  email: "ntulissa1060@gmail.com",                       // 已知（信箱）
  threads: "https://www.threads.com/@ntu_lis_sa",         // 已知
  facebook: "https://www.facebook.com/ntulislis",         // 已知（學會粉專）
  community: "https://www.facebook.com/share/g/1DiHYRrvKz/",    // 「臺大圖資系交流版」FB 連結
};

const zhFont = "'Noto Sans TC', sans-serif";
const monoFont = "'Ubuntu Sans Mono', monospace";
const enDisplay = "'Josefin Sans', sans-serif";

// 品牌色
const IG_GRADIENT = "linear-gradient(120deg, #FA3B4C 0%, #C4257E 52%, #8A33B0 100%)";
const FB_BLUE = "#2E5CF6";
const DARK = "#151515";

// 通用 svg glyph
function Glyph({ path, vb, className, style }: { path: string; vb: string; className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox={vb} className={className} style={style} fill="currentColor">
      <path d={path} />
    </svg>
  );
}

// 載入品牌 wordmark SVG，並用 filter 強制上成白色（不管原始檔是黑是白都變白）。
//   height：wordmark 高度；opacity：透明度；align：水平對齊；
//   fill=true 佔滿整格寬度（Logo 面用）、false 縮成自身寬度（右下小浮水印用）。
function Wordmark({ src, height = "auto", width = "auto", opacity = 1, align = "center", fill = true, recolor = true, className = "" }: {
  src: string; height?: string; width?: string; opacity?: number; align?: "left" | "center" | "right"; fill?: boolean; recolor?: boolean; className?: string;
}) {
  const justify = align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center";
  return (
    <span aria-hidden className={className} style={{ display: "flex", width: fill ? "100%" : "auto", justifyContent: justify, alignItems: "center" }}>
      <img src={src} alt="" style={{ height, width, maxWidth: "100%", maxHeight: "100%", objectFit: "contain", opacity, filter: recolor ? "brightness(0) invert(1)" : undefined }} />
    </span>
  );
}

// 每張卡的外框（rounded + 內距 + 置中），faces 共用
function FaceShell({ children, style, className = "" }: { children: ReactNode; style?: CSSProperties; className?: string }) {
  return (
    <div className={`w-full h-full rounded-[20px] lg:rounded-[26px] overflow-hidden flex ${className}`} style={style}>
      {children}
    </div>
  );
}

/* ───────────────────────── 五張卡的兩個面 ───────────────────────── */

// 1) INSTAGRAM（Logo 面＝Instagram wordmark，白色、置中放大）
const IG_LOGO = (
  <FaceShell className="items-center justify-center px-6 lg:px-10" style={{ background: DARK }}>
    <Wordmark src={igWordmark} width="82%" align="center" />
  </FaceShell>
);
const IG_INFO = (
  <FaceShell className="items-center gap-5 lg:gap-7 px-8 lg:px-10" style={{ background: IG_GRADIENT }}>
    <Glyph path={svgPaths.p372aef00} vb="0 0 64 64" className="shrink-0 text-white" style={{ width: "clamp(48px,7vw,84px)", height: "clamp(48px,7vw,84px)" }} />
    <span className="text-white truncate" style={{ fontFamily: monoFont, fontWeight: 600, fontSize: "clamp(1.4rem,3.4vw,2.6rem)" }}>ntu_lis_sa</span>
  </FaceShell>
);

// 2) EMAIL（Logo 面＝你原設計轉出的 NTU LIS SA.svg，保留原色置中）
const EMAIL_LOGO = (
  <FaceShell className="items-center justify-center px-6 lg:px-9" style={{ background: DARK }}>
    <img src={emailLogo} alt="EMAIL — NTU LIS SA 臺大圖資系學會" style={{ maxWidth: "90%", maxHeight: "72%", width: "auto", height: "auto", objectFit: "contain" }} />
  </FaceShell>
);
const EMAIL_INFO = (
  <FaceShell className="items-center gap-4 lg:gap-5 px-6 lg:px-9" style={{ background: DARK, border: "1.5px solid transparent", backgroundImage: `linear-gradient(${DARK},${DARK}), ${IG_GRADIENT}`, backgroundOrigin: "border-box", backgroundClip: "padding-box, border-box" }}>
    <Mail className="shrink-0 text-white/85" style={{ width: "clamp(30px,4vw,44px)", height: "clamp(30px,4vw,44px)" }} strokeWidth={1.6} />
    <span className="text-white truncate" style={{ fontFamily: "'Chiron Hei HK Text', sans-serif", fontWeight: 500, fontSize: "clamp(0.85rem,2vw,1.55rem)", letterSpacing: "0.02em" }}>{LINKS.email}</span>
  </FaceShell>
);

// 3) THREADS
const THREADS_LOGO = (
  <FaceShell className="items-center justify-center" style={{ background: DARK }}>
    <Glyph path={svgPaths.p3455000} vb="0 0 55 64" className="text-white" style={{ width: "clamp(88px,14vw,156px)", height: "clamp(88px,14vw,156px)" }} />
  </FaceShell>
);
const THREADS_INFO = (
  <FaceShell className="flex-col items-center justify-center gap-3 lg:gap-4 px-4 text-center" style={{ background: DARK, border: "1.5px solid rgba(255,255,255,0.85)" }}>
    <Glyph path={svgPaths.p3455000} vb="0 0 55 64" className="text-white" style={{ width: "clamp(40px,5vw,64px)", height: "clamp(40px,5vw,64px)" }} />
    <div className="leading-tight">
      <span className="block text-white/70" style={{ fontFamily: "'Chiron Hei HK Text'", fontWeight: 500, fontSize: "clamp(0.8rem,1.5vw,1.05rem)", letterSpacing: "0.1em" }}>臺大圖資系學會</span>
      <span className="block text-white" style={{ fontFamily: monoFont, fontWeight: 600, fontSize: "clamp(1rem,2vw,1.5rem)", marginTop: 6 }}>ntu_lis_sa</span>
    </div>
  </FaceShell>
);

// 4) FACEBOOK（Logo 面＝facebook wordmark，白色、置中放大）
const FB_LOGO = (
  <FaceShell className="items-center justify-center px-6" style={{ background: DARK }}>
    <Wordmark src={fbWordmark} width="76%" align="center" />
  </FaceShell>
);
const FB_INFO = (
  <FaceShell className="items-center gap-4 lg:gap-6 px-6 lg:px-9" style={{ background: FB_BLUE }}>
    <Glyph path={svgPaths.p1c5aa00} vb="0 0 64 64" className="shrink-0 text-white" style={{ width: "clamp(52px,7vw,90px)", height: "clamp(52px,7vw,90px)" }} />
    <span className="text-white leading-tight" style={{ fontFamily: zhFont, fontWeight: 900, fontSize: "clamp(1.3rem,3vw,2.4rem)", letterSpacing: "0.06em" }}>臺大圖資系學會</span>
  </FaceShell>
);

// 5) COMMUNITY（交流版）
const COMMUNITY_LOGO = (
  <FaceShell className="relative flex-col items-center justify-center gap-2 lg:gap-3 px-4 text-center" style={{ background: DARK }}>
    <span className="text-white/55" style={{ fontFamily: enDisplay, fontWeight: 600, fontSize: "clamp(0.7rem,1.2vw,0.95rem)", letterSpacing: "0.25em" }}>COMMUNITY :</span>
    <span style={{ fontFamily: enDisplay, fontWeight: 700, fontSize: "clamp(1.4rem,2.6vw,2.2rem)", letterSpacing: "0.14em", color: "transparent", WebkitTextStroke: "1px rgba(255,255,255,0.9)" }}>NTU LIS</span>
    <span className="text-white/70" style={{ fontFamily: "'Chiron Hei HK Text'", fontWeight: 500, fontSize: "clamp(0.72rem,1.3vw,1rem)", letterSpacing: "0.08em", marginTop: 4 }}>臺大圖資系交流版</span>
    {/* 底部小 facebook：白色 45% */}
    <Wordmark src={fbWordmark} height="clamp(12px,1.6vw,20px)" opacity={0.45} align="center" fill={false} className="absolute bottom-3 left-1/2 -translate-x-1/2" />
  </FaceShell>
);
const COMMUNITY_INFO = (
  <FaceShell className="flex-col items-center justify-center relative px-4 text-center" style={{ background: DARK, border: "1.5px solid rgba(46,92,246,0.9)" }}>
    <span className="text-white leading-relaxed" style={{ fontFamily: zhFont, fontWeight: 500, fontSize: "clamp(0.9rem,1.7vw,1.35rem)", letterSpacing: "0.04em" }}>
      憑 <b style={{ fontWeight: 900 }}>臺大圖資系學號</b> 加入
    </span>
    {/* 右下小 facebook：重用同一個 facebook.svg，白色 45% */}
    <Wordmark src={fbWordmark} height="clamp(12px,1.6vw,20px)" opacity={0.45} align="right" fill={false} className="absolute bottom-3 right-4" />
  </FaceShell>
);

/* ───────────────────────── 翻牌卡片 ───────────────────────── */

type Card = { key: string; href: string; label: string; className: string; logo: ReactNode; info: ReactNode };

function GrayFace() {
  return <div className="w-full h-full rounded-[20px] lg:rounded-[26px]" style={{ background: DARK }} />;
}

function FlipCard({ card }: { card: Card }) {
  const [step, setStep] = useState(0);
  const [frontKind, setFrontKind] = useState<"gray" | "logo">("gray");
  const pinned = useRef(false);                                   // 滑鼠停在上面時 = true（暫停自動翻）
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alive = useRef(true);

  // 翻一次（step+1）；第一次翻牌後把灰面換成 Logo 面
  const flipOnce = () => setStep((s) => {
    const ns = s + 1;
    if (ns === 1) window.setTimeout(() => { if (alive.current) setFrontKind("logo"); }, 780);
    return ns;
  });
  // 排下一次自動翻（6–8 秒隨機）；被釘住時不排
  const schedule = () => {
    timer.current = setTimeout(() => {
      if (!alive.current || pinned.current) return;
      flipOnce();
      schedule();
    }, 6000 + Math.random() * 2000);
  };

  useEffect(() => {
    alive.current = true;
    timer.current = setTimeout(() => {          // 起始延遲隨機 → 進場錯開
      if (!alive.current || pinned.current) return;
      flipOnce();
      schedule();
    }, 300 + Math.random() * 2600);
    return () => { alive.current = false; if (timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // hover：暫停自動翻，並確保停在彩色資訊面（奇數 step ＝ back ＝ info）
  const handleEnter = () => {
    pinned.current = true;
    if (timer.current) clearTimeout(timer.current);
    setStep((s) => {
      if (s % 2 === 0) { // 目前在 Logo/灰面 → 翻到 info
        const ns = s + 1;
        if (ns === 1) window.setTimeout(() => { if (alive.current) setFrontKind("logo"); }, 780);
        return ns;
      }
      return s; // 已經在 info 面就維持
    });
  };
  // 放開：恢復自動翻（維持目前面，時間到再翻）
  const handleLeave = () => {
    pinned.current = false;
    if (timer.current) clearTimeout(timer.current);
    schedule();
  };

  const front = frontKind === "gray" ? <GrayFace /> : card.logo;
  const back = card.info;
  const href = card.href || "#";
  const external = href.startsWith("http");

  return (
    <a
      href={href}
      aria-label={card.label}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={`group block ${card.className}`}
      style={{ perspective: "1400px" }}
    >
      <div className="relative w-full h-full transition-transform duration-200 group-hover:scale-[0.985]" style={{ transformStyle: "preserve-3d", transform: `rotateX(${step * 180}deg)`, transition: "transform 0.75s cubic-bezier(0.4,0,0.2,1)" }}>
        <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", transform: "rotateX(0deg)" }}>{front}</div>
        <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", transform: "rotateX(180deg)" }}>{back}</div>
      </div>
    </a>
  );
}

/* ───────────────────────── 頁面 ───────────────────────── */

// 手機：min-h 給每格高度底線（頁面可捲動）。md 以上：min-h 歸零，
// 交給 grid 的 1fr 平均分配、剛好塞滿一屏（不會被切）。
const CARDS: Card[] = [
  { key: "instagram", href: LINKS.instagram, label: "Instagram：ntu_lis_sa", className: "col-span-12 md:col-span-7 min-h-[200px] md:min-h-0", logo: IG_LOGO, info: IG_INFO },
  { key: "email", href: `mailto:${LINKS.email}`, label: `Email：${LINKS.email}`, className: "col-span-12 md:col-span-5 min-h-[200px] md:min-h-0", logo: EMAIL_LOGO, info: EMAIL_INFO },
  { key: "threads", href: LINKS.threads, label: "Threads：ntu_lis_sa", className: "col-span-5 md:col-span-3 min-h-[180px] md:min-h-0", logo: THREADS_LOGO, info: THREADS_INFO },
  { key: "facebook", href: LINKS.facebook, label: "Facebook：臺大圖資系學會", className: "col-span-7 md:col-span-6 min-h-[180px] md:min-h-0", logo: FB_LOGO, info: FB_INFO },
  { key: "community", href: LINKS.community, label: "臺大圖資系交流版", className: "col-span-12 md:col-span-3 min-h-[160px] md:min-h-0", logo: COMMUNITY_LOGO, info: COMMUNITY_INFO },
];

export default function ContactSection() {
  return (
    <section id="contact" className="bg-black min-h-[100svh] flex flex-col px-5 sm:px-8 md:px-14 pt-24 sm:pt-28 lg:pt-28 pb-6 sm:pb-8 lg:pb-12">
      <div className="max-w-[1400px] w-full mx-auto flex flex-col flex-1 min-h-0">
        <Reveal>
          <p className="text-xs tracking-widest mb-3" style={{ fontSize: "14px", fontFamily: monoFont, background: "linear-gradient(90deg, #FFF 0%, #595959 34.13%, #FFF 67.79%, #3A3A3A 100%)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundSize: "220% 100%" }}>
            — 各種服務・聯絡我們
          </p>
          <h2 className="font-bold leading-none mb-5 sm:mb-6 lg:mb-8" style={{ fontFamily: enDisplay, fontSize: "clamp(2.25rem, 4.6vw, 4.25rem)" }}>
            <span className="text-white block">CONTACT</span>
            <span className="block" style={{ color: "#2F9EBD" }}>US</span>
          </h2>
        </Reveal>

        {/* md 以上：grid 撐滿剩餘高度、兩列各佔 1fr → 兩排卡片剛好一屏 */}
        <div className="grid grid-cols-12 gap-4 sm:gap-5 lg:gap-6 md:flex-1 md:min-h-0 md:[grid-template-rows:1fr_1fr]">
          {CARDS.map((c) => (
            <FlipCard key={c.key} card={c} />
          ))}
        </div>
      </div>
    </section>
  );
}