import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import imgBuilding from "@/imports/HomePage-1/de7749452570d864c1f5c584765f093ab16a6d89.png";

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen bg-black overflow-hidden flex flex-col justify-end pb-20 pt-[100px]">
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
          <div className="absolute inset-0 overflow-hidden opacity-20" style={{ borderRadius: "50%" }}>
            <img
              src={imgBuilding}
              alt=""
              className="absolute max-w-none"
              style={{ width: "220.8%", height: "102.77%", left: "-60.09%", top: "-2.77%" }}
            />
          </div>
          <div className="absolute inset-0" style={{ border: "1.85vw solid #2F9EBD", borderRadius: "50%" }} />
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

      <div className="relative px-6 md:px-14 max-w-[1400px] mx-auto w-full">
        <p className="text-white text-sm md:text-base mb-4 tracking-[2px]" style={{ fontFamily: "'Ubuntu Sans Mono', monospace", fontWeight: 700 }}>
          → LISSA, on LIVE.
        </p>
        <h1
          className="leading-none select-none mb-10 bg-clip-text text-transparent"
          style={{
            fontFamily: "'Noto Sans TC', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(3.5rem, 13vw, 15rem)",
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
            fontSize: "clamp(2rem, 9.5vw, 11rem)",
          }}
        >
          可以這樣「玩」？
        </h2>
        <a
          href="#"
          className="inline-flex items-center gap-3 bg-white text-black px-7 py-3 rounded-full hover:bg-white/90 transition-all duration-200 group"
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
