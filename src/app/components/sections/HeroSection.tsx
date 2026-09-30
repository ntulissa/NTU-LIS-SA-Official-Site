import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { ArrowRight, ArrowDown } from "lucide-react";

/* ════════════════════════════════════════════════════════════════
   ✏️ 在這裡輸入你的 Hashtag 文案（不用打「#」，程式會自動加上）
   想加幾個都可以，一行一個，記得用 "" 包起來、後面加逗號。
   ════════════════════════════════════════════════════════════════ */
const HASHTAGS: string[] = [
  "加入學術部",
  "加入形象宣傳部",
  "加入活動部",
  "加入行政部",
  "加入體育部",
  "圖資人大團結",
  "LISSA on LIVE",
  "可以這樣玩",
];

/* 畫面上最多同時出現幾個 Hashtag（超過會把最舊的收掉） */
const MAX_TAGS = 10;

/* Hashtag 出現後多久消失（毫秒，3000 = 3 秒） */
const TAG_LIFETIME = 3000;

/* 消失時淡出動畫的長度（毫秒），會包含在上面的 3 秒內 */
const EXIT_MS = 350;

/* 「加入系學會」按鈕要連到哪裡 */
const JOIN_LINK = "#/join";

type Tag = {
  id: number;
  text: string;
  x: number; // 點擊位置（相對於 Hero 區塊）
  y: number;
  cw: number; // 點擊當下 Hero 區塊的寬高，用來防止 Hashtag 超出畫面
  ch: number;
};

/* ── 隨機但不重複的抽籤器 ─────────────────────────────────────────
   像「抽籤筒」：把所有文案洗牌後一張張抽，全部抽完才重新洗牌。
   所以一輪之內不會重複，而且換輪時也不會連續抽到同一句。 */
function useShuffleBag(items: string[]) {
  const bagRef = useRef<string[]>([]);
  const lastRef = useRef<string | null>(null);

  return useCallback(() => {
    if (items.length === 0) return "";
    if (bagRef.current.length === 0) {
      const next = [...items];
      for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
      }
      // 抽籤是從陣列尾巴拿；若新一輪第一張剛好等於上一張，就換到最前面
      if (next.length > 1 && next[next.length - 1] === lastRef.current) {
        [next[0], next[next.length - 1]] = [next[next.length - 1], next[0]];
      }
      bagRef.current = next;
    }
    const value = bagRef.current.pop()!;
    lastRef.current = value;
    return value;
  }, [items]);
}

/* ── 單一 Hashtag 標籤 ────────────────────────────────────────────
   以點擊位置為中心出現；會先量自己的寬高，若會超出畫面邊緣就自動往內推。 */
