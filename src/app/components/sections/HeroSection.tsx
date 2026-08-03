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
    <section className="relative min-h-screen bg-black overflow-hidden flex flex-col justify-end pb-16 pt-24 sm:pt-28 sm:pb-20 md:pt-[100px] md:pb-20">
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

      <div className="relative px-5 sm:px-8 md:px-14 max-w-[1400px] mx-auto w-full">
        <p className="text-white text-sm sm:text-base mb-4 tracking-[2px]" style={{ fontFamily: "'Ubuntu Sans Mono', monospace", fontWeight: 700 }}>
          {displayText}
          <span className="ml-1 inline-block h-4 w-[0.6ch] align-middle border-r border-white/80 animate-pulse" aria-hidden="true" />
        </p>
        <h1
          className="leading-none select-none mb-10 bg-clip-text text-transparent"
          style={{
            fontFamily: "'Noto Sans TC', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(2.6rem, 10vw, 15rem)",
            backgroundImage: "linear-gradient(to right, #D14B4B 0%, #2F9EBD 100%)",
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
