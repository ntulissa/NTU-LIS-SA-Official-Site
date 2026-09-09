import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

// 圖片：全部放在 @/imports/Fee/ 資料夾（路徑已先寫好，之後把圖檔放進去即可）
import benefit1 from "@/imports/Fee/benefit1.png";
import benefit2 from "@/imports/Fee/benefit2.svg";
import benefit3 from "@/imports/Fee/benefit3.png";
import benefit4 from "@/imports/Fee/benefit4.jpg";
import benefit5 from "@/imports/Fee/benefit5.jpg";
import lockerImg from "@/imports/Fee/locker.png";
import logoSvg from "@/imports/Fee/NTULISSAlogo.svg";
import feelissaSvg from "@/imports/Fee/feelissa.svg";

// ─────────────────────────────────────────────────────────────────────────
// 系學費專區（路由 #/fees）· Apple 風垂直捲動長頁
//   A. Hero          → 大標 + 草寫「fee lissa.」手寫動畫 + 繳費按鈕
//   B. 五大福利       → 五張白色字卡，可右滑，底下膠囊數字（1st / 2 / 3…）
//   C. 價格           → 紅藍排列的「800」背景 + $800 / 一學年
//   D. 系櫃租借       → locker 圖 + 大字，Switch 切換有／無繳費方案
//   E. 綠色 CTA       → 驟變綠底、大標、繳費按鈕、系學會 logo
//
// ★ 要改文案／數字都集中在檔案上方常數區。
// ─────────────────────────────────────────────────────────────────────────

// 繳費表單連結（Google 表單）。所有「繳費」按鈕共用這一個字串。
const PAY_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfmwqzlNfrtShLDTGdOBX2NuIT-NDs3Z49nJHVlLnPXcYlJ6g/viewform";

// 品牌紅藍（紅 #D14B4B、藍 #2F9EBD）
const RED = "#D14B4B";
const BLUE = "#2F9EBD";
const GREEN = "#34A24E";

// 全站中文／數字字體：Chiron Hei HK（沿用 HeroSection）
const zhFont = "'Chiron Hei HK Text','Chiron Hei HK','Noto Sans TC',sans-serif";
// 草寫英文專用字體（背景裝飾用；如專案已有指定手寫字體可換掉）
const scriptFont = "'Dancing Script','Brush Script MT',cursive";

// ── 左上角小標題（麵包屑，只放在 Hero）─────────────────────────────────────
// 字體格式沿用 TeamSection：Ubuntu Sans Mono + 白→灰漸層字，前面加「— 」。
// 想改文字改 EYEBROW_TEXT；想移動位置改 EYEBROW_X / EYEBROW_Y（px；正 X=右、正 Y=下）。
const EYEBROW_TEXT = "各種服務・系學會費";
const EYEBROW_X = 0; // 水平位移（px）：正 = 往右、負 = 往左
const EYEBROW_Y = 90; // 垂直位移（px）：正 = 往下、負 = 往上
function Eyebrow({
  text = EYEBROW_TEXT,
  className = "",
  style,
}: {
  text?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <p
      className={`tracking-widest pointer-events-none select-none ${className}`}
      style={{
        fontSize: "14px",
        fontFamily: "'Ubuntu Sans Mono', monospace",
        background: "linear-gradient(90deg, #FFF 0%, #595959 34.13%, #FFF 67.79%, #3A3A3A 100%)",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundSize: "220% 100%",
        transform: `translate(${EYEBROW_X}px, ${EYEBROW_Y}px)`,
        ...style,
      }}
    >
      — {text}
    </p>
  );
}

