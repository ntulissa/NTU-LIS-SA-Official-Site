import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";
import { useI18n } from "../i18n";

const ENABLED_ROUTES = new Set(["home", "presidents", "sponsor", "news", "fees", "join"]);

function getCurrentRoute() {
  const hash = window.location.hash;
  return hash.startsWith("#/") ? hash.slice(2).split("/")[0] || "home" : "home";
}

/**
 * 畫面下方中央的「往下繼續探索」捲動提示。
 * - 固定於視窗底部中央（fixed），使用者一路往下捲時都會顯示。
 * - 電腦版：footer 進入畫面即淡出隱藏；手機／平板（沒有 footer）：捲到頁面底部即隱藏。
 * - 可點擊：每次點擊平滑往下捲動約一個畫面高度。
 */
export default function ScrollIndicator() {
  const { t, lang } = useI18n();
  const enabled = ENABLED_ROUTES.has(getCurrentRoute());
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // 電腦版：Footer 一露出就把提示藏起來（同原本）。
    // 手機／平板：Footer 是隱藏的，改成「捲到頁面最底部」就藏起來。
    const check = () => {
      const footer = document.querySelector("footer");
      const footerH = footer && footer.offsetParent !== null ? footer.offsetHeight : 0; // 隱藏時＝0
      const distToBottom = document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
      setHidden(footerH > 0 ? distToBottom < footerH : distToBottom <= 40);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [enabled]);

  // 捲到「下一個區塊的開頭」，讓每個區塊的頁面小標題都停在畫面同一個位置。
  // 若下一個區塊還很遠（目前這塊比一個螢幕還高），先照舊往下捲約一個畫面，避免跳過內容。
  const scrollDown = () => {
    const footer = document.querySelector("footer");
    const blocks = footer?.parentElement
      ? Array.from(footer.parentElement.children).filter(
          (el): el is HTMLElement =>
            el instanceof HTMLElement && !["HEADER", "FOOTER", "BUTTON", "STYLE", "SCRIPT"].includes(el.tagName)
        )
      : [];
    const vh = window.innerHeight;
    const next = blocks
      .map((el) => el.getBoundingClientRect().top)
      .find((top) => top > 4); // 第一個「頂端還在畫面下方」的區塊

    if (next === undefined || next > vh) {
      window.scrollBy({ top: vh * 0.85, behavior: "smooth" });
    } else {
      window.scrollBy({ top: next, behavior: "smooth" });
    }
  };

  if (!enabled) return null;

  // 中文字距拉開比較好看；英文拉太開會難讀
  const tracking = lang === "en" ? "0.12em" : "0.3em";

  return (
    <button
      type="button"
      onClick={scrollDown}
      aria-label={t.scrollHint}
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
          letterSpacing: tracking,
          paddingLeft: tracking, // 補償尾端字距，讓文字視覺置中
        }}
      >
        {t.scrollHint}
      </span>
    </button>
  );
}