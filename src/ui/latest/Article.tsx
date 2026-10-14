import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft } from "lucide-react";
import { Reveal, useIsDesktop } from "../general/shared";
import { getAnnouncement } from "./news.ts";
import { defineText, useI18n } from "../i18n";
// 背景浮水印圖：先沿用現有的建築圖（很淡）。想換成臺大校徽等，改這行 import 即可。
import watermark from "@/imports/LatestUpdates/newsbackground.png";

// 畫面文字（中英兩份）。公告內容本身的英文寫在 news.ts 的 titleEn / paragraphsEn…
// byline：作者掛名的前綴，{author} 會換成作者名
// zhOnly：英文版時，若這篇公告還沒有英文內文，會在內文上方顯示這句提示
const TEXT = defineText({
  zh: { back: "回上頁", notFound: "找不到這篇公告。", byline: "文／{author}", zhOnly: "" },
  en: { back: "Back", notFound: "We couldn't find this announcement.", byline: "By {author}", zhOnly: "This announcement is currently available in Chinese only." },
});

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
const IMAGE_MAX_WIDTH = 1000;   // 插圖最大寬度（px）。圖片會自動縮到「右半放得下」的大小，這只是上限。

// ★ 右半插圖的「可用區域」（桌機）：圖片＋圖說會自動縮放，塞進這個區域內，永遠不會超出畫面。
//   top    ：上方保留空間（px），要大於 Header 高度，圖片才不會被 Header 蓋住。
//   bottom ：下方保留空間（px）。
//   想讓圖片整體往下一點 → 調大 top；想讓圖片更大 → 調小 top / bottom。
const IMAGE_AREA = { top: 120, bottom: 48 };

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
const BODY    = { size: "clamp(0.95rem, 1.05vw, 1.05rem)", lineHeight: 2.1, lineHeightEn: 1.8, x: -15, y: 15, paraGap: 24, width: "60em" }; // 內文（width＝一行最寬到多少才換行；lineHeightEn＝英文行距）
// 右半插圖微調位移。★上下位置建議改上面的 IMAGE_AREA；這裡的 y 是「硬推」，推太多一樣會超出畫面。
const IMAGE   = { x: 0, y: 0 };
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
export default function Article({ slug }: { slug: string }) {
  const { pick, localize, track, isEn } = useI18n();
  const tx = pick(TEXT);
  const raw = getAnnouncement(slug);
  const article = raw ? localize(raw) : undefined;
  // 手機／平板：各元素的 X/Y 微調是照電腦版畫面調的，小螢幕一律不套用（避免按鈕被推出畫面）。
  const isDesktop = useIsDesktop();
  const mv = (x: number, y: number) => (isDesktop ? move(x, y) : {});

  // 右半固定插圖的「快到頁尾時往上帶」位移：平常 0（照舊釘在畫面中央），
  // 當本頁區塊底部升進畫面（＝ Footer 開始探進來）時，用同樣的量把插圖往上推，
  // 讓它停在頁尾之上、不被 Footer 蓋住（連續位移、不會跳）。
  const sectionRef = useRef<HTMLElement>(null);
  const [endShift, setEndShift] = useState(0);

  // ── 右半插圖自動縮放 ──
  // 量「右半可用區域」與「圖說高度」，算出圖片最大能多大：
  //   寬度不超過右半、高度不超過（可用高度 − 圖說），並維持圖片原本比例（不裁切、不變形）。
  // 圖說永遠緊貼圖片下方，而且寬度跟圖片一樣寬。
  const rightBoxRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLElement>(null);
  const desktopImgRef = useRef<HTMLImageElement>(null);
  const [ratio, setRatio] = useState<number | null>(null); // 圖片寬高比（寬 ÷ 高）
  const [figSize, setFigSize] = useState<{ w: number; h: number } | null>(null);

  // 進頁面時捲到最上面；換文章時重設插圖尺寸。
  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
    setRatio(null);
    setFigSize(null);
  }, [slug]);

  // 讀圖片原始比例（圖片可能已在快取裡、onLoad 早就觸發過，所以這裡也檢查一次）。
  const readRatio = (img: HTMLImageElement | null) => {
    if (!img || !img.complete) return;
    const { naturalWidth: nw, naturalHeight: nh } = img;
    if (nw > 0 && nh > 0) setRatio(nw / nh);
  };
  useEffect(() => {
    readRatio(desktopImgRef.current);
  }, [slug]);

  // 依右半區域大小與圖說高度計算插圖尺寸；視窗縮放、圖說換行（例如切換語言）時自動重算。
  useEffect(() => {
    const box = rightBoxRef.current;
    if (!box || !ratio || typeof ResizeObserver === "undefined") return;

    const fit = () => {
      const cs = getComputedStyle(box);
      const availW = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const availH = box.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      if (availW <= 0 || availH <= 0) return; // 手機版右半是隱藏的，不用算
      const capH = captionRef.current ? captionRef.current.offsetHeight + CAPTION.gap : 0;
      const maxW = Math.min(availW, IMAGE_MAX_WIDTH);
      const maxH = Math.max(120, availH - capH);
      let w = maxW;
      let h = w / ratio;
      if (h > maxH) {
        h = maxH;
        w = h * ratio;
      }
      setFigSize((prev) => (prev && Math.abs(prev.w - w) < 0.5 && Math.abs(prev.h - h) < 0.5 ? prev : { w, h }));
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    if (captionRef.current) ro.observe(captionRef.current);
    return () => ro.disconnect();
  }, [ratio, slug, isEn]);

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
  }, [slug, isEn]);

  // 找不到這篇（slug 打錯或資料已刪）→ 顯示提示 + 回上頁。
  if (!article || !raw) {
    return (
      <section className="relative bg-black min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-white/70" style={{ fontFamily: zhFont, fontSize: "1.1rem" }}>{tx.notFound}</p>
        <button onClick={goBack} className="group inline-flex items-center gap-2 rounded-full bg-white text-black px-5 py-2 hover:bg-white/90 transition-colors" style={{ fontFamily: zhFont, fontWeight: 700, letterSpacing: track("0.12em") }}>
          <ArrowLeft size={16} strokeWidth={2.4} className="group-hover:-translate-x-1 transition-transform duration-200" /> {tx.back}
        </button>
      </section>
    );
  }

  const hasImage = Boolean(article.image);
  const lastPara = article.paragraphs.length - 1;
  // 英文版但這篇沒有英文內文 → 顯示提示（內文先用中文）
  const showZhOnlyNotice = isEn && !raw.paragraphsEn?.length && tx.zhOnly;

  const captionStyle: CSSProperties = {
    fontFamily: zhFont,
    fontWeight: 500,
    fontSize: CAPTION.size,
    letterSpacing: track("0.04em", "0.005em"),
    color: "#FFFFFF",
    opacity: 0.55,
    marginTop: CAPTION.gap,
  };

  // ── 桌機版插圖（右半 fixed）：尺寸由上面的自動縮放算出來 ──
  const desktopFigure = article.image ? (
    <figure
      style={{
        width: figSize ? figSize.w : "100%",
        maxWidth: IMAGE_MAX_WIDTH,
        ...move(IMAGE.x, IMAGE.y),
      }}
    >
      <img
        ref={desktopImgRef}
        src={article.image}
        alt={article.imageCaption ?? article.title}
        onLoad={(e) => readRatio(e.currentTarget)}
        className="block rounded-2xl border border-white/10"
        style={
          figSize
            ? { width: figSize.w, height: figSize.h }
            : // 還沒算好之前（或圖片讀不到比例時）的保底：寬度填滿、高度不超過畫面
              { width: "100%", height: "auto", maxHeight: `calc(100vh - ${IMAGE_AREA.top + IMAGE_AREA.bottom + 80}px)`, objectFit: "contain" }
        }
      />
      {article.imageCaption && (
        <figcaption ref={captionRef} className="leading-relaxed" style={{ ...captionStyle, ...move(CAPTION.x, CAPTION.y) }}>
          {article.imageCaption}
        </figcaption>
      )}
    </figure>
  ) : null;

  // ── 手機／平板直式版插圖（內嵌在標題下方）：寬度填滿，但高度最多 75% 螢幕，直式海報也不會長到捲不完 ──
  const mobileFigure = article.image ? (
    <figure className="w-full">
      <img
        src={article.image}
        alt={article.imageCaption ?? article.title}
        className="block w-auto h-auto max-w-full max-h-[75vh] mx-auto rounded-2xl border border-white/10"
      />
      {article.imageCaption && (
        <figcaption className="leading-relaxed" style={captionStyle}>
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
          style={{ fontFamily: zhFont, fontWeight: 700, fontSize: BACK.size, letterSpacing: track("0.12em"), marginBottom: BACK.gap, ...mv(BACK.x, BACK.y) }}
        >
          <ArrowLeft size={16} strokeWidth={2.4} className="group-hover:-translate-x-1 transition-transform duration-200" /> {tx.back}
        </button>
      </Reveal>

      {/* 標題 */}
      <Reveal delay={70}>
        <h1
          className="text-white leading-tight"
          style={{ fontFamily: zhDisplay, fontWeight: 900, fontSize: TITLE.size, letterSpacing: track("0.02em", "0"), marginBottom: TITLE.gap, ...mv(TITLE.x, TITLE.y) }}
        >
          {article.title}
        </h1>
      </Reveal>

      {/* 作者掛名 + 日期 */}
      <Reveal delay={90}>
        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/55"
          style={{ fontFamily: zhFont, fontWeight: 500, fontSize: BYLINE.size, letterSpacing: track("0.06em"), marginBottom: BYLINE.gap, ...mv(BYLINE.x, BYLINE.y) }}
        >
          {article.author && <span>{tx.byline.replace("{author}", article.author)}</span>}
          {article.author && <span className="w-px h-3.5 bg-white/20" />}
          <span style={{ fontFamily: monoFont }}>{article.date}</span>
        </div>
      </Reveal>

      {/* 手機才顯示的插圖（桌機改用右半 fixed 版本，這裡用 lg:hidden 藏起來）*/}
      {hasImage && (
        <Reveal delay={100} className="lg:hidden">
          <div style={{ marginBottom: BODY.paraGap + 8 }}>{mobileFigure}</div>
        </Reveal>
      )}

      {/* 英文版但沒有英文內文時的提示 */}
      {showZhOnlyNotice && (
        <Reveal delay={105}>
          <p className="mb-6 inline-block rounded-full border border-white/20 px-4 py-1.5 text-white/60" style={{ fontFamily: zhFont, fontSize: "0.85rem", ...mv(BODY.x, BODY.y) }}>
            {tx.zhOnly}
          </p>
        </Reveal>
      )}

      {/* 內文 */}
      <Reveal delay={110}>
        <div style={{ maxWidth: BODY.width, ...mv(BODY.x, BODY.y) }}>
          {article.paragraphs.map((para, i) => (
            <p
              key={i}
              className="text-white/80"
              style={{ fontFamily: zhFont, fontWeight: 500, fontSize: BODY.size, letterSpacing: track("0.04em", "0.005em"), lineHeight: isEn ? BODY.lineHeightEn : BODY.lineHeight, marginBottom: i === lastPara ? 0 : BODY.paraGap }}
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
              上下留 IMAGE_AREA 的空間，圖片＋圖說會自動縮放塞進中間，不會被 Header 蓋住、也不會超出畫面。
              z-10：Header(z-50) 疊在插圖上方；捲到底時 Footer(z-30) 會蓋過它。 */}
          <div
            ref={rightBoxRef}
            className="na-right hidden lg:flex fixed top-0 right-0 h-screen z-10 items-center justify-center px-10 xl:px-14"
            style={{ paddingTop: IMAGE_AREA.top, paddingBottom: IMAGE_AREA.bottom, transform: `translateY(${endShift}px)` }}
          >
            {desktopFigure}
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