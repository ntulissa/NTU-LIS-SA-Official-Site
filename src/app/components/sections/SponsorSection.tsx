import { useEffect, useRef, useState } from "react";
import { Reveal } from "./shared";

// ─────────────────────────────────────────────────────────────────────────
// 贊助頁（獨立分頁 · 路由 #/sponsor）
// 對外招募贊助：Hero 視差 → 成效數字 sticky 隨捲動 count-up → 為什麼贊助我們
// → 合作 / 露出管道（先不分級）→ 未來夥伴牆 → 聯絡 CTA。
// 自我包含，只依賴 ./shared 的 Reveal。
//
// ★ 之後要改的地方集中在上方常數：
//   CONTACT：聯絡 email（佔位）。
//   IMPACT / REASONS / CHANNELS：文案與數字（目前為佔位範例）。
// ─────────────────────────────────────────────────────────────────────────

// 聯絡資訊（佔位）。換成真實 email 即可。
const CONTACT = {
  email: "lissa.ntu@gmail.com",
  contactHref: "#/contact",
};

// 成效數字（佔位範例）。label 為說明，suffix 例如 "+"。
const IMPACT = [
  { value: 250, suffix: "+", label: "系上學生", en: "STUDENTS" },
  { value: 30, suffix: "+", label: "年度活動場次", en: "EVENTS / YR" },
  { value: 3000, suffix: "+", label: "社群每月觸及", en: "REACH / MO" },
  { value: 30, suffix: "+", label: "屆傳承", en: "YEARS" },
];

// 為什麼贊助我們（對外賣點）。
const REASONS = [
  {
    en: "TALENT",
    title: "精準觸及未來人才",
    desc: "直接接觸臺大圖書資訊學系學生——資訊、圖書館與資料領域的明日專業人才。",
  },
  {
    en: "VISIBILITY",
    title: "多管道品牌曝光",
    desc: "官網、活動主視覺、系服與社群貼文，讓你的品牌被全系與更廣的校園社群看見。",
  },
  {
    en: "CSR",
    title: "展現企業社會責任",
    desc: "支持學生自治與校園活動，是對教育與青年培育最直接、也最真誠的長期投入。",
  },
  {
    en: "RECRUIT",
    title: "招募與合作管道",
    desc: "實習與徵才資訊優先傳達給對口科系學生，為你建立長期的人才連結。",
  },
];

// 合作 / 露出管道（不分級，彈性列點）。
const CHANNELS = [
  { title: "官網品牌露出", desc: "在系學會官方網站呈現贊助夥伴，長期可見。" },
  { title: "活動主視覺與看板", desc: "於各式活動的海報、看板與現場物料露出。" },
  { title: "系服・系外套印製", desc: "品牌隨會員穿在身上，走進校園每個角落。" },
  { title: "社群貼文標記", desc: "在活動貼文與限動中標記與感謝贊助夥伴。" },
  { title: "講座・攤位機會", desc: "可安排企業講座、體驗攤位或說明會。" },
  { title: "客製化合作", desc: "我們樂於一起討論最適合你的合作形式。" },
];

const BRAND_GRADIENT = "linear-gradient(to right, #D14B4B, #2F9EBD)";
const zhHead = "'Chiron Hei HK Text','Noto Sans TC', sans-serif";
const zhBody = "'Noto Sans TC', sans-serif";
const mono = "'Ubuntu Sans Mono', monospace";

// 捲動進度 Hook（同 FeesSection，自我包含）。
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

