import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { PageEyebrow, Reveal, useIsDesktop, fitLine } from "./shared";

// ─────────────────────────────────────────────────────────────────────────
// 加入我們（Join Us · Apple 式捲動頁）
// A. Hero：左標題文案 ＋ 右「火鍋店飲料機」（五部門色飲料、波動動畫）
//          底下五顆 PRESS：「按住」飲料往下流、放開就停；流乾後放開會自動補滿。
//          機台上方 ntulissa 草寫字、畫面底部 Recruit 字 → 讀 imports/JoinUs/ 的圖檔。
// B. 音樂播放器 UI（介紹加入的好處）。正方形專輯（紅藍漸層外框）、上一首／播放／下一首、
//          進度條（每首 10 秒自動切下一首）、右上角 COVER / CAPTION 切換 → 專輯翻面到說明。
// C. 部門招募：五顆部門色球並排，左右黑色漸層遮罩，
//          只清楚看到正中央那顆；左右切換顯示該部門招募資訊。
// D. 加入手續三步驟：
//    ① 線上登記：手機待辦清單，最上面一項打勾→淡出消失→下面遞補、底部補新的一項（循環）。
//    ② 輕鬆面談：彈珠台，球經過不規則鋼丁隨機落入五部門出口；自動重播，每次結果都和上一次不同。
//    ③ 正式加入：幹部證明卡，外框描繪→Logo→頭像→欄位打字→簽名波浪→漸層印章蓋下→反光掃過（循環）。
// E. 歡迎你的加入：六顆球（會長＋五部門），點一下頭頂冒出「+1」；下方「加入我們」連到 Google 表單。
//
// ★ 所有「大小(px)／位置(XY px)」都集中在下面的《版面常數區》，改那裡就好。
// ─────────────────────────────────────────────────────────────────────────

// ── 字型（與全站一致）──
const zhHead = "'Chiron Hei HK Text','Noto Sans TC', sans-serif"; // 標題／敘述
const zhBody = "'Noto Sans TC', sans-serif";                       // 內文／按鈕
const mono   = "'Ubuntu Sans Mono','Noto Sans TC', monospace";     // 英文小字／數值
const latin  = "'Josefin Sans', sans-serif";                        // PRESS / COVER / CAPTION
const serif  = "'Noto Serif TC', serif";                            // 專輯封面直排大字（請確認已載入 Noto Serif TC 900）

