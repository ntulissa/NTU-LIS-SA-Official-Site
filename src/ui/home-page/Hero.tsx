import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { ArrowRight } from "lucide-react";
import { defineText, useI18n } from "../i18n";

/**
 * 首頁 Hero（可左右切換的輪播）
 * ─────────────────────────────────────────────────────────────
 * ● 四頁：系學會招募（recruit）、全新官網（official）、系友講座（talks）、文學院籃球賽（battle）
 * ● 切換方式（任何裝置都能用）：
 *     - 點底部圓點
 *     - 鍵盤 ← →（Hero 在畫面上就有效，不用先點）；Tab 也能移到按鈕上按 Enter
 *     - 觸控板兩指左右滑、手機手指左右滑、滑鼠拖曳
 *   也會自動輪播（滑鼠停在上面、或用鍵盤操作 Hero 時會暫停）
 * ● 只有「系學會招募」那頁，點畫面空白處會跳出 Hashtag
 * ● 圖片：放在 src/imports/ 底下任何資料夾都可以（建議 src/imports/home-page/），程式用「檔名」找
 *     officialsite.svg、speaker1.svg、speaker2.svg、battleLA.svg
 */

// ══════════════════════════════════════════════════════════════════
// ✏️ 手動調整區
// ══════════════════════════════════════════════════════════════════

// ── 輪播順序：調換這四個的順序即可；不想顯示某一頁就把它刪掉 ──
type SlideId = "official" | "talks" | "battle" | "recruit";
const SLIDE_ORDER: SlideId[] = ["official", "talks", "battle", "recruit"];

const AUTOPLAY_MS = 8000; // 自動切換間隔（毫秒）；設 0＝不自動切換
const SLIDE_MS = 700;     // 切換動畫時間（毫秒）

// ── 各頁按鈕連結 ──
const LINKS = {
  recruitTeam: "#/current-team",       // 第 53 屆工作團隊
  recruitEvents: "#/calendar",         // 系學會近期活動
  officialMore: "#/news/official-site", // 全新官網「深入了解」→ 官網上線公告
  talksMore: "#/news/lis-talk-2026-fall", // 系友講座「深入了解」→ 系友講座公告
  talksSignup: "#/calendar?event=1",      // 系友講座「報名參加」→ 行事曆活動展開畫面
  battleMore: "#/news/battle-la-2026",  // 籃球賽「深入了解」→ Battle LA 公告
  battleTeam: "#/service/basketball",  // 「關於系籃」
};

// ── 圖片檔名 ──
const IMG = {
  official: "officialsite.svg",
  speaker1: "speaker1.png",
  speaker2: "speaker2.png",
  battle: "battleLA.svg",
};

// 全新官網頁：背景 icon 上的黑色漸層遮罩（0~1；越大越暗）
//   桌機：由左往右漸層（左邊 icon 半暗、右邊文字區最暗）
//   手機：由上往下漸層（文字在下方，所以下方最暗）
const OFFICIAL_OVERLAY = { start: 0.55, end: 0.92 };

const BATTLE_OVERLAY = 0.55;

// 「系學會招募」和「Battle LA」兩頁的按鈕列，固定在「距離畫面底部」同一個高度，
// 所以兩頁按鈕位置永遠對齊（不管螢幕多高）。數字越大＝整塊內容越往上。
const BUTTONS_FROM_BOTTOM = "clamp(7.5rem, 25svh, 18rem)";

// ── 字級（clamp(手機最小, 隨螢幕寬度縮放, 大螢幕最大)）想再大／小改這裡 ──
const SIZE = {
  title: "clamp(1.9rem, 4.2vw, 4rem)",          // Official Site / LIS Talks… / Battle LA.
  subtitle: "clamp(1rem, 1.7vw, 1.6rem)",        // 臺大圖資系學會全新官方網站 / 系友講座…
  info: "clamp(0.8rem, 1.1vw, 1.1rem)",          // 11/17 經驗傳承… / 想要這樣玩？…
  button: "clamp(0.8rem, 1.05vw, 1.05rem)",      // 所有按鈕
  recruitTitle: "clamp(4.2rem, 12.5vw, 11.5rem)",      // 招募頁「系學會」
  recruitSubtitle: "clamp(1.6rem, 4.4vw, 4rem)", // 招募頁「可以這樣「玩」」
}; // 籃球賽背景圖上的黑色遮罩（0~1；越大越暗、字越清楚）

