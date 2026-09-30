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

export const cardBase = "rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.04)] hover:border-white/20 transition-colors duration-200 cursor-pointer";

export const monoSemi: CSSProperties = { fontFamily: "'Ubuntu Sans Mono', monospace", fontWeight: 600 };
export const monoMed: CSSProperties = { fontFamily: "'Ubuntu Sans Mono', monospace", fontWeight: 500 };
export const monoBold: CSSProperties = { fontFamily: "'Ubuntu Sans Mono', monospace", fontWeight: 700 };