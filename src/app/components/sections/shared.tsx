import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

export function pad(n: number) {
  return String(n);
}

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function useCountdown(target: Date) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, target.getTime() - Date.now());
      const totalSec = Math.floor(diff / 1000);
      setTime({
        d: Math.floor(totalSec / 86400),
        h: Math.floor((totalSec % 86400) / 3600),
        m: Math.floor((totalSec % 3600) / 60),
        s: totalSec % 60,
      });
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  return time;
}

export function useScrollReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ── 頁面小標題（「— 關於我們・現任團隊」那一行）─────────────────────────────
// 全站統一位置：一律釘在「所在區塊的頂端往下 --eyebrow-top」，左緣對齊站內 1400px 內容欄。
// ★ 要調上下位置／內容起點，改 globals.css 的 --eyebrow-top、--page-content-top（全站一起變）。
// ★ 使用規則（照做位置才會一致）：
//   1. 直接放在 <section className="relative ..."> 裡，外面「不要」再包 <Reveal>
//      （Reveal 有 transform，會把標題的定位基準換成 Reveal 自己，標題就會跑位）。
//   2. 該頁內容的上內距用 pt-[var(--page-content-top)]，內容就不會壓到標題。
export function PageEyebrow({ text }: { text: string }) {
  return (
    <div
      className="absolute inset-x-0 z-20 pointer-events-none select-none"
      style={{ top: "var(--eyebrow-top)" }}
    >
      <p
        className="max-w-[1400px] mx-auto px-5 sm:px-8 md:px-14 tracking-widest"
        style={{
          fontSize: "14px",
          lineHeight: "20px",
          fontFamily: "'Ubuntu Sans Mono', monospace",
          color: "#FFFFFF",
        }}
      >
        — {text}
      </p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// ★ RWD 共用工具（手機／平板用；電腦版 ≥ 1024px 一律維持原本的數值，完全不變）
// ══════════════════════════════════════════════════════════════════════════
// 斷點：寬度 ≥ 1024px＝電腦版（和 Tailwind 的 lg: 一致）；以下＝平板／手機。
export const DESKTOP_MIN = 1024;

// 監聽 media query（例如 "(min-width: 1024px)"），視窗大小改變時會自動更新。
export function useMediaQuery(query: string) {
  const get = () => typeof window !== "undefined" && !!window.matchMedia?.(query).matches;
  const [match, setMatch] = useState(get);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

// true＝電腦版。用法：const isDesktop = useIsDesktop();
//   之後寫 isDesktop ? 原本的值 : 手機平板的值 → 電腦版完全不受影響。
export function useIsDesktop() {
  return useMediaQuery(`(min-width: ${DESKTOP_MIN}px)`);
}

// 「字體縮小優先、不要換行」的字級：
//   fitText(原本的字級, 一行的字數, { min: 最小字級px, ls: 字距em, gutter: 左右留白總和px })
//   → 螢幕夠寬時＝原本的字級；螢幕變窄就等比例縮小，讓這一行剛好塞得下；
//     縮到 min 還放不下，才允許換行（避免字小到看不清楚）。
//   chars：該行字數（中文、全形標點算 1，英數算 0.55 左右）。
export function fitText(desktop: string | number, chars: number, opts: { min?: number; ls?: number; gutter?: number } = {}) {
  const { min = 16, ls = 0, gutter = 40 } = opts;
  const d = typeof desktop === "number" ? `${desktop}px` : desktop;
  const k = (chars * (1 + ls) + 0.5).toFixed(3); // +0.5：預留標點／字型寬度誤差，避免剛好差一點就換行
  return `max(${min}px, min(${d}, calc((100vw - ${gutter}px) / ${k})))`;
}

// 估算一行文字的「寬度單位」（中文／全形＝1、英數＝0.6、空白＝0.3），給 fitText 用。
export function textUnits(s: string) {
  let n = 0;
  for (const ch of s) n += ch === " " ? 0.3 : /[\u0000-ÿ]/.test(ch) ? 0.6 : 1;
  return n;
}
// 傳入「最長那一行」的文字，自動算字數：fitLine("你的大學生涯", 58, { min: 26, ls: 0.1 })
export function fitLine(longestLine: string, desktop: string | number, opts: { min?: number; ls?: number; gutter?: number } = {}) {
  return fitText(desktop, textUnits(longestLine), opts);
}

export const cardBase = "rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.04)] hover:border-white/20 transition-colors duration-200 cursor-pointer";

export const monoSemi: CSSProperties = { fontFamily: "'Ubuntu Sans Mono', monospace", fontWeight: 600 };
export const monoMed: CSSProperties = { fontFamily: "'Ubuntu Sans Mono', monospace", fontWeight: 500 };
export const monoBold: CSSProperties = { fontFamily: "'Ubuntu Sans Mono', monospace", fontWeight: 700 };