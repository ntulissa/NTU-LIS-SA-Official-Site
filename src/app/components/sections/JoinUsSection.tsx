import { Reveal } from "./shared";

export default function JoinUsSection() {
  return (
    <section id="join" className="bg-black min-h-screen flex flex-col items-center justify-center px-6 py-28 text-center">
      <Reveal>
        <h2 className="text-white leading-tight mb-8" style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 900, fontSize: "clamp(1.8rem, 4.5vw, 4.5rem)" }}>
          成為{" "}
          <span style={{ background: "linear-gradient(to right, #D14B4B, #2F9EBD)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            臺大圖資系學會
          </span>{" "}
          的一員
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
          <a href="#" className="inline-flex items-center justify-center px-8 py-3 rounded-full hover:opacity-80 transition-all duration-200" style={{ background: "linear-gradient(to right, #D14B4B, #2F9EBD)", fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 900, fontSize: "1rem", letterSpacing: "0.2em", color: "white" }}>
            加 入 我 們
          </a>
          <a href="#" className="inline-flex items-center justify-center px-8 py-3 rounded-full border border-white/50 text-white hover:bg-white/5 transition-all duration-200" style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 500, fontSize: "1rem", letterSpacing: "0.12em" }}>
            追 蹤 我 們 的 社 群
          </a>
        </div>
      </Reveal>
    </section>
  );
}