// ── 五大福利字卡（五張分開編輯）────────────────────────────────────────────
// 每張卡片一個物件，欄位都可手動調。三種版型（type）：
//   "center"   ：白底 + 中間大圖（可調圖片 XY / 高度）
//   "gradient" ：紅藍漸層填滿 + 圖片疊在上面（可調圖片透明度 imgOpacity）
//   "fill"     ：圖片填滿整張 + 黑色遮罩（可調遮罩透明度 overlayOpacity）
//
// 每張共通可調：
//   title/desc          左上標題、右下敘述的文字
//   titleColor/descColor 文字顏色
//   titleSize/descSize   文字大小（可用 clamp(...) 或 "40px"）
//   titleX/titleY        標題位置微調（px；正 X=右、正 Y=下）
//   descX/descY          敘述位置微調（px）
//   watermark            左下角草寫英文
//   watermarkColor       草寫顏色（每張可不同）
//   watermarkOpacity     草寫透明度（0～1）
// 版型專屬：
//   imgX/imgY/imgHeight  中間大圖的位置與高度（center / gradient 用）
//   imgOpacity           圖片透明度（gradient 用）
//   overlayOpacity       黑色遮罩透明度（fill 用）
type Benefit = {
  type: "center" | "gradient" | "fill";
  img: string;
  title: string;
  titleColor: string;
  titleSize: string;
  titleX: number;
  titleY: number;
  desc: string;
  descColor: string;
  descSize: string;
  descX: number;
  descY: number;
  watermark: string;
  watermarkColor: string;
  watermarkOpacity: number;
  imgX?: number;
  imgY?: number;
  imgHeight?: string;
  imgOpacity?: number;
  overlayOpacity?: number;
};

const CARD_TITLE_SIZE = "clamp(55px, 3.2vw, 180px)"; // 標題預設字級
const CARD_DESC_SIZE = "clamp(20px, 2.5vw, 30px)"; // 敘述預設字級

const BENEFITS: Benefit[] = [
  // ① 系櫃免費租借 —— 白底置中大圖
  {
    type: "center",
    img: benefit1,
    title: "系櫃免費租借。",
    titleColor: "#000000",
    titleSize: CARD_TITLE_SIZE,
    titleX: -30,
    titleY: -15,
    desc: "免租金，僅收押金 $200 元，讓你的雙肩輕鬆無負擔！",
    descColor: "#000000",
    descSize: CARD_DESC_SIZE,
    descX: 30,
    descY: 35,
    watermark: "free rent.",
    watermarkColor: "#000000",
    watermarkOpacity: 0.1,
    imgX: 0,
    imgY: 0,
    imgHeight: "clamp(240px, 44vh, 460px)",
  },
  // ② 迎新免費入場 —— 白底置中大圖
  {
    type: "center",
    img: benefit2,
    title: "迎新免費參加。",
    titleColor: "#000000",
    titleSize: CARD_TITLE_SIZE,
    titleX: -30,
    titleY: -15,
    desc: "圖資系內迎新直接免費參加，一起玩團康、吃披薩！",
    descColor: "#000000",
    descSize: CARD_DESC_SIZE,
    descX: 30,
    descY: 35,
    watermark: "free ori.",
    watermarkColor: "#000000",
    watermarkOpacity: 0.1,
    imgX: 0,
    imgY: 35,
    imgHeight: "clamp(300px, 44vh, 100px)",
  },
  // ③ 系服系外套補助 —— 紅藍漸層填滿 + 衣服圖 opacity
  {
    type: "gradient",
    img: benefit3,
    title: "系服訂購減免。",
    titleColor: "#FFFFFF",
    titleSize: CARD_TITLE_SIZE,
    titleX: -30,
    titleY: -15,
    desc: "用最划算的價格入手系服，展現圖資人的凝聚力。",
    descColor: "#FFFFFF",
    descSize: CARD_DESC_SIZE,
    descX: 30,
    descY: 35,
    watermark: "free merch.",
    watermarkColor: "#FFFFFF",
    watermarkOpacity: 0.5,
    imgX: 0,
    imgY: 0,
    imgHeight: "clamp(320px, 60vh, 560px)",
    imgOpacity: 0.35,
  },
  // ④ 器材優先借用 —— 圖片填滿 + 黑色遮罩
  {
    type: "fill",
    img: benefit4,
    title: "教科書專屬折扣。",
    titleColor: "#FFFFFF",
    titleSize: CARD_TITLE_SIZE,
    titleX: -30,
    titleY: -15,
    desc: "系學會學術部為大家談妥的專屬團購優惠價，買書省更多。",
    descColor: "#FFFFFF",
    descSize: CARD_DESC_SIZE,
    descX: 30,
    descY: 35,
    watermark: "free gear.",
    watermarkColor: "#FFFFFF",
    watermarkOpacity: 0.5,
    overlayOpacity: 0.45,
  },
  // ⑤ 圖片填滿 + 黑色遮罩
  {
    type: "fill",
    img: benefit5,
    title: "系上活動享折扣。",
    titleColor: "#FFFFFF",
    titleSize: CARD_TITLE_SIZE,
    titleX: -30,
    titleY: -15,
    desc: "系烤、舞會等各大精彩活動，皆享有專屬優惠價！",
    descColor: "#FFFFFF",
    descSize: CARD_DESC_SIZE,
    descX: 30,
    descY: 35,
    watermark: "free voice.",
    watermarkColor: "#FFFFFF",
    watermarkOpacity: 0.5,
    overlayOpacity: 0.45,
  },
];

