import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./shared";
// ↑ 本檔請放在 src/components/sections/（跟 HeroSection.tsx 同一層）。

/**
 * 首頁「學輔室」區塊
 * ─────────────────────────────────────────────────────────────
 * ● 背景：imports/services/IMG-gen/lounge.mp4（自動播放、靜音、循環）＋ 黑色透明遮罩。
 * ● 中間：標題＋副標。
 * ● 下方：三個學輔室相關服務，圖片抓 imports/services/IMG-gen/ 裡「檔名＝slug」的圖
 *   （locker.png / lounge.png / aircon.png，副檔名不限），點擊連到 #/service/<slug>。
 * ● 左下角：AI 影片聲明（半透明）。
 */

// ══════════════════════════════════════════════════════════════════
// ✏️ 手動調整區
// ══════════════════════════════════════════════════════════════════
const TITLE_LINES = ["涼爽自在的空間", "延長陪伴每刻努力"]; // 大標題（一行一句）
const SUBTITLE = "一個全新的學輔室";
const AI_NOTICE = "場景由 AI 輔助生成，僅供示意參考";

const OVERLAY_OPACITY = 0.7;  // 黑色遮罩透明度（0~1；Figma 70% ＝ 0.7）
const NOTICE_OPACITY = 0.45;  // 左下角 AI 聲明的透明度（0~1；越小越淡）
const VIDEO_FILE = "lounge.mp4"; // 背景影片檔名（放在 imports/services/IMG-gen/）

// 三個服務：slug 要跟 servicesData.ts 一致；label 是圖片下方連結文字
const ITEMS: { slug: string; label: string }[] = [
  { slug: "locker", label: "系櫃租借" },
  { slug: "lounge", label: "學輔室夜間使用" },
  { slug: "aircon", label: "學輔室冷氣使用" },
];

const IMG_H = "clamp(150px, 17vw, 250px)"; // 三張圖片的高度（一致才會對齊）
// ══════════════════════════════════════════════════════════════════

const zhDisplay = "'Chiron Hei HK Text', 'Noto Sans TC', sans-serif";
const zhFont = "'Noto Sans TC', sans-serif";

// 讀 imports/services/ 底下的圖片（跟 Services.tsx 同一套規則：檔名＝slug）
const IMG_ASSETS = import.meta.glob("/src/**/services/**/*.{svg,png,jpg,jpeg,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
// 讀背景影片
const VIDEO_ASSETS = import.meta.glob("/src/**/services/**/*.{mp4,webm,mov}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

function imgBySlug(slug: string): string | undefined {
  const hit = Object.keys(IMG_ASSETS).find((p) => {
    const f = (p.split("/").pop() || "").replace(/\.[^.]+$/, "");
    return f === slug;
  });
  return hit ? IMG_ASSETS[hit] : undefined;
}
function videoByFile(file: string): string | undefined {
  const hit = Object.keys(VIDEO_ASSETS).find((p) => p.endsWith(`/${file}`));
  return hit ? VIDEO_ASSETS[hit] : undefined;
}

export default function LoungeSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoSrc = videoByFile(VIDEO_FILE);

  // 省電：影片只在畫面上看得到時才播放；系統開啟「減少動態效果」就不播
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { v.pause(); return; }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.15 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [videoSrc]);

  return (
    <section id="lounge" className="relative min-h-[100svh] overflow-hidden bg-black flex flex-col">
      {/* ── 背景影片 ── */}
      {videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          aria-hidden="true"
        />
      )}
      {/* ── 黑色透明遮罩 ── */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: `rgba(0,0,0,${OVERLAY_OPACITY})` }} />

      {/* ── 內容 ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center text-center px-5 sm:px-8 pt-24 sm:pt-28 pb-24 sm:pb-28">
        <Reveal>
          <h2
            className="text-white"
            style={{ fontFamily: zhDisplay, fontWeight: 700, fontSize: "clamp(1.9rem, 4.4vw, 4rem)", letterSpacing: "0.08em", lineHeight: 1.5 }}
          >
            {TITLE_LINES.map((line) => (
              <span key={line} className="block">{line}</span>
            ))}
          </h2>
        </Reveal>

        <Reveal delay={80}>
          <p
            className="text-white mt-6 sm:mt-10"
            style={{ fontFamily: zhFont, fontWeight: 900, fontSize: "clamp(1rem, 1.6vw, 1.5rem)", letterSpacing: "0.15em" }}
          >
            {SUBTITLE}
          </p>
        </Reveal>

        {/* 撐開中間空間，讓三個服務靠下（照設計稿） */}
        <div className="flex-1 min-h-[64px] sm:min-h-[120px]" />

        {/* ── 三個服務 ── 手機直排、平板以上三欄 */}
        <div className="w-full max-w-[1300px] grid grid-cols-1 sm:grid-cols-3 gap-14 sm:gap-6 lg:gap-10">
          {ITEMS.map((item, i) => {
            const img = imgBySlug(item.slug);
            return (
              <Reveal key={item.slug} delay={120 + i * 80}>
                <a href={`#/service/${item.slug}`} className="group flex flex-col items-center focus:outline-none">
                  <div className="w-full flex items-end justify-center" style={{ height: IMG_H }}>
                    {img ? (
                      <img
                        src={img}
                        alt={item.label}
                        draggable={false}
                        className="max-h-full max-w-[85%] object-contain select-none transition-transform duration-500 group-hover:-translate-y-1.5"
                      />
                    ) : (
                      <span className="text-white/40 text-sm" style={{ fontFamily: zhFont }}>（找不到 {item.slug} 圖片）</span>
                    )}
                  </div>
                  <span
                    className="mt-8 sm:mt-10 inline-flex items-center gap-2 text-white underline-offset-8 decoration-2 group-hover:underline group-focus-visible:underline"
                    style={{ fontFamily: zhFont, fontWeight: 700, fontSize: "clamp(0.95rem, 1.25vw, 1.2rem)", letterSpacing: "0.12em" }}
                  >
                    了解 {item.label}
                    <ArrowRight size={20} strokeWidth={2.6} className="transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* ── 左下角 AI 影片聲明 ── */}
      <p
        className="absolute z-10 left-5 sm:left-8 bottom-5 sm:bottom-7 text-white select-none pointer-events-none"
        style={{ opacity: NOTICE_OPACITY, fontFamily: zhFont, fontWeight: 700, fontSize: "clamp(0.7rem, 0.95vw, 0.95rem)", letterSpacing: "0.12em" }}
      >
        {AI_NOTICE}
      </p>
    </section>
  );
}
