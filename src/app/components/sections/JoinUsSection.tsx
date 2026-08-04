import { Reveal } from "./shared";

export default function JoinUsSection() {
  return (
    <section id="join" className="bg-black min-h-screen flex flex-col items-center justify-center px-6 py-28 text-center">
      <Reveal>
        <h2 className="text-white leading-tight mb-8" style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 900, fontSize: "clamp(1.8rem, 4.5vw, 4.5rem)" }}>
          成 為{" "}
          <span style={{ background: "linear-gradient(to right, #D14B4B, #2F9EBD)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            臺大圖資系學會
          </span>{" "}
          的 一 員
        </h2>
      </Reveal>

      <Reveal delay={80}>
        <div className="text-white/60 leading-loose mb-10 max-w-2xl" style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 500, fontSize: "clamp(0.85rem, 1.5vw, 1rem)" }}>
          <p>你將有機會親手策劃屬於圖資人的舞台，參與一次又一次影響全系的決策與行動。</p>
          <p>你投入的不是單純的公共事務，而是一段能讓你累積經驗、結識夥伴、發揮影響力的旅程。</p>
          <p>成就不一樣的圖資系，需要的就是你</p>
        </div>
      </Reveal>

      <Reveal delay={140}>
        <p className="mb-12 tracking-[0.5em]" style={{ fontFamily: "'Ubuntu Sans Mono', monospace", fontWeight: 500, fontSize: "clamp(2rem, 5vw, 3.5rem)", background: "linear-gradient(to right, #D14B4B, #2F9EBD)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          JOIN&nbsp;&nbsp;US
        </p>
      </Reveal>

      <Reveal delay={200}>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#" className="relative inline-flex items-center justify-center px-8 py-3 rounded-full overflow-hidden hover:opacity-90 transition-all duration-200" style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 900, fontSize: "1rem", letterSpacing: "0.2em", color: "white", background: "#000" }}>
            <span
              className="absolute inset-0 rounded-full"
              style={{
                padding: "1.5px",
                border: "1.5px solid transparent",
                background: "linear-gradient(#000, #000) padding-box, linear-gradient(90deg, #D14B4B 0%, #2F9EBD 100%) border-box",
              }}
            />
            <span
              className="absolute inset-0 rounded-full"
              style={{
                background: "conic-gradient(from 0deg, #D14B4B 0deg, #2F9EBD 180deg, #D14B4B 360deg)",
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
                animation: "buttonRotate 8s linear infinite",
                transformOrigin: "center",
                opacity: 0.95,
              }}
            />
            <span className="relative z-10">加 入 我 們</span>
          </a>
          <a href="#" className="inline-flex items-center justify-center px-8 py-3 rounded-full border border-white/50 text-white hover:bg-white/5 transition-all duration-200" style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 500, fontSize: "1rem", letterSpacing: "0.12em" }}>
            追 蹤 我 們 的 社 群
          </a>
        </div>
      </Reveal>
    </section>
  );
}
