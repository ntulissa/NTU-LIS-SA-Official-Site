import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";

/**
 * 畫面下方中央的「往下繼續探索」捲動提示。
 * - 固定於視窗底部中央（fixed），使用者一路往下捲時都會顯示。
 * - 以 IntersectionObserver 監看頁面的 <footer>：footer 進入畫面即淡出隱藏。
 * - 可點擊：每次點擊平滑往下捲動約一個畫面高度。
 */
export default function ScrollIndicator() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // 找到頁面最底部的 Footer；捲到它就把提示藏起來。
    const footer = document.querySelector("footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => setHidden(entry.isIntersecting),
      { root: null, threshold: 0 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const scrollDown = () => {
    window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollDown}
      aria-label="往下繼續探索"
      className={`fixed left-1/2 -translate-x-1/2 bottom-6 sm:bottom-8 z-40 flex flex-col items-center gap-2 transition-all duration-500 ease-out ${
        hidden ? "opacity-0 translate-y-4 pointer-events-none" : "opacity-100 translate-y-0"
      }`}
    >
      {/* 提示動畫（自成一格，不需改動全域 CSS） */}
      <style>{`
        @keyframes scrollHintBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
      `}</style>

      {/* 白色圓形 + 向下箭頭 */}
      <span
        className="flex items-center justify-center rounded-full bg-white shadow-lg shadow-black/40"
        style={{ width: "44px", height: "44px", animation: "scrollHintBounce 1.8s ease-in-out infinite" }}
      >
        <ArrowDown className="text-black" size={20} strokeWidth={2.4} />
      </span>

      {/* 文字告示 */}
      <span
        className="text-white/70 whitespace-nowrap"
        style={{
          fontFamily: "'Noto Sans TC', sans-serif",
          fontWeight: 700,
          fontSize: "0.7rem",
          letterSpacing: "0.3em",
          paddingLeft: "0.2em", // 補償尾端字距，讓文字視覺置中
        }}
      >
        往下繼續探索
      </span>
    </button>
  );
}