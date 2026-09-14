import { useEffect, type CSSProperties } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Reveal } from "../sections/shared";
// ↑ 若 Services.tsx 不是放在跟 DepartmentPage 同一層，請改這行的相對路徑到 sections/shared。
import { DEPT_COLORS, BENTO, serviceBySlug, type Cell } from "./servicesData";
// ↑ 服務資料（Bento 佈局 + 詳情頁內容）集中在 servicesData.ts；本檔只負責呈現。
//   若不同層，改成正確的相對路徑即可。

/**
 * 各種服務（Services）
 * ─────────────────────────────────────────────────────────────
 * 進入方式：導覽列「各種服務」→ #/services（本檔的 Bento Grid 總覽）
 * 點任一業務格 → #/service/<slug>（本檔的「服務詳情頁」，和 DepartmentPage 上半同格式）
 *
 * 用法：<Services />              → 顯示 Bento Grid 總覽
 *      <Services slug="textbook" /> → 顯示該服務的詳情頁
 * 路由怎麼接：在你的 hash 路由把 #/services 指到 <Services/>，
 *            #/service/xxx 指到 <Services slug="xxx"/> 即可。
 */

// ── 字型（與全站一致）──
const zhDisplay = "'Chiron Hei HK Text','Noto Sans TC', sans-serif";
const zhFont = "'Noto Sans TC', sans-serif";
const mono = "'Ubuntu Sans Mono', monospace";

// ── 準備中的膠囊提示語 ──
const SERVICE_SOON = "本服務準備中，敬請期待";

// ── 部門名稱格：svg 顯示大小（部門名稱 svg 由你放在 imports/services/<dept>.svg）──
// 想再更小／更大，改這兩個百分比即可（相對於該格）。
const DEPT_LOGO = { maxW: "100%", maxH: "42%" };