// ── Hashtag（只在「系學會招募」頁）──
const MAX_TAGS = 10;      // 畫面上最多同時幾個
const TAG_LIFETIME = 3000; // 出現多久後消失（毫秒）
const EXIT_MS = 350;       // 淡出動畫長度（毫秒）

// ── 所有文字（中英兩份；英文結構要和中文一樣）──
const TEXT = defineText({
  zh: {
    slideNames: { recruit: "系學會招募", official: "全新官方網站", talks: "系友講座", battle: "文學院籃球賽" },
    goTo: "前往",
    nowShowing: "目前顯示",
    learnMore: "深入了解",
    recruit: {
      hashtags: ["加入學術部", "加入形象宣傳部", "加入活動部", "加入行政部", "加入體育部", "圖資人大團結", "LISSA on LIVE", "可以這樣玩"],
      phrases: ["→ LISSA, on LIVE.", "→ 真的可以這樣玩。"],
      title: "系學會",
      subtitle: "可以這樣「玩」",
      team: "第 53 屆工作團隊",
      events: "系學會近期活動",
    },
    official: {
      title: "Official Site",
      subtitle: "臺大圖資系學會全新官方網站",
      tagline: "想要這樣玩？那就做出來",
    },
    talks: {
      title: "LIS Talks, 2026 Fall",
      subtitle: "系友講座",
      info: "11/17 經驗傳承・跨界對話",
      signup: "報名參加",
      speakers: [
        { name: "傅嬿羽", year: "B04", role: "Micron Technology -\nFull stack AI engineer" },
        { name: "陳庭姍", year: "B04", role: "IBM Consulting" },
      ],
    },
    battle: {
      title: "Battle LA.",
      subtitle: "臺大文學院籃球邀請賽",
      info: "12/6 臺大醫體 點燃戰火",
      team: "關於系籃",
    },
  },
  en: {
    slideNames: { recruit: "Join LISSA", official: "New Official Site", talks: "LIS Talks", battle: "Battle LA" },
    goTo: "Go to",
    nowShowing: "Now showing",
    learnMore: "Learn more",
    recruit: {
      hashtags: ["Join Academic Affairs", "Join Image & Publicity", "Join Events", "Join General Affairs", "Join Sports", "LIS United", "LISSA on LIVE", "Play It Your Way"],
      phrases: ["→ 系學會可以這樣玩。", "→ REDEFINING LISSA."],
      title: "LIS SA",
      subtitle: "Truly Next Level.",
      team: "Meet the 53rd Team",
      events: "Upcoming Events",
    },
    official: {
      title: "Official Site",
      subtitle: "Brand new NTU LIS SA website",
      tagline: "Talk is cheap. Make it real.",
    },
    talks: {
      title: "LIS Talks, 2026 Fall",
      subtitle: "",
      info: "Nov 17 · Mentorship · Cross-Field Exchange",
      signup: "Sign up",
      speakers: [
        { name: "傅嬿羽", year: "B04", role: "Micron Technology -\nFull stack AI engineer" },
        { name: "陳庭姍", year: "B04", role: "IBM Consulting" },
      ],
    },
    battle: {
      title: "Battle LA.",
      subtitle: "NTU CLA Basketball Invitational",
      info: "Dec 6 · NTU Medical Gym · Game on",
      team: "Our team",
    },
  },
});
// ══════════════════════════════════════════════════════════════════

const zhDisplay = "'Chiron Hei HK Text', 'Noto Sans TC', sans-serif";
const zhFont = "'Noto Sans TC', sans-serif";
const monoFont = "'Ubuntu Sans Mono', 'Noto Sans TC', monospace";

