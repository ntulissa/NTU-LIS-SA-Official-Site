import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { ArrowRight } from "lucide-react";
import imgBuilding from "@/imports/HomePage-1/de7749452570d864c1f5c584765f093ab16a6d89.png";

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [num53Hover, setNum53Hover] = useState(false); // 滑鼠是否在「53」數字上
  const svg53Ref = useRef<SVGSVGElement>(null);
  const hit53Ref = useRef<{ ctx: CanvasRenderingContext2D; w: number; h: number } | null>(null);
  const num53HoverRef = useRef(false);

  // 字型載入完成或視窗尺寸改變時，讓命中用的 canvas 失效、下次重建
  // （確保 canvas 用的是 Josefin 而非 fallback，命中形狀才會跟畫面一致）
  useEffect(() => {
    const invalidate = () => { hit53Ref.current = null; };
    const anyDoc = document as unknown as { fonts?: { ready?: Promise<unknown> } };
    if (anyDoc.fonts?.ready) anyDoc.fonts.ready.then(invalidate);
    window.addEventListener("resize", invalidate);
    return () => window.removeEventListener("resize", invalidate);
  }, []);

  // 用隱藏 canvas 畫出「53」，以像素透明度判斷滑鼠是否落在「數字形狀」上（精準貼合字形，
  // 避開 SVG 文字只用方框感應、以及 clip-path 會讓元素收不到事件的問題）
  const isOver53 = (clientX: number, clientY: number) => {
    const svg = svg53Ref.current;
    if (!svg) return false;
    const rect = svg.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    let hit = hit53Ref.current;
    if (!hit || hit.w !== w || hit.h !== h) {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return false;
      const scale = h / 1000; // viewBox 高 1000 對應到 rect 高 h
      ctx.fillStyle = "#000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `400 ${1000 * scale}px 'Josefin Sans', sans-serif`;
      ctx.fillText("53", 600 * scale, 560 * scale); // 對應 SVG text 的 x=600 y=560
      hit = { ctx, w, h };
      hit53Ref.current = hit;
    }
    const x = Math.round(clientX - rect.left);
    const y = Math.round(clientY - rect.top);
    if (x < 0 || y < 0 || x >= w || y >= h) return false;
    return hit.ctx.getImageData(x, y, 1, 1).data[3] > 10;
  };

  const handleHeroMouseMove = (e: ReactMouseEvent) => {
    const over = isOver53(e.clientX, e.clientY);
    if (over !== num53HoverRef.current) {
      num53HoverRef.current = over;
      setNum53Hover(over);
    }
  };

  const handleHeroMouseLeave = () => {
    if (num53HoverRef.current) {
      num53HoverRef.current = false;
      setNum53Hover(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 打字機動畫：兩句輪流。打完一句停留約 7 秒 → 逐字刪掉 → 換下一句重打，
  // 整段循環大約每 10 秒重打一次。
  useEffect(() => {
    const PHRASES = ["→ LISSA, on LIVE.", "→ 真的可以這樣玩。"];
    const TYPE_SPEED = 90; // 打字速度（每字 ms）
    const DELETE_SPEED = 45; // 刪字速度（每字 ms）
    const HOLD_AFTER_TYPE = 7000; // 打完停留多久再重打（ms）← 調這個控制「大約十秒」
    const PAUSE_BEFORE_NEXT = 500; // 刪完到下一句開始的間隔（ms）

    let phraseIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let timer: number;

    const tick = () => {
      const full = PHRASES[phraseIdx];
      if (!deleting) {
        charIdx += 1;
        setDisplayText(full.slice(0, charIdx));
        if (charIdx >= full.length) {
          // 打完整句 → 停留後開始刪
          deleting = true;
          timer = window.setTimeout(tick, HOLD_AFTER_TYPE);
          return;
        }
        timer = window.setTimeout(tick, TYPE_SPEED);
      } else {
        charIdx -= 1;
        setDisplayText(full.slice(0, Math.max(0, charIdx)));
        if (charIdx <= 0) {
          // 刪完 → 換下一句
          deleting = false;
          phraseIdx = (phraseIdx + 1) % PHRASES.length;
          timer = window.setTimeout(tick, PAUSE_BEFORE_NEXT);
          return;
        }
        timer = window.setTimeout(tick, DELETE_SPEED);
      }
    };

    timer = window.setTimeout(tick, TYPE_SPEED);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section
      className="relative min-h-screen bg-black overflow-hidden flex flex-col justify-end pb-24 pt-24 sm:pt-28 sm:pb-32 md:pt-[100px] md:pb-40"
      onMouseMove={handleHeroMouseMove}
      onMouseLeave={handleHeroMouseLeave}
      style={{ cursor: num53Hover ? "pointer" : undefined }}
    >
      {/* 內容整塊往上：加大 pb（padding-bottom）把 justify-end 的內容往上推；
          想再往上就把 md:pb-40 調更大，想回原本改回 md:pb-20。 */}
      {/* 「系學會」紅藍漸層流動動畫（參考 Footer 的 footerFlow，速度放慢） */}
      {/* 想調流動速度：改 animation 的秒數（現在 12s，數字越大越慢）。 */}
      {/* 想調顏色：改 linear-gradient 裡的 #D14B4B / #2F9EBD。 */}
      <style>{`
        @keyframes heroFlow {
          0%   { background-position: 200% 50%; }
          100% { background-position: -200% 50%; }
        }
        .hero-flow-text {
          background: linear-gradient(90deg, #D14B4B 0%, #2F9EBD 25%, #D14B4B 50%, #2F9EBD 75%, #D14B4B 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          animation: heroFlow 12s linear infinite;
        }
        /* 「53」外框流動：平移一條寬的重複漸層矩形。想調速度改 dur（現在 4s）。 */
        @keyframes num53Flow {
          from { transform: translateX(0); }
          to   { transform: translateX(-600px); }
        }
        .num53-flow-rect {
          animation: num53Flow 4s linear infinite;
        }
      `}</style>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          style={{
            position: "absolute",
            width: "115vw",
            height: "162vw",
            left: "-2.3vw",
            top: "-57vw",
            transform: `translateY(${scrollY * 0.1}px)`,
            willChange: "transform",
          }}
        >
          <div className="absolute inset-0 overflow-hidden opacity-30">
            <img
              src={imgBuilding}
              alt=""
              className="absolute max-w-none"
              style={{ width: "280%", height: "140%", left: "-90%", top: "-20%", objectFit: "contain", objectPosition: "center" }}
            />
          </div>
        </div>
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* ── 背景大數字「53」 ─────────────────────────────────────────────
          黑色填滿（蓋住建築圖）+ 紅藍漸層外框（stroke 2px）。
          用 SVG 是因為 CSS text-stroke 不支援漸層；SVG stroke 可指向 linearGradient。
          位置：靠右、垂直置中（可改下方 right / height）。
          大小：height 用 clamp 讓它隨畫面縮放，最大 1000px（對應你的 font-size:1000px）。 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
        {/* 53 往下移：top:50% 置中後，再用 translateY 加 +67px 往下推，
            讓 53 頂端大約與「系學會」頂端切齊。想再往下就把 67px 調大，往上就調小。 */}
        <svg
          ref={svg53Ref}
          className="absolute"
          style={{ right: "-4%", top: "50%", transform: "translateY(calc(-50% + 67px))", height: "clamp(360px, 82vh, 1000px)", width: "auto" }}
          viewBox="0 0 1200 1000"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* 靜態漸層（平常沒 hover 時的外框顏色） */}
            <linearGradient id="stroke53Gradient" gradientUnits="userSpaceOnUse" x1="150" y1="120" x2="1050" y2="880">
              <stop offset="0" stopColor="#D14B4B" />
              <stop offset="1" stopColor="#2F9EBD" />
            </linearGradient>
            {/* 流動漸層：紅-藍-紅 重複（objectBoundingBox，隨矩形移動）。
                實際流動是靠 CSS 平移矩形（.num53-flow-rect）產生，Safari 也會動。 */}
            <linearGradient id="stroke53Flow" x1="0" y1="0" x2="0.2" y2="0" spreadMethod="repeat">
              <stop offset="0" stopColor="#D14B4B" />
              <stop offset="0.5" stopColor="#2F9EBD" />
              <stop offset="1" stopColor="#D14B4B" />
            </linearGradient>
            {/* Safari 安全做法：外框用 mask 讓漸層矩形只在字的邊框露出，
                而不是用「文字漸層 stroke」（Safari 不支援，會把整個字填滿變實心）。
                遮罩文字只用白色實色描邊，Safari 完全支援。
                想調外框粗細：改下面遮罩文字的 strokeWidth。 */}
            <mask id="mask53" maskUnits="userSpaceOnUse" x="0" y="0" width="1200" height="1000">
              <rect x="0" y="0" width="1200" height="1000" fill="black" />
              <text
                x="600"
                y="560"
                textAnchor="middle"
                dominantBaseline="central"
                fill="black"
                stroke="white"
                strokeWidth="4"
                style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 400, fontSize: "1000px" }}
              >
                53
              </text>
            </mask>
          </defs>

          {/* 1) 純黑字身：純視覺，蓋住建築圖。
                （hover 感應改用 section 上的 canvas 取樣，見上方 isOver53，能精準貼合字形） */}
          <text
            x="600"
            y="560"
            textAnchor="middle"
            dominantBaseline="central"
            fill="#000000"
            style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 400, fontSize: "1000px" }}
          >
            53
          </text>

          {/* 2) 漸層外框：平常靜態漸層；hover 在數字上時淡入切換成流動漸層 */}
          <g mask="url(#mask53)">
            {/* 靜態外框 */}
            <rect
              x="0" y="0" width="1200" height="1000"
              fill="url(#stroke53Gradient)"
              style={{ opacity: num53Hover ? 0 : 1, transition: "opacity 300ms ease" }}
            />
            {/* 流動外框：寬矩形 + 重複漸層，用 CSS 平移 (num53-flow-rect) 產生流動；hover 才淡入 */}
            <rect
              className="num53-flow-rect"
              x="-900" y="0" width="3000" height="1000"
              fill="url(#stroke53Flow)"
              style={{ opacity: num53Hover ? 1 : 0, transition: "opacity 300ms ease" }}
            />
          </g>

        </svg>
      </div>

      <div className="relative px-5 sm:px-8 md:px-14 max-w-[1400px] mx-auto w-full">
        <p className="text-white text-sm sm:text-base mb-4 tracking-[2px]" style={{ fontFamily: "'Ubuntu Sans Mono', 'Noto Sans TC', monospace", fontWeight: 700 }}>
          {displayText}
          <span className="ml-1 inline-block h-4 w-[0.6ch] align-middle border-r border-white/80 animate-pulse" aria-hidden="true" />
        </p>
        <h1
          className="hero-flow-text leading-none select-none mb-10"
          style={{
            fontFamily: "'Chiron Hei HK Text', 'Noto Sans TC', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(2.6rem, 10vw, 15rem)",
          }}
        >
          系學會
        </h1>
        <h2
          className="text-white leading-tight mb-10"
          style={{
            fontFamily: "'Chiron Hei HK Text','Noto Sans TC', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(1.6rem, 7vw, 11rem)",
          }}
        >
          可以這樣「玩」？
        </h2>
        <a
          href="#/news/term-53-inauguration"
          className="inline-flex items-center gap-3 bg-white text-black px-6 sm:px-7 py-3 rounded-full hover:bg-white/90 transition-all duration-200 group w-fit max-w-full"
          style={{
            fontFamily: "'Noto Sans TC', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(0.85rem, 1.5vw, 1.1rem)",
            letterSpacing: "0.06em",
          }}
        >
          第 53 屆系學會上任公告
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
        </a>
      </div>
    </section>
  );
}