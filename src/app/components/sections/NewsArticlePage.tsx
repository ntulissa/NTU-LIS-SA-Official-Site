import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "./shared";
import { getAnnouncement } from "./announcements";
// 背景浮水印圖：先沿用現有的建築圖（很淡）。想換成臺大校徽等，改這行 import 即可。
import watermark from "@/imports/LatestUpdates/newsbackground.png";

// ── 字型（與全站一致）──
const zhDisplay = "'Chiron Hei HK Text', 'Noto Sans TC', sans-serif";
const zhFont = "'Noto Sans TC', sans-serif";
const monoFont = "'Ubuntu Sans Mono', monospace";

// ══════════════════════════════════════════════════════════════════════════
// ★ 手動排版區：改這裡就能調每個元素的「大小」與「上下左右位置」。
//   每個元素都有四個值：
//     size ：大小（字級或寬度，直接寫 CSS 長度，如 "1rem"、"18px"、clamp(...)）。
//     x    ：左右位移，正值往右、負值往左（px）。
//     y    ：上下位移，正值往下、負值往上（px）。
//     gap  ：與「下一個元素」的間距（px）。內文的 paraGap＝段落之間的間距。
// ══════════════════════════════════════════════════════════════════════════

// ── 文章頁可調參數 ────────────────────────────────────────────────
const WATERMARK_OPACITY = 0.35; // 背景浮水印濃淡（0＝關掉浮水印）
const IMAGE_MAX_WIDTH = "1000px"; // 插圖最大寬度（桌機釘在右半、最寬到這裡；右半約半個螢幕寬）

// ★ 版面（桌機）：左半＝內文（可捲動）、右半＝插圖（fixed 固定不動）。
//   TEXT_HALF   ：左半內文欄佔畫面寬度的比例（右半就是剩下的）。想讓內文更寬就調大。
//   BODY_COL    ：左半內文的最大寬度（在左半之內再收一層，避免行太長）。
const TEXT_HALF = "50%";   // 左半（內文）寬度；右半（插圖）＝ 100% − 這個值
const BODY_COL = "600px";  // 左半內文最大寬度

// 版面（整體）
const LAYOUT = {
  maxWidth: "1400px",                   // 「沒有插圖」的純文字文章才用到的置中最大寬度
  padX: "clamp(20px, 5vw, 56px)",       // 左右內距（頁面兩側留白）
  padTop: "clamp(96px, 12vh, 130px)",   // 頂部留白（清掉固定 Header 的高度）
  padBottom: "clamp(64px, 10vh, 112px)",// 底部留白
};

// 各元素：大小 + 左右(x) + 上下(y) + 下方間距(gap)
const BACK    = { size: "0.9rem",  x: -25, y: 15, gap: 32 }; // 回上頁按鈕
const TITLE   = { size: "clamp(1.9rem, 4.2vw, 3.2rem)", x: -20, y: 15, gap: 16 }; // 標題
const BYLINE  = { size: "0.92rem", x: -15, y: 15, gap: 40 }; // 作者掛名 + 日期
const BODY    = { size: "clamp(0.95rem, 1.05vw, 1.05rem)", lineHeight: 2.1, x: -15, y: 15, paraGap: 24, width: "60em" }; // 內文（width＝一行最寬到多少才換行）
const IMAGE   = { x: 0, y: 70 };                            // 右半插圖位移（在右半之內微調；寬度用上方 IMAGE_MAX_WIDTH）
const CAPTION = { size: "0.82rem", x: 3, y: 0, gap: 15 }; // 圖說（與圖片的距離＝gap）

// 位移小工具：把 x/y 轉成 transform（0/0 時不輸出）
const move = (x: number, y: number): CSSProperties => (x || y ? { transform: `translate(${x}px, ${y}px)` } : {});

// 回上頁：有上一頁就返回，否則退回公告列表。
function goBack() {
  if (typeof window === "undefined") return;
  if (window.history.length > 1) window.history.back();
  else window.location.hash = "#/news";
}

