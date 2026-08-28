import { useEffect, type CSSProperties } from "react";
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
const IMAGE_MAX_WIDTH = "1000px"; // 右側大圖最大寬度（想更大／更小改這裡）

// ★ 有圖片的文章（桌機左文右圖）：內文欄用「固定寬度」，插圖獨立 → 改插圖不會動到內文。
//   ★★ 想「只調大插圖、內文不動」→ 只改上方 IMAGE_MAX_WIDTH（放大插圖）；BODY_COL 別動，內文就固定。
//      插圖能長多大＝受頁面寬度限制：若插圖已頂到頁面邊還想更大，就把 LAYOUT.maxWidth 調大
//      （頁面變寬、給插圖更多空間，內文一樣不動）。想讓內文本身變寬則改 BODY_COL。
const BODY_COL = "600px";  // 左：內文欄「固定」寬度（改插圖不會動到它）

// 版面（整體）
const LAYOUT = {
  maxWidth: "1400px",                   // 內容最大寬度（也決定插圖最多能長多大；內文固定不受影響）
  padX: "clamp(20px, 5vw, 56px)",       // 左右內距（頁面兩側留白）
  padTop: "clamp(96px, 12vh, 130px)",   // 頂部留白（清掉固定 Header 的高度）
  padBottom: "clamp(64px, 10vh, 112px)",// 底部留白
  textImageGap: "80px",                 // 桌機「左文」與「右圖」之間的距離
};

// 各元素：大小 + 左右(x) + 上下(y) + 下方間距(gap)
const BACK    = { size: "0.9rem",  x: -45, y: 15, gap: 32 }; // 回上頁按鈕
const TITLE   = { size: "clamp(1.9rem, 4.2vw, 3.2rem)", x: -40, y: 15, gap: 16 }; // 標題
const BYLINE  = { size: "0.92rem", x: -35, y: 15, gap: 40 }; // 作者掛名 + 日期
const BODY    = { size: "clamp(0.95rem, 1.05vw, 1.05rem)", lineHeight: 2.1, x: -35, y: 15, paraGap: 24, width: "60em" }; // 內文（width＝一行最寬到多少才換行；越大一行字越多。em≈幾個字寬，也可用 "760px"／"90%"）
const IMAGE   = { x: 30, y: -35 };                           // 右側插圖（大圖）位移；寬度用上方 IMAGE_MAX_WIDTH
const CAPTION = { size: "0.82rem", x: 0, y: 15, gap: 15 }; // 圖說（與圖片的距離＝gap）

// 位移小工具：把 x/y 轉成 transform（0/0 時不輸出，避免影響 sticky 等行為）
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

  // 進頁面時捲到最上面。
  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
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

  return (
    <section className="relative bg-black min-h-screen overflow-hidden">
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

      <div
        className="relative mx-auto"
        style={{ maxWidth: LAYOUT.maxWidth, paddingLeft: LAYOUT.padX, paddingRight: LAYOUT.padX, paddingTop: LAYOUT.padTop, paddingBottom: LAYOUT.padBottom }}
      >
        {/* 回上頁（白色膠囊，比照部門頁）*/}
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

        {/* 內文 + 插圖：有圖＝左文右圖（手機上下堆疊、圖在上）；沒圖＝純文字單欄。
            桌機兩欄＝「內文固定 BODY_COL」＋「插圖彈性 minmax(0, IMAGE_MAX_WIDTH)」：
            內文欄鎖死不動，插圖在剩餘空間內長到 IMAGE_MAX_WIDTH（空間不夠時只縮插圖、內文照舊）。 */}
        {hasImage && (
          <style>{`
            .news-grid { display: grid; grid-template-columns: 1fr; gap: ${LAYOUT.textImageGap}; align-items: start; }
            @media (min-width: 1024px) { .news-grid { grid-template-columns: ${BODY_COL} minmax(0, ${IMAGE_MAX_WIDTH}); } }
          `}</style>
        )}
        <div className={hasImage ? "news-grid" : ""}>
          {/* 內文 */}
          <Reveal delay={110} className={hasImage ? "order-2 lg:order-1 min-w-0" : ""}>
            {/* 內文最大寬度＝BODY.width（上限）：純文字文章靠這個控制一行字數。
                ※ 有圖的文章（左文右圖）：內文寬度＝上方 BODY_COL（固定），BODY.width 只是額外上限。 */}
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

          {/* 插圖（大圖）+ 圖說（沒填 image 就整塊不顯示）*/}
          {hasImage && (
            <Reveal delay={130} className="order-1 lg:order-2 w-full lg:w-auto">
              <figure className="lg:sticky lg:top-28 mx-auto lg:mx-0" style={{ width: "100%", maxWidth: IMAGE_MAX_WIDTH, ...move(IMAGE.x, IMAGE.y) }}>
                <img
                  src={article.image}
                  alt={article.imageCaption ?? article.title}
                  className="w-full h-auto rounded-2xl border border-white/10 object-cover"
                />
                {article.imageCaption && (
                  <figcaption
                    className="text-white/45 leading-relaxed"
                    style={{ fontFamily: zhFont, fontWeight: 500, fontSize: CAPTION.size, letterSpacing: "0.04em", color: "#FFFFFF", marginTop: CAPTION.gap, ...move(CAPTION.x, CAPTION.y) }}
                  >
                    {article.imageCaption}
                  </figcaption>
                )}
              </figure>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}