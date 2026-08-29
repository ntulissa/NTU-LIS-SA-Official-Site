import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal } from "./shared";
import {
  EVENTS,
  DEPTS,
  DEPT_MAP,
  LEAD_COLOR,
  type DeptKey,
  type CalEvent,
  eventStart,
  isSchoolOnly,
  accentColorOf,
  ymd,
} from "./events";

/**
 * 系學會行事曆頁（CALENDAR）── 版型／呈現邏輯
 * ─────────────────────────────────────────────────────────────
 * ● 上半部「下一場活動」：自動抓最近五場「即將到來」的系學會活動（排除純學校日程），
 *   由近到遠橫向排列，可左右捲動。每張卡：部門色外框（跨部門＝正副會長黃）、
 *   左下角部門色圓點、右側倒數（天→小時→分鐘→秒，自動切換）。
 * ● 下半部「行事曆」：月曆外觀 + 七個部門 Toggle（開關某部門是否顯示）。
 *   當日＝紅藍漸層外框空心圓；有活動的日子＝部門色實心圓（跨部門＝正副會長黃、
 *   學校日程＝白）；滑到該日跳出小卡列出當天活動。
 *
 * ★ 要改活動內容（新增／修改／刪除），請改隔壁的 events.ts，這支檔案通常不用動。
 */

// ── 字型（與全站一致）──────────────────────────────────────────
const zhDisplay = "'Chiron Hei HK Text', 'Noto Sans TC', sans-serif";
const zhFont = "'Noto Sans TC', sans-serif";
const monoFont = "'Ubuntu Sans Mono', monospace";
const roundFont = "'SF Pro Rounded', ui-rounded, 'Noto Sans TC', sans-serif"; // 倒數／日期數字

const BRAND_GRAD = "linear-gradient(90deg, #D14B4B 0%, #2F9EBD 100%)";
const CARD_BG = "#151515";
const MONTHS_ZH = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
const WEEK_ZH = ["日", "一", "二", "三", "四", "五", "六"];

const pad = (n: number) => `${n}`.padStart(2, "0");
// 很淺的顏色（如學校日程白色）用深色數字，維持可讀性。
function isLight(hex: string): boolean {
  const h = hex.replace("#", "");
  if (h.length < 6) return hex.toUpperCase() === "#FFF";
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.72;
}

// ── 漸層外框膠囊標題（下一場活動 / 行事曆）─────────────────────────
function PillLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full" style={{ padding: "1.5px", background: BRAND_GRAD }}>
      <span
        className="rounded-full bg-black px-6 py-2 text-white"
        style={{ fontFamily: zhFont, fontWeight: 900, fontSize: "clamp(0.95rem,1.2vw,1.1rem)", letterSpacing: "0.22em", paddingLeft: "calc(1.5rem + 0.22em)" }}
      >
        {children}
      </span>
    </span>
  );
}

// ── 倒數（每秒更新；天→小時→分鐘→秒自動切換）──────────────────────
function Countdown({ target }: { target: Date }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const DAY = 86400000, HOUR = 3600000, MIN = 60000;
  const rem = Math.max(0, target.getTime() - now);
  let value: number, unit: string;
  if (rem >= DAY)       { value = Math.floor(rem / DAY);  unit = "天後"; }
  else if (rem >= HOUR) { value = Math.floor(rem / HOUR); unit = "小時後"; }
  else if (rem >= MIN)  { value = Math.floor(rem / MIN);  unit = "分鐘後"; }
  else                  { value = Math.floor(rem / 1000); unit = "秒後"; }

  return (
    <div className="flex items-end gap-1.5 leading-none">
      <span className="text-white tabular-nums" style={{ fontFamily: roundFont, fontWeight: 800, fontSize: "clamp(2.4rem,4vw,3.4rem)", letterSpacing: "0.02em" }}>
        {value}
      </span>
      <span className="text-white/85 mb-2" style={{ fontFamily: zhDisplay, fontWeight: 700, fontSize: "clamp(0.72rem,0.95vw,0.92rem)", letterSpacing: "0.2em" }}>
        {unit}
      </span>
    </div>
  );
}