function HashtagChip({ tag }: { tag: Tag }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: tag.x, top: tag.y });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const MARGIN = 12; // 距離畫面邊緣至少留多少 px
    const left = Math.min(Math.max(tag.x - w / 2, MARGIN), Math.max(MARGIN, tag.cw - w - MARGIN));
    const top = Math.min(Math.max(tag.y - h / 2, MARGIN), Math.max(MARGIN, tag.ch - h - MARGIN));
    setPos({ left, top });
  }, [tag]);

  return (
    <div
      ref={ref}
      className="hashtag-chip absolute bg-white border-2 border-[#FFFFFF] text-black"
      style={{
        left: pos.left,
        top: pos.top,
        // 先「捲出」，停留到快 3 秒時再「淡出」
        animation: `hashtagRoll 420ms cubic-bezier(0.22, 1, 0.36, 1) both, hashtagOut ${EXIT_MS}ms ease-in ${TAG_LIFETIME - EXIT_MS}ms forwards`,
        maxWidth: "calc(100% - 24px)",
        padding: "clamp(0.55rem, 1vw, 1rem) clamp(0.8rem, 1.2vw, 1.1rem)",
        fontFamily: "'Chiron Hei HK Text', 'Noto Sans TC', sans-serif",
        fontWeight: 900,
        fontSize: "clamp(0.95rem, 1.5vw, 1.5rem)",
        letterSpacing: "0.15em",
        lineHeight: 1.2,
      }}
    >
      <span className="hashtag-chip-text">#&nbsp;{tag.text}</span>
    </div>
  );
}

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const idRef = useRef(0);
  const timersRef = useRef<Set<number>>(new Set());
  const [tags, setTags] = useState<Tag[]>([]);
  const [displayText, setDisplayText] = useState("");
  const nextHashtag = useShuffleBag(HASHTAGS);

  /* 點擊畫面任一處 → 在點擊位置捲出一個 Hashtag */
  const handleClick = (e: ReactMouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    // 點到按鈕或連結時不要產生 Hashtag（避免跟按鈕功能打架）
    if (target.closest("a, button, [data-no-hashtag]")) return;
    // 使用者在反白選字時也不要產生
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;

    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const newTag: Tag = {
      id: idRef.current++,
      text: nextHashtag(),
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      cw: rect.width,
      ch: rect.height,
    };
    setTags((prev) => [...prev, newTag].slice(-MAX_TAGS));

    // 3 秒後把這個 Hashtag 從畫面移除（淡出動畫已在這之前播完）
    const timer = window.setTimeout(() => {
      setTags((prev) => prev.filter((t) => t.id !== newTag.id));
      timersRef.current.delete(timer);
    }, TAG_LIFETIME);
    timersRef.current.add(timer);
  };

  /* 視窗尺寸改變（例如手機轉橫向）時清掉 Hashtag，避免位置跑掉；
     離開頁面時也把還沒跑完的計時器清掉 */
  useEffect(() => {
    const timers = timersRef.current;
    const clear = () => setTags([]);
    window.addEventListener("resize", clear);
    return () => {
      window.removeEventListener("resize", clear);
      timers.forEach((t) => window.clearTimeout(t));
      timers.clear();
    };
  }, []);

  /* 「往下繼續探索」→ 平滑捲到下一個區塊 */
  const scrollToNext = () => {
    const next = sectionRef.current?.nextElementSibling as HTMLElement | null;
    if (next) next.scrollIntoView({ behavior: "smooth" });
    else window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
  };

  /* 打字機動畫：兩句輪流。打完停留約 7 秒 → 逐字刪掉 → 換下一句 */
  useEffect(() => {
    const PHRASES = ["→ LISSA, on LIVE.", "→ 真的可以這樣玩。"];
    const TYPE_SPEED = 90;
    const DELETE_SPEED = 45;
    const HOLD_AFTER_TYPE = 7000;
    const PAUSE_BEFORE_NEXT = 500;

    let phraseIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let timer: number;

    const tick = () => {
      const full = PHRASES[phraseIdx];
      if (!deleting) {
        charIdx += 1;
        setDisplayText(full.slice(0, charIdx));
        if (charIdx >= full.length) {
          deleting = true;
          timer = window.setTimeout(tick, HOLD_AFTER_TYPE);
          return;
        }
        timer = window.setTimeout(tick, TYPE_SPEED);
      } else {
        charIdx -= 1;
        setDisplayText(full.slice(0, Math.max(0, charIdx)));
        if (charIdx <= 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % PHRASES.length;
          timer = window.setTimeout(tick, PAUSE_BEFORE_NEXT);
          return;
        }
        timer = window.setTimeout(tick, DELETE_SPEED);
      }
    };

    timer = window.setTimeout(tick, TYPE_SPEED);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section
      ref={sectionRef}
      onClick={handleClick}
      className="relative min-h-[100svh] bg-black overflow-hidden flex flex-col items-center justify-center text-center px-5 sm:px-8 pt-28 pb-40"
    >
      <style>{`
        /* 「系學會」紅藍漸層流動（12s 一輪，數字越大越慢） */
        @keyframes heroFlow {
          0%   { background-position: 200% 50%; }
          100% { background-position: -200% 50%; }
        }
        .hero-flow-text {
          background: linear-gradient(90deg, #D14B4B 0%, #2F9EBD 25%, #D14B4B 50%, #2F9EBD 75%, #D14B4B 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          animation: heroFlow 12s linear infinite;
        }

        /* Hashtag「捲出」動畫：白色方塊由左往右展開，文字再淡入 */
        @keyframes hashtagRoll {
          0%   { clip-path: inset(0 100% 0 0); transform: scale(0.92); }
          70%  { transform: scale(1.03); }
          100% { clip-path: inset(0 0 0 0); transform: scale(1); }
        }
        @keyframes hashtagText {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        /* Hashtag 消失：往上飄一點點並淡出 */
        @keyframes hashtagOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(-10px) scale(0.96); }
        }
        .hashtag-chip {
          transform-origin: left center;
        }
        .hashtag-chip-text {
          display: inline-block;
          animation: hashtagText 280ms ease-out 220ms both;
        }

        /* 「往下繼續探索」箭頭上下輕輕浮動 */
        @keyframes scrollHint {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(6px); }
        }
        .scroll-hint-icon { animation: scrollHint 1.8s ease-in-out infinite; }

        /* 使用者若在系統開啟「減少動態效果」，就關掉動畫 */
        @media (prefers-reduced-motion: reduce) {
          .hero-flow-text, .hashtag-chip, .hashtag-chip-text, .scroll-hint-icon { animation: none !important; }
        }
      `}</style>

      {/* ── 主要內容（置中） ── */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-[1400px]">
        <p
          className="text-white text-sm sm:text-base mb-6 sm:mb-8 tracking-[2px] min-h-[1.5em]"
          style={{ fontFamily: "'Ubuntu Sans Mono', 'Noto Sans TC', monospace", fontWeight: 700 }}
        >
          {displayText}
          <span className="ml-1 inline-block h-4 w-[0.6ch] align-middle border-r border-white/80 animate-pulse" aria-hidden="true" />
        </p>

        <h1
          className="hero-flow-text leading-none select-none mb-8 sm:mb-12"
          style={{
            fontFamily: "'Chiron Hei HK Text', 'Noto Sans TC', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(4rem, 14vw, 12rem)",
            letterSpacing: "0.04em",
          }}
        >
          系學會
        </h1>

        <h2
          className="text-white leading-tight select-none mb-12 sm:mb-20"
          style={{
            fontFamily: "'Chiron Hei HK Text', 'Noto Sans TC', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(1.2rem, 5.5vw, 3rem)",
          }}
        >
          可以這樣「玩」
        </h2>

        <a
          href={JOIN_LINK}
          className="inline-flex items-center gap-3 bg-white text-black px-7 sm:px-9 py-3 sm:py-4 rounded-full hover:bg-white/90 active:scale-95 transition-all duration-200 group"
          style={{
            fontFamily: "'Noto Sans TC', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(1rem, 1.6vw, 1.4rem)",
            letterSpacing: "0.08em",
          }}
        >
          第 53 屆系學會招募中
          <ArrowRight size={22} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform duration-200" />
        </a>
      </div>

      {/* ── Hashtag 圖層（不擋住按鈕：pointer-events-none，點擊會穿透） ── */}
      <div className="absolute inset-0 z-20 pointer-events-none select-none" aria-hidden="true">
        {tags.map((tag) => (
          <HashtagChip key={tag.id} tag={tag} />
        ))}
      </div>
    </section>
  );
}