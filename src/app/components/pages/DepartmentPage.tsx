import { useEffect, useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, ArrowLeft } from "lucide-react";
import { Reveal } from "../sections/shared";

/**
 * 部門獨立頁（範例：行政部 GENERAL AFFAIRS）
 * ─────────────────────────────────────────────────────────────
 * 進入方式：現任團隊（首頁 CURRENT TEAM）點該部門格子 → #/dept/<slug>
 * 版面：Header（全域）→ 回上頁 → 上半（左：簡介＋加入鈕／右：服務輪播）
 *        → 團隊成員（幹部卡）→ 部員名單＋加入區塊 → Footer（全域）
 *
 * ★ 要新增其他部門：在最下方的 DEPARTMENTS 物件加一筆資料即可（結構同 GENERAL_AFFAIRS）。
 */

// ── 字型（與全站一致）──
const zhDisplay = "'Chiron Hei HK Text', 'Noto Sans TC', sans-serif";
const zhFont = "'Noto Sans TC', sans-serif";
const monoFont = "'Ubuntu Sans Mono', monospace";

// 幹部照片底部漸層（與歷屆會長一致：下緣淡出、漂浮）
const PHOTO_FADE = "linear-gradient(to bottom, #000 74%, transparent 100%)";

// ── 資料型別 ────────────────────────────────────────────────
type Service = { name: string; img: string; href: string };
type Head = { name: string; cls: string; title: string; img: string };
type Member = { n: string; c: string };
type DeptData = {
  slug: string; // 路由用，如 "general"
  zh: string; // 行政部
  en: string; // GENERAL AFFAIRS
  color: string; // 部門色
  intro: string; // 部門簡介
  joinBlurb: string; // 「成為…的一員」文案
  services: Service[]; // 各種服務（右側輪播）
  heads: Head[]; // 幹部（部長等）
  members: Member[]; // 部員
};

// hex → rgba（給脈動光暈用；避免同色高斯模糊把小圓點中心洗成白色）
function hexToRgba(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// ── 屆數切換／服務切換用的「點 → 箭頭」按鈕（比照歷屆會長）──
// 靜態時是一顆「實心、飽和」的圓點（左紅右藍），外圈是同色柔光；
// hover 才變成實心箭頭。刻意不用模糊光暈疊在小點上，否則中心會被洗白。
function NavArrow({ dir, color, disabled, onClick }: { dir: "prev" | "next"; color: string; disabled: boolean; onClick: () => void }) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "上一項服務" : "下一項服務"}
      className="group relative flex items-center justify-center disabled:cursor-default"
      style={{ width: "42px", height: "42px" }}
    >
      {disabled ? (
        <span className="absolute rounded-full" style={{ width: "11px", height: "11px", background: color, opacity: 0.32 }} />
      ) : (
        <>
          <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-out group-hover:opacity-0">
            <span
              className="dept-pulse-dot absolute rounded-full"
              style={{ width: "12px", height: "12px", background: color, ["--dept-glow" as string]: hexToRgba(color, 0.55) } as CSSProperties}
            />
          </span>
          <span
            className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 scale-75 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-100"
            style={{ background: color, boxShadow: `0 8px 20px -8px ${color}` }}
          >
            <Icon size={20} strokeWidth={2.6} className="text-white" />
          </span>
        </>
      )}
    </button>
  );
}

// ── 迷宮背景（近似 Figma 的 Pac-Man 迷宮牆；可替換成你匯出的圖）──
function MazeBackdrop() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden style={{ opacity: 0.5 }}>
      <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="mazeWall" width="240" height="240" patternUnits="userSpaceOnUse">
            <g fill="#141414">
              <rect x="24" y="24" width="86" height="26" rx="13" />
              <rect x="24" y="24" width="26" height="120" rx="13" />
              <rect x="150" y="60" width="26" height="96" rx="13" />
              <rect x="150" y="60" width="70" height="26" rx="13" />
              <rect x="60" y="176" width="120" height="26" rx="13" />
              <rect x="194" y="176" width="26" height="46" rx="13" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mazeWall)" />
      </svg>
    </div>
  );
}

