import { useState, type CSSProperties } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal } from "./shared";

// ─────────────────────────────────────────────────────────────────────────
// 贊助頁（獨立分頁 · 路由 #/sponsor）
// A. Hero：左標題文案 ＋ 右六顆「拉長版 Switch Toggle」（圓球自動上下浮動）
//           ＋ 底部置中 Sponsor LISSA logo。
// B. 贊助方案規格比較：三方案圖＋名稱，類別可左右切換，切換後顯示差異，下面是方案敘述。
// C. 感謝您的支持！：標題＋副標＋「聯絡我們」按鈕，背景是排成「向下箭頭」的浮動 Toggle。
//
// ★ 所有「大小(px)／位置(XY px)」都集中在下面的《版面常數區》，改那裡就好。
// ─────────────────────────────────────────────────────────────────────────

// ── 字型（與全站一致）──
const zhHead = "'Chiron Hei HK Text','Noto Sans TC', sans-serif"; // 標題／敘述
const zhBody = "'Noto Sans TC', sans-serif";                       // 按鈕
const mono   = "'Ubuntu Sans Mono','Noto Sans TC', monospace";     // 方案名稱／數值

// ── 左上角小標題（麵包屑，與 FeesSection 對齊）──────────────────────────────
const EYEBROW_TEXT = "支持我們・贊助我們";
const EYEBROW_X = 0;
const EYEBROW_Y = 90;
function Eyebrow({ text = EYEBROW_TEXT }: { text?: string }) {
  return (
    <p
      className="tracking-widest pointer-events-none select-none"
      style={{
        fontSize: "14px",
        fontFamily: "'Ubuntu Sans Mono', monospace",
        background: "linear-gradient(90deg, #FFF 0%, #595959 34.13%, #FFF 67.79%, #3A3A3A 100%)",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundSize: "220% 100%",
        transform: `translate(${EYEBROW_X}px, ${EYEBROW_Y}px)`,
      }}
    >
      — {text}
    </p>
  );
}

// 聯絡（換成真實連結即可）
const CONTACT = { contactHref: "#/contact" };

// ══════════════════════════════════════════════════════════════
// ★★ 版面常數區：size=字級(px)；x/y=位移(px，正x=右、正y=下)；h/w=尺寸(px) ★★
//    每個元素都有自己的一組，單獨調不影響別人。
// ══════════════════════════════════════════════════════════════

// 五個部門色（Toggle 用）。依序：行政(棕)、活動(紅)、學術(綠)、美宣(紫)、資訊/公關(藍)
const DEPT_COLORS = ["#A9713F", "#C24747", "#4E7B3F", "#7B3F6B", "#2F7FA6"];
// 正副會長色（放 Hero 最左邊那顆）
const LEADER_COLOR = "#A27F00";
// Hero 六顆並列：正副會長(最左) ＋ 五部門色
const HERO_COLORS = [LEADER_COLOR, ...DEPT_COLORS];

// ── A. Hero ─────────────────────────────────────────────
const HERO_LAYOUT = {
  title:   { size: 58, lh: 1.5, x: 0, y: -90 },   // 主標題（兩行）
  sub:     { size: 20, lh: 2.0, x: 0, y: -60 },   // 副標（兩行）
};
const HERO_TOGGLE = { w: 60, h: 480, gap: 30, x: 65, y: 0 }; // 右側六顆：w=軌道寬(也是圓球直徑)、h=軌道高、gap=間距
const HERO_LOGO   = { h: 60, x: 0, y: -30 };                   // 底部 Sponsor logo 高度與位移

// ── B. 贊助方案規格比較 ──────────────────────────────────
const PLANS_LAYOUT = {
  heading:  { size: 44, x: -90, y: -70 },           // 「贊助方案規格比較」
  art:      { h: 120, x: 0, y: -100 },             // 三張方案圖高度
  name:     { size: 18, x: 0, y: -80 },           // 方案名稱（mono）
  catLabel: { size: 18, x: 0, y: 0 },           // 類別膠囊文字
  value:    { size: 26, x: 0, y: 20 },           // 三方案數值
  desc:     { size: 15, lh: 2.0, x: 0, y: 0 },  // 方案敘述（Chiron）
  colW:     300,   // ★ 每個方案欄的寬度(px)（三欄同寬）
  colGap:   190,    // ★ 相鄰方案欄的間距(px)：調這個就能拉近／拉遠左右兩欄，Plus 永遠置中
};
// 三欄置中排版：整組水平置中（Plus 在正中央），欄寬 colW、間距 colGap
const planRow: CSSProperties = { display: "flex", justifyContent: "center", gap: `${PLANS_LAYOUT.colGap}px` };
const planCol: CSSProperties = { width: `${PLANS_LAYOUT.colW}px`, maxWidth: "100%" };
// 兩條分隔線落在欄與欄間距的正中央（自動跟著 colW/colGap 對齊）
const DIVIDER_OFFSET = PLANS_LAYOUT.colW / 2 + PLANS_LAYOUT.colGap / 2;