// ── 單張「下一場活動」卡片 ────────────────────────────────────────
function EventCard({ e }: { e: CalEvent }) {
  const border = accentColorOf(e); // 跨部門＝黃；單一部門＝該色
  const dt = eventStart(e);
  const dateStr = `${dt.getFullYear()}.${pad(dt.getMonth() + 1)}.${pad(dt.getDate())}`;
  const timeStr = e.time ? `　${e.time}` : "";
  const dots = e.depts.map((k) => DEPT_MAP[k]).filter(Boolean);

  return (
    <div
      className="relative shrink-0 rounded-[18px] flex flex-col"
      style={{
        width: "clamp(280px, 30vw, 420px)",
        minHeight: "176px",
        background: CARD_BG,
        border: `1.5px solid ${border}`,
        padding: "26px 28px 22px",
      }}
    >
      <h3 className="text-white" style={{ fontFamily: zhDisplay, fontWeight: 900, fontSize: "clamp(1.05rem,1.6vw,1.4rem)", letterSpacing: "0.02em" }}>
        {e.title}
      </h3>
      <p className="text-white/45 mt-3" style={{ fontFamily: monoFont, fontWeight: 500, fontSize: "clamp(0.78rem,0.95vw,0.92rem)", letterSpacing: "0.08em" }}>
        {dateStr}{timeStr}
      </p>

      {/* 左下角：部門色圓點（每部門一點） */}
      <div className="absolute left-7 bottom-6 flex gap-[7px]">
        {dots.map((d, i) => (
          <span key={`${d.key}-${i}`} className="rounded-full" style={{ width: 14, height: 14, background: d.color, boxShadow: isLight(d.color) ? "inset 0 0 0 1px rgba(0,0,0,0.15)" : "none" }} />
        ))}
      </div>

      {/* 右下角：倒數 */}
      <div className="absolute right-7 bottom-4">
        <Countdown target={dt} />
      </div>
    </div>
  );
}

