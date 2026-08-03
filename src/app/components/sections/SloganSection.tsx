import { Reveal } from "./shared";

export default function SloganSection() {
  return (
    <section className="bg-black min-h-screen flex flex-col items-center justify-center px-6 py-28">
      <Reveal>
        <h2
          className="text-white text-center mb-8"
          style={{
            fontFamily: "'Chiron Hei HK Text', 'Noto Sans TC', sans-serif",
            fontWeight: 900,
            fontSize: "48px",
            letterSpacing: "5.53px",
            lineHeight: "normal",
          }}
        >
          在繁重的大學日常裡，做你四年的避風港。
        </h2>
      </Reveal>
      <Reveal delay={160}>
        <p
          className="text-center"
          style={{
            fontFamily: "'Ubuntu Sans Mono', monospace",
            fontWeight: 500,
            fontSize: "clamp(1rem, 3.7vw, 53px)",
            letterSpacing: "3.71px",
            lineHeight: "normal",
            background: "linear-gradient(90deg, #FFF 0%, #595959 34.13%, #FFF 67.79%, #3A3A3A 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundSize: "220% 100%",
            animation: "sloganFlow 6s linear infinite",
          }}
        >
          HOME IS WHERE NTU LIS SA IS.
        </p>
      </Reveal>
    </section>
  );
}