// 讀 src/imports/ 底下所有圖片，用檔名找
const HERO_ASSETS = import.meta.glob("/src/imports/**/*.{svg,png,jpg,jpeg,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
function asset(file: string): string | undefined {
  const hit = Object.keys(HERO_ASSETS).find((p) => p.endsWith(`/${file}`));
  return hit ? HERO_ASSETS[hit] : undefined;
}

type Tx = (typeof TEXT)["zh"];
type Track = (zh: string, en?: string) => string;

// ── 共用：白色實心 / 白框按鈕 ──
function HeroButton({ href, children, outline, track }: { href: string; children: ReactNode; outline?: boolean; track: Track }) {
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center gap-2 sm:gap-3 rounded-full px-4 sm:px-6 py-2 sm:py-2.5 active:scale-95 transition-all duration-200 group whitespace-nowrap ${
        outline ? "border-2 border-white text-white hover:bg-white/10" : "bg-white text-black border-2 border-white hover:bg-white/90"
      }`}
      style={{ fontFamily: zhFont, fontWeight: 700, fontSize: SIZE.button, letterSpacing: track("0.1em") }}
    >
      {children}
      <ArrowRight strokeWidth={2.5} className="w-[1.3em] h-[1.3em] group-hover:translate-x-1 transition-transform duration-200" />
    </a>
  );
}

function ButtonRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-row flex-wrap items-center justify-center gap-x-[clamp(1.25rem,5vw,5rem)] gap-y-3">{children}</div>;
}

const titleStyle = (track: Track) => ({
  fontFamily: zhDisplay,
  fontWeight: 700,
  fontSize: SIZE.title,
  letterSpacing: track("0.02em", "0.01em"),
  lineHeight: 1.1,
});
const subStyle = (track: Track) => ({
  fontFamily: zhFont,
  fontWeight: 700,
  fontSize: SIZE.subtitle,
  letterSpacing: track("0.15em", "0.02em"),
});
const infoStyle = (track: Track) => ({
  fontFamily: zhFont,
  fontWeight: 700,
  fontSize: SIZE.info,
  letterSpacing: track("0.18em", "0.04em"),
});

// ══════════════════ 第 1 頁：系學會招募 ══════════════════
function RecruitSlide({ tx, track, isClone }: { tx: Tx; track: Track; isClone?: boolean }) {
  const [displayText, setDisplayText] = useState("");
  const Heading = isClone ? "p" : "h1"; // 分身不要重複 <h1>（對 Google 比較好）

  // 打字機動畫：兩句輪流。打完停留約 7 秒 → 逐字刪掉 → 換下一句
  useEffect(() => {
    const PHRASES = tx.recruit.phrases;
    let phraseIdx = 0, charIdx = 0, deleting = false;
    let timer: number;
    setDisplayText("");
    const tick = () => {
      const full = PHRASES[phraseIdx];
      if (!deleting) {
        charIdx += 1;
        setDisplayText(full.slice(0, charIdx));
        if (charIdx >= full.length) { deleting = true; timer = window.setTimeout(tick, 7000); return; }
        timer = window.setTimeout(tick, 90);
      } else {
        charIdx -= 1;
        setDisplayText(full.slice(0, Math.max(0, charIdx)));
        if (charIdx <= 0) { deleting = false; phraseIdx = (phraseIdx + 1) % PHRASES.length; timer = window.setTimeout(tick, 500); return; }
        timer = window.setTimeout(tick, 45);
      }
    };
    timer = window.setTimeout(tick, 90);
    return () => window.clearTimeout(timer);
  }, [tx.recruit.phrases]);

  return (
    <div className="hero-content relative z-10 flex flex-col items-center w-full max-w-[1400px] px-5 sm:px-8 self-end" style={{ marginBottom: BUTTONS_FROM_BOTTOM }}>
      <p
        className="text-white text-sm sm:text-base mb-6 sm:mb-8 tracking-[2px] min-h-[1.5em]"
        style={{ fontFamily: monoFont, fontWeight: 700 }}
      >
        {displayText}
        <span className="ml-1 inline-block h-4 w-[0.6ch] align-middle border-r border-white/80 animate-pulse" aria-hidden="true" />
      </p>
      <Heading
        className="hero-flow-text leading-none select-none mb-6 sm:mb-10"
        style={{ fontFamily: zhDisplay, fontWeight: 900, fontSize: SIZE.recruitTitle, letterSpacing: "0.04em" }}
      >
        {tx.recruit.title}
      </Heading>
      <h2
        className="text-white leading-tight select-none mb-10 sm:mb-16"
        style={{ fontFamily: zhDisplay, fontWeight: 900, fontSize: SIZE.recruitSubtitle }}
      >
        {tx.recruit.subtitle}
      </h2>
      <ButtonRow>
        <HeroButton href={LINKS.recruitTeam} track={track}>{tx.recruit.team}</HeroButton>
        <HeroButton href={LINKS.recruitEvents} track={track} outline>{tx.recruit.events}</HeroButton>
      </ButtonRow>
    </div>
  );
}

// ══════════════════ 第 2 頁：全新官方網站 ══════════════════
function OfficialSlide({ tx, track }: { tx: Tx; track: Track }) {
  const bg = asset(IMG.official);
  return (
    <>
      {bg && (
        <img
          src={bg}
          alt=""
          draggable={false}
          className="absolute left-0 top-0 h-full w-full lg:w-[72%] object-cover lg:object-contain object-left-top pt-24 sm:pt-28 pb-20 px-4 lg:px-8 select-none pointer-events-none"
        />
      )}
      {/* 黑色漸層遮罩：手機由上往下、桌機由左往右（深淺調上面的 OFFICIAL_OVERLAY） */}
      <div
        className="official-overlay absolute inset-0 pointer-events-none"
        style={{
          ["--ov-a" as string]: `rgba(0,0,0,${OFFICIAL_OVERLAY.start})`,
          ["--ov-b" as string]: `rgba(0,0,0,${OFFICIAL_OVERLAY.end})`,
        }}
      />

      <div className="hero-content relative z-10 w-full max-w-[1500px] px-5 sm:px-10 lg:px-14 self-end lg:self-auto mb-24 lg:mb-0 flex flex-col items-center lg:items-end text-center lg:text-right lg:mt-[22vh]">
        <h2 className="text-white" style={titleStyle(track)}>{tx.official.title}</h2>
        <p className="text-white mt-3 sm:mt-6" style={subStyle(track)}>{tx.official.subtitle}</p>
        <p className="text-white mt-10 sm:mt-24 mb-6 sm:mb-8" style={infoStyle(track)}>{tx.official.tagline}</p>
        <HeroButton href={LINKS.officialMore} track={track}>{tx.learnMore}</HeroButton>
      </div>
    </>
  );
}

// ══════════════════ 第 3 頁：系友講座 ══════════════════
function SpeakerCard({ name, year, role, track }: { name: string; year: string; role: string; track: Track }) {
  return (
    <div className="bg-white text-black rounded-md shadow-xl px-3 sm:px-4 py-2.5 sm:py-3.5 w-[min(100%,300px)]">
      <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2.5">
        <span style={{ fontFamily: zhDisplay, fontWeight: 900, fontSize: "clamp(1rem, 2vw, 1.7rem)", letterSpacing: track("0.04em") }}>{name}</span>
        <span className="bg-black text-white px-1.5 sm:px-2 py-0.5 leading-none" style={{ fontFamily: monoFont, fontWeight: 700, fontSize: "clamp(0.7rem, 1.2vw, 1.05rem)" }}>
          {year}
        </span>
      </div>
      <p className="whitespace-pre-line" style={{ fontFamily: monoFont, fontWeight: 500, fontSize: "clamp(0.65rem, 1vw, 0.95rem)", lineHeight: 1.6 }}>
        {role}
      </p>
    </div>
  );
}

function SpeakerFigure({ img, side, speaker, track }: { img?: string; side: "left" | "right"; speaker: Tx["talks"]["speakers"][number]; track: Track }) {
  const isLeft = side === "left";
  return (
    <div
      className={`relative flex flex-col justify-end ${isLeft ? "items-start" : "items-end"} lg:absolute lg:bottom-0 ${isLeft ? "lg:left-[3%]" : "lg:right-[3%]"} lg:w-[26vw] lg:max-w-[460px] lg:h-[62%]`}
    >
      {img && (
        <img
          src={img}
          alt={speaker.name}
          draggable={false}
          className={`select-none pointer-events-none object-contain object-bottom h-[30svh] lg:h-full w-auto max-w-full ${isLeft ? "self-start" : "self-end"}`}
          style={{ maskImage: "linear-gradient(to bottom, #000 80%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, #000 80%, transparent 100%)" }}
        />
      )}
      <div className={`absolute bottom-3 lg:bottom-10 ${isLeft ? "left-0" : "right-0"} w-full flex ${isLeft ? "justify-start" : "justify-end"}`}>
        <SpeakerCard {...speaker} track={track} />
      </div>
    </div>
  );
}

function TalksSlide({ tx, track }: { tx: Tx; track: Track }) {
  const [s1, s2] = tx.talks.speakers;
  return (
    <div className="hero-content relative z-10 w-full self-stretch flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center text-center px-5 sm:px-8 lg:pb-[14vh]">
        <h2 className="text-white" style={titleStyle(track)}>{tx.talks.title}</h2>
        <p className="text-white mt-3 sm:mt-5" style={subStyle(track)}>{tx.talks.subtitle}</p>
        <p className="text-white mt-10 sm:mt-[12vh] mb-6 sm:mb-8" style={infoStyle(track)}>{tx.talks.info}</p>
        <ButtonRow>
          <HeroButton href={LINKS.talksMore} track={track}>{tx.learnMore}</HeroButton>
          <HeroButton href={LINKS.talksSignup} track={track} outline>{tx.talks.signup}</HeroButton>
        </ButtonRow>
      </div>
      {/* 手機：兩位講者並排在下方；桌機：各自貼在左下、右下 */}
      <div className="grid grid-cols-2 gap-3 px-4 pb-20 lg:pb-0 lg:block">
        <SpeakerFigure img={asset(IMG.speaker1)} side="left" speaker={s1} track={track} />
        <SpeakerFigure img={asset(IMG.speaker2)} side="right" speaker={s2} track={track} />
      </div>
    </div>
  );
}

// ══════════════════ 第 4 頁：文學院籃球賽 ══════════════════
function BattleSlide({ tx, track }: { tx: Tx; track: Track }) {
  const bg = asset(IMG.battle);
  return (
    <>
      {bg && (
        <img src={bg} alt="" draggable={false} className="absolute inset-0 w-full h-full object-cover object-bottom select-none pointer-events-none" />
      )}
      <div className="absolute inset-0 pointer-events-none" style={{ background: `rgba(0,0,0,${BATTLE_OVERLAY})` }} />
      <div className="hero-content relative z-10 flex flex-col items-center text-center px-5 sm:px-8 self-end" style={{ marginBottom: BUTTONS_FROM_BOTTOM }}>
        <h2 className="text-white" style={{ ...titleStyle(track), textShadow: "0 4px 24px rgba(0,0,0,0.6)" }}>{tx.battle.title}</h2>
        <p className="text-white mt-3 sm:mt-5" style={{ ...subStyle(track), textShadow: "0 2px 16px rgba(0,0,0,0.7)" }}>{tx.battle.subtitle}</p>
        <p className="text-white mt-14 sm:mt-[16vh] mb-6 sm:mb-8" style={{ ...infoStyle(track), textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>{tx.battle.info}</p>
        <ButtonRow>
          <HeroButton href={LINKS.battleMore} track={track}>{tx.learnMore}</HeroButton>
          <HeroButton href={LINKS.battleTeam} track={track} outline>{tx.battle.team}</HeroButton>
        </ButtonRow>
      </div>
    </>
  );
}

// ══════════════════ Hashtag（招募頁專用）══════════════════
type Tag = { id: number; text: string; x: number; y: number; cw: number; ch: number };

function useShuffleBag(items: string[]) {
  const bagRef = useRef<string[]>([]);
  const lastRef = useRef<string | null>(null);
  useEffect(() => { bagRef.current = []; lastRef.current = null; }, [items]);
  return useCallback(() => {
    if (items.length === 0) return "";
    if (bagRef.current.length === 0) {
      const next = [...items];
      for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
      }
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

function HashtagChip({ tag, letterSpacing }: { tag: Tag; letterSpacing: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: tag.x, top: tag.y });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const w = el.offsetWidth, h = el.offsetHeight, M = 12;
    setPos({
      left: Math.min(Math.max(tag.x - w / 2, M), Math.max(M, tag.cw - w - M)),
      top: Math.min(Math.max(tag.y - h / 2, M), Math.max(M, tag.ch - h - M)),
    });
  }, [tag]);
  return (
    <div
      ref={ref}
      className="hashtag-chip absolute bg-white border-2 border-[#FFFFFF] text-black"
      style={{
        left: pos.left,
        top: pos.top,
        animation: `hashtagRoll 420ms cubic-bezier(0.22, 1, 0.36, 1) both, hashtagOut ${EXIT_MS}ms ease-in ${TAG_LIFETIME - EXIT_MS}ms forwards`,
        maxWidth: "calc(100% - 24px)",
        padding: "clamp(0.55rem, 1vw, 1rem) clamp(0.8rem, 1.2vw, 1.1rem)",
        fontFamily: zhDisplay,
        fontWeight: 900,
        fontSize: "clamp(0.95rem, 1.5vw, 1.5rem)",
        letterSpacing,
        lineHeight: 1.2,
      }}
    >
      <span className="hashtag-chip-text">#&nbsp;{tag.text}</span>
    </div>
  );
}

// ══════════════════ 底部頁碼指示器 ══════════════════
const PILL_BG = "#CCCCCC";
function Pagination({ count, index, onSelect, labels, tx }: {
  count: number; index: number; onSelect: (i: number) => void; labels: string[]; tx: Tx;
}) {
  return (
    <div className="absolute z-30 left-1/2 -translate-x-1/2 bottom-6 sm:bottom-10">
      <div
        className="flex items-center rounded-full"
        style={{ background: PILL_BG, padding: "clamp(13px, 1.1vw, 16px) clamp(16px, 1.6vw, 22px)", gap: "clamp(10px, 1vw, 14px)" }}
      >
        {Array.from({ length: count }).map((_, i) => {
          const active = i === index;
          return (
            <button
              key={i}
              type="button"
              aria-current={active ? "true" : undefined}
              aria-label={`${tx.goTo}：${labels[i]}`}
              onClick={() => onSelect(i)}
              className="relative block rounded-full bg-black transition-all duration-300 ease-out hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              style={{ height: "clamp(9px, 0.8vw, 12px)", width: active ? "clamp(28px, 2.6vw, 38px)" : "clamp(9px, 0.8vw, 12px)", ["--tw-ring-offset-color" as string]: PILL_BG }}
            >
              {/* 加大可點範圍（手機手指好點） */}
              <span className="absolute -inset-2" aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════ 主元件 ══════════════════
export default function Hero() {
  const { pick, track, lang } = useI18n();
  const tx = pick(TEXT);
  const count = SLIDE_ORDER.length;

  const sectionRef = useRef<HTMLElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  // ── 無限輪播 ──
  // 軌道實際排法：[最後一張的分身, 第1張, 第2張, …, 最後一張, 第1張的分身]
  // pos＝軌道上的位置（1＝第 1 張）。往右滑到「第1張的分身」後，動畫一結束就瞬間跳回真正的第 1 張，
  // 看起來就像一直往右、永遠接得上，不會整排倒退回去。往左同理。
  const loop = count > 1;
  const [pos, setPos] = useState(loop ? 1 : 0);
  const [animate, setAnimate] = useState(true);
  const index = loop ? (((pos - 1) % count) + count) % count : 0;
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false); // 用鍵盤操作 Hero 時暫停自動輪播
  const [visible, setVisible] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  const go = useCallback((i: number) => { if (loop) { setAnimate(true); setPos(i + 1); } }, [loop]);
  // 還停在分身上（跳回去之前）就不再往前，避免連按跑出軌道
  const next = useCallback(() => { if (loop) { setAnimate(true); setPos((p) => (p >= count + 1 ? p : p + 1)); } }, [loop, count]);
  const prev = useCallback(() => { if (loop) { setAnimate(true); setPos((p) => (p <= 0 ? p : p - 1)); } }, [loop, count]);

  // 停在分身上 → 關掉動畫、瞬間跳回真正那張，下一個畫面再把動畫打開
  const jumpIfClone = useCallback(() => {
    setPos((p) => {
      if (p >= count + 1) { setAnimate(false); return 1; }
      if (p <= 0) { setAnimate(false); return count; }
      return p;
    });
  }, [count]);
  useEffect(() => {
    if (animate) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    return () => cancelAnimationFrame(id);
  }, [animate]);

  // 系統「減少動態效果」
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    setReduceMotion(mq.matches);
    const on = () => setReduceMotion(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);

  // 關閉動畫時不會有 transitionend，直接跳
  useEffect(() => { if (reduceMotion) jumpIfClone(); }, [pos, reduceMotion, jumpIfClone]);

  // Hero 捲出畫面或切到別的分頁時，暫停自動輪播
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  // 自動輪播
  useEffect(() => {
    if (!AUTOPLAY_MS || reduceMotion || hovered || focusWithin || !visible || count < 2) return;
    const t = window.setTimeout(next, AUTOPLAY_MS);
    return () => window.clearTimeout(t);
  }, [index, hovered, focusWithin, visible, reduceMotion, next, count]);

  // 看不到的頁面設為 inert：鍵盤 Tab 不會跳進去、螢幕閱讀器也不會念
  useEffect(() => {
    slideRefs.current.forEach((el, i) => {
      if (!el) return;
      if (i === pos) el.removeAttribute("inert");
      else el.setAttribute("inert", "");
    });
  }, [pos]);

  // ── 手指滑動 / 滑鼠拖曳 ──
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ x: number; y: number; locked: boolean; cancelled: boolean } | null>(null);
  const suppressClickRef = useRef(false);

  const onPointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragRef.current = { x: e.clientX, y: e.clientY, locked: false, cancelled: false };
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d || d.cancelled) return;
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      if (!d.locked) {
        if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { d.cancelled = true; return; } // 上下捲動：交給瀏覽器
        if (Math.abs(dx) > 8) { d.locked = true; setDragging(true); }
      }
      if (d.locked) setDragX(dx);
    };
    const onUp = (e: PointerEvent) => {
      const d = dragRef.current;
      dragRef.current = null;
      if (!d || !d.locked) return;
      const dx = e.clientX - d.x;
      const w = sectionRef.current?.offsetWidth ?? window.innerWidth;
      suppressClickRef.current = true; // 拖曳結束後的那一下「點擊」不算
      window.setTimeout(() => { suppressClickRef.current = false; }, 0);
      setDragging(false);
      setDragX(0);
      if (Math.abs(dx) > Math.min(80, w * 0.15)) {
        if (dx < 0) next(); else prev();
      }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [next, prev]);

  const onClickCapture = (e: ReactMouseEvent) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // ── Hashtag（只在招募頁）──
  const idRef = useRef(0);
  const timersRef = useRef<Set<number>>(new Set());
  const [tags, setTags] = useState<Tag[]>([]);
  const nextHashtag = useShuffleBag(tx.recruit.hashtags);

  const handleClick = (e: ReactMouseEvent<HTMLElement>) => {
    if (SLIDE_ORDER[index] !== "recruit") return;
    const target = e.target as HTMLElement;
    if (target.closest("a, button, [data-no-hashtag]")) return;
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const newTag: Tag = { id: idRef.current++, text: nextHashtag(), x: e.clientX - rect.left, y: e.clientY - rect.top, cw: rect.width, ch: rect.height };
    setTags((p) => [...p, newTag].slice(-MAX_TAGS));
    const timer = window.setTimeout(() => {
      setTags((p) => p.filter((t) => t.id !== newTag.id));
      timersRef.current.delete(timer);
    }, TAG_LIFETIME);
    timersRef.current.add(timer);
  };

  useEffect(() => {
    const timers = timersRef.current;
    const clear = () => setTags([]);
    window.addEventListener("resize", clear);
    return () => { window.removeEventListener("resize", clear); timers.forEach((t) => window.clearTimeout(t)); timers.clear(); };
  }, []);
  useEffect(() => { setTags([]); }, [lang, index]); // 換語言或換頁時清掉

  // ── 鍵盤 ← →：Hero 在畫面上時就能用（正在打字的輸入框除外）──
  const visibleRef = useRef(true);
  visibleRef.current = visible;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.defaultPrevented) return;
      if (!visibleRef.current) return;
      const el = document.activeElement as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      // 焦點在 Hero 外的其他互動元件（例如別區的輪播）就不搶
      if (el && el !== document.body && !sectionRef.current?.contains(el)) return;
      e.preventDefault();
      if (e.key === "ArrowRight") next(); else prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // ── 觸控板兩指左右滑（Mac / Windows 精確式觸控板、有左右滾輪的滑鼠）──
  const wheelRef = useRef({ acc: 0, lockUntil: 0 });
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // 上下捲動照常
      e.preventDefault(); // 避免瀏覽器把左右滑當成「上一頁」
      const w = wheelRef.current;
      const now = Date.now();
      if (now < w.lockUntil) return; // 一次滑動只換一頁（慣性滾動期間不再觸發）
      w.acc += e.deltaX;
      if (Math.abs(w.acc) > 40) {
        if (w.acc > 0) next(); else prev();
        w.acc = 0;
        w.lockUntil = now + SLIDE_MS + 300;
      }
    };
    const reset = () => { wheelRef.current.acc = 0; };
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("mouseleave", reset);
    return () => { el.removeEventListener("wheel", onWheel); el.removeEventListener("mouseleave", reset); };
  }, [next, prev]);

  const labels = SLIDE_ORDER.map((id) => tx.slideNames[id]);
  // 軌道上的每一格（含頭尾分身）
  const trackItems = loop
    ? [
        { key: "clone-last", real: count - 1, clone: true },
        ...SLIDE_ORDER.map((id, i) => ({ key: id, real: i, clone: false })),
        { key: "clone-first", real: 0, clone: true },
      ]
    : SLIDE_ORDER.map((id, i) => ({ key: id, real: i, clone: false }));
  const renderSlide = (id: SlideId, isClone = false) => {
    switch (id) {
      case "recruit": return <RecruitSlide tx={tx} track={track} isClone={isClone} />;
      case "official": return <OfficialSlide tx={tx} track={track} />;
      case "talks": return <TalksSlide tx={tx} track={track} />;
      case "battle": return <BattleSlide tx={tx} track={track} />;
    }
  };

  return (
    <section
      ref={sectionRef}
      onClick={handleClick}
      onClickCapture={onClickCapture}
      onPointerDown={onPointerDown}
      onFocus={() => setFocusWithin(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusWithin(false); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-roledescription="carousel"
      aria-label="Hero"
      className={`relative min-h-[100svh] bg-black overflow-hidden ${dragging ? "cursor-grabbing select-none" : ""}`}
      style={{ touchAction: "pan-y", overscrollBehaviorX: "contain" }}
    >
      <style>{`
        @keyframes heroFlow { 0% { background-position: 200% 50%; } 100% { background-position: -200% 50%; } }
        .hero-flow-text {
          background: linear-gradient(90deg, #2F9EBD 0%, #D14B4B 25%, #2F9EBD 50%, #D14B4B 75%, #2F9EBD 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent; color: transparent;
          animation: heroFlow 12s linear infinite;
        }
        .official-overlay { background: linear-gradient(to bottom, var(--ov-a) 0%, var(--ov-a) 35%, var(--ov-b) 75%); }
        @media (min-width: 1024px) {
          .official-overlay { background: linear-gradient(to right, var(--ov-a) 0%, var(--ov-a) 45%, var(--ov-b) 80%); }
        }
        /* 切到這一頁時，文字淡入上浮 */
        .hero-slide .hero-content { transition: opacity 600ms ease 200ms, transform 600ms cubic-bezier(0.22,1,0.36,1) 200ms; }
        .hero-slide[data-active="false"] .hero-content { opacity: 0; transform: translateY(16px); }

        @keyframes hashtagRoll {
          0% { clip-path: inset(0 100% 0 0); transform: scale(0.92); }
          70% { transform: scale(1.03); }
          100% { clip-path: inset(0 0 0 0); transform: scale(1); }
        }
        @keyframes hashtagText { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes hashtagOut { from { opacity: 1; transform: translateY(0) scale(1); } to { opacity: 0; transform: translateY(-10px) scale(0.96); } }
        .hashtag-chip { transform-origin: left center; }
        .hashtag-chip-text { display: inline-block; animation: hashtagText 280ms ease-out 220ms both; }

        @media (prefers-reduced-motion: reduce) {
          .hero-flow-text, .hashtag-chip, .hashtag-chip-text { animation: none !important; }
          .hero-slide .hero-content { transition: none !important; }
        }
      `}</style>

      {/* ── 輪播軌道 ── */}
      <div
        className="flex min-h-[100svh]"
        style={{
          transform: `translateX(calc(${-pos * 100}% + ${dragX}px))`,
          transition: dragging || reduceMotion || !animate ? "none" : `transform ${SLIDE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        }}
        onTransitionEnd={(e) => {
          if (e.target === e.currentTarget && e.propertyName === "transform") jumpIfClone();
        }}
      >
        {trackItems.map((item, t) => (
          <div
            key={item.key}
            ref={(el) => { slideRefs.current[t] = el; }}
            data-active={item.real === index}
            className="hero-slide relative w-full shrink-0 min-h-[100svh] flex items-center justify-center overflow-hidden pt-24 sm:pt-28"
            {...(item.clone
              ? { "aria-hidden": true }
              : { role: "group", "aria-roledescription": "slide", "aria-label": `${item.real + 1} / ${count}：${labels[item.real]}` })}
          >
            {renderSlide(SLIDE_ORDER[item.real], item.clone)}
          </div>
        ))}
      </div>

      {/* ── 底部頁碼 ── */}
      {count > 1 && <Pagination count={count} index={index} onSelect={go} labels={labels} tx={tx} />}

      {/* 螢幕閱讀器：使用者操作換頁時念出目前是哪一頁（自動輪播時不念，免得一直打擾） */}
      <p className="sr-only" aria-live={focusWithin ? "polite" : "off"}>{`${tx.nowShowing} ${index + 1} / ${count}：${labels[index]}`}</p>

      {/* ── Hashtag 圖層 ── */}
      <div className="absolute inset-0 z-20 pointer-events-none select-none" aria-hidden="true">
        {tags.map((tag) => (
          <HashtagChip key={tag.id} tag={tag} letterSpacing={track("0.15em", "0.03em")} />
        ))}
      </div>
    </section>
  );
}