// ── C. 感謝您的支持 ─────────────────────────────────────
const THANKS_LAYOUT = {
  title:  { size: 88, x: 0, y: 0 },             // 「感謝您的支持！」
  sub:    { size: 20, x: 0, y: 0 },             // 副標
  button: { size: 17, x: 0, y: 40 },            // 按鈕文字
};
// 背景：散布多個箭頭圖（imports/Sponsor/arrow.svg），各自「閃動」（淡入淡出）。
// 每個箭頭：x/y = 相對畫面中心的位移(px，負=左/上、正=右/下)；size = 寬度(px，可省略用預設)；delay = 閃動起始錯開(秒)。
// (0,0) = 畫面正中心。想加減幾個 → 增刪 THANKS_ARROWS 的項目。
const THANKS_ARROW = { w: 300 };                       // 箭頭圖預設寬度(px)
const THANKS_BLINK = { min: 0.12, max: 0.85, dur: 3.2 }; // 閃動：透明度最低/最高、週期(秒)
type ThanksArrow = { x: number; y: number; size?: number; delay?: number };
const THANKS_ARROWS: ThanksArrow[] = [
  { x: -540, y: -240, delay: 0.0 },
  { x:  540, y: -240, delay: 0.9 },
  { x: -540, y:  240, delay: 1.8 },
  { x:  540, y:  240, delay: 2.6 },
];
// ── imports/Sponsor/*.svg 自動讀取（缺檔不會壞，會顯示佔位框） ──
// 若原始碼不在 /src 底下，改下面的 glob 路徑字串即可；
// 舊版 Vite 請把 `query:"?url", import:"default"` 換成 `as:"url"`。
const SPONSOR_SVGS = import.meta.glob("/src/**/Sponsor/*.svg", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
function sponsorSvg(file: string): string | undefined {
  const hit = Object.keys(SPONSOR_SVGS).find((p) => p.endsWith(`/Sponsor/${file}`));
  return hit ? SPONSOR_SVGS[hit] : undefined;
}

// ── 三個贊助方案（svg 放 imports/Sponsor/；名稱用 mono）──
const PLANS = [
  { key: "basic",   svg: "basic.svg",   name: "BASIC  基礎曝光",  desc: "最輕量的支持方式，在系學會官網與年度感謝中露出品牌，適合想先試水溫的夥伴。" },
  { key: "plus",    svg: "plus.svg",    name: "PLUS  深度推廣",   desc: "跨官網、社群與活動的多點曝光，讓品牌被全系與更廣的校園社群持續看見。" },
  { key: "partner", svg: "partner.svg", name: "PARTNER  年度夥伴", desc: "一整年的深度合作與客製化露出，成為圖資系學會最緊密的長期夥伴。" },
];

// ── 比較面向（可左右切換）；每組 values 依序對應 Basic / Plus / Partner（皆為佔位範例）──
const COMPARE = [
  { label: "贊助金額", values: ["NT$ 1,000 以下", "NT$ 1,000 – 5,000", "NT$ 5,000 以上"] },
  { label: "核心形式", values: ["官方網站專區露出", "官網 ＋ 社群宣傳", "官網 ＋ 社群 ＋ 實體宣傳"] },
  { label: "官方網站", values: ["專屬頁面品牌 Logo", "品牌 Logo ＋ 首頁宣傳版位", "品牌 Logo ＋ 首頁宣傳 ＋ 獨立夥伴介紹頁面"] },
  { label: "社群推廣", values: ["—", "專屬宣傳貼文 1 篇 ＋ 限時動態", "專屬宣傳貼文 2 篇以上 ＋ 限時動態"] },
  { label: "實體宣傳", values: ["—", "—", "實體活動現場宣傳（文宣品、海報發放）"] },
];

// hex → rgba（Toggle 軌道底色／圓球光暈用）
function hexToRgba(hex: string, a: number): string {
  const h = hex.replace("#", "");
  return `rgba(${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}, ${a})`;
}
// 位移 helper：把 {x,y} 變成 transform
const move = (c: { x?: number; y?: number }): CSSProperties => ({ transform: `translate(${c.x ?? 0}px, ${c.y ?? 0}px)` });

// ── 拉長版 Switch Toggle：軌道 ＋ 圓球繞「軌道中心」上下對稱擺動（w/h 為 px）──
// travel：圓球上下總擺動幅度(px)，不填＝跑滿整條軌道(h-w)。圓球繞中心 ±travel/2 擺動，
//         所以「軌道中心」就是這根的定位點——y 一樣、球的中心高度就一定一樣。
// ★ delay 一律轉成「負值」：讓動畫一載入就從週期中段開始，圓球進場已散開、不會一起往下掉。
function ToggleBar({ color, w, h, dur, delay, travel, className = "", style }: {
  color: string; w: number; h: number; dur: number; delay: number; travel?: number; className?: string; style?: CSSProperties;
}) {
  const amp = (travel ?? (h - w)) / 2;
  return (
    <div
      className={`relative overflow-hidden shrink-0 ${className}`}
      style={{ width: `${w}px`, height: `${h}px`, borderRadius: 9999, background: hexToRgba(color, 0.16), ...style }}
      aria-hidden
    >
      <span
        className="sp-ball absolute left-1/2 top-1/2"
        style={{
          width: `${w}px`,
          height: `${w}px`,
          borderRadius: "9999px",
          background: color,
          boxShadow: `0 0 26px -4px ${hexToRgba(color, 0.55)}`,
          ["--sp-amp" as string]: `${amp}px`,
          animation: `spBall ${dur}s ease-in-out ${-Math.abs(delay)}s infinite`,
        } as CSSProperties}
      />
    </div>
  );
}

// ── 類別左右切換鈕（點 → 箭頭，比照 DepartmentPage）──
function NavArrow({ dir, color, disabled, onClick }: { dir: "prev" | "next"; color: string; disabled: boolean; onClick: () => void }) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "上一個面向" : "下一個面向"}
      className="group relative flex items-center justify-center disabled:cursor-default"
      style={{ width: "42px", height: "42px" }}
    >
      {disabled ? (
        <span className="absolute rounded-full" style={{ width: "11px", height: "11px", background: color, opacity: 0.32 }} />
      ) : (
        <>
          <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-out group-hover:opacity-0">
            <span className="dept-pulse-dot absolute rounded-full" style={{ width: "12px", height: "12px", background: color, ["--dept-glow" as string]: hexToRgba(color, 0.55) } as CSSProperties} />
          </span>
          <span className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 scale-75 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-100" style={{ background: color, boxShadow: `0 8px 20px -8px ${color}` }}>
            <Icon size={20} strokeWidth={2.6} className="text-white" />
          </span>
        </>
      )}
    </button>
  );
}

