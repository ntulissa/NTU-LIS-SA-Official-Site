import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./shared";
// ↑ 本檔請放在 src/components/sections/（跟 LoungeSection.tsx 同一層）。

/**
 * 首頁「系隊招募」區塊
 * ─────────────────────────────────────────────────────────────
 * ● 背景：imports/services/IMG-sp/ 裡的影片（自動播放、靜音、循環）＋ 黑色透明遮罩。
 *   VIDEO_FILE 留空 ""＝自動抓 IMG-sp 資料夾裡的第一支影片；
 *   想指定就填檔名，例："teams.mp4"。
 * ● 中間：標題＋副標。
 * ● 下方：三個系隊（大字＋連結），點擊連到 #/service/<slug>（Services 詳情頁）。
 * ● 真實影片，所以沒有 AI 聲明。
 */

// ══════════════════════════════════════════════════════════════════
// ✏️ 手動調整區
// ══════════════════════════════════════════════════════════════════
const TITLE_LINES = ["找到你的隊友", "為圖資熱血揮汗"]; // 大標題（一行一句）
const SUBTITLE = "各大體育系隊球員、工作人員招募中";

const OVERLAY_OPACITY = 0.7; // 黑色遮罩透明度（0~1）
const VIDEO_FOLDER = "IMG-sp"; // 影片所在資料夾
const VIDEO_FILE = "listeam.mp4";         // 影片檔名；留空＝自動抓該資料夾第一支影片

// 三個系隊：slug 要跟 servicesData.ts 一致
const TEAMS: { slug: string; sport: string; label: string }[] = [
  { slug: "basketball", sport: "籃球", label: "臺大日文圖資男籃" },
  { slug: "volleyball", sport: "排球", label: "臺大圖資女排" },
  { slug: "badminton", sport: "羽球", label: "臺大圖資羽球" },
];
// ══════════════════════════════════════════════════════════════════

const zhDisplay = "'Chiron Hei HK Text', 'Noto Sans TC', sans-serif";
const zhFont = "'Noto Sans TC', sans-serif";

const VIDEO_ASSETS = import.meta.glob("/src/**/services/**/*.{mp4,webm,mov}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

function findVideo(): string | undefined {
  const paths = Object.keys(VIDEO_ASSETS).filter((p) => p.includes(`/${VIDEO_FOLDER}/`));
  const hit = VIDEO_FILE ? paths.find((p) => p.endsWith(`/${VIDEO_FILE}`)) : paths.sort()[0];
  return hit ? VIDEO_ASSETS[hit] : undefined;
}

export default function SportsTeamsSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoSrc = findVideo();

  // 只在畫面上看得到時播放（省電）；系統開啟「減少動態效果」就不播
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { v.pause(); return; }
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) v.play().catch(() => {}); else v.pause(); },
      { threshold: 0.15 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [videoSrc]);

  return (
    <section id="teams" className="relative min-h-[100svh] overflow-hidden bg-black flex flex-col">
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
      <div className="relative z-10 flex-1 flex flex-col items-center text-center px-5 sm:px-8 pt-24 sm:pt-28 pb-20 sm:pb-28">
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

        {/* 撐開中間空間，讓三個系隊靠下 */}
        <div className="flex-1 min-h-[64px] sm:min-h-[120px]" />

        {/* ── 三個系隊 ── 手機直排、平板以上三欄 */}
        <div className="w-full max-w-[1300px] grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-6 lg:gap-10">
          {TEAMS.map((t, i) => (
            <Reveal key={t.slug} delay={120 + i * 80}>
              <a href={`#/service/${t.slug}`} className="group flex flex-col items-center focus:outline-none">
                <span
                  className="text-white transition-transform duration-500 group-hover:-translate-y-1.5"
                  style={{ fontFamily: zhDisplay, fontWeight: 900, fontSize: "clamp(2rem, 6vw, 3rem)", letterSpacing: "0.12em", paddingLeft: "0.12em", lineHeight: 1.1 }}
                >
                  {t.sport}
                </span>
                <span
                  className="mt-4 sm:mt-6 inline-flex items-center gap-2 text-white underline-offset-8 decoration-2 group-hover:underline group-focus-visible:underline"
                  style={{ fontFamily: zhFont, fontWeight: 700, fontSize: "clamp(0.95rem, 1.25vw, 1.2rem)", letterSpacing: "0.12em" }}
                >
                  了解 {t.label}
                  <ArrowRight size={20} strokeWidth={2.6} className="transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
