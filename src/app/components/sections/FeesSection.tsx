import { useEffect, useRef, useState } from "react";
import { Reveal } from "./shared";

// ─────────────────────────────────────────────────────────────────────────
// 會費專區（獨立分頁 · 路由 #/fees）
// 重度 Apple 風：Hero 視差 → 好處 sticky 釘住捲動切換 → 費用數字 count-up
// → 三步驟繳費 → 常見問題 → 底部 CTA。
// 全部自我包含，只依賴 ./shared 的 Reveal（淡入上移），不需外部動畫套件。
//
// ★ 之後要改的地方都集中在檔案上方常數：
//   PAY_FORM_URL：繳費表單網址（目前為佔位 "#"）。
//   FEE_INFO：金額 / 對象 / 期限（目前為佔位範例）。
//   BENEFITS / STEPS / FAQ：文案內容。
// ─────────────────────────────────────────────────────────────────────────

// 繳費表單連結（佔位）。拿到 Google 表單 / 繳費系統網址後，換掉這一個字串即可，
// 頁面上所有「立即繳費」按鈕都會一起更新。
const PAY_FORM_URL = "#";

// 會費資訊（佔位範例）。改成真實數字即可。
const FEE_INFO = {
  amount: 300, // 數字會 count-up；改這裡的數字
  amountUnit: "／ 學年",
  target: "全系同學（含大學部與研究所）",
  deadline: "每年 10 月 31 日前",
};

// 加入的好處（sticky 捲動切換的主秀）。可自由增減；每多一項，捲動距離會自動變長。
const BENEFITS = [
  {
    en: "EVENTS",
    title: "活動免費・會員優惠",
    desc: "迎新宿營、系烤、系遊、耶誕舞會⋯⋯系學會舉辦的大小活動，會員享免費或優惠價入場。",
  },
  {
    en: "MERCH",
    title: "系服・系外套補助",
    desc: "會員購買系服、系外套與各式週邊，享有專屬補助價，把圖資穿在身上。",
  },
  {
    en: "RESOURCES",
    title: "器材・空間優先借用",
    desc: "系學會的攝影器材、桌遊、活動道具與公共空間，會員可優先借用。",
  },
  {
    en: "VOICE",
    title: "權益發聲的管道",
    desc: "你對系上與課程的想法，透過系學會被完整傳達給系辦與學校，讓改變真的發生。",
  },
  {
    en: "BELONGING",
    title: "一整年的夥伴與回憶",
    desc: "最超值的其實不是折扣，而是一整年的活動、並肩的夥伴，還有屬於圖資人的歸屬感。",
  },
];

// 三步驟繳費流程（佔位文案）。
const STEPS = [
  { n: "01", title: "填寫繳費表單", desc: "點擊「立即繳費」，填入姓名、學號與聯絡方式。" },
  { n: "02", title: "完成繳款", desc: "依表單指示完成轉帳或現場繳費，保留交易紀錄。" },
  { n: "03", title: "收到會員確認", desc: "我們核對後，將回覆確認訊息，你就正式成為會員！" },
];

// 常見問題（佔位文案）。
const FAQ = [
  {
    q: "沒有繳會費也能參加活動嗎？",
    a: "大部分活動仍可參加，但多為原價；部分限定活動（如會員回饋、抽獎）僅開放給會員。",
  },
  {
    q: "繳一次可以用多久？",
    a: "會費以「學年」為單位，繳一次即涵蓋當學年度所有會員權益。",
  },
  {
    q: "繳完之後要去哪裡確認？",
    a: "表單送出並完成繳款後，系學會核對無誤會主動回覆確認訊息，你也可以私訊社群詢問。",
  },
  {
    q: "可以退費嗎？",
    a: "原則上會費用於支持全年度活動運作，恕不退費；若有特殊情況歡迎與我們聯繫。",
  },
];

// 品牌漸層（紅→青），與全站一致。
const BRAND_GRADIENT = "linear-gradient(to right, #D14B4B, #2F9EBD)";
const zhHead = "'Chiron Hei HK Text','Noto Sans TC', sans-serif";
const zhBody = "'Noto Sans TC', sans-serif";
const mono = "'Ubuntu Sans Mono', monospace";