// ── 方案圖：固定高度框 ＋ object-contain 置中（不同尺寸 svg 都會對齊）──
function PlanArt({ file, alt }: { file: string; alt: string }) {
  const url = sponsorSvg(file);
  return (
    <div className="relative w-full flex items-center justify-center" style={{ height: `${PLANS_LAYOUT.art.h}px`, ...move(PLANS_LAYOUT.art) }}>
      {url ? (
        <img src={url} alt={alt} className="max-w-[86%] max-h-full object-contain select-none" />
      ) : (
        <div className="flex items-center justify-center rounded-2xl border border-dashed border-white/15 w-[70%] h-full text-white/25" style={{ fontFamily: mono, fontSize: "0.7rem", letterSpacing: "0.18em" }}>
          {file}
        </div>
      )}
    </div>
  );
}

export default function SponsorSection() {
  const [cat, setCat] = useState(0);
  const canPrev = cat > 0;
  const canNext = cat < COMPARE.length - 1;
  const current = COMPARE[cat];
  const heroLogo = sponsorSvg("sponsorLISSA.svg");
  const arrowImg = sponsorSvg("arrow.svg");

  return (
    <div className="bg-black">
      <style>{`
        /* 圓球繞「軌道中心」上下對稱擺動（中心 = 這根 toggle 的定位點） */
        @keyframes spBall {
          0%,100% { transform: translate(-50%, calc(-50% - var(--sp-amp))); }
          50%     { transform: translate(-50%, calc(-50% + var(--sp-amp))); }
        }
        /* 類別切換點的脈動（比照 DepartmentPage） */
        @keyframes deptPulseDot {
          0%,100% { transform: scale(1);    box-shadow: 0 0 0 0 var(--dept-glow); }
          50%     { transform: scale(1.18); box-shadow: 0 0 10px 2px var(--dept-glow); }
        }
        .dept-pulse-dot { transform-origin: center; animation: deptPulseDot 1.8s ease-in-out infinite; }
        /* 背景箭頭閃動（淡入淡出） */
        @keyframes spBlink {
          0%,100% { opacity: var(--sp-min); }
          50%     { opacity: var(--sp-max); }
        }
        @media (prefers-reduced-motion: reduce) {
          .sp-ball, .dept-pulse-dot, .sp-blink { animation: none !important; }
        }
      `}</style>

      {/* ══════════ A. Hero ══════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden px-5 sm:px-8 md:px-14 pt-24 pb-28">
        <div className="absolute top-6 left-6 md:left-12 z-20">
          <Eyebrow />
        </div>
        <div className="max-w-[1400px] w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* 左：文案 */}
          <div>
            <div className="h-[14px] mb-8" aria-hidden="true" />
            <Reveal delay={60}>
              <h1 className="text-white mb-8" style={{ fontFamily: zhHead, fontWeight: 900, fontSize: `${HERO_LAYOUT.title.size}px`, lineHeight: HERO_LAYOUT.title.lh, letterSpacing: "0.02em", ...move(HERO_LAYOUT.title) }}>
                <span className="block">讓你的品牌，</span>
                <span className="block">走入知識與資訊的核心。</span>
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="text-white/60" style={{ fontFamily: zhBody, fontWeight: 500, color: "white", fontSize: `${HERO_LAYOUT.sub.size}px`, letterSpacing: "0.05em", lineHeight: HERO_LAYOUT.sub.lh, ...move(HERO_LAYOUT.sub) }}>
                <span className="block">透過全新改版的系學會官方網站與社群渠道，</span>
                <span className="block">精準對接臺大圖資系多元的專業人才與校園群體。</span>
              </p>
            </Reveal>
          </div>

          {/* 右：六顆拉長版 Toggle（最左為正副會長色；手機隱藏，避免擁擠） */}
          <div className="hidden lg:flex items-center justify-center" style={{ gap: `${HERO_TOGGLE.gap}px`, ...move(HERO_TOGGLE) }}>
            {HERO_COLORS.map((c, i) => (
              <ToggleBar key={i} color={c} w={HERO_TOGGLE.w} h={HERO_TOGGLE.h} dur={3.4 + i * 0.4} delay={i * 0.7} />
            ))}
          </div>
        </div>

        {/* 底部置中：Sponsor LISSA logo（imports/Sponsor/sponsorLISSA.svg） */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center">
          {heroLogo ? (
            <img src={heroLogo} alt="Sponsor — NTU LIS SA" className="select-none" style={{ height: `${HERO_LOGO.h}px`, width: "auto", objectFit: "contain", ...move(HERO_LOGO) }} />
          ) : (
            <span className="text-white/30" style={{ fontFamily: mono, fontSize: "0.8rem", letterSpacing: "0.2em", ...move(HERO_LOGO) }}>Sponsor · sponsorLISSA.svg</span>
          )}
        </div>
      </section>

      {/* ══════════ B. 贊助方案規格比較 ══════════ */}
      {/* 註：「往下繼續探索」白色指示器由全站共用元件提供，這裡不再重複。 */}
      <section id="sponsor-plans" className="relative min-h-screen flex flex-col justify-center px-5 sm:px-8 md:px-14 py-24">
        <div className="max-w-[1200px] w-full mx-auto">
          <Reveal>
            <h2 className="text-white mb-14 lg:mb-20" style={{ fontFamily: zhHead, fontWeight: 900, fontSize: `${PLANS_LAYOUT.heading.size}px`, letterSpacing: "0.04em", ...move(PLANS_LAYOUT.heading) }}>
              贊助方案比較
            </h2>
          </Reveal>

          {/* 直向分隔線 ＋ 三欄內容（整組置中，Plus 在正中央；間距改 PLANS_LAYOUT.colGap） */}
          <div className="relative">
            <span aria-hidden className="pointer-events-none absolute top-0 bottom-0 w-px bg-white/10" style={{ left: `calc(50% - ${DIVIDER_OFFSET}px)` }} />
            <span aria-hidden className="pointer-events-none absolute top-0 bottom-0 w-px bg-white/10" style={{ left: `calc(50% + ${DIVIDER_OFFSET}px)` }} />

            {/* 方案圖 ＋ 名稱 */}
            <div style={planRow}>
              {PLANS.map((p, i) => (
                <div key={p.key} style={planCol}>
                  <Reveal delay={i * 80}>
                    <div className="flex flex-col items-center text-center">
                      <PlanArt file={p.svg} alt={p.name} />
                      <p className="text-white mt-6" style={{ fontFamily: mono, fontWeight: 700, fontSize: `${PLANS_LAYOUT.name.size}px`, letterSpacing: "0.06em", ...move(PLANS_LAYOUT.name) }}>
                        {p.name}
                      </p>
                    </div>
                  </Reveal>
                </div>
              ))}
            </div>

            {/* 類別切換（置中） */}
            <div className="flex items-center justify-center gap-4 sm:gap-5 my-12 lg:my-16">
              <NavArrow dir="prev" color="#D14B4B" disabled={!canPrev} onClick={() => canPrev && setCat((v) => v - 1)} />
              <div className="rounded-full border border-white/40 bg-black px-6 py-2.5 min-w-[140px] text-center" style={{ fontFamily: zhHead, fontWeight: 700, color: "#fff", fontSize: `${PLANS_LAYOUT.catLabel.size}px`, letterSpacing: "0.12em", ...move(PLANS_LAYOUT.catLabel) }}>
                {current.label}
              </div>
              <NavArrow dir="next" color="#2F9EBD" disabled={!canNext} onClick={() => canNext && setCat((v) => v + 1)} />
            </div>

            {/* 該面向下三方案的差異數值 */}
            <div style={planRow}>
              {current.values.map((v: string, i: number) => (
                <div key={i} style={planCol} className="flex items-center justify-center text-center">
                  <span className="text-white" style={{ fontFamily: zhBody, fontWeight: 700, fontSize: "23px", letterSpacing: "0.02em", ...move(PLANS_LAYOUT.value) }}>
                    {v}
                  </span>
                </div>
              ))}
            </div>

            {/* 方案敘述 */}
            <div style={planRow} className="mt-14 lg:mt-20">
              {PLANS.map((p, i) => (
                <div key={p.key} style={planCol}>
                  <Reveal delay={i * 80}>
                    <p className="text-white/60 text-center" style={{ fontFamily: zhHead, fontWeight: 500, fontSize: `${PLANS_LAYOUT.desc.size}px`, lineHeight: PLANS_LAYOUT.desc.lh, ...move(PLANS_LAYOUT.desc) }}>
                      {p.desc}
                    </p>
                  </Reveal>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ C. 感謝您的支持！ ══════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 py-24">
        {/* 背景：散布的箭頭圖（arrow.svg），各自閃動；位置全由 THANKS_ARROWS 手動控制 */}
        {arrowImg ? (
          <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
            {THANKS_ARROWS.map((a, i) => (
              <img
                key={i}
                src={arrowImg}
                alt=""
                className="sp-blink absolute max-w-none"
                style={{
                  left: "50%",
                  top: "50%",
                  width: `${a.size ?? THANKS_ARROW.w}px`,
                  transform: `translate(calc(-50% + ${a.x}px), calc(-50% + ${a.y}px))`,
                  ["--sp-min" as string]: THANKS_BLINK.min,
                  ["--sp-max" as string]: THANKS_BLINK.max,
                  animation: `spBlink ${THANKS_BLINK.dur}s ease-in-out ${-(a.delay ?? 0)}s infinite`,
                } as CSSProperties}
              />
            ))}
          </div>
        ) : null}

        <div className="relative z-10 text-center max-w-3xl">
          <Reveal>
            <h2 className="text-white mb-6" style={{ fontFamily: zhHead, fontWeight: 900, fontSize: `${THANKS_LAYOUT.title.size}px`, letterSpacing: "0.08em", textShadow: "0 4px 30px rgba(0,0,0,0.7)", ...move(THANKS_LAYOUT.title) }}>
              感謝您的支持！
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-white/80 mb-10" style={{ fontFamily: zhHead, fontWeight: 500, fontSize: `${THANKS_LAYOUT.sub.size}px`, letterSpacing: "0.04em", textShadow: "0 2px 16px rgba(0,0,0,0.6)", ...move(THANKS_LAYOUT.sub) }}>
              歡迎尋找最適合您／貴司的合作方式。
            </p>
          </Reveal>
          <Reveal delay={180}>
            <a
              href={CONTACT.contactHref}
              className="inline-flex items-center gap-3 bg-white text-black px-7 sm:px-8 py-3.5 rounded-full hover:bg-white/90 transition-all duration-200 group w-fit max-w-full"
              style={{ fontFamily: zhBody, fontWeight: 700, fontSize: `${THANKS_LAYOUT.button.size}px`, letterSpacing: "0.06em", ...move(THANKS_LAYOUT.button) }}
            >
              聯絡我們
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
            </a>
          </Reveal>
        </div>
      </section>
    </div>
  );
}