// ── imports/JoinUs/*.svg|png 自動讀取（缺檔不會壞，會顯示佔位文字） ──
// 若原始碼不在 /src 底下，改下面的 glob 路徑字串即可；
// 舊版 Vite 請把 `query:"?url", import:"default"` 換成 `as:"url"`。
const JOIN_ASSETS = import.meta.glob("/src/**/JoinUs/*.{svg,png,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
function joinAsset(...files: string[]): string | undefined {
  for (const f of files) {
    const hit = Object.keys(JOIN_ASSETS).find((p) => p.endsWith(`/JoinUs/${f}`));
    if (hit) return JOIN_ASSETS[hit];
  }
  return undefined;
}

// ══════════════════════════════════════════════════════════════
// ★★ 版面常數區：size=字級(px)；x/y=位移(px，正x=右、正y=下) ★★
// ══════════════════════════════════════════════════════════════

// ── A. Hero ─────────────────────────────────────────────
const HERO_LAYOUT = {
  title: { size: 58, lh: 1.6, x: 0, y: -40 },  // 主標題（兩行）
  sub:   { size: 22, lh: 2.1, x: 0, y: 20 },   // 副標（兩行）
};
const MACHINE = {
  w: 560,            // 飲料機最大寬度(px)
  tankH: 250,        // 飲料槽高度(px，手機會自動縮)
  gap: 10,           // 槽與槽的間距(px)
  full: 0.6,         // 滿杯時液面高度（佔槽高比例）
  drainPerSec: 0.28, // 按住時每秒流掉多少（1 = 整杯；0.28 ≈ 3.6 秒流乾）
  refillDelay: 1200, // 流乾放開後，等多久開始補滿(ms)
  refillMs: 1400,    // 補滿動畫時間(ms)
  x: 0, y: 0,
};
const RECRUIT = { h: 44, x: 0, y: 0 }; // 底部 Recruit 圖高度與位移

// ── B. 為何要加入？（音樂播放器）──────────────────────────
const PLAYER_LAYOUT = {
  album:   "min(80vw, 520px, 50vh)",   // 專輯邊長
  coverChar: "calc(min(80vw, 520px, 50vh) * 0.125)", // 封面直排字大小（找不到 coverN.svg 時的備用文字才會用到）
  coverSvg: "54%",                       // 封面 SVG（imports/JoinUs/cover1.svg…）最大寬高，佔專輯邊長比例
  toggle: {                              // 專輯右上角 COVER / CAPTION 切換鈕
    w: "clamp(84px, calc(min(80vw, 520px, 50vh) * 0.26), 136px)", // 寬度（高度自動 = 寬 × 0.3）
    inset: "4.5%",                       // 距離專輯上緣、右緣
    font: "clamp(8px, calc(min(80vw, 520px, 50vh) * 0.021), 11px)", // 圓鈕內文字大小
  },
  caption: { size: 22, lh: 2.5 },        // 翻面說明文字
};
const TRACK_MS = 10_000; // ★ 每首展示時間（毫秒）

// ── C. 部門招募 ─────────────────────────────────────────
const DEPT_LAYOUT = {
  ball: "clamp(96px, 9.6vw, 196px)",   // 球直徑
  ballGap: "clamp(130px, 17vw, 350px)",// 相鄰兩球中心距離
  name: { size: 50 },                  // 部門中文名
  en:   { size: 20 },                  // 英文名
  cardTitle: { size: 24 },             // 「在這裡，你會得到」
  item: { size: 26 },                  // 卡片條列
  quizCta: { size: 24 },               // 底部「不知道自己屬於哪個部門？」
};
const QUIZ_HREF = "#/dept-quiz"; // 部門適性測驗頁路由（DeptQuizPage.tsx）
const GRADIENT_TEXT = "linear-gradient(90deg, #D14B4B 0%, #2F9EBD 100%)";

// ── D. 加入手續三步驟 ───────────────────────────────────
const STEP_LAYOUT = {
  badge: 60,                      // 步驟編號圓圈直徑(px)
  title: { size: 104, x: 0, y: 0 }, // 「線上登記」等大標
  sub:   { size: 22,  x: 0, y: 0 }, // 小標
};
const STEPS_TEXT = [
  { title: "線上登記", sub: "填寫招募意向表" },
  { title: "輕鬆面談", sub: "雙向交流與認識" },
  { title: "正式加入", sub: "卸任後即可領取就任證明" },
];
const PHONE = { w: 300, h: 470, itemH: 62, itemGap: 14, cycle: 2000 }; // 手機外觀與清單尺寸；cycle=每幾毫秒勾掉一項
const CERT  = { w: 380, cycle: 7500 };                                  // 幹部證明寬度；每幾毫秒重播一次動畫
const PACHINKO = { w: 480, pauseTop: 600, pauseEnd: 1800 };            // 彈珠台寬度；球在頂端停留／落定後停留(ms)

// ── E. 歡迎你的加入 ─────────────────────────────────────
const WELCOME_LAYOUT = {
  ball:   { size: 68, gap: 34 },   // 六顆球直徑與間距
  plus:   { size: 36 },            // 「+1」字級
  title:  { size: 120, x: 0, y: 0 },
  sub:    { size: 22, x: 0, y: 0 },
  button: { size: 20, x: 0, y: 0 },
};
const LEADER_COLOR = "#A27F00"; // 正副會長色（最左那顆）
const JOIN_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdzPM3pqgnH_osifNrCSB61iGVVZxB1FmxhWsEqZQeOdBMY0w/viewform?usp=header";

// ── 五部門資料（顏色與 TeamSection 一致；條列為佔位範例，自行替換）──
const DEPTS = [
  { key: "gen", name: "行政部",     en: "GENERAL AFFAIRS",   color: "#915E3E",
    gains: ["預算編列與財務管理", "行政流程與文書實務", "統籌規劃與細節掌控"],
    needs: ["細心謹慎", "條理分明", "值得信賴"] },
  { key: "eve", name: "活動部",     en: "EVENTS AFFAIRS",            color: "#9F353A",
    gains: ["大型活動企劃與執行", "跨單位溝通協調", "臨場應變與團隊領導"],
    needs: ["熱情活潑", "點子源源不絕", "享受舞台"] },
  { key: "aca", name: "學術部",     en: "ACADEMIC AFFAIRS",  color: "#42602D",
    gains: ["課程資訊蒐集與統整", "學術領域知識拓展", "溝通合作與應變能力"],
    needs: ["充滿好奇", "主動探索", "認真負責"] },
  { key: "ima", name: "形象宣傳部", en: "IMAGE & PUBLICITY", color: "#572A3F",
    gains: ["視覺設計與品牌經營", "社群企劃與文案撰寫", "攝影剪輯實戰經驗"],
    needs: ["美感敏銳", "樂於創作", "追求細節"] },
  { key: "sp",  name: "體育部",     en: "SPORTS AFFAIRS",            color: "#23658A",
    gains: ["系隊與賽事籌辦經驗", "團隊合作與體能挑戰", "跨系交流人脈"],
    needs: ["熱愛運動", "積極投入", "團隊精神"] },
];

// ── 播放清單：cover = 封面兩直欄（各 4 字最好看）；caption = 翻面說明（佔位範例）──
const TRACKS = [
  { cover: ["掌握系上", "生存指南"], caption: "直接混熟各屆學長姐。從私房考古題、選課避雷指南到專題指導，有問題直接私訊問，少走兩年彎路。" },
  { cover: ["累積實戰", "經驗履歷"], caption: "從企劃、預算到上線執行，每一場活動都是一份作品。面試時說得出口的經歷，從這裡開始累積。" },
  { cover: ["結識跨屆", "革命夥伴"], caption: "一起熬夜趕企劃、一起在活動後收場。這群人會是你大學四年，甚至畢業後最常聯絡的朋友。" },
  { cover: ["親手策劃", "圖資舞台"], caption: "迎新、系烈、系週、系學會網站——你的點子不只停在紙上，而是真的被全系看見。" },
  { cover: ["搶先掌握", "系上資源"], caption: "講座、實習、系上補助與各種福利消息，第一手就在你手上，機會不再擦肩而過。" },
];

// ── helpers ──
const move = (c: { x?: number; y?: number }): CSSProperties => ({ transform: `translate(${c.x ?? 0}px, ${c.y ?? 0}px)` });
// 手機／平板版：X/Y 位移一律不套用（那些數字是照電腦版畫面調的，套在小螢幕會跑版）
const moveIf = (on: boolean, c: { x?: number; y?: number }): CSSProperties => (on ? move(c) : {});
const GRADIENT_STROKE = "linear-gradient(180deg, #D14B4B 0%, #2F9EBD 100%)";

// 無縫波浪路徑：viewBox 200×20，週期 100（左右兩段相同 → translateX(-50%) 可無縫循環）
const WAVE_PATH = (() => {
  const pts: string[] = [];
  for (let x = 0; x <= 200; x += 2) {
    const y = 9 + 3.2 * Math.sin((2 * Math.PI * x) / 50) + 1.8 * Math.sin((2 * Math.PI * x) / 25 + 1.2);
    pts.push(`${x},${y.toFixed(2)}`);
  }
  return `M${pts.join(" L")} L200,20 L0,20 Z`;
})();

// ══════════════════════════════════════════════════════════════
// A. 飲料機
// ══════════════════════════════════════════════════════════════
function DrinkMachine() {
  const logo = joinAsset("ntulissa.svg", "ntulissa.png");
  const isDesktop = useIsDesktop();
  const n = DEPTS.length;
  const [levels, setLevels] = useState<number[]>(() => Array(n).fill(1));
  const [held, setHeld] = useState<boolean[]>(() => Array(n).fill(false));
  const [refilling, setRefilling] = useState<boolean[]>(() => Array(n).fill(false));

  const heldRef = useRef<boolean[]>(Array(n).fill(false));
  const levelsRef = useRef(levels);
  levelsRef.current = levels;
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef(0);
  const timers = useRef<number[]>([]);

  const setAt = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>) => (i: number, v: T) =>
    setter((arr) => arr.map((x, j) => (j === i ? v : x)));

  // 按住期間的逐格流動
  const tick = useCallback((t: number) => {
    const dt = lastRef.current ? (t - lastRef.current) / 1000 : 0;
    lastRef.current = t;
    setLevels((prev) => prev.map((lv, i) => (heldRef.current[i] ? Math.max(0, lv - MACHINE.drainPerSec * dt) : lv)));
    if (heldRef.current.some(Boolean)) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      rafRef.current = null;
      lastRef.current = 0;
    }
  }, []);

  const start = (i: number) => {
    if (heldRef.current[i]) return;
    window.clearTimeout(timers.current[i]);
    setAt(setRefilling)(i, false);
    heldRef.current[i] = true;
    setAt(setHeld)(i, true);
    if (rafRef.current == null) rafRef.current = requestAnimationFrame(tick);
  };

  const stop = (i: number) => {
    if (!heldRef.current[i]) return;
    heldRef.current[i] = false;
    setAt(setHeld)(i, false);
    // 流乾了 → 等一下自動補滿（沒流乾就停在原位）
    if (levelsRef.current[i] <= 0.002) {
      window.clearTimeout(timers.current[i]);
      timers.current[i] = window.setTimeout(() => {
        setAt(setRefilling)(i, true);
        setAt(setLevels)(i, 1);
        timers.current[i] = window.setTimeout(() => setAt(setRefilling)(i, false), MACHINE.refillMs);
      }, MACHINE.refillDelay);
    }
  };

  useEffect(() => () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    timers.current.forEach((t) => window.clearTimeout(t));
  }, []);

  const cols: CSSProperties = { display: "grid", gridTemplateColumns: `repeat(${n}, 1fr)`, gap: `${MACHINE.gap}px` };

  return (
    <div className="w-full select-none" style={{ maxWidth: `${MACHINE.w}px`, ...moveIf(isDesktop, MACHINE) }}>
      {/* 頂部招牌：ntulissa 草寫 */}
      <div className="flex items-center justify-center rounded-[22px] border-[1.5px] border-white/90 mb-[10px]" style={{ height: "clamp(52px, 5vw, 68px)" }}>
        {logo ? (
          <img src={logo} alt="ntu lis sa" className="h-[58%] w-auto object-contain" draggable={false} />
        ) : (
          <span className="text-white/30" style={{ fontFamily: mono, fontSize: "0.75rem", letterSpacing: "0.2em" }}>JoinUs/ntulissa.svg</span>
        )}
      </div>

      {/* 五個飲料槽 */}
      <div style={cols}>
        {DEPTS.map((d, i) => {
          const lv = levels[i];
          const pouring = held[i] && lv > 0;
          return (
            <div key={d.key} className="relative overflow-hidden border-[1.5px] border-white/90 bg-black" style={{ height: `clamp(170px, 22vw, ${MACHINE.tankH}px)`, borderRadius: "18px 18px 20px 20px" }}>
              <div
                className="absolute left-0 right-0 bottom-0"
                style={{
                  height: `${lv * MACHINE.full * 100}%`,
                  background: d.color,
                  transition: refilling[i] ? `height ${MACHINE.refillMs}ms cubic-bezier(0.22,1,0.36,1)` : "height 80ms linear",
                }}
              >
                <svg
                  className={`jn-wave ${pouring ? "jn-wave-fast" : ""}`}
                  viewBox="0 0 200 20"
                  preserveAspectRatio="none"
                  aria-hidden
                  style={{
                    position: "absolute", left: 0, bottom: "calc(100% - 1px)", width: "200%", height: "14px",
                    opacity: lv > 0.002 ? 1 : 0, transition: "opacity .2s",
                    ["--jn-dur" as string]: `${2.4 + i * 0.35}s`,
                  } as CSSProperties}
                >
                  <path d={WAVE_PATH} fill={d.color} />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* 出水口面板：PRESS（按住流、放開停） */}
      <div className="rounded-[22px] border-[1.5px] border-white/90 mt-[10px] px-[10px] pt-4 pb-2" style={cols}>
        {DEPTS.map((d, i) => {
          const pressed = held[i];
          const pouring = pressed && levels[i] > 0;
          return (
            <div key={d.key} className="flex flex-col items-center">
              <button
                type="button"
                aria-label={`按住倒出${d.name}飲料`}
                onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); start(i); }}
                onPointerUp={() => stop(i)}
                onPointerCancel={() => stop(i)}
                onLostPointerCapture={() => stop(i)}
                onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); if (!e.repeat) start(i); } }}
                onKeyUp={(e) => { if (e.key === " " || e.key === "Enter") stop(i); }}
                onBlur={() => stop(i)}
                onContextMenu={(e) => e.preventDefault()}
                className="w-full max-w-[96px] rounded-full border-[1.5px] border-white py-[5px] transition-colors duration-150"
                style={{
                  fontFamily: latin, fontWeight: 700, fontSize: "clamp(9px, 0.8vw, 12px)", letterSpacing: isDesktop ? "0.38em" : "0.2em", paddingLeft: isDesktop ? "0.38em" : "0.2em",
                  background: pressed ? "#fff" : "transparent", color: pressed ? "#000" : "#fff",
                  touchAction: "none", WebkitTouchCallout: "none", userSelect: "none",
                }}
              >
                PRESS
              </button>
              {/* 出水口 \ / ＋ 流下的飲料 */}
              <div className="relative flex justify-center w-full" style={{ height: "64px" }}>
                <svg width="46" height="20" viewBox="0 0 46 20" className="mt-2" aria-hidden>
                  <path d="M4 3 L16 14 M42 3 L30 14" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <span className="jn-stream" style={{ ["--c" as string]: d.color, transform: pouring ? "scaleY(1)" : "scaleY(0)", opacity: pouring ? 1 : 0 } as CSSProperties} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// B. 音樂播放器
// ══════════════════════════════════════════════════════════════
const fmt = (ms: number) => `0:${String(Math.min(99, Math.floor(ms / 1000))).padStart(2, "0")}`;

function IconPrev() {
  return <svg viewBox="0 0 80 60" width="100%" height="100%" aria-hidden><path d="M38 9 L10 30 L38 51 Z M72 9 L44 30 L72 51 Z" fill="#fff" stroke="#fff" strokeWidth="5" strokeLinejoin="round" /></svg>;
}
function IconNext() {
  return <svg viewBox="0 0 80 60" width="100%" height="100%" aria-hidden><path d="M8 9 L36 30 L8 51 Z M42 9 L70 30 L42 51 Z" fill="#fff" stroke="#fff" strokeWidth="5" strokeLinejoin="round" /></svg>;
}
function IconPlay() {
  return <svg viewBox="0 0 60 60" width="100%" height="100%" aria-hidden><path d="M16 8 L52 30 L16 52 Z" fill="#fff" stroke="#fff" strokeWidth="5" strokeLinejoin="round" /></svg>;
}
function IconPause() {
  return <svg viewBox="0 0 60 60" width="100%" height="100%" aria-hidden><rect x="13" y="9" width="12" height="42" rx="3" fill="#fff" /><rect x="35" y="9" width="12" height="42" rx="3" fill="#fff" /></svg>;
}

// 專輯一面：紅藍漸層外框（無填色）＋ 內容
function AlbumFace({ back = false, bg, children }: { back?: boolean; bg: string; children: ReactNode }) {
  return (
    <div
      className="absolute inset-0"
      style={{ padding: "3px", background: GRADIENT_STROKE, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: back ? "rotateY(180deg)" : undefined }}
    >
      <div className="w-full h-full flex items-center justify-center overflow-hidden" style={{ background: bg }}>{children}</div>
    </div>
  );
}

// COVER / CAPTION 切換（比照 TeamSection 的滑動 toggle，圓鈕內放文字）
function SideToggle({ caption, onToggle }: { caption: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={caption}
      aria-label="切換封面／說明"
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className="relative rounded-full bg-black transition-transform active:scale-95"
      style={{ width: PLAYER_LAYOUT.toggle.w, aspectRatio: "10 / 3", border: "2px solid #fff" }}
    >
      <span
        className="absolute rounded-full bg-white flex items-center justify-center"
        style={{ top: "2px", bottom: "2px", width: "52%", left: caption ? "calc(48% - 2px)" : "2px", transition: "left 360ms cubic-bezier(0.4,0,0.2,1)" }}
      >
        <span key={caption ? "cap" : "cov"} className="jn-fade" style={{ fontFamily: latin, fontWeight: 700, fontSize: PLAYER_LAYOUT.toggle.font, letterSpacing: "0.06em", color: "#140606", paddingTop: "1px", whiteSpace: "nowrap" }}>
          {caption ? "CAPTION" : "COVER"}
        </span>
      </span>
    </button>
  );
}

function AlbumPlayer() {
  const [idx, setIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [caption, setCaption] = useState(false);
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const isDesktop = useIsDesktop();

  // 捲到畫面內才開始計時（Apple 式：看到才播）
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || !inView) return;
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = t - last;
      last = t;
      setElapsed((e) => e + dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, inView]);

  // 10 秒到 → 自動下一首（循環）
  useEffect(() => {
    if (elapsed >= TRACK_MS) {
      setIdx((i) => (i + 1) % TRACKS.length);
      setElapsed(0);
    }
  }, [elapsed]);

  const go = (i: number) => { setIdx((i + TRACKS.length) % TRACKS.length); setElapsed(0); };
  const prev = () => (elapsed > 1500 ? setElapsed(0) : go(idx - 1));
  const next = () => go(idx + 1);
  const track = TRACKS[idx];
  const pct = Math.min(100, (elapsed / TRACK_MS) * 100);
  const coverSvg = joinAsset(`cover${idx + 1}.svg`);

  return (
    <div ref={rootRef} className="flex flex-col items-center w-full">
      {/* 專輯（可翻面） */}
      <div className="relative" style={{ width: PLAYER_LAYOUT.album, aspectRatio: "1 / 1", perspective: "1800px" }}>
        <div
          className="relative w-full h-full cursor-pointer"
          onClick={() => setCaption((c) => !c)}
          style={{ transformStyle: "preserve-3d", transition: "transform 0.9s cubic-bezier(0.22,1,0.36,1)", transform: caption ? "rotateY(180deg)" : "none" }}
        >
          <AlbumFace bg="#000">
            {coverSvg ? (
              // imports/JoinUs/cover{N}.svg（N = 第幾首，從 1 開始）
              <img
                key={`c${idx}`}
                src={coverSvg}
                alt={track.cover.join(" ")}
                draggable={false}
                className="jn-fade select-none"
                style={{ maxWidth: PLAYER_LAYOUT.coverSvg, maxHeight: PLAYER_LAYOUT.coverSvg, width: "auto", height: "auto", objectFit: "contain" }}
              />
            ) : (
              // 備用：還沒放 SVG 時用文字顯示
              <div key={`c${idx}`} className="jn-fade flex" style={{ gap: `calc(${PLAYER_LAYOUT.coverChar} * 1.6)` }}>
                {track.cover.map((col, ci) => (
                  <div key={ci} className="flex flex-col items-center" style={{ fontFamily: serif, fontWeight: 900, fontSize: PLAYER_LAYOUT.coverChar, lineHeight: 1.38, color: "#fff" }}>
                    {Array.from(col).map((ch, k) => <span key={k}>{ch}</span>)}
                  </div>
                ))}
              </div>
            )}
          </AlbumFace>
          <AlbumFace back bg="#1E1E1E">
            <p key={`t${idx}`} className="jn-fade text-white" style={{ fontFamily: zhBody, fontWeight: 700, fontSize: `clamp(15px, 1.6vw, ${PLAYER_LAYOUT.caption.size}px)`, lineHeight: PLAYER_LAYOUT.caption.lh, letterSpacing: "0.14em", padding: "0 11%", textAlign: "justify" }}>
              {track.caption}
            </p>
          </AlbumFace>
        </div>

        {/* COVER / CAPTION 切換：固定在專輯右上角（放在翻轉層外面，翻面時不會跟著轉） */}
        <div className="absolute z-10" style={{ top: PLAYER_LAYOUT.toggle.inset, right: PLAYER_LAYOUT.toggle.inset, transform: "translateZ(1px)" }}>
          <SideToggle caption={caption} onToggle={() => setCaption((c) => !c)} />
        </div>
      </div>

      {/* 播放控制 */}
      <div className="flex items-center justify-center mt-[clamp(20px,4vh,48px)]" style={{ gap: isDesktop ? "clamp(56px, 10vw, 150px)" : "clamp(36px, 10vw, 80px)" }}>
        <button type="button" onClick={prev} aria-label="上一則" className="transition-transform active:scale-90 hover:opacity-80" style={{ width: isDesktop ? "76px" : "60px", height: isDesktop ? "58px" : "46px" }}><IconPrev /></button>
        <button type="button" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "暫停" : "播放"} className="transition-transform active:scale-90 hover:opacity-80" style={{ width: isDesktop ? "58px" : "46px", height: isDesktop ? "58px" : "46px" }}>
          {playing ? <IconPause /> : <IconPlay />}
        </button>
        <button type="button" onClick={next} aria-label="下一則" className="transition-transform active:scale-90 hover:opacity-80" style={{ width: isDesktop ? "76px" : "60px", height: isDesktop ? "58px" : "46px" }}><IconNext /></button>
      </div>

      {/* 進度條（可點擊跳轉） */}
      <div className="w-full mt-[clamp(18px,4vh,48px)]" style={{ maxWidth: "1140px" }}>
        <div
          className="relative h-[14px] rounded-full cursor-pointer"
          style={{ background: "#4A4A4A" }}
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setElapsed(Math.max(0, Math.min(0.999, (e.clientX - r.left) / r.width)) * TRACK_MS);
          }}
        >
          <div className="absolute left-0 top-0 bottom-0 rounded-full bg-white" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between mt-3 text-white/45" style={{ fontFamily: mono, fontSize: "13px", letterSpacing: "0.12em" }}>
          <span>{fmt(elapsed)}</span>
          <span>{String(idx + 1).padStart(2, "0")} / {String(TRACKS.length).padStart(2, "0")}</span>
          <span>{fmt(TRACK_MS)}</span>
        </div>
      </div>

    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// C. 部門招募輪播
