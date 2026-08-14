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

export const cardBase = "rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.04)] hover:border-white/20 transition-colors duration-200 cursor-pointer";

export const monoSemi: CSSProperties = { fontFamily: "'Ubuntu Sans Mono', monospace", fontWeight: 600 };
export const monoMed: CSSProperties = { fontFamily: "'Ubuntu Sans Mono', monospace", fontWeight: 500 };
export const monoBold: CSSProperties = { fontFamily: "'Ubuntu Sans Mono', monospace", fontWeight: 700 };