// ── 捲動進度 Hook ──────────────────────────────────────────────────────
// 回傳 target 元素「穿過視窗」的進度 0→1：
//   0 = 元素頂端剛對齊視窗頂端；1 = 元素底端剛對齊視窗底端。
// 用來驅動 sticky 釘住段落的切換。
function useScrollProgress<T extends HTMLElement>(ref: React.RefObject<T | null>) {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const calc = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      const prog = total > 0 ? scrolled / total : 0;
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
  }, [ref]);
  return p;
}

// ── 捲出進度 Hook ──────────────────────────────────────────────────────
// 適用「剛好一屏」的 Hero：回傳 0→1，表示元素往上捲出視窗的比例
//   0 = 元素頂端貼齊視窗頂端；1 = 元素已上移整整一個視窗高。
// （useScrollProgress 需要元素比視窗高，對一屏 Hero 會恆為 0，故另用此公式。）
function useExitProgress<T extends HTMLElement>(ref: React.RefObject<T | null>) {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const calc = () => {
      const el = ref.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      const prog = Math.min(1, Math.max(0, -top / window.innerHeight));
      setP(prog);
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
  }, [ref]);
  return p;
}

// ── 數字 count-up Hook ─────────────────────────────────────────────────
// 元素進入視窗時，數字從 0 跑到 target。
function useCountUp(target: number, duration = 1400) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const t0 = performance.now();
            const tick = (now: number) => {
              const t = Math.min(1, (now - t0) / duration);
              // easeOutCubic
              const eased = 1 - Math.pow(1 - t, 3);
              setVal(Math.round(eased * target));
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);
  return { ref, val };
}

// 旋轉描邊的主要 CTA 按鈕（沿用全站樣式）。
function GlowButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="relative inline-flex items-center justify-center px-8 py-3.5 rounded-full overflow-hidden hover:opacity-90 transition-all duration-200"
      style={{ fontFamily: zhBody, fontWeight: 900, fontSize: "1rem", letterSpacing: "0.2em", color: "white", background: "#000" }}
    >
      <span
        className="absolute inset-0 rounded-full"
        style={{ padding: "1.5px", border: "1.5px solid transparent", background: "linear-gradient(#000, #000) padding-box, linear-gradient(90deg, #D14B4B 0%, #2F9EBD 100%) border-box" }}
      />
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background: "conic-gradient(from 0deg, #D14B4B 0deg, #2F9EBD 180deg, #D14B4B 360deg)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          animation: "buttonRotate 8s linear infinite",
          opacity: 0.95,
        }}
      />
      <span className="relative z-10">{children}</span>
    </a>
  );
}