// ── 部門開關（Toggle）───────────────────────────────────────────
function Switch({ on, color, onClick, label }: { on: boolean; color: string; onClick: () => void; label: string }) {
  const light = isLight(color);
  const trackOn = light ? "#3a3a3a" : color;        // 白色（學校）用深灰軌道，才看得見白色把手
  const track = on ? trackOn : "rgba(255,255,255,0.16)";
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-2.5 group" aria-pressed={on}>
      <span className="relative rounded-full transition-colors duration-200" style={{ width: 46, height: 26, background: track }}>
        <span
          className="absolute rounded-full transition-all duration-200"
          style={{ top: 3, width: 20, height: 20, left: on ? 23 : 3, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
        />
      </span>
      <span
        className="transition-colors duration-200"
        style={{ fontFamily: zhFont, fontWeight: 800, fontSize: "clamp(0.85rem,1vw,1rem)", letterSpacing: "0.12em", color: on ? "#fff" : "rgba(255,255,255,0.4)" }}
      >
        {label}
      </span>
    </button>
  );
}

export default function CalendarPage() {
  // ── 上方：最近五場「即將到來」的系學會活動（排除純學校日程）──
  const upcoming = useMemo(() => {
    const now = Date.now();
    return EVENTS
      .filter((e) => !isSchoolOnly(e))
      .map((e) => ({ e, t: eventStart(e).getTime() }))
      .filter((x) => x.t >= now)
      .sort((a, b) => a.t - b.t)
      .slice(0, 5)
      .map((x) => x.e);
  }, []);

  // ── 橫向捲動控制 ──
  const scroller = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const syncArrows = () => {
    const el = scroller.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };
  useEffect(() => {
    syncArrows();
    const el = scroller.current;
    if (!el) return;
    el.addEventListener("scroll", syncArrows, { passive: true });
    window.addEventListener("resize", syncArrows);
    return () => {
      el.removeEventListener("scroll", syncArrows);
      window.removeEventListener("resize", syncArrows);
    };
  }, [upcoming.length]);
  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 440), behavior: "smooth" });
  };

  // ── 月曆狀態 ──
  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState(() => ({ y: today.getFullYear(), m: today.getMonth() }));
  const [enabled, setEnabled] = useState<Record<DeptKey, boolean>>(
    () => Object.fromEntries(DEPTS.map((d) => [d.key, true])) as Record<DeptKey, boolean>
  );
  const [hoverKey, setHoverKey] = useState<string | null>(null);

  const goMonth = (delta: number) => {
    setHoverKey(null);
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };

  const todayKey = ymd(today);

  // 該月每一天的活動（用日期字串比對，避開時區誤差）。
  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    const prefix = `${view.y}-${pad(view.m + 1)}-`;
    for (const e of EVENTS) {
      if (!e.date.startsWith(prefix)) continue;
      const arr = map.get(e.date) ?? [];
      arr.push(e);
      map.set(e.date, arr);
    }
    return map;
  }, [view]);

  // 依 Toggle 算出某一天的「圓色 + 要顯示的活動」；沒有可顯示的就回 null。
  const dayVisual = (key: string): { color: string; events: CalEvent[] } | null => {
    const evs = eventsByDay.get(key);
    if (!evs || !evs.length) return null;
    const visible = evs.filter((e) => e.depts.some((k) => enabled[k]));
    if (!visible.length) return null;
    const keys = new Set<DeptKey>();
    visible.forEach((e) => e.depts.forEach((k) => { if (enabled[k]) keys.add(k); }));
    const color = keys.size > 1 ? LEAD_COLOR : DEPT_MAP[[...keys][0]].color;
    return { color, events: visible };
  };

  // 排出月曆格子（前置空格 + 本月日 + 補到整週的次月灰字）。
  const cells = useMemo(() => {
    const first = new Date(view.y, view.m, 1).getDay(); // 0=日
    const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
    const list: { day: number; inMonth: boolean }[] = [];
    for (let i = 0; i < first; i++) list.push({ day: 0, inMonth: false });
    for (let d = 1; d <= daysInMonth; d++) list.push({ day: d, inMonth: true });
    while (list.length % 7 !== 0) list.push({ day: list.length - first - daysInMonth + 1, inMonth: false });
    return list;
  }, [view]);

  return (
    <section id="calendar" className="relative bg-black min-h-screen px-5 sm:px-8 md:px-12 lg:px-16 pt-24 sm:pt-28 lg:pt-28 pb-16 lg:pb-24">
      <style>{`
        @keyframes calPopIn { from { opacity: 0; transform: translate(-50%, calc(var(--dy) + 6px)); } to { opacity: 1; transform: translate(-50%, var(--dy)); } }
        .cal-pop { animation: calPopIn 0.16s ease-out both; }
        .cal-scroll::-webkit-scrollbar { height: 0; }
        .cal-scroll { scrollbar-width: none; }
        @media (prefers-reduced-motion: reduce) { .cal-pop { animation: none; } }
      `}</style>

      <div className="max-w-[1200px] mx-auto">
        {/* 眉標 */}
        <Reveal>
          <p className="mb-6" style={{ fontSize: "14px", fontFamily: monoFont, background: "linear-gradient(90deg, #FFF 0%, #595959 34.13%, #FFF 67.79%, #3A3A3A 100%)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            － 最新動態・系學會行事曆
          </p>
        </Reveal>

        {/* ══════════ 上半：下一場活動 ══════════ */}
        <Reveal delay={40}>
          <div className="mb-6"><PillLabel>下一場活動</PillLabel></div>
        </Reveal>

        <Reveal delay={80}>
          <div className="relative">
            <div ref={scroller} className="cal-scroll flex gap-4 sm:gap-5 overflow-x-auto pb-2">
              {upcoming.length > 0 ? (
                upcoming.map((e, i) => <EventCard key={`${e.title}-${e.date}-${i}`} e={e} />)
              ) : (
                <div className="text-white/40 py-10" style={{ fontFamily: zhFont, letterSpacing: "0.1em" }}>
                  目前沒有即將到來的活動，敬請期待。
                </div>
              )}
            </div>

            {/* 左右捲動箭頭（有需要才出現） */}
            {canLeft && (
              <button type="button" onClick={() => scrollBy(-1)} aria-label="上一個活動"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                <ChevronLeft size={22} strokeWidth={2.4} />
              </button>
            )}
            {canRight && (
              <button type="button" onClick={() => scrollBy(1)} aria-label="下一個活動"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                <ChevronRight size={22} strokeWidth={2.4} />
              </button>
            )}
          </div>
        </Reveal>

        {/* ══════════ 下半：行事曆 ══════════ */}
        <div className="mt-16 lg:mt-20">
          <Reveal>
            <div className="mb-6"><PillLabel>行事曆</PillLabel></div>
          </Reveal>

          {/* 部門 Toggle */}
          <Reveal delay={40}>
            <div className="flex flex-wrap gap-x-6 gap-y-3.5 mb-7">
              {DEPTS.map((d) => (
                <Switch key={d.key} on={enabled[d.key]} color={d.color} label={d.zh} onClick={() => setEnabled((p) => ({ ...p, [d.key]: !p[d.key] }))} />
              ))}
            </div>
          </Reveal>

          {/* 月份切換 */}
          <Reveal delay={80}>
            <div className="flex items-center justify-center gap-7 mb-5">
              <button type="button" onClick={() => goMonth(-1)} aria-label="上個月" className="text-white/70 hover:text-white transition-colors">
                <ChevronLeft size={22} strokeWidth={2.4} />
              </button>
              <span className="text-white tabular-nums" style={{ fontFamily: monoFont, fontWeight: 700, fontSize: "clamp(1.05rem,1.4vw,1.25rem)", letterSpacing: "0.12em" }}>
                {MONTHS_ZH[view.m]}, {view.y}
              </span>
              <button type="button" onClick={() => goMonth(1)} aria-label="下個月" className="text-white/70 hover:text-white transition-colors">
                <ChevronRight size={22} strokeWidth={2.4} />
              </button>
            </div>
          </Reveal>

          <div className="h-px bg-white/15 mb-5" />

          {/* 星期列 */}
          <div className="grid grid-cols-7 text-center mb-3">
            {WEEK_ZH.map((w) => (
              <span key={w} className="text-white" style={{ fontFamily: zhDisplay, fontWeight: 800, fontSize: "clamp(0.95rem,1.2vw,1.1rem)", letterSpacing: "0.18em" }}>
                {w}
              </span>
            ))}
          </div>

          {/* 日期格 */}
          <div className="grid grid-cols-7">
            {cells.map((c, i) => {
              if (!c.inMonth) {
                return (
                  <div key={i} className="flex items-center justify-center" style={{ height: "clamp(56px,7vw,78px)" }}>
                    {c.day > 0 && <span className="text-white/20" style={{ fontFamily: roundFont, fontWeight: 700, fontSize: "clamp(1.2rem,1.7vw,1.7rem)" }}>{c.day}</span>}
                  </div>
                );
              }
              const key = `${view.y}-${pad(view.m + 1)}-${pad(c.day)}`;
              const vis = dayVisual(key);
              const isToday = key === todayKey;
              const filled = !!vis;
              const light = vis ? isLight(vis.color) : false;
              const firstWeek = i < 7;

              return (
                <div
                  key={i}
                  className="flex items-center justify-center relative"
                  style={{ height: "clamp(56px,7vw,78px)" }}
                  onMouseEnter={() => vis && setHoverKey(key)}
                  onMouseLeave={() => setHoverKey((k) => (k === key ? null : k))}
                >
                  <div
                    className="relative flex items-center justify-center rounded-full"
                    style={{
                      width: "clamp(44px,5.2vw,58px)",
                      height: "clamp(44px,5.2vw,58px)",
                      background: filled ? vis!.color : "transparent",
                      cursor: vis ? "pointer" : "default",
                    }}
                  >
                    {/* 當日：紅藍漸層外框空心圓（有活動時疊在實心圓外緣） */}
                    {isToday && (
                      <span
                        className="absolute rounded-full pointer-events-none"
                        style={{
                          inset: "-3px",
                          padding: "2.5px",
                          background: BRAND_GRAD,
                          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                          WebkitMaskComposite: "xor",
                          maskComposite: "exclude",
                        }}
                      />
                    )}
                    <span
                      className="tabular-nums leading-none"
                      style={{ fontFamily: roundFont, fontWeight: 700, fontSize: "clamp(1.2rem,1.7vw,1.7rem)", color: filled ? (light ? "#111" : "#fff") : "#fff" }}
                    >
                      {c.day}
                    </span>
                  </div>

                  {/* Hover 小卡：列出當天（可顯示的）活動 */}
                  {hoverKey === key && vis && (
                    <div
                      className="cal-pop absolute left-1/2 z-20 rounded-2xl border border-white/12 shadow-2xl shadow-black/60"
                      style={{
                        // 第一週往下展開、其餘往上展開，避免超出容器上緣。
                        ["--dy" as string]: firstWeek ? "0%" : "-100%",
                        top: firstWeek ? "calc(100% + 8px)" : "-8px",
                        transform: `translate(-50%, ${firstWeek ? "0%" : "-100%"})`,
                        width: "min(240px, 72vw)",
                        background: "#1c1c1e",
                        padding: "12px 14px",
                      }}
                    >
                      {vis.events.map((ev, j) => (
                        <div key={`${ev.title}-${j}`} className="flex items-center gap-2.5 py-1">
                          <span className="rounded-full shrink-0" style={{ width: 9, height: 9, background: accentColorOf(ev), boxShadow: isLight(accentColorOf(ev)) ? "inset 0 0 0 1px rgba(0,0,0,0.2)" : "none" }} />
                          <span className="text-white/90 truncate" style={{ fontFamily: zhFont, fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.03em" }}>
                            {ev.title}
                          </span>
                          <span className="ml-auto text-white/45 shrink-0" style={{ fontFamily: monoFont, fontSize: "0.72rem", letterSpacing: "0.04em" }}>
                            {ev.time ?? "整天"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