// 捲出進度 Hook（適用一屏 Hero；同 FeesSection）。
function useExitProgress<T extends HTMLElement>(ref: React.RefObject<T | null>) {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const calc = () => {
      const el = ref.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      setP(Math.min(1, Math.max(0, -top / window.innerHeight)));
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

const easeOutCubic = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

// 旋轉描邊 CTA（沿用全站樣式）。
function GlowButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="relative inline-flex items-center justify-center px-8 py-3.5 rounded-full overflow-hidden hover:opacity-90 transition-all duration-200"
      style={{ fontFamily: zhBody, fontWeight: 900, fontSize: "1rem", letterSpacing: "0.2em", color: "white", background: "#000" }}
    >
      <span className="absolute inset-0 rounded-full" style={{ padding: "1.5px", border: "1.5px solid transparent", background: "linear-gradient(#000, #000) padding-box, linear-gradient(90deg, #D14B4B 0%, #2F9EBD 100%) border-box" }} />
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

// ── 成效數字：sticky 釘住，數字隨捲動依序 count-up ──────────────────────
function ImpactScene() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const p = useScrollProgress(sceneRef);
  const n = IMPACT.length;
  // 中間 80% 範圍用來跑數字，首尾留緩衝。
  const clamped = Math.min(1, Math.max(0, (p - 0.1) / 0.8));

  return (
    <div ref={sceneRef} className="relative" style={{ height: `${Math.max(2.6, n * 0.7) * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col items-center justify-center px-6">
        <div aria-hidden className="pointer-events-none absolute rounded-full blur-[130px] opacity-30" style={{ width: "60vw", height: "60vw", background: BRAND_GRADIENT, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
        <div className="relative z-10 text-center mb-14 md:mb-20">
          <p className="mb-4 tracking-[0.4em]" style={{ fontFamily: mono, fontSize: "0.8rem", background: BRAND_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            OUR&nbsp;&nbsp;IMPACT
          </p>
          <h2 className="text-white" style={{ fontFamily: zhHead, fontWeight: 900, fontSize: "clamp(1.9rem,4.2vw,3.6rem)" }}>
            你的支持，會走得很遠
          </h2>
        </div>
        <div className="relative z-10 w-full max-w-[1200px] grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
          {IMPACT.map((s, i) => {
            // 每個數字錯開起跑，形成「依序點亮」的節奏。
            const segStart = (i / n) * 0.7;
            const local = easeOutCubic((clamped - segStart) / 0.35);
            const shown = Math.round(s.value * local);
            const lit = local > 0.02;
            return (
              <div
                key={i}
                className="text-center transition-all duration-500"
                style={{ opacity: lit ? 1 : 0.25, transform: lit ? "translateY(0)" : "translateY(16px)" }}
              >
                <p className="text-white" style={{ fontFamily: zhHead, fontWeight: 900, fontSize: "clamp(2.4rem,6vw,4.5rem)", lineHeight: 1 }}>
                  <span style={{ background: BRAND_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    {shown.toLocaleString()}
                  </span>
                  <span className="text-white/80" style={{ fontSize: "0.5em" }}>{s.suffix}</span>
                </p>
                <p className="text-white/70 mt-3" style={{ fontFamily: zhBody, fontWeight: 700, fontSize: "clamp(0.85rem,1.4vw,1.05rem)" }}>{s.label}</p>
                <p className="text-white/30 mt-1" style={{ fontFamily: mono, fontSize: "0.65rem", letterSpacing: "0.2em" }}>{s.en}</p>
              </div>
            );
          })}
        </div>
        <p className="relative z-10 text-white/30 mt-14" style={{ fontFamily: zhBody, fontSize: "0.8rem" }}>
          ＊ 數字為範例，實際依系學會統計為準。
        </p>
      </div>
    </div>
  );
}

export default function SponsorSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroP = useExitProgress(heroRef);

  return (
    <div className="bg-black">
      <style>{`
        @keyframes buttonRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
      `}</style>

      {/* ── A. Hero（視差 · 對外語氣） ─────────────────────────────── */}
      <div ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-full blur-[130px]"
          style={{ width: "72vw", height: "72vw", background: BRAND_GRADIENT, opacity: 0.32, top: "44%", left: "50%", transform: `translate(-50%,-50%) translateY(${heroP * -120}px) scale(${1 + heroP * 0.3})` }}
        />
        <div className="relative z-10 text-center max-w-4xl" style={{ transform: `translateY(${heroP * -60}px)`, opacity: 1 - heroP * 0.8 }}>
          <p className="mb-6 tracking-[0.5em]" style={{ fontFamily: mono, fontSize: "clamp(0.8rem,1.4vw,1rem)", background: BRAND_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            SPONSORSHIP
          </p>
          <h1 className="text-white leading-tight mb-8" style={{ fontFamily: zhHead, fontWeight: 900, fontSize: "clamp(2.1rem,5.6vw,4.8rem)" }}>
            與圖資系學會，<br />
            一起{" "}
            <span style={{ background: BRAND_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>投資下一代</span>{" "}資訊人才
          </h1>
          <p className="text-white/60 leading-loose mb-4 max-w-2xl mx-auto" style={{ fontFamily: zhBody, fontWeight: 500, fontSize: "clamp(0.9rem,1.6vw,1.1rem)" }}>
            你的支持，將化為一整年的活動、服務與成長機會，也讓你的品牌走進未來專業人才的日常。
          </p>
          <p className="text-white/35 mb-12" style={{ fontFamily: mono, fontSize: "clamp(0.7rem,1.2vw,0.85rem)", letterSpacing: "0.15em" }}>
            Partner with NTU LIS Student Association
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <GlowButton href={CONTACT.contactHref}>成 為 贊 助 夥 伴</GlowButton>
            <a href="#sponsor-why" className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border border-white/40 text-white hover:bg-white/5 transition-all duration-200" style={{ fontFamily: zhBody, fontWeight: 500, fontSize: "1rem", letterSpacing: "0.12em" }}>
              了 解 更 多
            </a>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2" style={{ animation: "spFloat 2.4s ease-in-out infinite" }}>
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <span className="w-1 h-2 rounded-full bg-white/50" />
          </div>
        </div>
      </div>

      {/* ── B. 成效數字（sticky count-up） ─────────────────────────── */}
      <ImpactScene />

      {/* ── C. 為什麼贊助我們 ──────────────────────────────────────── */}
      <section id="sponsor-why" className="py-28 md:py-36 px-6 border-t border-white/5">
        <div className="max-w-[1200px] mx-auto">
          <Reveal>
            <p className="mb-4 tracking-[0.4em] text-center" style={{ fontFamily: mono, fontSize: "0.8rem", background: BRAND_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              WHY&nbsp;&nbsp;SPONSOR&nbsp;&nbsp;US
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="text-white text-center mb-16" style={{ fontFamily: zhHead, fontWeight: 900, fontSize: "clamp(1.9rem,4vw,3.4rem)" }}>
              為 什 麼 贊 助 我 們
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-6">
            {REASONS.map((r, i) => (
              <Reveal key={i} delay={(i % 2) * 100}>
                <div className="rounded-[22px] p-8 md:p-10 border border-white/10 h-full" style={{ background: "linear-gradient(150deg, rgba(47,158,189,0.14), rgba(209,75,75,0.12))" }}>
                  <p className="mb-4 tracking-[0.25em]" style={{ fontFamily: mono, fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>{r.en}</p>
                  <h3 className="text-white mb-4" style={{ fontFamily: zhHead, fontWeight: 900, fontSize: "clamp(1.3rem,2.4vw,2rem)" }}>{r.title}</h3>
                  <p className="text-white/70 leading-loose" style={{ fontFamily: zhBody, fontWeight: 500, fontSize: "clamp(0.9rem,1.4vw,1.05rem)" }}>{r.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── D. 合作 / 露出管道（不分級） ───────────────────────────── */}
      <section className="py-28 md:py-36 px-6 border-t border-white/5">
        <div className="max-w-[1200px] mx-auto">
          <Reveal>
            <h2 className="text-white text-center mb-5" style={{ fontFamily: zhHead, fontWeight: 900, fontSize: "clamp(1.9rem,4vw,3.4rem)" }}>
              我 們 能 一 起 做 什 麼
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="text-center text-white/55 leading-loose mb-16 max-w-2xl mx-auto" style={{ fontFamily: zhBody, fontWeight: 500, fontSize: "clamp(0.9rem,1.5vw,1.05rem)" }}>
              我們沒有制式的方案框架——以下是常見的合作形式，最終會依你的需求，一起討論最合適的組合。
            </p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CHANNELS.map((c, i) => (
              <Reveal key={i} delay={(i % 3) * 90}>
                <div className="group rounded-[18px] p-7 md:p-8 border border-white/10 h-full hover:border-white/25 transition-colors duration-300" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="block rounded-full" style={{ width: "10px", height: "10px", background: BRAND_GRADIENT }} />
                    <h3 className="text-white" style={{ fontFamily: zhBody, fontWeight: 900, fontSize: "clamp(1.05rem,1.7vw,1.25rem)" }}>{c.title}</h3>
                  </div>
                  <p className="text-white/60 leading-loose" style={{ fontFamily: zhBody, fontWeight: 500, fontSize: "clamp(0.85rem,1.3vw,0.98rem)" }}>{c.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── E. 未來夥伴牆（佔位） ──────────────────────────────────── */}
      <section className="py-28 md:py-36 px-6 border-t border-white/5">
        <div className="max-w-[1100px] mx-auto">
          <Reveal>
            <h2 className="text-white text-center mb-4" style={{ fontFamily: zhHead, fontWeight: 900, fontSize: "clamp(1.7rem,3.4vw,2.8rem)" }}>
              期 待 與 你 並 肩
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="text-center text-white/45 mb-14" style={{ fontFamily: zhBody, fontWeight: 500, fontSize: "clamp(0.85rem,1.4vw,1rem)" }}>
              這裡會留給每一位支持我們的夥伴——下一個，會不會是你？
            </p>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Reveal key={i} delay={(i % 4) * 70}>
                <div className="aspect-[3/2] rounded-[16px] border border-dashed border-white/15 flex items-center justify-center hover:border-white/30 transition-colors duration-300" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <span className="text-white/25" style={{ fontFamily: mono, fontSize: "0.75rem", letterSpacing: "0.2em" }}>YOUR LOGO</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── F. 聯絡 CTA ────────────────────────────────────────────── */}
      <section className="relative py-32 md:py-44 px-6 overflow-hidden border-t border-white/5">
        <div aria-hidden className="pointer-events-none absolute rounded-full blur-[130px] opacity-30" style={{ width: "60vw", height: "60vw", background: BRAND_GRADIENT, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <Reveal>
            <h2 className="text-white leading-tight mb-8" style={{ fontFamily: zhHead, fontWeight: 900, fontSize: "clamp(2rem,5vw,4rem)" }}>
              聊 聊 合 作 的 可 能
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-white/60 leading-loose mb-10" style={{ fontFamily: zhBody, fontWeight: 500, fontSize: "clamp(0.9rem,1.6vw,1.1rem)" }}>
              無論是企業、店家或個人，只要你願意支持圖資，我們都很想認識你。
            </p>
          </Reveal>
          <Reveal delay={160}>
            <a href={`mailto:${CONTACT.email}`} className="inline-block mb-10 text-white/80 hover:text-white transition-colors" style={{ fontFamily: mono, fontSize: "clamp(0.95rem,1.8vw,1.3rem)", letterSpacing: "0.1em", borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: "4px" }}>
              {CONTACT.email}
            </a>
          </Reveal>
          <Reveal delay={220}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GlowButton href={CONTACT.contactHref}>聯 絡 我 們</GlowButton>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