// ── 系櫃租借：有／無繳費方案（下方敘述會隨 Switch 切換）─────────────────────
const LOCKER_PLANS = {
  paid: {
    label: "有繳費者",
    desc: "免租金（僅收押金 $200 元）",
  },
  unpaid: {
    label: "無繳費者",
    desc: "酌收租金 $400 元（另收押金 $200 元）", // ← 待編輯：填無繳費者實際方案
  },
};

// 序數：1→1st、2→2nd、3→3rd、4→4th、5→5th
function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ── 繳費按鈕（白底黑字膠囊 + 箭頭，格式參考 HeroSection）─────────────────────
function PayButton({ size = "md" }: { size?: "md" | "lg" }) {
  const lg = size === "lg";
  return (
    <a
      href={PAY_FORM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-3 bg-white text-black rounded-full hover:bg-white/90 transition-all duration-200 group w-fit ${
        lg ? "px-8 py-4" : "px-7 py-3"
      }`}
      style={{
        fontFamily: zhFont,
        fontWeight: 700,
        fontSize: lg ? "clamp(1rem,1.8vw,1.25rem)" : "clamp(0.9rem,1.5vw,1.1rem)",
        letterSpacing: "0.1em",
      }}
    >
      繳費
      <ArrowRight
        size={lg ? 22 : 18}
        className="group-hover:translate-x-1 transition-transform duration-200"
      />
    </a>
  );
}

// ── 單張福利卡片：依 type 渲染三種版型 ────────────────────────────────────
// 標題固定錨在「左上」、敘述錨在「右下」、草寫錨在「左下」；各自再用 X/Y 微調。
function BenefitCard({ b }: { b: Benefit }) {
  const isFill = b.type === "fill";
  const isGradient = b.type === "gradient";
  const showCenterImg = b.type === "center" || isGradient;

  return (
    <article
      data-card
      className="relative flex-none w-[86vw] max-w-[980px] rounded-[28px] overflow-hidden"
      style={{
        scrollSnapAlign: "center",
        minHeight: "min(70vh,620px)",
        background: isGradient
          ? `linear-gradient(105deg, ${RED} 0%, ${BLUE} 100%)`
          : isFill
          ? "#000"
          : "#fff",
      }}
    >
      {/* 版型：填滿大圖 + 黑色遮罩（fill） */}
      {isFill && (
        <>
          <img
            src={b.img}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 bg-black" style={{ opacity: b.overlayOpacity ?? 0.45 }} />
        </>
      )}

      {/* 版型：中間大圖（center / gradient；gradient 疊在漸層上、可調透明度） */}
      {showCenterImg && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            src={b.img}
            alt=""
            draggable={false}
            style={{
              height: b.imgHeight ?? "clamp(240px,44vh,460px)",
              width: "auto",
              maxWidth: "82%",
              objectFit: "contain",
              opacity: isGradient ? b.imgOpacity ?? 0.35 : 1,
              transform: `translate(${b.imgX ?? 0}px, ${b.imgY ?? 0}px)`,
            }}
          />
        </div>
      )}

      {/* 左上角：標題 */}
      <h3
        className="absolute whitespace-pre-line"
        style={{
          top: "clamp(28px,4vw,56px)",
          left: "clamp(28px,4vw,56px)",
          fontFamily: zhFont,
          fontWeight: 900,
          lineHeight: 1.1,
          color: b.titleColor,
          fontSize: b.titleSize,
          transform: `translate(${b.titleX}px, ${b.titleY}px)`,
        }}
      >
        {b.title}
      </h3>

      {/* 右下角：敘述（whiteSpace:nowrap → 放大字級也強制單行，不換行；字往左長） */}
      <p
        className="absolute text-right"
        style={{
          bottom: "clamp(28px,4vw,56px)",
          right: "clamp(28px,4vw,56px)",
          maxWidth: "none", // 不限寬，配合 nowrap 就不會換行
          whiteSpace: "nowrap", // ← 強制不換行；想恢復自動換行改成 "normal"
          fontFamily: zhFont,
          fontWeight: 700,
          lineHeight: 1.6,
          color: b.descColor,
          fontSize: b.descSize,
          transform: `translate(${b.descX}px, ${b.descY}px)`,
        }}
      >
        {b.desc}
      </p>
    </article>
  );
}

// ── B. 五大福利：橫向捲動字卡 ─────────────────────────────────────────────
function BenefitsScene() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // 拖曳捲動（滑鼠按住左右拉）
  const drag = useRef({ down: false, startX: 0, startLeft: 0, moved: false });

  const updateActive = () => {
    const el = scrollRef.current;
    if (!el) return;
    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-card]"));
    const center = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    cards.forEach((c, i) => {
      const cc = c.offsetLeft + c.offsetWidth / 2;
      const d = Math.abs(cc - center);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setActive(best);
  };

  const scrollToCard = (i: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>("[data-card]");
    const card = cards[i];
    if (!card) return;
    const left = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2;
    el.scrollTo({ left, behavior: "smooth" });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateActive);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    updateActive();
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    drag.current = { down: true, startX: e.clientX, startLeft: el.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const el = scrollRef.current;
    if (!el || !drag.current.down) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.startLeft - dx;
  };
  const endDrag = () => {
    drag.current.down = false;
  };

  return (
    <section className="relative min-h-screen bg-black py-16 md:py-20 overflow-hidden flex flex-col">
      {/* 頂列：標題 */}
      <div className="relative px-6 md:px-12 mb-8 md:mb-10">
        <h2
          className="text-white"
          style={{ fontFamily: zhFont, fontWeight: 900, fontSize: "clamp(1.5rem,3.4vw,2.6rem)" }}
        >
          五個無法拒絕的理由。
        </h2>
      </div>

      {/* 橫向捲動軌 */}
      <div
        ref={scrollRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        className="flex-1 flex items-stretch gap-6 md:gap-8 overflow-x-auto px-6 md:px-12 pb-4 select-none cursor-grab active:cursor-grabbing"
        style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none" }}
      >
        <style>{`section > div::-webkit-scrollbar{display:none}`}</style>
        {BENEFITS.map((b, i) => (
          <BenefitCard key={i} b={b} />
        ))}
        {/* 尾端留白，讓最後一張能置中 */}
        <div className="flex-none w-[6vw]" aria-hidden />
      </div>

      {/* 膠囊數字指示器 */}
      <div className="flex items-center justify-center gap-3 mt-8">
        {BENEFITS.map((_, i) => {
          const on = i === active;
          return (
            <button
              key={i}
              onClick={() => scrollToCard(i)}
              aria-label={`第 ${i + 1} 張`}
              className="flex items-center justify-center rounded-full border transition-all duration-300"
              style={{
                fontFamily: zhFont,
                fontWeight: 700,
                height: "40px",
                minWidth: "40px",
                padding: on ? "0 20px" : "0",
                borderColor: on ? "#fff" : "rgba(255,255,255,0.4)",
                color: on ? "#fff" : "rgba(255,255,255,0.5)",
                fontSize: on ? "1rem" : "0.95rem",
              }}
            >
              {on ? ordinal(i + 1) : i + 1}
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ── C. 價格：紅藍排列的「800」背景 ────────────────────────────────────────
function PriceScene() {
  const ROWS = 6;
  const COLS = 10;
  return (
    <section className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden px-6">
      {/* 背景「800」棋盤：紅藍交錯、低透明度 */}
      <div
        aria-hidden
        className="absolute inset-0 grid pointer-events-none select-none"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          opacity: 0.35,
        }}
      >
        {Array.from({ length: ROWS * COLS }).map((_, idx) => {
          const r = Math.floor(idx / COLS);
          const c = idx % COLS;
          const isBlue = (r + c) % 2 === 0;
          return (
            <span
              key={idx}
              className="flex items-center justify-center"
              style={{
                fontFamily: zhFont,
                fontWeight: 900,
                fontSize: "clamp(1.4rem,3.4vw,2.8rem)",
                color: isBlue ? BLUE : RED,
              }}
            >
              800
            </span>
          );
        })}
      </div>

      {/* 前景價格 */}
      <div className="relative z-10 text-center">
        <h2
          className="text-white"
          style={{ fontFamily: zhFont, fontWeight: 900, fontSize: "clamp(2.8rem,9vw,7rem)", lineHeight: 1.05 }}
        >
          $800 / 一學年
        </h2>
        <p
          className="text-white/85 mt-6"
          style={{ fontFamily: zhFont, fontWeight: 500, fontSize: "clamp(0.9rem,1.8vw,1.2rem)", letterSpacing: "0.08em" }}
        >
          登記時間：即日起 ～ 115 學期末
        </p>
      </div>
    </section>
  );
}

// ── 捲動進度 Hook ─────────────────────────────────────────────────────────
// 回傳進度 0→1，用元素頂端相對視窗的位置換算：
//   progress = 0 → 當 rect.top = startVh × 視窗高（元素剛從畫面下方進場）
//   progress = 1 → 當 rect.top = endVh × 視窗高（元素釘住後再往上一點）
// 這樣「還在往上升」時就開始拉大 letterSpacing，而不是等釘住才開始。
// 下滑變大、上滑變小，天生可逆。
function useScrollProgress<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  startVh: number,
  endVh: number
) {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const calc = () => {
      const el = ref.current;
      if (!el) return;
      const vh = window.innerHeight || 1;
      const top = el.getBoundingClientRect().top;
      const start = startVh * vh;
      const end = endVh * vh;
      const prog = (start - top) / (start - end);
      setP(Math.min(1, Math.max(0, prog)));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(calc);
    };
    calc();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [ref, startVh, endVh]);
  return p;
}

// ── D. 系櫃租借：字藏在圖片後面，隨捲動 letterSpacing 拉大 ─────────────────
// ┌─ 可手動調的參數都在這裡 ─────────────────────────────────────────────┐
// 「系櫃租借」四個字的位置（相對於櫃子圖片中心）：
const TITLE_X = 0; // 水平位移（px）：正 = 往右、負 = 往左
const TITLE_Y = 0; // 垂直位移（px）：正 = 往下、負 = 往上
//
// 下滑時會變動的字距（letterSpacing，單位 em，相對字級；越大四個字橫向展開越多）：
const LS_START = -0.05; // 起始字距：一開始擠在中間、藏在櫃子後
const LS_END = 1.2; // 結束字距：拉滿後往兩側大幅展開（想更誇張就再調大）
//
// 動畫的捲動時機（進度 0→1）：
const START_TOP_VH = 0.8; // 何時開始：元素頂端到「視窗底部」就開始（1＝很早；越小越晚）
const END_TOP_VH = -0.35; // 何時拉滿：釘住後再往上捲這麼多屏（負值，越負越晚拉滿）
const SCRUB_VH = 125; // 這一段總高（vh）：設成 100 + |END_TOP_VH|×100，字距一拉滿就結束、不留死區
// └──────────────────────────────────────────────────────────────────────┘

function LockerScene() {
  const [plan, setPlan] = useState<"paid" | "unpaid">("paid");
  const current = LOCKER_PLANS[plan];

  const trackRef = useRef<HTMLDivElement>(null);
  const p = useScrollProgress(trackRef, START_TOP_VH, END_TOP_VH);
  // easeOutCubic 讓展開更有加速度感
  const eased = 1 - Math.pow(1 - p, 3);
  const ls = LS_START + eased * (LS_END - LS_START); // 當前字距（em）

  return (
    <div ref={trackRef} className="relative bg-black" style={{ height: `${SCRUB_VH}vh` }}>
      {/* sticky 釘住：捲動這段時畫面固定，字距隨進度改變 */}
      <section className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden px-6">
        {/* 圖 + 大字疊放（字在後、圖在前） */}
        <div className="relative flex items-center justify-center w-full max-w-[1100px] mb-10">
          <h2
            className="absolute inset-0 z-0 flex items-center justify-center text-white text-center pointer-events-none whitespace-nowrap"
            style={{
              fontFamily: zhFont,
              fontWeight: 900,
              fontSize: "clamp(3rem,13vw,11rem)",
              lineHeight: 1,
              letterSpacing: `${ls}em`,
              // 位移 = 使用者的 XY 偏移 + 置中補償。
              // letter-spacing 會在最後一個字後面多加一格空白使字往左偏，往右補半格拉回正中。
              transform: `translate(calc(${TITLE_X}px + ${ls / 2}em), ${TITLE_Y}px)`,
              willChange: "letter-spacing, transform",
            }}
          >
            系櫃租借
          </h2>
          <img
            src={lockerImg}
            alt="系櫃"
            className="relative z-10 h-[46vh] max-h-[560px] w-auto object-contain"
            draggable={false}
          />
        </div>

      {/* Switch Toggle：有繳費者 / 無繳費者 */}
      <div
        className="relative z-20 flex items-center rounded-full border border-white/40 p-1 mb-6"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        {/* 滑動指示塊 */}
        <span
          aria-hidden
          className="absolute top-1 bottom-1 rounded-full bg-white transition-all duration-300"
          style={{
            width: "calc(50% - 4px)",
            left: plan === "paid" ? "4px" : "calc(50% + 0px)",
          }}
        />
        {(["paid", "unpaid"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setPlan(key)}
            className="relative z-10 rounded-full px-6 md:px-8 py-2.5 transition-colors duration-300"
            style={{
              fontFamily: zhFont,
              fontWeight: 700,
              fontSize: "clamp(0.9rem,1.6vw,1.1rem)",
              color: plan === key ? "#000" : "rgba(255,255,255,0.8)",
            }}
          >
            {LOCKER_PLANS[key].label}
          </button>
        ))}
      </div>

      {/* 隨切換變動的方案敘述 */}
      <p
        key={plan}
        className="relative z-20 text-white text-center"
        style={{
          fontFamily: zhFont,
          fontWeight: 700,
          fontSize: "clamp(1.05rem,2.2vw,1.5rem)",
          animation: "fadeSwap 400ms ease",
        }}
      >
        {current.desc}
      </p>
      </section>
    </div>
  );
}

// ── 背景「fee lissa.」：使用自製 SVG（imports/Fee/feelissa.svg），無動畫 ─────
// 位置：改 FEE_X / FEE_Y（px；正 X=右、正 Y=下）。
// 大小：改 FEE_WIDTH（可用 px 或 vw，如 "1400px" 或 "120vw"）。
// 明暗：改 FEE_OPACITY（0～1）。
const FEE_X = 0; // 水平位移（px）
const FEE_Y = 0; // 垂直位移（px）
const FEE_WIDTH = "min(1400px, 120vw)"; // 圖寬
const FEE_OPACITY = 0.25; // 透明度
function HandwrittenFee() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 z-0 flex items-center pointer-events-none select-none overflow-hidden"
    >
      <img
        src={feelissaSvg}
        alt=""
        style={{
          width: FEE_WIDTH,
          height: "auto",
          maxWidth: "none",
          opacity: FEE_OPACITY,
          transform: `translate(${FEE_X}px, ${FEE_Y}px)`,
        }}
        draggable={false}
      />
    </div>
  );
}

// ── E. 綠色 CTA：釘住滿版後，整個畫面由黑「漸染」成綠 ─────────────────────
// 關鍵：先 sticky 釘住讓綠色區塊鋪滿整個螢幕（此時上一段黑色已完全捲出畫面），
// 才在滿版狀態下把整片背景從黑染到綠 → 畫面上沒有別的東西，就不會有黑綠交界線。
// ┌─ 可手動調 ───────────────────────────────────────────────────────────┐
const GREEN_START_TOP_VH = 0.05; // 何時開始染綠：0＝剛好釘住（滿版、系櫃字已捲走）才開始
const GREEN_END_TOP_VH = -0.001; // 何時染滿：釘住後再往上捲這麼多屏（負值，越負越慢染滿）
const GREEN_SCRUB_VH = 100; // 這段總高（vh）：設成 100 + |GREEN_END_TOP_VH|×100，染滿就結束、下面不留長尾
// └──────────────────────────────────────────────────────────────────────┘

// ── 綠色頁各元素位置（相對各自置中位置的位移，px；正 X=右、正 Y=下）─────────
const CTA_TITLE_X = 0; // 「開通！」水平
const CTA_TITLE_Y = 40; // 「開通！」垂直
const CTA_DESC_X = 0; // 敘述文字 水平
const CTA_DESC_Y = 50; // 敘述文字 垂直
const CTA_BTN_X = 0; // 繳費按鈕 水平
const CTA_BTN_Y = 90; // 繳費按鈕 垂直
const CTA_LOGO_X = 0; // logo 水平
const CTA_LOGO_Y = 110; // logo 垂直

// 由黑 (#000000) 線性漸變到品牌綠 GREEN。t：0=黑、1=綠。
function blackToGreen(t: number) {
  const hex = GREEN.replace("#", "");
  const gr = parseInt(hex.slice(0, 2), 16);
  const gg = parseInt(hex.slice(2, 4), 16);
  const gb = parseInt(hex.slice(4, 6), 16);
  return `rgb(${Math.round(gr * t)}, ${Math.round(gg * t)}, ${Math.round(gb * t)})`;
}

function GreenCTA() {
  const trackRef = useRef<HTMLDivElement>(null);
  const p = useScrollProgress(trackRef, GREEN_START_TOP_VH, GREEN_END_TOP_VH);
  const eased = p * p * (3 - 2 * p); // smoothstep 讓染色更順
  const bg = blackToGreen(eased);

  return (
    <div ref={trackRef} className="relative" style={{ height: `${GREEN_SCRUB_VH}vh`, background: bg }}>
      {/* sticky 釘住滿版：整片背景在此染色 */}
      <section
        className="sticky top-0 h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden"
        style={{ background: bg }}
      >
        <h2
          className="text-white mb-8"
          style={{
            fontFamily: zhFont,
            fontWeight: 900,
            fontSize: "clamp(4rem,16vw,13rem)",
            lineHeight: 1,
            transform: `translate(${CTA_TITLE_X}px, ${CTA_TITLE_Y}px)`,
          }}
        >
          開通！
        </h2>
        <p
          className="text-white mb-12"
          style={{
            fontFamily: zhFont,
            fontWeight: 700,
            fontSize: "clamp(1.05rem,2.4vw,1.6rem)",
            letterSpacing: "0.04em",
            transform: `translate(${CTA_DESC_X}px, ${CTA_DESC_Y}px)`,
          }}
        >
          便利圖資生活，系學會讓你這樣「玩」！
        </p>
        <div style={{ transform: `translate(${CTA_BTN_X}px, ${CTA_BTN_Y}px)` }}>
          <PayButton size="lg" />
        </div>

        {/* 系學會 logo */}
        <img
          src={logoSvg}
          alt="臺大圖資系學會"
          className="mt-16 h-16 md:h-20 w-auto"
          style={{ transform: `translate(${CTA_LOGO_X}px, ${CTA_LOGO_Y}px)` }}
        />
      </section>
    </div>
  );
}

// ── 主元件 ────────────────────────────────────────────────────────────────
export default function FeesSection() {
  return (
    <div className="bg-black">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&display=swap');
        @keyframes fadeSwap { from{opacity:0; transform:translateY(6px)} to{opacity:1; transform:translateY(0)} }
      `}</style>

      {/* ── A. Hero ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen bg-black overflow-hidden">
        {/* 小標題（麵包屑） */}
        <div className="relative z-20 px-6 md:px-12 pt-6">
          <Eyebrow />
        </div>

        {/* 背景草寫「fee lissa.」：真・手寫描繪（一筆一筆畫出來）+ 筆尖 */}
        <HandwrittenFee />

        {/* Hero 內容 */}
        <div className="relative z-10 px-6 md:px-12 min-h-screen flex flex-col justify-center max-w-[1400px] mx-auto w-full">
          <h1
            className="text-white mb-8"
            style={{ fontFamily: zhFont, fontWeight: 900, fontSize: "clamp(2.4rem,6.5vw,5.5rem)", lineHeight: 1.15 }}
          >
            一年會費，
            <br />
            讓你可以這樣「玩」。
          </h1>
          <p
            className="text-white mb-2"
            style={{ fontFamily: zhFont, fontWeight: 500, fontSize: "clamp(1rem,2vw,1.5rem)", letterSpacing: "0.04em" }}
          >
            ＄800 解鎖一年五大福利
          </p>

          {/* 繳費按鈕（靠右下，格式參考 HeroSection） */}
          <div className="flex justify-end mt-8 md:mt-10">
            <PayButton size="lg" />
          </div>
        </div>

      </section>

      {/* ── B. 五大福利 ─────────────────────────────────────────────── */}
      <BenefitsScene />

      {/* ── C. 價格 ─────────────────────────────────────────────────── */}
      <PriceScene />

      {/* ── D. 系櫃租借 ─────────────────────────────────────────────── */}
      <LockerScene />

      {/* ── E. 綠色 CTA（黑→綠 隨捲動漸變） ─────────────────────────── */}
      <GreenCTA />
    </div>
  );
}