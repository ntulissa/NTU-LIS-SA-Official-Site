import { useEffect, useState, type CSSProperties } from "react";
import { ArrowRight, ArrowLeft, Info, XCircle } from "lucide-react";
import { PageEyebrow, Reveal, useIsDesktop } from "../sections/shared";
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

// ── 部門名稱格：svg 顯示大小（部門名稱 svg 放在 imports/services/IMG-<dept>/）──
// 想再更小／更大，改這兩個百分比即可（相對於該格）。
const DEPT_LOGO = { maxW: "100%", maxH: "42%" };

// ── 服務詳情頁：每個元素的 XY 位移（px；正 x=往右、正 y=往下），手動微調版面用 ──
const DETAIL_LAYOUT = {
  back:    { x: 0, y: 0 }, // 回上頁按鈕
  eyebrow: { x: 0, y: 0 }, // — 各種服務・各部業務
  title:   { x: 0, y: 0 }, // 主標題（中文名）
  note:    { x: 0, y: 0 }, // 便利貼
  en:      { x: 0, y: 0 }, // 英文標題
  intro:   { x: 0, y: 0 }, // 介紹內文
  button:  { x: 0, y: 0 }, // 按鈕（前往／準備中）
  image:   { x: 0, y: 0 }, // 右側圖片
};
const mv = (c: { x: number; y: number }) => `translate(${c.x}px, ${c.y}px)`;

// ── 詳情頁右側「翻牌卡」外觀（想改卡片大小、比例、外框、翻牌速度改這裡）──
const CARD = {
  maxW: 460,            // 卡片最大寬度（px）
  ratio: "10 / 11",     // 寬 / 高 比例（越大越扁）
  radius: 26,           // 圓角（px）
  border: "linear-gradient(135deg, #D14B4B 0%, #2F9EBD 100%)", // 紅→藍漸層外框
  flipMs: 600,          // 翻牌動畫時間（ms）
  offset: { x: 20, y: -20 }, // 卡片整體位移（px；正 x=往右、正 y=往下）。想再挪就改這裡。
  // 懸浮陰影：第一層大而柔（遠處的影子），第二層小而深（貼近卡片的影子）。想更浮就把 60px / 0.55 調大。
  shadow: "0 34px 60px -18px rgba(0,0,0,0.6), 0 14px 28px -10px rgba(0,0,0,0.4)",
};

// ── 詳情頁左側各元素的「上下間距」（Tailwind class；手機 → lg 電腦版）──
// 覺得還是太擠／太鬆，改這裡的數字即可（數字 × 4 = px，例如 mb-16 = 64px）。
const GAP = {
  backToTitle: "mb-10 lg:mb-12", // 回上頁 ↔ 主標題
  titleToEn:   "mb-4 lg:mb-6",   // 主標題 ↔ 英文標題
  enToIntro:   "mb-10 lg:mb-10", // 英文標題 ↔ 介紹內文
  introToBtn:  "mt-12 lg:mt-20", // 介紹內文 ↔ 前往按鈕
};