// 公告文章頁（獨立頁：只有本體；Header／Footer 由最外層 App 一定會出現）。
// 由「公告列表頁」卡片的「閱讀全文」進入，網址＝ #/news/<slug>。
export default function NewsArticlePage({ slug }: { slug: string }) {
  const article = getAnnouncement(slug);

  // 右半固定插圖的「快到頁尾時往上帶」位移：平常 0（照舊釘在畫面中央），
  // 當本頁區塊底部升進畫面（＝ Footer 開始探進來）時，用同樣的量把插圖往上推，
  // 讓它停在頁尾之上、不被 Footer 蓋住（連續位移、不會跳）。
  const sectionRef = useRef<HTMLElement>(null);
  const [endShift, setEndShift] = useState(0);

  // 進頁面時捲到最上面。
  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, [slug]);

  // 監看捲動：endShift = min(0, 區塊底部距畫面頂 − 視窗高)。快到底才會變負（把插圖往上帶）。
  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => {
      const el = sectionRef.current;
      if (!el) return;
      setEndShift(Math.min(0, el.getBoundingClientRect().bottom - window.innerHeight));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [slug]);

  // 找不到這篇（slug 打錯或資料已刪）→ 顯示提示 + 回上頁。
  if (!article) {
    return (
      <section className="relative bg-black min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-white/70" style={{ fontFamily: zhFont, fontSize: "1.1rem" }}>找不到這篇公告。</p>
        <button onClick={goBack} className="group inline-flex items-center gap-2 rounded-full bg-white text-black px-5 py-2 hover:bg-white/90 transition-colors" style={{ fontFamily: zhFont, fontWeight: 700, letterSpacing: "0.12em" }}>
          <ArrowLeft size={16} strokeWidth={2.4} className="group-hover:-translate-x-1 transition-transform duration-200" /> 回上頁
        </button>
      </section>
    );
  }

  const hasImage = Boolean(article.image);
  const lastPara = article.paragraphs.length - 1;

  // 插圖 + 圖說（withOffset＝是否套用 IMAGE.x/y 位移；桌機 fixed 版才套，手機內嵌版不套避免位置怪）
  const renderFigure = (withOffset: boolean) =>
    article.image ? (
      <figure style={{ width: "100%", maxWidth: IMAGE_MAX_WIDTH, ...(withOffset ? move(IMAGE.x, IMAGE.y) : {}) }}>
        <img
          src={article.image}
          alt={article.imageCaption ?? article.title}
          className="w-full h-auto rounded-2xl border border-white/10 object-cover"
        />
        {article.imageCaption && (
          <figcaption
            className="leading-relaxed"
            style={{ fontFamily: zhFont, fontWeight: 500, fontSize: CAPTION.size, letterSpacing: "0.04em", color: "#FFFFFF", opacity: 0.55, marginTop: CAPTION.gap, ...(withOffset ? move(CAPTION.x, CAPTION.y) : {}) }}
          >
            {article.imageCaption}
          </figcaption>
        )}
      </figure>
    ) : null;

  // 左半（可捲動）內文：回上頁 → 標題 → 作者/日期 →（手機才內嵌的插圖）→ 內文
  const textContent = (
    <>
      {/* 回上頁（白色膠囊，hover 箭頭往左滑）*/}
      <Reveal>
        <button
          onClick={goBack}
          className="group inline-flex items-center gap-2 rounded-full bg-white text-black hover:bg-white/90 transition-colors px-5 py-2"
          style={{ fontFamily: zhFont, fontWeight: 700, fontSize: BACK.size, letterSpacing: "0.12em", marginBottom: BACK.gap, ...move(BACK.x, BACK.y) }}
        >
          <ArrowLeft size={16} strokeWidth={2.4} className="group-hover:-translate-x-1 transition-transform duration-200" /> 回上頁
        </button>
      </Reveal>

      {/* 標題 */}
      <Reveal delay={70}>
        <h1
          className="text-white leading-tight"
          style={{ fontFamily: zhDisplay, fontWeight: 900, fontSize: TITLE.size, letterSpacing: "0.02em", marginBottom: TITLE.gap, ...move(TITLE.x, TITLE.y) }}
        >
          {article.title}
        </h1>
      </Reveal>

      {/* 作者掛名 + 日期 */}
      <Reveal delay={90}>
        <div
          className="flex items-center gap-4 text-white/55"
          style={{ fontFamily: zhFont, fontWeight: 500, fontSize: BYLINE.size, letterSpacing: "0.06em", marginBottom: BYLINE.gap, ...move(BYLINE.x, BYLINE.y) }}
        >
          {article.author && <span>文／{article.author}</span>}
          {article.author && <span className="w-px h-3.5 bg-white/20" />}
          <span style={{ fontFamily: monoFont }}>{article.date}</span>
        </div>
      </Reveal>

      {/* 手機才顯示的插圖（桌機改用右半 fixed 版本，這裡用 lg:hidden 藏起來）*/}
      {hasImage && (
        <Reveal delay={100} className="lg:hidden">
          <div style={{ marginBottom: BODY.paraGap + 8 }}>{renderFigure(false)}</div>
        </Reveal>
      )}

      {/* 內文 */}
      <Reveal delay={110}>
        <div style={{ maxWidth: BODY.width, ...move(BODY.x, BODY.y) }}>
          {article.paragraphs.map((para, i) => (
            <p
              key={i}
              className="text-white/80"
              style={{ fontFamily: zhFont, fontWeight: 500, fontSize: BODY.size, letterSpacing: "0.04em", lineHeight: BODY.lineHeight, marginBottom: i === lastPara ? 0 : BODY.paraGap }}
            >
              {para}
            </p>
          ))}
        </div>
      </Reveal>
    </>
  );

  return (
    <section ref={sectionRef} className="relative bg-black min-h-screen">
      {/* 背景浮水印（很淡，鋪滿整頁）*/}
      <img
        src={watermark}
        alt=""
        aria-hidden
        className="pointer-events-none select-none absolute inset-0 w-full h-full object-cover"
        style={{ opacity: WATERMARK_OPACITY }}
      />
      {/* 上下加一層深色漸層遮罩，讓內容更聚焦、浮水印不搶戲 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.55) 100%)" }}
      />

      {hasImage ? (
        <>
          {/* 左右兩半寬度（桌機才分半）：左半＝TEXT_HALF、右半＝剩下的。用 scoped CSS 才能吃 TEXT_HALF 常數。 */}
          <style>{`
            @media (min-width: 1024px) {
              .na-left  { width: ${TEXT_HALF}; }
              .na-right { width: calc(100% - ${TEXT_HALF}); }
            }
          `}</style>

          {/* ══ 右半：桌機用 fixed 把插圖釘在右半螢幕（不受左半捲動影響）══
              用 fixed 而非 sticky，因為 App 根層 overflow-x-hidden 會讓 sticky 失效（比照歷任會長）。
              z-10：Header(z-50) 疊在插圖上方；捲到底時 Footer(z-30) 會蓋過它。 */}
          <div
            className="na-right hidden lg:flex fixed top-0 right-0 h-screen z-10 items-center justify-center px-10 xl:px-14"
            style={{ transform: `translateY(${endShift}px)` }}
          >
            {renderFigure(true)}
          </div>

          {/* ══ 左半：可捲動內文（限制在左半寬度，右半留給上面的 fixed 插圖）══ */}
          <div
            className="na-left relative z-10 w-full lg:min-h-screen"
            style={{ paddingLeft: LAYOUT.padX, paddingRight: LAYOUT.padX, paddingTop: LAYOUT.padTop, paddingBottom: LAYOUT.padBottom }}
          >
            <div style={{ maxWidth: BODY_COL }}>{textContent}</div>
          </div>
        </>
      ) : (
        // 沒有插圖：純文字單欄置中
        <div
          className="relative z-10 mx-auto"
          style={{ maxWidth: LAYOUT.maxWidth, paddingLeft: LAYOUT.padX, paddingRight: LAYOUT.padX, paddingTop: LAYOUT.padTop, paddingBottom: LAYOUT.padBottom }}
        >
          {textContent}
        </div>
      )}
    </section>
  );
}