// ── 讀 imports/services/ 底下的圖檔（部門名稱 svg：gen.svg…；服務詳情圖：<slug>.png/jpg/svg）──
// 若原始碼不在 /src 底下，改下面 glob 的路徑字串即可；舊版 Vite 把 query/import 換成 as:"url"。
const SERVICE_ASSETS = import.meta.glob("/src/**/services/*.{svg,png,jpg,jpeg,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
// 依「完整檔名」取（給部門 svg 用，如 gen.svg）
function assetByFile(file: string): string | undefined {
  const hit = Object.keys(SERVICE_ASSETS).find((p) => p.endsWith(`/services/${file}`));
  return hit ? SERVICE_ASSETS[hit] : undefined;
}
// 依「檔名去副檔名 = slug」取（給服務詳情圖用，副檔名不限）
function assetBySlug(slug: string): string | undefined {
  const hit = Object.keys(SERVICE_ASSETS).find((p) => {
    const f = (p.split("/").pop() || "").replace(/\.[^.]+$/, "");
    return f === slug;
  });
  return hit ? SERVICE_ASSETS[hit] : undefined;
}

// ── 單一格 ───────────────────────────────────────────────
function BentoCell({ cell }: { cell: Cell }) {
  const color = DEPT_COLORS[cell.dept];
  const style: CSSProperties = { gridColumn: cell.gc, gridRow: cell.gr };

  if (cell.type === "dept") {
    const svg = assetByFile(`${cell.dept}.svg`);
    return (
      <div className="rounded-2xl flex items-center justify-center p-3 select-none" style={{ ...style, background: color }}>
        {svg ? (
          <img src={svg} alt={`${cell.dept}.`} className="object-contain" style={{ maxWidth: DEPT_LOGO.maxW, maxHeight: DEPT_LOGO.maxH }} />
        ) : (
          // 佔位（等你放 imports/services/<dept>.svg 就會換掉），字級刻意做小。
          <span className="text-white/90 lowercase" style={{ fontFamily: mono, fontWeight: 700, fontSize: "clamp(0.85rem,1.3vw,1.3rem)" }}>{cell.dept}.</span>
        )}
      </div>
    );
  }

  return (
    <a
      href={`#/service/${cell.slug}`}
      className="svc-cell group rounded-2xl border-[1.5px] flex items-center justify-center text-center p-2 transition-colors duration-200"
      style={{ ...style, borderColor: color, ["--svc-fill" as string]: color } as CSSProperties}
      aria-label={cell.zh}
    >
      <span
        className="text-white leading-tight"
        style={{
          fontFamily: zhDisplay,
          fontWeight: 700,
          fontSize: "clamp(0.95rem,1.5vw,1.7rem)",
          letterSpacing: "0.08em",
          ...(cell.vertical ? { writingMode: "vertical-rl", textOrientation: "upright" } as CSSProperties : {}),
        }}
      >
        {cell.zh}
      </span>
    </a>
  );
}

// ── Bento Grid 總覽 ───────────────────────────────────────
function ServicesGrid() {
  return (
    <section className="relative bg-black min-h-screen px-4 sm:px-6 lg:px-10 pt-24 sm:pt-28 lg:pt-[120px] pb-10">
      <style>{`.svc-cell:hover{ background: var(--svc-fill); }`}</style>
      <Reveal>
        <p className="mb-6" style={{ fontFamily: mono, fontSize: "14px", letterSpacing: "0.05em", background: "linear-gradient(90deg,#FFF 0%,#595959 34%,#FFF 68%,#3A3A3A 100%)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          — 各種服務・各部業務
        </p>
      </Reveal>

      {/* 手機以水平捲動檢視完整 Bento（min-width 保底）；桌機直接鋪滿 */}
      <div className="overflow-x-auto">
        <div
          className="grid gap-2 sm:gap-3"
          style={{
            gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
            gridTemplateRows: "repeat(8, 1fr)",
            minWidth: "980px",
            height: "min(78vh, 820px)",
          }}
        >
          {BENTO.map((cell, i) => (
            <BentoCell key={cell.type === "dept" ? `dept-${cell.dept}` : cell.slug + i} cell={cell} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 服務詳情頁（只有上半：左 標題/便利貼/英文/介紹/按鈕，右 圖片）──
function ServiceDetail({ slug }: { slug: string }) {
  const s = serviceBySlug(slug);

  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, [slug]);

  const goBack = () => {
    if (typeof window === "undefined") return;
    if (window.history.length > 1) window.history.back();
    else window.location.hash = "#/services";
  };

  if (!s) {
    return (
      <section className="relative bg-black min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-white/70" style={{ fontFamily: zhFont, fontSize: "1.1rem" }}>此服務頁面尚未建立。</p>
        <button onClick={goBack} className="rounded-full border border-white/30 text-white px-6 py-2.5 hover:bg-white/5" style={{ fontFamily: zhFont, fontWeight: 700, letterSpacing: "0.16em" }}>
          ← 回上頁
        </button>
      </section>
    );
  }

  const color = DEPT_COLORS[s.dept];
  const img = assetBySlug(s.slug);
  const hasHref = !!s.href && s.href !== "#";

  return (
    <section className="relative min-h-screen" style={{ background: color }}>
      <div className="relative max-w-[1400px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 pt-24 sm:pt-28 lg:pt-[120px] pb-16 lg:pb-24 lg:min-h-screen lg:flex lg:flex-col lg:justify-center">
        {/* 回上頁 */}
        <Reveal>
          <button
            onClick={goBack}
            className="group inline-flex items-center gap-2 rounded-full bg-white text-black px-5 py-2 mb-8 lg:mb-10 hover:bg-white/90 transition-all duration-200 w-fit"
            style={{ fontFamily: zhFont, fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.06em" }}
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-200" /> 回上頁
          </button>
        </Reveal>

        <Reveal delay={40}>
          <p className="mb-6" style={{ fontFamily: mono, fontSize: "14px", letterSpacing: "0.05em", color: "rgba(255,255,255,0.7)" }}>
            — 各種服務・各部業務
          </p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* 左：標題 + 便利貼 + 英文 + 介紹 + 按鈕 */}
          <div className="max-w-[620px]">
            <Reveal delay={60}>
              <div className="flex items-end flex-wrap gap-3 mb-2">
                <h1 className="leading-none text-white" style={{ fontFamily: zhDisplay, fontWeight: 900, fontSize: "clamp(2.4rem,4.5vw,4.2rem)", letterSpacing: "0.08em" }}>
                  {s.zh}
                </h1>
                {/* 便利貼（隨機/自填文字，內容在該服務的 note） */}
                {s.note ? (
                  <span
                    className="inline-block mb-2 rounded-[6px] px-3 py-1 select-none"
                    style={{ background: "#111", color: "#fff", fontFamily: mono, fontWeight: 700, fontSize: "clamp(0.72rem,1vw,0.95rem)", letterSpacing: "0.04em", transform: "rotate(-3deg)", boxShadow: "0 6px 16px -8px rgba(0,0,0,0.6)" }}
                  >
                    {s.note}
                  </span>
                ) : null}
              </div>
            </Reveal>

            <Reveal delay={90}>
              <p className="mb-8" style={{ fontFamily: mono, fontWeight: 700, fontSize: "clamp(0.8rem,1.2vw,1.1rem)", letterSpacing: "0.28em", color: "rgba(255,255,255,0.85)" }}>
                {s.en}
              </p>
            </Reveal>

            <Reveal delay={120}>
              <p style={{ fontFamily: zhFont, fontWeight: 500, fontSize: "clamp(0.9rem,1.05vw,1.05rem)", lineHeight: 2.1, letterSpacing: "0.04em", color: "rgba(255,255,255,0.92)" }}>
                {s.intro}
              </p>
            </Reveal>

            {/* 按鈕：有網址＝白色實心「前往 →」；沒網址＝純外框膠囊、無箭頭、不可點 */}
            <Reveal delay={160}>
              <div className="mt-10">
                {hasHref ? (
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white text-black px-7 py-3 hover:bg-white/90 transition-all duration-200 group w-fit"
                    style={{ fontFamily: zhFont, fontWeight: 900, fontSize: "1rem", letterSpacing: "0.16em" }}
                  >
                    前往 <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                  </a>
                ) : (
                  <span
                    className="inline-flex items-center rounded-full px-7 py-3 select-none cursor-default"
                    style={{ fontFamily: zhFont, fontWeight: 700, fontSize: "1rem", letterSpacing: "0.12em", color: "#fff", background: "transparent", border: "1.5px solid rgba(255,255,255,0.7)" }}
                  >
                    {SERVICE_SOON}
                  </span>
                )}
              </div>
            </Reveal>
          </div>

          {/* 右：圖片（無按鈕）。放 imports/services/<slug>.png（或 jpg/webp/svg） */}
          <Reveal delay={100}>
            <div className="relative w-full flex items-center justify-center" style={{ height: "clamp(260px, 46vh, 460px)" }}>
              {img ? (
                <img src={img} alt={s.zh} className="max-w-full max-h-full object-contain select-none" />
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/25 w-[70%] h-full text-white/50" style={{ fontFamily: mono, letterSpacing: "0.2em" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-14 h-14">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M3 15l5-5 4 4 3-3 6 6" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="8.5" cy="9" r="1.4" />
                  </svg>
                  <span className="text-xs">{s.slug}.png</span>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ── 進入點：有 slug 顯示詳情頁；沒有就顯示總覽 ──
export default function Services({ slug }: { slug?: string }) {
  return slug ? <ServiceDetail slug={slug} /> : <ServicesGrid />;
}