// ══════════════════════════════════════════════════════════════
function DeptRecruit() {
  const n = DEPTS.length;
  const [active, setActive] = useState(2);
  // 相對偏移：-2..2（環狀）
  const wrap = (d: number) => { const m = ((d % n) + n) % n; return m > n / 2 ? m - n : m; };
  const offsets = DEPTS.map((_, i) => wrap(i - active));
  const prevOffsets = useRef<number[]>(offsets);
  const jumps = offsets.map((o, i) => Math.abs(o - prevOffsets.current[i]) > 2); // 從最右跳到最左 → 不做過場（藏在遮罩下）
  useEffect(() => { prevOffsets.current = offsets; });

  const go = (d: number) => setActive((a) => (a + d + n) % n);
  const dept = DEPTS[active];
  const swipeX = useRef<number | null>(null);
  const isDesktop = useIsDesktop();

  return (
    <div
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "ArrowLeft") go(-1); if (e.key === "ArrowRight") go(1); }}
      className="outline-none"
    >
      {/* 五顆球 ＋ 黑色漸層遮罩 */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: DEPT_LAYOUT.ball, ["--ball" as string]: DEPT_LAYOUT.ball, ["--gap" as string]: DEPT_LAYOUT.ballGap, touchAction: "pan-y" } as CSSProperties}
        onPointerDown={(e) => { swipeX.current = e.clientX; }}
        onPointerUp={(e) => {
          if (swipeX.current == null) return;
          const dx = e.clientX - swipeX.current;
          swipeX.current = null;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        }}
      >
        {DEPTS.map((d, i) => {
          const o = offsets[i];
          return (
            <button
              key={d.key}
              type="button"
              aria-label={d.name}
              onClick={() => setActive(i)}
              className="absolute top-0 rounded-full"
              style={{
                left: "50%",
                width: "var(--ball)",
                height: "var(--ball)",
                background: d.color,
                transform: `translateX(calc(-50% + ${o} * var(--gap))) scale(${o === 0 ? 1 : 0.92})`,
                opacity: o === 0 ? 1 : Math.abs(o) === 1 ? 0.6 : 0.4,
                transition: jumps[i] ? "none" : "transform 700ms cubic-bezier(0.22,1,0.36,1), opacity 700ms ease",
              }}
            />
          );
        })}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10"
          style={{ background: "linear-gradient(90deg, #000 0%, rgba(0,0,0,0.88) 20%, rgba(0,0,0,0) 42%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.88) 80%, #000 100%)" }}
        />
      </div>

      {/* 部門名 ＋ 左右切換 */}
      <div className="flex items-center justify-center gap-4 sm:gap-20 mt-[clamp(20px,4vh,56px)]">
        <button type="button" onClick={() => go(-1)} aria-label="上一個部門" className="text-white hover:opacity-70 transition-all active:-translate-x-1">
          <ChevronLeft size={44} strokeWidth={3.2} />
        </button>
        <div key={dept.key} className="jn-fade text-center min-w-0 sm:min-w-[220px]">
          <p className="text-white" style={{ fontFamily: zhHead, fontWeight: 900, fontSize: isDesktop ? `clamp(32px, 3.6vw, ${DEPT_LAYOUT.name.size}px)` : fitLine("形象宣傳部", `clamp(32px, 3.6vw, ${DEPT_LAYOUT.name.size}px)`, { min: 24, ls: 0.18, gutter: 150 }), letterSpacing: "0.18em", paddingLeft: "0.18em", whiteSpace: isDesktop ? undefined : "nowrap" }}>
            {dept.name}
          </p>
          <p className="text-white mt-2" style={{ fontFamily: mono, fontWeight: 500, fontSize: `clamp(13px, 1.3vw, ${DEPT_LAYOUT.en.size}px)`, letterSpacing: "0.22em" }}>
            {dept.en}
          </p>
        </div>
        <button type="button" onClick={() => go(1)} aria-label="下一個部門" className="text-white hover:opacity-70 transition-all active:translate-x-1">
          <ChevronRight size={44} strokeWidth={3.2} />
        </button>
      </div>

      {/* 招募資訊卡 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-9 mt-[clamp(24px,5vh,64px)] max-w-[640px] lg:max-w-none mx-auto">
        {[{ title: "在這裡，你會得到", items: dept.gains }, { title: "我們需要這樣的你加入", items: dept.needs }].map((card) => (
          <div key={card.title}>
            <p className="text-white text-center mb-[clamp(12px,2.5vh,32px)]" style={{ fontFamily: zhHead, fontWeight: 900, fontSize: `clamp(17px, 1.7vw, ${DEPT_LAYOUT.cardTitle.size}px)`, letterSpacing: isDesktop ? "0.3em" : "0.16em" }}>
              {card.title}
            </p>
            <div className="rounded-[28px] px-6 sm:px-12 py-[clamp(20px,4vh,40px)]" style={{ background: dept.color, transition: "background-color 600ms ease" }}>
              <ul key={dept.key} className="jn-fade flex flex-col gap-[clamp(12px,2.6vh,28px)]">
                {card.items.map((it) => (
                  <li key={it} className="text-white flex items-center gap-4 sm:gap-5" style={{ fontFamily: zhHead, fontWeight: 900, fontSize: isDesktop ? `clamp(17px, 1.8vw, ${DEPT_LAYOUT.item.size}px)` : fitLine("課程資訊蒐集與統整", 22, { min: 14, ls: 0.16, gutter: 130 }), letterSpacing: isDesktop ? "0.3em" : "0.16em" }}>
                    <span className="inline-block rounded-full bg-white shrink-0" style={{ width: "7px", height: "7px" }} />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* 部門測驗入口 */}
      <p className="text-white text-center mt-[clamp(28px,5vh,64px)] flex flex-wrap items-center justify-center gap-x-8 gap-y-2" style={{ fontFamily: zhBody, fontWeight: 500, fontSize: `clamp(16px, 1.7vw, ${DEPT_LAYOUT.quizCta.size}px)`, letterSpacing: "0.14em" }}>
        <span>不知道自己屬於哪個部門？</span>
        <a
          href={QUIZ_HREF}
          className="jn-quiz-link relative inline-block"
          style={{ fontFamily: zhHead, fontWeight: 900, background: GRADIENT_TEXT, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}
        >
          點擊按鈕
        </a>
        <span>讓我們幫你評估</span>
      </p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 共用：元素進入畫面才跑動畫
// ══════════════════════════════════════════════════════════════
function useInView<T extends Element>(threshold = 0.3) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

// 步驟版型：編號圓圈＋大標＋小標；reverse=true 時圖在左、字在右
function StepSection({ num, visual, reverse = false }: { num: number; visual: ReactNode; reverse?: boolean }) {
  const t = STEPS_TEXT[num - 1];
  const isDesktop = useIsDesktop();
  return (
    <section className="relative lg:min-h-[92vh] flex items-center px-5 sm:px-8 md:px-14 py-20 lg:py-24 overflow-hidden">
      <div className="max-w-[1400px] w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-10 items-center">
        <div className={`flex flex-col items-center text-center ${reverse ? "lg:order-2" : ""}`}>
          <Reveal>
            <span className="flex items-center justify-center rounded-full bg-white text-black mb-8 lg:mb-10" style={{ width: STEP_LAYOUT.badge, height: STEP_LAYOUT.badge, fontFamily: latin, fontWeight: 700, fontSize: STEP_LAYOUT.badge * 0.56, paddingTop: STEP_LAYOUT.badge * 0.08 }}>
              {num}
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h3 className="text-white" style={{ fontFamily: zhHead, fontWeight: 900, fontSize: isDesktop ? `clamp(52px, 7vw, ${STEP_LAYOUT.title.size}px)` : fitLine("線上登記", `clamp(52px, 7vw, ${STEP_LAYOUT.title.size}px)`, { min: 36, ls: 0.14 }), letterSpacing: "0.14em", paddingLeft: "0.14em", lineHeight: 1.2, ...moveIf(isDesktop, STEP_LAYOUT.title) }}>
              {t.title}
            </h3>
          </Reveal>
          <Reveal delay={150}>
            <p className="text-white mt-6 lg:mt-10" style={{ fontFamily: zhHead, fontWeight: 900, fontSize: `clamp(16px, 1.6vw, ${STEP_LAYOUT.sub.size}px)`, letterSpacing: isDesktop ? "0.4em" : "0.3em", paddingLeft: isDesktop ? "0.4em" : "0.3em", ...moveIf(isDesktop, STEP_LAYOUT.sub) }}>
              {t.sub}
            </p>
          </Reveal>
        </div>
        <div className={`flex justify-center ${reverse ? "lg:order-1" : ""}`}>
          <Reveal delay={120}>{visual}</Reveal>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════
// D-①：手機待辦清單
// ══════════════════════════════════════════════════════════════
const TODO_SLOTS = 4;
const TODO_COLOR_ORDER = [1, 4, 3, 2, 0]; // 顏色出現順序（DEPTS 的 index）：紅、藍、紫、綠、棕…循環

function PhoneTodo() {
  const [ref, inView] = useInView<HTMLDivElement>(0.35);
  const nextId = useRef(TODO_SLOTS);
  const [items, setItems] = useState(() => Array.from({ length: TODO_SLOTS }, (_, i) => ({ id: i, c: i % TODO_COLOR_ORDER.length })));
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const [checking, setChecking] = useState<number | null>(null);
  const [leaving, setLeaving] = useState<number | null>(null);

  useEffect(() => {
    if (!inView) return;
    const timers: number[] = [];
    const run = () => {
      const top = itemsRef.current[0];
      setChecking(top.id);                                        // 1. 打勾
      timers.push(window.setTimeout(() => setLeaving(top.id), 500)); // 2. 淡出消失
      timers.push(window.setTimeout(() => {                       // 3. 移除＋遞補＋底部補新
        setItems((cur) => {
          const last = cur[cur.length - 1];
          return [...cur.slice(1), { id: nextId.current++, c: (last.c + 1) % TODO_COLOR_ORDER.length }];
        });
        setChecking(null);
        setLeaving(null);
      }, 820));
    };
    const first = window.setTimeout(run, 500);
    const iv = window.setInterval(run, PHONE.cycle);
    return () => { window.clearTimeout(first); window.clearInterval(iv); timers.forEach((t) => window.clearTimeout(t)); };
  }, [inView]);

  const listH = TODO_SLOTS * PHONE.itemH + (TODO_SLOTS - 1) * PHONE.itemGap;

  return (
    <div ref={ref} className="relative bg-black" style={{ width: `min(76vw, ${PHONE.w}px)`, height: `${PHONE.h}px`, border: "3.5px solid #fff", borderRadius: "46px" }}>
      {/* 動態島 */}
      <span className="absolute left-1/2 -translate-x-1/2 bg-white rounded-full" style={{ top: "18px", width: "34%", height: "26px" }} />
      {/* 清單 */}
      <div className="absolute left-[12%] right-[12%]" style={{ top: `${(PHONE.h - listH) / 2}px`, height: `${listH}px` }}>
        {items.map((it, i) => {
          const color = DEPTS[TODO_COLOR_ORDER[it.c]].color;
          const isChecked = checking === it.id;
          return (
            <div
              key={it.id}
              className={`absolute left-0 right-0 rounded-[10px] flex items-center justify-end pr-4 ${leaving === it.id ? "jn-todo-out" : "jn-todo-in"}`}
              style={{ top: `${i * (PHONE.itemH + PHONE.itemGap)}px`, height: `${PHONE.itemH}px`, background: color, transition: "top 520ms cubic-bezier(0.22,1,0.36,1)" }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden>
                <circle cx="14" cy="14" r="13" fill="#fff" />
                {isChecked && <path className="jn-check" d="M8 14.5 L12.5 19 L20 10" pathLength={24} fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />}
              </svg>
            </div>
          );
        })}
      </div>
      {/* Home bar */}
      <span className="absolute left-1/2 -translate-x-1/2 bg-white rounded-full" style={{ bottom: "14px", width: "38%", height: "5px" }} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// D-②：彈珠台（預先模擬物理 → 播放路徑；保證和上一次落點不同）
// ══════════════════════════════════════════════════════════════
const PB = { W: 480, H: 560, ballR: 10, pegR: 5.5, g: 1150, e: 0.45, binL: 140, binW: 40, binTop: 380, floor: 468 };
const funnelLeftX = (y: number) => 30 + ((y - 95) * 110) / 285;
const funnelRightX = (y: number) => PB.W - funnelLeftX(y);
const frac = (v: number) => v - Math.floor(v);
// 鋼丁：交錯排列＋固定的小幅不規則偏移
const PEGS: { x: number; y: number }[] = (() => {
  const out: { x: number; y: number }[] = [];
  [135, 180, 225, 270, 315].forEach((baseY, r) => {
    for (let k = -6; k <= 6; k++) {
      const jx = (frac(Math.sin(r * 7.13 + k * 3.31) * 43758.5) - 0.5) * 10;
      const jy = (frac(Math.sin(r * 2.71 + k * 5.17) * 12345.6) - 0.5) * 8;
      const x = 240 + (r % 2 ? 22 : 0) + k * 44 + jx;
      const y = baseY + jy;
      if (x > funnelLeftX(y) + 22 && x < funnelRightX(y) - 22) out.push({ x, y });
    }
  });
  return out;
})();
// 碰撞線段：漏斗兩側、出口隔板、底板
const SEGS: [number, number, number, number][] = [
  [30, 95, 140, PB.binTop],
  [450, 95, 340, PB.binTop],
  ...Array.from({ length: 6 }, (_, i) => [PB.binL + i * PB.binW, PB.binTop - 8, PB.binL + i * PB.binW, PB.floor] as [number, number, number, number]),
  [PB.binL, PB.floor, PB.binL + 5 * PB.binW, PB.floor],
];

function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function simulatePachinko(seed: number) {
  const rnd = mulberry32(seed);
  const dt = 1 / 240;
  let x = 240 + (rnd() - 0.5) * 16, y = 40, vx = (rnd() - 0.5) * 70, vy = 0;
  const frames: [number, number][] = [[x, y]];
  let settled = 0;
  const bounce = (nx: number, ny: number, jitter: number) => {
    const vn = vx * nx + vy * ny;
    if (vn >= 0) return;
    vx -= (1 + PB.e) * vn * nx;
    vy -= (1 + PB.e) * vn * ny;
    vx *= 0.97;
    vx += (rnd() - 0.5) * jitter;
  };
  for (let step = 0; step < 240 * 10; step++) {
    vy += PB.g * dt;
    x += vx * dt;
    y += vy * dt;
    for (const p of PEGS) {
      const dx = x - p.x, dy = y - p.y, min = PB.ballR + PB.pegR;
      const d2 = dx * dx + dy * dy;
      if (d2 < min * min) {
        const d = Math.sqrt(d2) || 1e-6, nx = dx / d, ny = dy / d;
        x = p.x + nx * min; y = p.y + ny * min;
        bounce(nx, ny, 50);
      }
    }
    for (const [ax, ay, bx, by] of SEGS) {
      const abx = bx - ax, aby = by - ay;
      const t = Math.max(0, Math.min(1, ((x - ax) * abx + (y - ay) * aby) / (abx * abx + aby * aby)));
      const cx = ax + t * abx, cy = ay + t * aby;
      const dx = x - cx, dy = y - cy, min = PB.ballR + 2;
      const d2 = dx * dx + dy * dy;
      if (d2 < min * min) {
        const d = Math.sqrt(d2) || 1e-6, nx = dx / d, ny = dy / d;
        x = cx + nx * min; y = cy + ny * min;
        bounce(nx, ny, 10);
        vx *= 0.9;
      }
    }
    const speed = Math.abs(vx) + Math.abs(vy);
    if (y < PB.binTop && speed < 6) vx += (rnd() - 0.5) * 160; // 卡在鋼丁上 → 輕推
    if (y > PB.binTop + 20 && speed < 30) settled++; else settled = 0;
    if (step % 4 === 0) frames.push([x, y]);
    if (settled > 40) break;
  }
  const bin = Math.max(0, Math.min(4, Math.floor((x - PB.binL) / PB.binW)));
  return { frames, bin, ok: y > PB.binTop };
}

function pickPachinkoRun(lastBin: number) {
  for (let i = 0; i < 80; i++) {
    const run = simulatePachinko(Math.floor(Math.random() * 2 ** 31));
    if (run.ok && run.bin !== lastBin) return run;
  }
  return simulatePachinko(Math.floor(Math.random() * 2 ** 31));
}

function Pachinko() {
  const [ref, inView] = useInView<HTMLDivElement>(0.35);
  const ballRef = useRef<SVGCircleElement>(null);
  const lastBin = useRef(-1);
  const [hit, setHit] = useState<{ bin: number; n: number } | null>(null);
  const logo = joinAsset("ntulissa.svg", "ntulissa.png");

  useEffect(() => {
    if (!inView) return;
    let raf = 0, timer = 0, n = 0;
    const place = ([x, y]: [number, number]) => {
      ballRef.current?.setAttribute("cx", x.toFixed(2));
      ballRef.current?.setAttribute("cy", y.toFixed(2));
    };
    const drop = () => {
      const { frames, bin } = pickPachinkoRun(lastBin.current);
      lastBin.current = bin;
      setHit(null);
      place(frames[0]);
      timer = window.setTimeout(() => {
        const start = performance.now();
        const step = (t: number) => {
          const i = Math.floor(((t - start) / 1000) * 60);
          if (i >= frames.length) {
            place(frames[frames.length - 1]);
            setHit({ bin, n: ++n });
            timer = window.setTimeout(drop, PACHINKO.pauseEnd);
            return;
          }
          place(frames[i]);
          raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      }, PACHINKO.pauseTop);
    };
    drop();
    return () => { cancelAnimationFrame(raf); window.clearTimeout(timer); };
  }, [inView]);

  return (
    <div ref={ref} className="flex flex-col items-center" style={{ width: `min(88vw, ${PACHINKO.w}px)` }}>
      <svg viewBox={`0 0 ${PB.W} ${PB.H}`} width="100%" aria-label="彈珠台動畫：隨機配對部門">
        {/* 漏斗 */}
        <path d={`M30 95 L140 ${PB.binTop - 8} M450 95 L340 ${PB.binTop - 8}`} stroke="#fff" strokeWidth="2" fill="none" />
        {/* 鋼丁 */}
        {PEGS.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={PB.pegR + 1.5} fill="#fff" />)}
        {/* 底座外框 */}
        <rect x="58" y="420" width="364" height="128" rx="28" fill="none" stroke="#fff" strokeWidth="4" />
        {/* 五個部門出口 */}
        {DEPTS.map((d, i) => (
          <g key={d.key}>
            <rect x={PB.binL + i * PB.binW + 3} y={PB.binTop} width={PB.binW - 6} height={PB.floor - PB.binTop + 4} fill={d.color} />
            {hit?.bin === i && (
              <rect key={hit.n} className="jn-bin-hit" x={PB.binL + i * PB.binW + 3} y={PB.binTop} width={PB.binW - 6} height={PB.floor - PB.binTop + 4} fill="#fff" />
            )}
          </g>
        ))}
        {/* 隔板 */}
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1={PB.binL + i * PB.binW} y1={PB.binTop - 10} x2={PB.binL + i * PB.binW} y2={PB.floor + 8} stroke="#fff" strokeWidth="4.5" strokeLinecap="round" />
        ))}
        {/* ntulissa */}
        {logo ? (
          <image href={logo} x="130" y="482" width="220" height="52" preserveAspectRatio="xMidYMid meet" />
        ) : (
          <text x="240" y="515" textAnchor="middle" fill="rgba(255,255,255,0.3)" style={{ fontFamily: mono, fontSize: 13, letterSpacing: "0.2em" }}>JoinUs/ntulissa.svg</text>
        )}
        {/* 彈珠 */}
        <circle ref={ballRef} cx="240" cy="40" r={PB.ballR + 3} fill="#fff" />
      </svg>
      {/* 配對結果 */}
      <p className="h-6 mt-4 text-white/70" style={{ fontFamily: mono, fontSize: "14px", letterSpacing: "0.22em" }}>
        {hit && <span key={hit.n} className="jn-fade inline-block">MATCHED · <span style={{ color: "#fff", fontFamily: zhHead, fontWeight: 900 }}>{DEPTS[hit.bin].name}</span></span>}
      </p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// D-③：幹部證明（逐步描繪＋蓋章＋反光，循環）
// ══════════════════════════════════════════════════════════════
const wavePath = (y0: number) => {
  let d = `M80 ${y0}`;
  for (let x = 84; x <= 560; x += 4) d += ` L${x} ${(y0 + 10 * Math.sin(((x - 80) / 80) * 2 * Math.PI)).toFixed(1)}`;
  return d;
};

function Certificate() {
  const [ref, inView] = useInView<HTMLDivElement>(0.35);
  const [cycle, setCycle] = useState(0);
  const logo = joinAsset("ntulissa.svg", "ntulissa.png");

  useEffect(() => {
    if (!inView) return;
    setCycle((c) => c + 1); // 進畫面就從頭播
    const iv = window.setInterval(() => setCycle((c) => c + 1), CERT.cycle);
    return () => window.clearInterval(iv);
  }, [inView]);

  const d = (s: number): CSSProperties => ({ animationDelay: `${s}s` });

  return (
    <div ref={ref} className={inView ? "" : "jn-paused"} style={{ width: `min(80vw, ${CERT.w}px)` }}>
      <svg key={cycle} viewBox="0 0 600 760" width="100%" aria-label="幹部證明">
        <defs>
          <linearGradient id="jnSeal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#D14B4B" />
            <stop offset="1" stopColor="#2F9EBD" />
          </linearGradient>
          <linearGradient id="jnShine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.16" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <clipPath id="jnCard"><rect x="6" y="6" width="588" height="748" /></clipPath>
        </defs>

        {/* 外框描繪 */}
        <rect className="jn-c-draw" style={{ animationDuration: "1.1s" }} x="6" y="6" width="588" height="748" pathLength={100} fill="none" stroke="#fff" strokeWidth="6" />

        {/* Logo */}
        <g className="jn-c-fade" style={d(0.6)}>
          {logo ? (
            <image href={logo} x="150" y="55" width="300" height="100" preserveAspectRatio="xMidYMid meet" />
          ) : (
            <text x="300" y="115" textAnchor="middle" fill="rgba(255,255,255,0.3)" style={{ fontFamily: mono, fontSize: 16, letterSpacing: "0.2em" }}>JoinUs/ntulissa.svg</text>
          )}
        </g>

        {/* 頭像 */}
        <g className="jn-c-pop" style={d(0.95)} fill="none" stroke="#fff" strokeWidth="4.5">
          <circle cx="100" cy="226" r="32" />
          <circle cx="100" cy="215" r="10.5" />
          <path d="M79 249 Q100 222 121 249" strokeLinecap="round" />
        </g>

        {/* 姓名欄＋打字 */}
        <rect className="jn-c-fade" style={d(1.1)} x="170" y="195" width="390" height="62" rx="6" fill="none" stroke="#fff" strokeWidth="2.5" />
        <rect className="jn-c-grow" style={d(1.35)} x="192" y="220" width="170" height="12" rx="6" fill="#fff" fillOpacity="0.85" />

        {/* 簽名波浪 */}
        {[330, 355, 380].map((y, i) => (
          <path key={y} className="jn-c-draw" style={{ ...d(1.7 + i * 0.2), animationDuration: "1.2s" }} d={wavePath(y)} pathLength={100} fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        ))}

        {/* 其餘欄位 */}
        <rect className="jn-c-fade" style={d(2.4)} x="80" y="455" width="480" height="62" rx="6" fill="none" stroke="#fff" strokeWidth="2.5" />
        <rect className="jn-c-grow" style={d(2.6)} x="102" y="480" width="250" height="12" rx="6" fill="#fff" fillOpacity="0.85" />
        <rect className="jn-c-fade" style={d(2.7)} x="80" y="550" width="480" height="62" rx="6" fill="none" stroke="#fff" strokeWidth="2.5" />
        <rect className="jn-c-grow" style={d(2.95)} x="102" y="575" width="190" height="12" rx="6" fill="#fff" fillOpacity="0.85" />

        {/* 印章：蓋下＋漣漪 */}
        <circle className="jn-c-ripple" style={d(3.6)} cx="300" cy="680" r="30" fill="none" stroke="url(#jnSeal)" strokeWidth="3" />
        <circle className="jn-c-stamp" style={d(3.4)} cx="300" cy="680" r="30" fill="url(#jnSeal)" />

        {/* 反光掃過 */}
        <g clipPath="url(#jnCard)">
          <rect className="jn-c-shine" style={d(4.1)} x="-260" y="-100" width="220" height="960" fill="url(#jnShine)" transform="skewX(-18)" />
        </g>
      </svg>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// E. 歡迎你的加入：六顆球 ＋1
// ══════════════════════════════════════════════════════════════
function PlusOneBalls() {
  const isDesktop = useIsDesktop();
  // 手機：六顆球縮小一點，三顆一排（電腦版維持原尺寸）
  const ball = isDesktop ? WELCOME_LAYOUT.ball.size : 52;
  const gap = isDesktop ? WELCOME_LAYOUT.ball.gap : 22;
  const colors = [LEADER_COLOR, ...DEPTS.map((d) => d.color)];
  const labels = ["正副會長", ...DEPTS.map((d) => d.name)];
  const [pops, setPops] = useState<{ id: number; i: number }[]>([]);
  const [bumps, setBumps] = useState<number[]>(() => colors.map(() => 0));
  const idRef = useRef(0);

  const tap = (i: number) => {
    const id = idRef.current++;
    setPops((p) => [...p, { id, i }]);
    setBumps((b) => b.map((v, j) => (j === i ? v + 1 : v)));
    window.setTimeout(() => setPops((p) => p.filter((x) => x.id !== id)), 1500);
  };

  return (
    <div className="flex items-center justify-center flex-wrap" style={{ gap: `${gap}px`, paddingTop: `${WELCOME_LAYOUT.plus.size * 1.8}px`, maxWidth: isDesktop ? undefined : `${ball * 3 + gap * 2 + 1}px`, marginInline: "auto", rowGap: isDesktop ? undefined : `${WELCOME_LAYOUT.plus.size * 1.8}px` }}>
      {colors.map((c, i) => (
        <div key={i} className="relative flex justify-center" style={{ width: `${ball}px` }}>
          {pops.filter((p) => p.i === i).map((p) => (
            <span key={p.id} className="jn-plus absolute text-white pointer-events-none select-none whitespace-nowrap" style={{ bottom: "calc(100% + 12px)", fontFamily: latin, fontWeight: 700, fontSize: `${WELCOME_LAYOUT.plus.size}px`, letterSpacing: "0.04em" }}>
              +1
            </span>
          ))}
          <button type="button" onClick={() => tap(i)} aria-label={`${labels[i]} +1`} className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/60" style={{ width: `${ball}px`, height: `${ball}px` }}>
            <span key={bumps[i]} className={`block w-full h-full rounded-full ${bumps[i] ? "jn-squish" : ""}`} style={{ background: c, boxShadow: `0 0 28px -8px ${c}` }} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
export default function JoinUsSection() {
  const recruit = joinAsset("recruit.svg", "recruit.png", "Recruit.svg", "Recruit.png");
  const isDesktop = useIsDesktop();

  return (
    <div id="join" className="bg-black">
      <style>{`
        @keyframes jnWave { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .jn-wave { animation: jnWave var(--jn-dur, 2.6s) linear infinite; }
        .jn-wave-fast { animation-duration: 0.9s; }
        .jn-stream {
          position: absolute; top: 18px; left: 50%; margin-left: -2.5px;
          width: 5px; height: 46px; border-radius: 3px; transform-origin: top;
          transition: transform .22s ease-out, opacity .22s ease-out;
          background-image: repeating-linear-gradient(180deg, rgba(255,255,255,.28) 0 6px, transparent 6px 14px), linear-gradient(var(--c), var(--c));
          -webkit-mask-image: linear-gradient(#000 65%, transparent); mask-image: linear-gradient(#000 65%, transparent);
          animation: jnFlow .35s linear infinite;
        }
        @keyframes jnFlow { from { background-position: 0 0, 0 0; } to { background-position: 0 14px, 0 0; } }
        .jn-quiz-link::after { content: ""; position: absolute; left: 0; right: 0; bottom: -4px; height: 2px; background: ${GRADIENT_TEXT}; transform: scaleX(0); transform-origin: left; transition: transform .35s cubic-bezier(0.22,1,0.36,1); }
        .jn-quiz-link:hover::after, .jn-quiz-link:focus-visible::after { transform: scaleX(1); }
        @keyframes jnFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .jn-fade { animation: jnFade .55s cubic-bezier(0.22,1,0.36,1) both; }
        /* ① 待辦清單 */
        @keyframes jnTodoIn { from { opacity: 0; transform: translateY(18px) scale(.97); } to { opacity: 1; transform: none; } }
        .jn-todo-in { animation: jnTodoIn .5s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes jnTodoOut { from { opacity: 1; transform: none; } to { opacity: 0; transform: translateY(-10px) scale(.96); } }
        .jn-todo-out { animation: jnTodoOut .32s ease-in forwards; }
        @keyframes jnCheck { from { stroke-dashoffset: 24; } to { stroke-dashoffset: 0; } }
        .jn-check { stroke-dasharray: 24; animation: jnCheck .35s ease-out forwards; }
        /* ② 彈珠台落點閃爍 */
        @keyframes jnBinHit { 0%, 100% { opacity: 0; } 20%, 60% { opacity: .55; } 40%, 80% { opacity: .1; } }
        .jn-bin-hit { animation: jnBinHit 1.2s ease-out forwards; }
        /* ③ 幹部證明 */
        .jn-c-draw, .jn-c-fade, .jn-c-pop, .jn-c-grow, .jn-c-stamp, .jn-c-ripple, .jn-c-shine { animation-fill-mode: both; transform-box: fill-box; transform-origin: center; }
        @keyframes jnDraw { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
        .jn-c-draw { stroke-dasharray: 100; animation-name: jnDraw; animation-duration: 1s; animation-timing-function: ease-in-out; }
        @keyframes jnCFade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        .jn-c-fade { animation: jnCFade .6s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes jnPop { 0% { opacity: 0; transform: scale(0); } 70% { opacity: 1; transform: scale(1.12); } 100% { opacity: 1; transform: scale(1); } }
        .jn-c-pop { animation: jnPop .55s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes jnGrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .jn-c-grow { transform-origin: left center; animation: jnGrow .7s steps(9, end) both; }
        @keyframes jnStamp { 0% { opacity: 0; transform: scale(2.2); } 60% { opacity: 1; transform: scale(.88); } 100% { opacity: 1; transform: scale(1); } }
        .jn-c-stamp { animation: jnStamp .5s cubic-bezier(0.34,1.4,0.64,1) both; }
        @keyframes jnRipple { 0% { opacity: 0; transform: scale(1); } 10% { opacity: .9; } 100% { opacity: 0; transform: scale(2.6); } }
        .jn-c-ripple { animation: jnRipple 1s ease-out both; }
        @keyframes jnShine { from { transform: skewX(-18deg) translateX(0); } to { transform: skewX(-18deg) translateX(1200px); } }
        .jn-c-shine { transform-box: view-box; transform-origin: 0 0; animation: jnShine 1.3s ease-in-out both; }
        .jn-paused * { animation-play-state: paused !important; }
        /* E. +1 與球回彈 */
        @keyframes jnPlus {
          0% { opacity: 0; transform: translateY(12px) scale(.6); }
          18% { opacity: 1; transform: translateY(0) scale(1.12); }
          30% { transform: translateY(0) scale(1); }
          72% { opacity: 1; transform: translateY(-6px); }
          100% { opacity: 0; transform: translateY(-28px); }
        }
        .jn-plus { animation: jnPlus 1.5s cubic-bezier(0.22,1,0.36,1) forwards; }
        @keyframes jnSquish { 0% { transform: scale(1); } 30% { transform: scale(.8); } 62% { transform: scale(1.12); } 100% { transform: scale(1); } }
        .jn-squish { animation: jnSquish .45s cubic-bezier(0.22,1,0.36,1); }
        @media (prefers-reduced-motion: reduce) {
          .jn-wave, .jn-stream, .jn-fade, .jn-todo-in, .jn-todo-out, .jn-check, .jn-bin-hit, .jn-squish,
          .jn-c-draw, .jn-c-fade, .jn-c-pop, .jn-c-grow, .jn-c-stamp, .jn-c-ripple, .jn-c-shine { animation-duration: .01s !important; animation-delay: 0s !important; }
        }
      `}</style>

      {/* ══════════ A. Hero ══════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden px-5 sm:px-8 md:px-14 pt-[var(--page-content-top)] lg:pt-24 pb-32">
        <PageEyebrow text="加入我們" />
        <div className="max-w-[1400px] w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <Reveal delay={60}>
              <h1 className="text-white" style={{ fontFamily: zhHead, fontWeight: 900, fontSize: isDesktop ? `clamp(36px, 5vw, ${HERO_LAYOUT.title.size}px)` : fitLine("還有這種「玩」法。", `clamp(36px, 5vw, ${HERO_LAYOUT.title.size}px)`, { min: 22, ls: 0.1 }), lineHeight: HERO_LAYOUT.title.lh, letterSpacing: "0.1em", ...moveIf(isDesktop, HERO_LAYOUT.title) }}>
                <span className="block">你的大學生涯</span>
                <span className="block">還有這種「玩」法。</span>
              </h1>
            </Reveal>
            <Reveal delay={140}>
              <p className="text-white mt-8 lg:mt-16" style={{ fontFamily: zhBody, fontWeight: 500, fontSize: `clamp(17px, 1.7vw, ${HERO_LAYOUT.sub.size}px)`, lineHeight: HERO_LAYOUT.sub.lh, letterSpacing: "0.08em", ...moveIf(isDesktop, HERO_LAYOUT.sub) }}>
                <span className="block">成為</span>
                <span className="block">臺大圖資系學會的一員</span>
              </p>
            </Reveal>
          </div>
          <Reveal delay={200}>
            <div className="flex justify-center lg:justify-end">
              <DrinkMachine />
            </div>
          </Reveal>
        </div>

        {/* 底部置中：Recruit（imports/JoinUs/recruit.svg） */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          {recruit ? (
            <img src={recruit} alt="Recruit — NTU LIS SA" className="select-none" draggable={false} style={{ height: `${isDesktop ? RECRUIT.h : 34}px`, width: "auto", ...moveIf(isDesktop, RECRUIT) }} />
          ) : (
            <span className="text-white/30" style={{ fontFamily: mono, fontSize: "0.8rem", letterSpacing: "0.2em", ...move(RECRUIT) }}>Recruit · JoinUs/recruit.svg</span>
          )}
        </div>
      </section>

      {/* ══════════ B. 為何要加入？ ══════════ */}
      <section className="relative lg:min-h-screen flex items-center px-5 sm:px-8 md:px-14 pt-20 lg:pt-28 pb-16">
        <div className="max-w-[1400px] w-full mx-auto">
          <Reveal>
            <AlbumPlayer />
          </Reveal>
        </div>
      </section>

      {/* ══════════ C. 部門招募 ══════════ */}
      <section className="relative lg:min-h-screen flex items-center px-5 sm:px-8 md:px-14 pt-20 lg:pt-28 pb-16">
        <div className="max-w-[1400px] w-full mx-auto">
          <Reveal>
            <DeptRecruit />
          </Reveal>
        </div>
      </section>

      {/* ══════════ D. 加入手續 ══════════ */}
      <StepSection num={1} visual={<PhoneTodo />} />
      <StepSection num={2} visual={<Pachinko />} reverse />
      <StepSection num={3} visual={<Certificate />} />

      {/* ══════════ E. 歡迎你的加入 ══════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-5 sm:px-6 py-24 text-center">
        <Reveal>
          <PlusOneBalls />
        </Reveal>
        <Reveal delay={80}>
          <h2 className="text-white mt-14" style={{ fontFamily: zhHead, fontWeight: 900, fontSize: isDesktop ? `clamp(52px, 8vw, ${WELCOME_LAYOUT.title.size}px)` : fitLine("歡迎你的加入", `clamp(52px, 8vw, ${WELCOME_LAYOUT.title.size}px)`, { min: 30, ls: 0.1 }), letterSpacing: "0.1em", paddingLeft: "0.1em", lineHeight: 1.2, ...moveIf(isDesktop, WELCOME_LAYOUT.title) }}>
            歡迎你的加入
          </h2>
        </Reveal>
        <Reveal delay={150}>
          <p className="text-white mt-8 lg:mt-10" style={{ fontFamily: zhBody, fontWeight: 500, fontSize: `clamp(15px, 1.6vw, ${WELCOME_LAYOUT.sub.size}px)`, letterSpacing: isDesktop ? "0.1em" : "0.06em", lineHeight: isDesktop ? undefined : 1.8, ...moveIf(isDesktop, WELCOME_LAYOUT.sub) }}>
            臺大圖資系學會 — 是學生組織，也是改變與成長的起點。
          </p>
        </Reveal>
        <Reveal delay={220}>
          <a
            href={JOIN_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-4 bg-white text-black px-10 py-4 rounded-full mt-16 hover:bg-white/90 transition-all duration-200 group"
            style={{ fontFamily: zhBody, fontWeight: 900, fontSize: `${isDesktop ? WELCOME_LAYOUT.button.size : 18}px`, letterSpacing: "0.1em", ...moveIf(isDesktop, WELCOME_LAYOUT.button) }}
          >
            加入我們
            <ArrowRight size={24} strokeWidth={2.8} className="group-hover:translate-x-1 transition-transform duration-200" />
          </a>
        </Reveal>
      </section>
    </div>
  );
}