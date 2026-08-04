import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import imgBuilding from "@/imports/HomePage-1/de7749452570d864c1f5c584765f093ab16a6d89.png";

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fullText = "→ LISSA, on LIVE.";
    let index = 0;

    const timer = window.setInterval(() => {
      setDisplayText(fullText.slice(0, index + 1));
      index += 1;

      if (index >= fullText.length) {
        window.clearInterval(timer);
      }
    }, 90);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen bg-black overflow-hidden flex flex-col justify-end pb-24 pt-24 sm:pt-28 sm:pb-32 md:pt-[100px] md:pb-40">
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
          className="absolute"
          style={{ right: "-4%", top: "50%", transform: "translateY(calc(-50% + 67px))", height: "clamp(360px, 82vh, 1000px)", width: "auto" }}
          viewBox="0 0 1200 1000"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="stroke53Gradient" gradientUnits="userSpaceOnUse" x1="150" y1="120" x2="1050" y2="880">
              <stop offset="0" stopColor="#D14B4B" />
              <stop offset="1" stopColor="#2F9EBD" />
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

          {/* 1) 純黑字身：蓋住建築圖 */}
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

          {/* 2) 紅藍漸層外框：漸層塗在矩形上，透過 mask 只在字的邊框露出 */}
          <rect x="0" y="0" width="1200" height="1000" fill="url(#stroke53Gradient)" mask="url(#mask53)" />
        </svg>
      </div>

      <div className="relative px-5 sm:px-8 md:px-14 max-w-[1400px] mx-auto w-full">
        <p className="text-white text-sm sm:text-base mb-4 tracking-[2px]" style={{ fontFamily: "'Ubuntu Sans Mono', monospace", fontWeight: 700 }}>
          {displayText}
          <span className="ml-1 inline-block h-4 w-[0.6ch] align-middle border-r border-white/80 animate-pulse" aria-hidden="true" />
        </p>
        <h1
          className="hero-flow-text leading-none select-none mb-10"
          style={{
            fontFamily: "'Noto Sans TC', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(2.6rem, 10vw, 15rem)",
          }}
        >
          系學會
        </h1>
        <h2
          className="text-white leading-tight mb-10"
          style={{
            fontFamily: "'Noto Sans TC', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(1.6rem, 7vw, 11rem)",
            letterSpacing: "0.09em",
          }}
        >
          可以這樣「玩」？
        </h2>
        <a
          href="#"
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