// ── 讀 imports/services/ 各部門子資料夾的圖檔（部門名稱 svg：IMG-gen/gen.svg…；服務詳情圖：<slug>.png/jpg/svg）──
// 若原始碼不在 /src 底下，改下面 glob 的路徑字串即可；舊版 Vite 把 query/import 換成 as:"url"。
const SERVICE_ASSETS = import.meta.glob("/src/**/services/**/*.{svg,png,jpg,jpeg,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
// 依「完整檔名」取（給部門 svg 用，如 gen.svg）
function assetByFile(file: string): string | undefined {
  const hit = Object.keys(SERVICE_ASSETS).find((p) => p.endsWith(`/${file}`));
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
          // 佔位（等你放 imports/services/IMG-<dept>/<dept>.svg 就會換掉），字級刻意做小。
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
// ── 手機／平板版總覽：12×8 的 Bento 在小螢幕塞不下，改成「每個部門一組」的兩欄格子 ──
const DEPT_ORDER = ["gen", "eve", "aca", "ima", "sp"] as const;
function ServicesListMobile() {
  return (
    <div className="flex flex-col gap-8">
      {DEPT_ORDER.map((d) => {
        const color = DEPT_COLORS[d];
        const svg = assetByFile(`${d}.svg`);
        const items = BENTO.filter((c) => c.type === "service" && c.dept === d) as Extract<Cell, { type: "service" }>[];
        return (
          <div key={d}>
            <div className="rounded-2xl flex items-center justify-center px-4 mb-3 select-none" style={{ background: color, height: 64 }}>
              {svg ? (
                <img src={svg} alt={`${d}.`} className="object-contain" style={{ maxHeight: "60%", maxWidth: "70%" }} />
              ) : (
                <span className="text-white/90 lowercase" style={{ fontFamily: mono, fontWeight: 700, fontSize: "1.1rem" }}>{d}.</span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {items.map((c) => (
                <a
                  key={c.slug}
                  href={`#/service/${c.slug}`}
                  className="svc-cell rounded-2xl border-[1.5px] flex items-center justify-center text-center px-3 py-5 min-h-[84px] transition-colors duration-200"
                  style={{ borderColor: color, ["--svc-fill" as string]: color } as CSSProperties}
                  aria-label={c.zh}
                >
                  <span className="text-white leading-snug" style={{ fontFamily: zhDisplay, fontWeight: 700, fontSize: "clamp(15px, 3.8vw, 18px)", letterSpacing: "0.06em" }}>
                    {c.zh}
                  </span>
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ServicesGrid() {
  const isDesktop = useIsDesktop();
  return (
    <section className="relative bg-black min-h-screen px-4 sm:px-6 lg:px-10 pt-[var(--page-content-top)] pb-10">
      <style>{`.svc-cell:hover{ background: var(--svc-fill); }`}</style>
      <PageEyebrow text="各種服務・各部業務" />

      {/* 手機／平板：改用分部門的兩欄清單；電腦版：原本的 Bento Grid */}
      {!isDesktop ? <ServicesListMobile /> : (
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
      )}
    </section>
  );
}

// ── 詳情頁右側「翻牌卡」──────────────────────────────────
// 正面：黑底 + 紅藍漸層外框；上方服務圖，下方部門名稱（Ubuntu Sans Mono），右上角「i」。
// 點「i」→ 翻到背面「服務指引」（條列，內容寫在 servicesData.ts 的 guide）；背面右上角「✕」翻回正面。
// 沒填 guide 的服務不顯示「i」，就當一張純圖卡。
function ServiceCard({ dept, img, zh, guide }: { dept: string; img?: string; zh: string; guide?: string[] }) {
  const [flipped, setFlipped] = useState(false);
  const isDesktop = useIsDesktop();
  const hasGuide = !!guide && guide.length > 0;

  // 兩面共用的底：黑底 + 紅藍漸層外框（padding-box/border-box 疊法）+ 背面剔除。
  // ★ 兩面「各自」都要有自己的 rotateY transform，backface-visibility:hidden 才會生效；
  //   正面若沒有 transform，翻轉時它的背面不會被剔除，正面的「i」會鏡像穿到背面 → 所以正面補上 rotateY(0)。
  const face: CSSProperties = {
    position: "absolute", inset: 0, borderRadius: CARD.radius,
    border: "1.5px solid transparent",
    background: `linear-gradient(#000,#000) padding-box, ${CARD.border} border-box`,
    WebkitBackfaceVisibility: "hidden", backfaceVisibility: "hidden",
    overflow: "hidden",
    boxShadow: CARD.shadow, // 懸浮陰影（兩面都加，翻到背面也一樣浮著）
  };
  // 右上角圓形按鈕（i / ✕）：黏在各自那一面，跟著卡片一起翻。
  const iconBtnClass = "absolute top-4 right-4 z-10 text-white/85 hover:text-white transition-colors";

  return (
    <div className="w-full mx-auto relative" style={{ maxWidth: CARD.maxW, perspective: "1600px", transform: isDesktop ? `translate(${CARD.offset.x}px, ${CARD.offset.y}px)` : undefined }}>
      {/* 翻牌本體（正/背兩面 3D 翻轉） */}
      <div
        className="relative w-full"
        style={{
          aspectRatio: CARD.ratio,
          transformStyle: "preserve-3d",
          transition: `transform ${CARD.flipMs}ms cubic-bezier(0.4,0,0.2,1)`,
          transform: flipped ? "rotateY(180deg)" : "none",
        }}
      >
        {/* 正面：服務圖 + 部門名稱（rotateY(0) 讓背面剔除生效，i 才不會穿到背面） */}
        <div style={{ ...face, transform: "rotateY(0deg)" }} className="flex flex-col p-5 sm:p-6">
          {hasGuide ? (
            <button type="button" onClick={() => setFlipped(true)} aria-label="服務指引" className={iconBtnClass}>
              <Info size={38} strokeWidth={1.4} />
            </button>
          ) : null}
          <div className="flex-1 flex items-center justify-center min-h-0 pt-2 pb-1">
            {img ? (
              <img src={img} alt={zh} className="max-w-full max-h-full object-contain select-none" />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 text-white/40" style={{ fontFamily: mono, letterSpacing: "0.2em" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-14 h-14">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="M3 15l5-5 4 4 3-3 6 6" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="8.5" cy="9" r="1.4" />
                </svg>
                <span className="text-xs">服務圖片</span>
              </div>
            )}
          </div>
        </div>

        {/* 背面（旋轉 180°）：服務指引條列（靠上排，避免上方一大片黑） */}
        <div style={{ ...face, transform: "rotateY(180deg)" }} className="flex flex-col p-6 sm:p-7">
          <button type="button" onClick={() => setFlipped(false)} aria-label="返回正面" className={iconBtnClass}>
            <XCircle size={38} strokeWidth={1.4} />
          </button>
          <div className="flex-1 flex flex-col justify-start gap-5 min-h-0 pt-16 pr-1">
            {(guide ?? []).map((g, i) => (
              <div key={i} className="flex items-start gap-3">
                {/* 圓點對齊「第一行文字」的垂直中央：line-height 1.7 → 半行 0.85em，再扣圓點半徑 */}
                <span className="shrink-0 rounded-full bg-white" style={{ width: 9, height: 9, marginTop: "calc(0.85em - 4.5px)" }} />
                <p className="text-white" style={{ fontFamily: zhFont, fontWeight: 500, fontSize: "clamp(0.95rem,1.5vw,1.25rem)", lineHeight: 1.7, letterSpacing: "0.02em" }}>{g}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 服務詳情頁（只有上半：左 標題/便利貼/英文/介紹/按鈕，右 翻牌卡）──
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
  // href 已寫在 servicesData.ts 該服務那格：填了才會出現「前往」按鈕，沒填＝顯示準備中膠囊。
  //   外部連結（http/https，如 Google 表單）→ 另開新分頁；
  //   站內連結（#/… 開頭，如 #/fees、#/contact）→ 同分頁跳轉，不開新頁。
  const hasHref = !!s.href && s.href !== "#";
  const isExternal = hasHref && /^https?:\/\//i.test(s.href as string);

  return (
    <section className="relative min-h-screen" style={{ background: color }}>
      <PageEyebrow text="各種服務・各部業務" />
      <div className="relative max-w-[1400px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 pt-[var(--page-content-top)] pb-16 lg:pb-24 lg:min-h-screen lg:flex lg:flex-col lg:justify-center">
        {/* 回上頁 */}
        <Reveal>
          <button
            onClick={goBack}
            className={`group inline-flex items-center gap-2 rounded-full bg-white text-black px-5 py-2 ${GAP.backToTitle} hover:bg-white/90 transition-all duration-200 w-fit`}
            style={{ fontFamily: zhFont, fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.06em", transform: mv(DETAIL_LAYOUT.back) }}
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-200" /> 回上頁
          </button>
        </Reveal>

        {/* items-start：標題一律靠上對齊，副標到標題的距離每頁固定一致（不再隨內文長度浮動） */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* 左：標題 + 便利貼 + 英文 + 介紹 + 按鈕 */}
          <div className="max-w-[620px]">
            <Reveal delay={60}>
              <div className={`flex items-end flex-wrap gap-3 ${GAP.titleToEn}`}>
                <h1 className="leading-none text-white" style={{ fontFamily: zhDisplay, fontWeight: 900, fontSize: "clamp(2.4rem,4.5vw,4.2rem)", letterSpacing: "0.08em", transform: mv(DETAIL_LAYOUT.title) }}>
                  {s.zh}
                </h1>
                {/* 便利貼（隨機/自填文字，內容在該服務的 note） */}
                {s.note ? (
                  <span
                    className="inline-block mb-2 rounded-[6px] px-3 py-1 select-none"
                    style={{ background: "#111", color: "#fff", fontFamily: mono, fontWeight: 700, fontSize: "clamp(0.72rem,1vw,0.95rem)", letterSpacing: "0.04em", boxShadow: "0 6px 16px -8px rgba(0,0,0,0.6)" }}
                  >
                    {s.note}
                  </span>
                ) : null}
              </div>
            </Reveal>

            <Reveal delay={90}>
              <p className={GAP.enToIntro} style={{ fontFamily: mono, fontWeight: 700, fontSize: "clamp(0.8rem,1.2vw,1.1rem)", letterSpacing: "0.28em", color: "rgba(255,255,255,0.85)", transform: mv(DETAIL_LAYOUT.en) }}>
                {s.en}
              </p>
            </Reveal>

            <Reveal delay={120}>
              <p style={{ fontFamily: zhFont, fontWeight: 500, fontSize: "clamp(0.9rem,1.05vw,1.05rem)", lineHeight: 2.1, letterSpacing: "0.1em", color: "rgba(255,255,255,0.92)", transform: mv(DETAIL_LAYOUT.intro) }}>
                {s.intro}
              </p>
            </Reveal>

            {/* 按鈕：有網址＝白色實心「前往 →」；沒網址＝純外框膠囊、無箭頭、不可點 */}
            <Reveal delay={160}>
              <div className={GAP.introToBtn} style={{ transform: mv(DETAIL_LAYOUT.button) }}>
                {hasHref ? (
                  <a
                    href={s.href}
                    {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
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

          {/* 右：翻牌卡（正面圖 + 部門名稱 + i；背面服務指引 + ✕）。圖放 imports/services/<slug>.png */}
          <Reveal delay={100}>
            <div className="relative w-full flex items-center justify-center" style={{ transform: mv(DETAIL_LAYOUT.image) }}>
              <ServiceCard dept={s.dept} img={img} zh={s.zh} guide={s.guide} />
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