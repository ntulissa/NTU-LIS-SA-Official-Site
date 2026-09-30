import { Reveal } from "./shared";

export default function SloganSection() {
  return (
    <section className="bg-black min-h-screen flex flex-col items-center justify-center px-6 py-28">
      {/* 英文標語的漸層流動動畫（自成一格，不依賴全域 CSS） */}
      <style>{`
        @keyframes sloganFlow {
          from { background-position: 0% 50%; }
          to   { background-position: -220% 50%; }
        }
      `}</style>
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
    </section>
  );
}