// ── 服務輪播（右側；圖片可點進服務頁；兩旁圓點 hover 變箭頭切換）──
function ServiceCarousel({ services }: { services: Service[] }) {
  const [idx, setIdx] = useState(0);
  const s = services[idx] ?? services[0];
  const canPrev = idx > 0;
  const canNext = idx < services.length - 1;

  if (!s) return null;

  return (
    <div className="flex flex-col items-center">
      {/* 服務圖片（點擊進入服務頁） */}
      <a
        href={s.href}
        aria-label={`${s.name} — 進入服務頁面`}
        className="block relative w-full max-w-[420px] transition-transform duration-300 hover:-translate-y-1"
        style={{ height: "clamp(240px, 42vh, 420px)" }}
      >
        {s.img ? (
          <img
            src={s.img}
            alt={s.name}
            className="absolute inset-0 w-full h-full object-contain object-top select-none"
            style={{ WebkitMaskImage: PHOTO_FADE, maskImage: PHOTO_FADE }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-white/25 rounded-2xl border border-white/10 w-[70%] h-full justify-center" style={{ fontFamily: monoFont, letterSpacing: "0.2em" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-14 h-14">
                <rect x="4" y="3" width="16" height="18" rx="2" />
                <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
              </svg>
              <span className="text-xs">服務圖片</span>
            </div>
          </div>
        )}
      </a>

      {/* 服務名稱（白色膠囊）＋左右切換點 */}
      <div className="flex items-center gap-4 sm:gap-5 mt-6">
        <NavArrow dir="prev" color="#D14B4B" disabled={!canPrev} onClick={() => canPrev && setIdx((v) => v - 1)} />
        <a
          href={s.href}
          className="rounded-full bg-white text-black px-6 py-2.5 whitespace-nowrap hover:bg-white/90 transition-colors"
          style={{ fontFamily: zhFont, fontWeight: 700, fontSize: "clamp(0.95rem,1.3vw,1.2rem)", letterSpacing: "0.16em" }}
        >
          {s.name}
        </a>
        <NavArrow dir="next" color="#2F9EBD" disabled={!canNext} onClick={() => canNext && setIdx((v) => v + 1)} />
      </div>

      <p className="text-white/40 mt-3" style={{ fontFamily: zhFont, fontWeight: 500, fontSize: "0.85rem", letterSpacing: "0.16em" }}>
        點擊即可進入服務頁面
      </p>
    </div>
  );
}

// ── 幹部卡（照片 → 姓名＋系級 → 職稱）──
function HeadCard({ head, delay }: { head: Head; delay: number }) {
  return (
    <Reveal delay={delay}>
      <div className="flex flex-col items-center text-center">
        <div className="relative w-full" style={{ height: "clamp(240px, 32vh, 380px)" }}>
          {head.img ? (
            <img
              src={head.img}
              alt={head.name}
              className="absolute inset-0 w-full h-full object-cover object-top select-none pointer-events-none"
              style={{ WebkitMaskImage: PHOTO_FADE, maskImage: PHOTO_FADE }}
            />
          ) : (
            <div className="absolute inset-0 flex items-end justify-center">
              <div className="flex flex-col items-center justify-center gap-2 text-white/20" style={{ fontFamily: monoFont, letterSpacing: "0.2em", height: "88%", width: "72%", WebkitMaskImage: PHOTO_FADE, maskImage: PHOTO_FADE, background: "rgba(255,255,255,0.03)", borderRadius: "16px" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-14 h-14">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
                </svg>
                <span className="text-xs">照片待補</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-end justify-center gap-3 mt-4">
          <p className="text-white leading-none" style={{ fontFamily: zhDisplay, fontWeight: 900, fontSize: "clamp(1.8rem,3vw,2.8rem)", letterSpacing: "0.06em" }}>
            {head.name}
          </p>
          <span className="mb-1 rounded-[6px] px-2.5 py-1" style={{ background: "linear-gradient(90deg,#FFF 0%,#B3B3B3 100%)", color: "#000", fontFamily: monoFont, fontWeight: 700, fontSize: "clamp(0.8rem,1.1vw,1.05rem)" }}>
            {head.cls}
          </span>
        </div>
        <p className="mt-2 text-white/55" style={{ fontFamily: monoFont, fontWeight: 500, fontSize: "clamp(0.72rem,0.95vw,0.95rem)", letterSpacing: "0.18em" }}>
          -{head.title}&nbsp;HEAD-
        </p>
      </div>
    </Reveal>
  );
}

// ── 主要頁面 ────────────────────────────────────────────────
export default function DepartmentPage({ slug }: { slug: string }) {
  const data = DEPARTMENTS[slug];

  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, [slug]);

  const goBack = () => {
    if (typeof window === "undefined") return;
    if (window.history.length > 1) window.history.back();
    else window.location.hash = "#team";
  };

  if (!data) {
    return (
      <section className="relative bg-black min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-white/70" style={{ fontFamily: zhFont, fontSize: "1.1rem" }}>此部門頁面尚未建立。</p>
        <button onClick={goBack} className="rounded-full border border-white/30 text-white px-6 py-2.5 hover:bg-white/5" style={{ fontFamily: zhFont, fontWeight: 700, letterSpacing: "0.16em" }}>
          ← 回上頁
        </button>
      </section>
    );
  }

  return (
    <section className="relative bg-black">
      {/* 切換點的脈動動畫（比照歷屆會長） */}
      <style>{`
        @keyframes deptPulseDot {
          0%, 100% { transform: scale(1);    box-shadow: 0 0 0 0 var(--dept-glow); }
          50%      { transform: scale(1.18); box-shadow: 0 0 10px 2px var(--dept-glow); }
        }
        .dept-pulse-dot { transform-origin: center; animation: deptPulseDot 1.8s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .dept-pulse-dot { animation: none; box-shadow: none; } }
      `}</style>

      {/* ══════════ 上半：簡介 + 服務輪播 ══════════ */}
      <div className="relative overflow-hidden">
        <MazeBackdrop />
        <div className="relative max-w-[1400px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 pt-24 sm:pt-28 lg:pt-[120px] pb-16 lg:pb-24 lg:min-h-screen lg:flex lg:flex-col lg:justify-center">
          {/* 回上頁 */}
          <Reveal>
            <button
              onClick={goBack}
              className="inline-flex items-center gap-2 rounded-full bg-white text-black px-5 py-2 mb-8 lg:mb-10 hover:bg-white/90 transition-colors"
              style={{ fontFamily: zhFont, fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.12em" }}
            >
              <ArrowLeft size={16} strokeWidth={2.4} /> 回上頁
            </button>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* 左：ABOUT + 標題 + 簡介 + 加入鈕 */}
            <div className="max-w-[600px]">
              <Reveal>
                <p className="text-white/30 text-xs tracking-widest mb-4" style={{ fontFamily: monoFont }}>
                  — ABOUT US 關於我們
                </p>
              </Reveal>
              <Reveal delay={40}>
                <h1 className="leading-none" style={{ fontFamily: zhDisplay, fontWeight: 900, fontSize: "clamp(2.6rem,4.5vw,4.4rem)", letterSpacing: "0.1em", color: data.color }}>
                  {data.zh}
                </h1>
                <p className="mt-2 mb-8" style={{ fontFamily: monoFont, fontWeight: 700, fontSize: "clamp(0.85rem,1.2vw,1.15rem)", letterSpacing: "0.32em", color: data.color, opacity: 0.75 }}>
                  {data.en}
                </p>
              </Reveal>
              <Reveal delay={80}>
                <p style={{ fontFamily: zhFont, fontWeight: 500, fontSize: "clamp(0.85rem,1vw,1rem)", lineHeight: 2.1, letterSpacing: "0.06em", color: "rgba(255,255,255,0.82)" }}>
                  {data.intro}
                </p>
              </Reveal>
              <Reveal delay={120}>
                <a
                  href="#join"
                  className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 mt-8 transition-colors"
                  style={{ fontFamily: zhFont, fontWeight: 700, fontSize: "1rem", letterSpacing: "0.16em", color: "#fff", border: `1.5px solid ${data.color}`, background: "transparent" }}
                >
                  加入{data.zh}
                </a>
              </Reveal>
            </div>

            {/* 右：服務輪播 */}
            <Reveal delay={100}>
              <ServiceCarousel services={data.services} />
            </Reveal>
          </div>
        </div>
      </div>

      {/* ══════════ 下半：團隊成員 ══════════ */}
      <div className="relative max-w-[1400px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 pb-24 lg:pb-32">
        <Reveal>
          <div className="inline-flex rounded-full mb-10 lg:mb-14" style={{ padding: "1.5px", background: "linear-gradient(90deg, #D14B4B 0%, #2F9EBD 100%)" }}>
            <div className="rounded-full bg-black px-6 py-2">
              <span className="text-white" style={{ fontFamily: zhFont, fontWeight: 700, fontSize: "clamp(0.9rem,1.1vw,1.05rem)", letterSpacing: "0.24em", paddingLeft: "0.24em" }}>
                團隊成員
              </span>
            </div>
          </div>
        </Reveal>

        {/* 幹部卡 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 mb-16 lg:mb-20">
          {data.heads.map((h, i) => (
            <HeadCard key={`${h.name}-${i}`} head={h} delay={i * 60} />
          ))}
        </div>

        {/* 部員名單（左）＋ 加入區塊（右） */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* 部員 MEMBERS */}
          <Reveal>
            <div className="rounded-2xl border p-6 sm:p-8 h-full" style={{ borderColor: `${data.color}66`, background: "rgba(255,255,255,0.02)" }}>
              <p className="mb-6" style={{ fontFamily: monoFont, fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.55)" }}>
                -部員&nbsp;&nbsp;MEMBERS-
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {data.members.map((m, i) => (
                  <div key={`${m.n}-${i}`} className="flex items-center gap-3 min-w-0">
                    <span className="shrink-0 text-white/70 rounded-[4px] px-1.5 py-0.5" style={{ fontFamily: monoFont, fontWeight: 500, fontSize: "0.62rem", background: "rgba(255,255,255,0.12)", letterSpacing: "0.04em" }}>
                      {m.c}
                    </span>
                    <span className="text-white truncate" style={{ fontFamily: zhFont, fontWeight: 700, fontSize: "clamp(0.9rem,1.1vw,1.05rem)", letterSpacing: "0.1em" }}>
                      {m.n}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* 成為…的一員 */}
          <Reveal delay={80}>
            <div className="rounded-2xl border border-white/15 p-6 sm:p-8 h-full flex flex-col" style={{ background: "rgba(255,255,255,0.02)" }}>
              <h3 className="mb-4" style={{ fontFamily: zhFont, fontWeight: 900, fontSize: "clamp(1.3rem,2vw,1.8rem)", letterSpacing: "0.06em", color: "#fff" }}>
                成為{" "}
                <span style={{ color: data.color }}>{data.zh}</span>{" "}
                的一員
              </h3>
              <p className="mb-6 flex-1" style={{ fontFamily: zhFont, fontWeight: 500, fontSize: "clamp(0.85rem,1vw,0.98rem)", lineHeight: 2, letterSpacing: "0.04em", color: "rgba(255,255,255,0.6)" }}>
                {data.joinBlurb}
              </p>
              <a
                href="#join"
                className="self-start relative inline-flex items-center gap-2 rounded-full px-7 py-2.5 overflow-hidden text-white"
                style={{ fontFamily: zhFont, fontWeight: 900, fontSize: "1rem", letterSpacing: "0.16em", background: "#000" }}
              >
                <span className="absolute inset-0 rounded-full" style={{ padding: "1.5px", border: "1.5px solid transparent", background: "linear-gradient(#000,#000) padding-box, linear-gradient(90deg,#D14B4B 0%,#2F9EBD 100%) border-box" }} />
                <span className="relative z-10 inline-flex items-center gap-2">加入我們 <ArrowRight size={15} /></span>
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ══════════ 圖片自動對應（丟檔就用）══════════
// 在 imports/ 底下開「兩個共用資料夾」，各部門都放這裡、用「部門前綴＋編號」命名：
//   imports/services/ ← 服務圖，如 行政部：gen1.png、gen2.png…
//   imports/members/  ← 幹部照，如 行政部：gen1.png、gen2.png、gen3.png…
// 用相對路徑（從本檔 pages/ 往上三層到 imports/），避免 @/ 別名在 import.meta.glob 不生效。
// ★ 新增/替換圖片後，若畫面沒更新，請重啟一次 dev server（glob 於啟動時掃描資料夾）。
const SERVICE_IMGS = import.meta.glob("../../../imports/services/*.{png,jpg,jpeg,webp}", { eager: true, import: "default" }) as Record<string, string>;
const MEMBER_IMGS = import.meta.glob("../../../imports/members/*.{png,jpg,jpeg,webp}", { eager: true, import: "default" }) as Record<string, string>;

// 依檔名（不含副檔名）取圖，找不到回空字串（會顯示佔位框）。
function pickImg(rec: Record<string, string>, file: string): string {
  const hit = Object.entries(rec).find(([path]) => path.includes(`/${file}.`));
  return hit ? hit[1] : "";
}
const svcImg = (file: string) => pickImg(SERVICE_IMGS, file); // 服務圖
const memImg = (file: string) => pickImg(MEMBER_IMGS, file); // 幹部照

// ══════════ 部門資料（要加其他部門就在這裡新增一筆）══════════

const GENERAL_AFFAIRS: DeptData = {
  slug: "general",
  zh: "行政部",
  en: "GENERAL AFFAIRS",
  color: "#B07C43",
  intro:
    "行政部為第 52 屆系學會自「召部執秘」獨立出來的專責部門，扮演組織運作最堅實的後勤骨幹。部門主責帳目管理（含系學會費收繳與財務透明化）、系館公共空間管理（如學輔室營運、設備維護與系櫃申請辦理）以及各項行政文書工作。透過將繁雜的行政與後勤業務專業化、制度化，行政部確保了系學會整體運作的高效與透明，為各項活動與學會政策提供穩固的支援體系。",
  joinBlurb:
    "加入行政部，你將成為全系運作最核心的幕後推手，掌管系館空間、財務與行政決策。這不只是會務，更是累積組織管理經驗、展現影響力的旅程。打造更完善的圖資系，就差你一個！",
  services: [
    // 服務圖放 imports/services/gen1.png、gen2.png（找不到會顯示佔位框）；href 先用 "#"，之後接服務頁。
    { name: "系櫃租借", img: svcImg("gen1"), href: "#" },
    { name: "系學會費", img: svcImg("gen2"), href: "#" },
  ],
  heads: [
    // 幹部照放 imports/members/gen1.png、gen2.png、gen3.png（找不到＝照片待補）。
    { name: "賴思瑜", cls: "B14", title: "部長", img: memImg("gen1") },
    { name: "林榮恩", cls: "B14", title: "部長", img: memImg("gen2") },
    { name: "劉以寬", cls: "B14", title: "部長", img: memImg("gen3") },
  ],
  members: [
    { n: "謝君兒", c: "B13" },
    { n: "羅良鎮", c: "B13" },
    { n: "廖誼晴", c: "B13" },
  ],
};

export const DEPARTMENTS: Record<string, DeptData> = {
  general: GENERAL_AFFAIRS,
  // 之後新增：activity / academic / image / sports ...（結構同上）
};