// ── 好處：sticky 釘住捲動切換 ───────────────────────────────────────────
function BenefitsScene() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const p = useScrollProgress(sceneRef);
  const n = BENEFITS.length;
  // 讓首/尾各留一點緩衝，切換落在中間 80% 的捲動範圍。
  const raw = (p - 0.08) / 0.84;
  const clamped = Math.min(0.9999, Math.max(0, raw));
  const active = Math.min(n - 1, Math.floor(clamped * n));

  return (
    <div ref={sceneRef} className="relative" style={{ height: `${n * 90}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        {/* 背景隨進度緩緩位移的光暈 */}
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-full blur-[120px] opacity-40"
          style={{
            width: "60vw",
            height: "60vw",
            background: BRAND_GRADIENT,
            top: "50%",
            left: `${20 + active * 12}%`,
            transform: "translate(-50%,-50%)",
            transition: "left 700ms cubic-bezier(0.22,1,0.36,1)",
          }}
        />
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-10 grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] gap-10 md:gap-16 items-center">
          {/* 左：固定標題 + 進度圓點 */}
          <div>
            <p className="mb-4 tracking-[0.4em]" style={{ fontFamily: mono, fontSize: "0.8rem", background: BRAND_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              WHY&nbsp;&nbsp;JOIN
            </p>
            <h2 className="text-white leading-tight mb-8" style={{ fontFamily: zhHead, fontWeight: 900, fontSize: "clamp(1.9rem, 3.6vw, 3.4rem)" }}>
              加入的<br />五個理由
            </h2>
            <div className="flex md:flex-col gap-3">
              {BENEFITS.map((b, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span
                    className="block rounded-full transition-all duration-500"
                    style={{
                      width: i === active ? "28px" : "10px",
                      height: "10px",
                      background: i === active ? BRAND_GRADIENT : "rgba(255,255,255,0.22)",
                    }}
                  />
                  <span
                    className="hidden md:block transition-colors duration-500"
                    style={{ fontFamily: mono, fontSize: "0.7rem", letterSpacing: "0.2em", color: i === active ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.3)" }}
                  >
                    {b.en}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 右：切換的卡片（全部疊放，用 opacity/位移切換） */}
          <div className="relative h-[320px] md:h-[380px]">
            {BENEFITS.map((b, i) => {
              const isActive = i === active;
              return (
                <div
                  key={i}
                  className="absolute inset-0 rounded-[22px] p-8 md:p-12 flex flex-col justify-center border border-white/10"
                  style={{
                    background: "linear-gradient(150deg, rgba(47,158,189,0.18), rgba(209,75,75,0.16))",
                    backdropFilter: "blur(6px)",
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? "translateY(0) scale(1)" : "translateY(40px) scale(0.97)",
                    transition: "opacity 600ms ease, transform 600ms cubic-bezier(0.22,1,0.36,1)",
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                >
                  <p className="mb-5" style={{ fontFamily: mono, fontSize: "clamp(2.4rem,5vw,4rem)", lineHeight: 1, background: BRAND_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="text-white mb-4" style={{ fontFamily: zhHead, fontWeight: 900, fontSize: "clamp(1.5rem,2.8vw,2.4rem)" }}>
                    {b.title}
                  </h3>
                  <p className="text-white/70 leading-loose" style={{ fontFamily: zhBody, fontWeight: 500, fontSize: "clamp(0.9rem,1.4vw,1.05rem)" }}>
                    {b.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── FAQ 手風琴 ─────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 py-6 text-left group"
      >
        <span className="text-white/90 group-hover:text-white transition-colors" style={{ fontFamily: zhBody, fontWeight: 700, fontSize: "clamp(1rem,1.6vw,1.2rem)" }}>
          {q}
        </span>
        <span
          className="shrink-0 text-white/50 transition-transform duration-300"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)", fontSize: "1.6rem", lineHeight: 1 }}
        >
          +
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-400 ease-out"
        style={{ maxHeight: open ? "220px" : "0px", opacity: open ? 1 : 0 }}
      >
        <p className="pb-6 text-white/60 leading-loose" style={{ fontFamily: zhBody, fontWeight: 500, fontSize: "clamp(0.88rem,1.3vw,1rem)" }}>
          {a}
        </p>
      </div>
    </div>
  );
}

export default function FeesSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroP = useExitProgress(heroRef);
  const amount = useCountUp(FEE_INFO.amount);

  return (
    <div className="bg-black">
      <style>{`
        @keyframes buttonRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes feeFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
      `}</style>

      {/* ── A. Hero（視差） ─────────────────────────────────────────── */}
      <div ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
        {/* 視差光暈：隨捲動緩緩上移、縮放 */}
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-full blur-[130px]"
          style={{
            width: "70vw",
            height: "70vw",
            background: BRAND_GRADIENT,
            opacity: 0.35,
            top: "42%",
            left: "50%",
            transform: `translate(-50%,-50%) translateY(${heroP * -120}px) scale(${1 + heroP * 0.3})`,
          }}
        />
        <div className="relative z-10 text-center max-w-4xl" style={{ transform: `translateY(${heroP * -60}px)`, opacity: 1 - heroP * 0.8 }}>
          <p className="mb-6 tracking-[0.5em]" style={{ fontFamily: mono, fontSize: "clamp(0.8rem,1.4vw,1rem)", background: BRAND_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            MEMBERSHIP
          </p>
          <h1 className="text-white leading-tight mb-8" style={{ fontFamily: zhHead, fontWeight: 900, fontSize: "clamp(2.2rem,6vw,5rem)" }}>
            一份會費，<br />
            換一整年的{" "}
            <span style={{ background: BRAND_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>圖資生活</span>
          </h1>
          <p className="text-white/60 leading-loose mb-12 max-w-2xl mx-auto" style={{ fontFamily: zhBody, fontWeight: 500, fontSize: "clamp(0.9rem,1.6vw,1.1rem)" }}>
            繳交系學會費，支持全年度的活動與服務，也讓你享有專屬於會員的優惠與權益。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <GlowButton href={PAY_FORM_URL}>立 即 繳 費</GlowButton>
            <a href="#fee-benefits" className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border border-white/40 text-white hover:bg-white/5 transition-all duration-200" style={{ fontFamily: zhBody, fontWeight: 500, fontSize: "1rem", letterSpacing: "0.12em" }}>
              了 解 好 處
            </a>
          </div>
        </div>
        {/* 捲動提示 */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2" style={{ animation: "feeFloat 2.4s ease-in-out infinite" }}>
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <span className="w-1 h-2 rounded-full bg-white/50" />
          </div>
        </div>
      </div>

      {/* ── B. 好處（sticky 主秀） ──────────────────────────────────── */}
      <div id="fee-benefits">
        <BenefitsScene />
      </div>

      {/* ── C. 費用說明 ────────────────────────────────────────────── */}
      <section className="py-28 md:py-36 px-6">
        <div className="max-w-[1100px] mx-auto">
          <Reveal>
            <p className="mb-4 tracking-[0.4em] text-center" style={{ fontFamily: mono, fontSize: "0.8rem", background: BRAND_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              THE&nbsp;&nbsp;DETAILS
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="text-white text-center mb-16" style={{ fontFamily: zhHead, fontWeight: 900, fontSize: "clamp(1.9rem,4vw,3.4rem)" }}>
              費 用 說 明
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {/* 金額（count-up） */}
            <Reveal>
              <div className="rounded-[22px] p-8 md:p-10 border border-white/10 h-full flex flex-col items-center justify-center text-center" style={{ background: "linear-gradient(160deg, rgba(47,158,189,0.16), rgba(209,75,75,0.14))" }}>
                <p className="text-white/50 mb-3" style={{ fontFamily: mono, fontSize: "0.75rem", letterSpacing: "0.3em" }}>AMOUNT</p>
                <p className="text-white" style={{ fontFamily: zhHead, fontWeight: 900, lineHeight: 1 }}>
                  <span style={{ fontSize: "clamp(1rem,2vw,1.4rem)", verticalAlign: "super" }}>NT$</span>
                  <span ref={amount.ref} style={{ fontSize: "clamp(3rem,7vw,5rem)" }}>{amount.val}</span>
                </p>
                <p className="text-white/60 mt-3" style={{ fontFamily: zhBody, fontWeight: 500, fontSize: "0.95rem" }}>{FEE_INFO.amountUnit}</p>
              </div>
            </Reveal>
            {/* 對象 */}
            <Reveal delay={100}>
              <div className="rounded-[22px] p-8 md:p-10 border border-white/10 h-full flex flex-col items-center justify-center text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="text-white/50 mb-4" style={{ fontFamily: mono, fontSize: "0.75rem", letterSpacing: "0.3em" }}>WHO</p>
                <p className="text-white/90 leading-relaxed" style={{ fontFamily: zhBody, fontWeight: 700, fontSize: "clamp(1.05rem,1.8vw,1.35rem)" }}>{FEE_INFO.target}</p>
              </div>
            </Reveal>
            {/* 期限 */}
            <Reveal delay={200}>
              <div className="rounded-[22px] p-8 md:p-10 border border-white/10 h-full flex flex-col items-center justify-center text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="text-white/50 mb-4" style={{ fontFamily: mono, fontSize: "0.75rem", letterSpacing: "0.3em" }}>WHEN</p>
                <p className="text-white/90 leading-relaxed" style={{ fontFamily: zhBody, fontWeight: 700, fontSize: "clamp(1.05rem,1.8vw,1.35rem)" }}>{FEE_INFO.deadline}</p>
              </div>
            </Reveal>
          </div>
          <Reveal delay={120}>
            <p className="text-center text-white/35 mt-8" style={{ fontFamily: zhBody, fontSize: "0.8rem" }}>
              ＊ 以上金額與期限為範例，實際依系學會公告為準。
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── D. 三步驟繳費 ──────────────────────────────────────────── */}
      <section className="py-28 md:py-36 px-6 border-t border-white/5">
        <div className="max-w-[1100px] mx-auto">
          <Reveal>
            <h2 className="text-white text-center mb-16" style={{ fontFamily: zhHead, fontWeight: 900, fontSize: "clamp(1.9rem,4vw,3.4rem)" }}>
              三 步 驟 完 成 繳 費
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6 md:gap-4">
            {STEPS.map((s, i) => (
              <Reveal key={i} delay={i * 120}>
                <div className="relative rounded-[22px] p-8 md:p-10 border border-white/10 h-full" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <p className="mb-5" style={{ fontFamily: mono, fontSize: "clamp(2rem,4vw,3rem)", lineHeight: 1, background: BRAND_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    {s.n}
                  </p>
                  <h3 className="text-white mb-3" style={{ fontFamily: zhBody, fontWeight: 900, fontSize: "clamp(1.1rem,1.9vw,1.4rem)" }}>{s.title}</h3>
                  <p className="text-white/60 leading-loose" style={{ fontFamily: zhBody, fontWeight: 500, fontSize: "clamp(0.88rem,1.3vw,1rem)" }}>{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={120}>
            <div className="flex justify-center mt-14">
              <GlowButton href={PAY_FORM_URL}>立 即 繳 費</GlowButton>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── E. 常見問題 ────────────────────────────────────────────── */}
      <section className="py-28 md:py-36 px-6 border-t border-white/5">
        <div className="max-w-[820px] mx-auto">
          <Reveal>
            <h2 className="text-white text-center mb-14" style={{ fontFamily: zhHead, fontWeight: 900, fontSize: "clamp(1.9rem,4vw,3.4rem)" }}>
              常 見 問 題
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <div>
              {FAQ.map((f, i) => (
                <FaqItem key={i} q={f.q} a={f.a} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── F. 底部 CTA ────────────────────────────────────────────── */}
      <section className="relative py-32 md:py-44 px-6 overflow-hidden border-t border-white/5">
        <div aria-hidden className="pointer-events-none absolute rounded-full blur-[130px] opacity-30" style={{ width: "60vw", height: "60vw", background: BRAND_GRADIENT, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <Reveal>
            <h2 className="text-white leading-tight mb-8" style={{ fontFamily: zhHead, fontWeight: 900, fontSize: "clamp(2rem,5vw,4rem)" }}>
              準備好加入了嗎？
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-white/60 leading-loose mb-12" style={{ fontFamily: zhBody, fontWeight: 500, fontSize: "clamp(0.9rem,1.6vw,1.1rem)" }}>
              花一分鐘完成繳費，接下來一整年的圖資生活，我們陪你一起。
            </p>
          </Reveal>
          <Reveal delay={180}>
            <GlowButton href={PAY_FORM_URL}>立 即 繳 費</GlowButton>
          </Reveal>
        </div>
      </section>

      {/* ── G. 對外交叉入口：導向贊助頁（#/sponsor） ────────────────── */}
      {/* 語氣對象是企業／好心人，非系上同學；刻意用低調樣式，不與上方主 CTA 競爭。 */}
      <section className="py-16 md:py-20 px-6 border-t border-white/10">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <p className="mb-2 tracking-[0.35em]" style={{ fontFamily: mono, fontSize: "0.72rem", background: BRAND_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              FOR&nbsp;&nbsp;PARTNERS
            </p>
            <p className="text-white/85" style={{ fontFamily: zhBody, fontWeight: 700, fontSize: "clamp(1.05rem,2vw,1.5rem)" }}>
              你是企業或好心人，想支持圖資嗎？
            </p>
            <p className="text-white/45 mt-1" style={{ fontFamily: zhBody, fontWeight: 500, fontSize: "clamp(0.82rem,1.3vw,0.95rem)" }}>
              看看能怎麼跟我們合作，一起投資下一代資訊人才。
            </p>
          </div>
          <a
            href="#/sponsor"
            className="shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/40 text-white hover:bg-white/5 transition-all duration-200"
            style={{ fontFamily: zhBody, fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.12em" }}
          >
            了 解 贊 助
            <span aria-hidden style={{ fontSize: "1.1em", lineHeight: 1 }}>→</span>
          </a>
        </div>
      </section>
    </div>
  );
}
