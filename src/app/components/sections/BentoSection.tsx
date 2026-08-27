import { useEffect, useRef, useState } from "react";
import { PiggyBank } from "lucide-react";
import svgPaths from "@/imports/BentoGrid-1/svg-lp3prmbugu";
// ── NEWS 卡（最新動態）：App 圖示中央改放單純「NTU LIS SA」字樣的 SVG（清晰不糊）。
//   放到 src/imports/BentoGrid/NTULISSAlogo2.svg（檔名需一致；若用別的檔名，改這行路徑即可）。
import newsLogo from "@/imports/BentoGrid/NTULISSAlogo2.svg";
// ── ABOUT 卡（第 53 屆）：中間直接放新版系學會 Logo 的 SVG（清晰不糊）。
//   放到 src/imports/BentoGrid/NTULISSAlogo.svg（檔名需一致；若用別的檔名，改下面這行的路徑即可）。
import aboutLogo from "@/imports/BentoGrid/NTULISSAlogo.svg";
import { Reveal, monoBold, monoSemi, useCountdown } from "./shared";

// ══════════════════════════════════════════════════════════════════════════
// 資訊總覽 BentoGrid（重製版・比照 Figma 新設計）
// 字體／顏色沿用現有網站樣式（紅→青品牌漸層、Noto Sans TC / Ubuntu Mono）。
//
// ★ 之後最常改的東西集中在這裡：
//   NEXT_EVENT：下一場活動名稱與時間（倒數圓環吃這個）。
//   LINKS：各卡片點擊目標。support 目前為 null＝不連結（會費／贊助整合後再接）。
//   ABOUT 卡：中間放新版系學會 Logo（含 53）的 SVG，見上方 aboutLogo import。
//   CHAT_LINES：學術資源卡的聊天泡泡文字。
//   MEMBER_DOTS：工作團隊卡的彩色圓點顏色序列。
//   社群卡（IG/FB/Threads）：等 SVG 文字 logo 上傳後，換掉 SocialCard 內的圖示即可。
// ══════════════════════════════════════════════════════════════════════════

const NEXT_EVENT = {
  name: "B14~15 系學會發表會",
  time: new Date("2026-09-07T14:30:00+08:00"),
};
const COUNTDOWN_TARGET = NEXT_EVENT.time;
// 倒數圓環的「滿環」對應天數：距離活動 ≥ 這個天數時環是滿的，越接近越空。改這裡調整視覺節奏。
const RING_FULL_DAYS = 30;
// 倒數圓環的漸層是否「持續旋轉流動」。預設 false＝靜態漸層（效能較好、比較不卡）。
// 這個大圓環若讓漸層一直轉，會持續重繪整圈、是這張卡最耗效能的來源；想要流動感再改 true。
const RING_GRADIENT_SPIN = false;

// ── 「下一場活動」卡片：標籤／Donut／標題 的間距、圓環大小、標題大小 ────────────────
// 這張卡片「首頁捲動版」與「獨立頁（#/overview）」共用同一份排版，改這裡兩邊會一起變。
//
// ⚠ 重要觀念（為什麼調大反而更擠）：這三個元素是「一整組、垂直置中」放進固定高度的格子。
//   把 GAP 或 RING 調大 → 這一組會變高變寬 → 格子大小沒變，四周留白反而更少 = 看起來更擠。
//   想要「更有呼吸感」→ 反過來把數字調小（讓這一組變小、四周留白變多）。目前刻意收小，讓它在格子裡浮起來。
const NEXT_TITLE_GAP = 35; // Donut 圓環 → 活動標題 的距離（px）
// （「UP NEXT」標籤現在絕對定位在卡片頂部；它與頂部距離＝倒數卡 JSX 裡的 top-5/top-7，不再用間距常數。）
// Donut 圓環直徑：clamp(最小, 隨螢幕縮放, 最大)。整組太高頂到卡片上下 → 先把最大值（140px）往下調。
const NEXT_RING_SIZE = "clamp(200px, 10vw, 300px)";
// 活動標題字級：clamp(最小, 隨螢幕縮放, 最大)。標題太寬快貼到卡片左右 → 把最大值（1.85rem）調小就會空出左右留白。
const NEXT_TITLE_SIZE = "clamp(1rem, 2.2vw, 1.85rem)";

// ── 首頁捲動版最上方的大標題（YOUR CAMPUS PORTAL ＋「－關於我們・資訊總覽」小標）─────
// false＝整塊隱藏，把上方空間全讓給下面的格子（獨立頁 #/overview 本來就沒有這塊，兩邊更一致）。
// 想讓標題回來 → 改成 true。
// ※ 注意：格子高度已改成「兩個版本一致」——整個 section 都佔滿一屏（min-h-[100svh]）、格子用 flex-1 撐滿剩餘高度。
//   關著（預設 false）時，首頁捲動版與獨立頁的格子大小完全相同；若改成 true 打開標題，
//   標題會佔掉一點高度，首頁版的格子會比獨立頁「略矮一點點」（想完全一致就維持關閉）。
const SHOW_HOME_HEADER = false;

// ── ABOUT 卡：新版系學會 Logo（含 53）SVG 的最大高度（寬度自動、等比例縮放）。想放大縮小改這裡。
const ABOUT_LOGO_MAXH = "clamp(90px, 16vw, 220px)";

// ── NEWS 卡（最新動態）：App 圖示中央「NTU LIS SA」文字 Logo（NTULISSAlogo2.svg）調整區。
//   NEWS_LOGO_SIZE：logo 佔 App 圖示方框的比例（%），數字越大字越大。
//   NEWS_LOGO_OFFSET_X：左右位移，正值往右、負值往左（px）。
//   NEWS_LOGO_OFFSET_Y：上下位移，正值往下、負值往上（px）。
const NEWS_LOGO_SIZE = 62;
const NEWS_LOGO_OFFSET_X = 0;
const NEWS_LOGO_OFFSET_Y = 0;

// 各卡片點擊目標。support=null 代表暫不連結（會費＋贊助整合後再接）。
const LINKS = {
  calendar: "#calendar",
  about: "#about", // ★ 暫時擱置：ABOUT 卡目前「不連結」（等「學會發展歷程」公告頁做好再接）。要接時見下方 ABOUT 卡的 TODO。
  news: "#news",
  resources: "#resources",
  team: "#/current-team", // 工作團隊卡 → 連到「現任團隊」獨立頁
  support: null as string | null,
};

// 學術資源卡的聊天泡泡（from＝對方藍色泡泡靠右；to＝自己灰色泡泡靠左）。
const CHAT_LINES = [
  { side: "in" as const, text: "學長學姊您好，請問你們有家產可以借我嗎……" },
  { side: "out" as const, text: "哪一門課？我這裡很多" },
];
// ── 學術資源卡：聊天動畫節奏（想改快慢就改這裡；改對話直接改上方 CHAT_LINES 即可，時間會自動調整）──
//   side："in"＝藍色靠右、"out"＝白色靠左；text＝內容。可自由增減句數、改字。
const CHAT_TIMING = {
  typingBase: 700,   // 每則「輸入中…」的基本時間（ms）
  typingPerChar: 32, // 每多一個字再加多少 ms（字越多、打字越久＝越自然）
  readGap: 650,      // 一句出現後、換下一句前的停頓
  leaveBeat: 280,    // 最舊那句「往上收合消失」的時間（要配合 CSS 的 .chat-row transition 0.28s）
};

// ── 工作團隊卡：圓點牆（10×4＝40 格）───────────────────────────────────────
// 依「部門順序」把每個部門的人數（count）填成該部門代表色，填不滿的用深灰「待補」點補到 40。
// ★ 只要改各部門的 count 調人數；人多了會自動往後排；全部加總超過 40（TEAM_COLS×TEAM_ROWS）的會被截掉。
//   顏色是各部門代表色，請勿更動。
const TEAM_COLS = 10; // 一排幾顆
const TEAM_ROWS = 4; // 幾排（10×4＝40）
const TEAM_EMPTY_COLOR = "#2E2E2E"; // 未填滿的空位（深灰）
const TEAM_DEPTS = [
  { name: "正副會長", color: "#A27F00", count: 2 },
  { name: "行政部", color: "#915E3E", count: 2 },
  { name: "活動部", color: "#9F353A", count: 5 },
  { name: "學術部", color: "#42602D", count: 4 },
  { name: "形象宣傳部", color: "#572A3F", count: 4 },
  { name: "體育部", color: "#8C7B6B", count: 3 },
];
// 圓點大小與間距（覺得太大就把 TEAM_DOT_SIZE 的最大值調小）。
const TEAM_DOT_SIZE = "clamp(13px, 1.9vw, 24px)";
const TEAM_DOT_GAP = "clamp(5px, 0.8vw, 11px)";
// 依上面 TEAM_DEPTS 展開成 40 個顏色：先照部門順序填色，再用深灰補滿。
const MEMBER_DOTS: string[] = (() => {
  const total = TEAM_COLS * TEAM_ROWS;
  const arr: string[] = [];
  for (const d of TEAM_DEPTS) for (let i = 0; i < d.count; i++) arr.push(d.color);
  while (arr.length < total) arr.push(TEAM_EMPTY_COLOR);
  return arr.slice(0, total);
})();

const BRAND_GRADIENT = "linear-gradient(to right, #D14B4B, #2F9EBD)";
const zhBody = "'Noto Sans TC', sans-serif";

// ── SUPPORT US 卡：水龍頭滴錢幣落入小豬撲滿的 hover 動畫（純內嵌 SVG）───────────
//   SUPPORT_SCENE_SIZE：整組圖示大小。SUPPORT_COIN_DURATION：錢幣「生成→掉落→入豬」一輪的秒數（越大越慢）。
//   錢幣的起點（水龍頭口）與終點（撲滿投幣口）位置＝下方 SupportScene 內 supportCoinDrop 的 left/top 百分比。
const SUPPORT_SCENE_SIZE = "clamp(96px, 12vw, 176px)";
const SUPPORT_COIN_DURATION = 1.5;

// 卡片共用外觀。
const BENTO_CARD = "group relative overflow-hidden rounded-[14px] flex flex-col";
// 卡片底色：統一深灰。要整體換色改這一行即可。
// contain: layout paint —— 效能關鍵：讓每張卡的「排版＋繪製」互相獨立，
// 一張卡在動（hover 展開、重繪）時不會波及、拖累其他卡（解決「碰了一格、其他格跟著卡」）。
const BENTO_BG: React.CSSProperties = {
  background: "#151515",
  contain: "layout paint",
};

// ── 「平常隱藏、hover 才淡入＋輕輕滑出」的文字（標籤／說明）──────────────────
// ★ 只用 opacity + transform（GPU 合成、完全不碰版面）→ 不重排、不卡頓、也不會拖累其他卡片。
//   （之前用 grid-template-rows 撐高度＝主執行緒重排動畫，那才是卡頓元兇，已移除。）
// ★ 這個元件「脫離版面」（由呼叫端用 absolute 定位浮在卡片頂/底），所以平常內容照樣在卡片正中央、不留空白。
//   而「內容在 hover 時滑動讓位」的質感，改由各卡片內容自己的 group-hover transform 完成（一樣是 GPU、不卡）。
// ★ 觸控（沒有 hover 的裝置）：一律直接顯示文字。尊重「減少動態」。想調速度改 duration-500。
function HoverReveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`transition-[opacity,transform] duration-500 ease-out opacity-100 translate-y-0 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:translate-y-1.5 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:translate-y-0 motion-reduce:transition-none ${className}`}
    >
      {children}
    </div>
  );
}

// 右側小卡的底部置中標籤（英＋中）。絕對定位浮在卡片底部中央（脫離版面 → 平常內容照樣置中、不留空白）；
// 平常隱藏，hover 才淡入＋輕輕上滑。pointer-events-none 避免擋到卡片點擊。
function CardCaption({ en, zh }: { en: string; zh: string }) {
  return (
    <HoverReveal className="absolute inset-x-0 bottom-3 md:bottom-4 flex items-center justify-center gap-2 px-3 pointer-events-none">
      <span className="text-white/90 tracking-[0.24em] whitespace-nowrap" style={{ ...monoSemi, fontSize: "clamp(10px, 1vw, 15px)" }}>
        {en}
      </span>
      <span className="text-white/90 whitespace-nowrap" style={{ fontFamily: zhBody, fontWeight: 700, fontSize: "clamp(11px, 1.05vw, 16px)", letterSpacing: "0.14em" }}>
        {zh}
      </span>
    </HoverReveal>
  );
}

// ── 學術資源卡：聊天泡泡「滾動視窗」動畫 ──────────────────────────────────
// 畫面永遠只有兩句（一藍一白）：對方先「輸入中…」（三點跳動）→ 泡泡從底部彈出；
// 要出下一句時，最舊那句往上收合消失、其餘上移、新句子從底部進來——像跑馬燈一直往下滾，並循環。
// 改對話直接改上方 CHAT_LINES（可增減句數、改字，時間自動調整）；改快慢改 CHAT_TIMING。
// 尊重「減少動態」：開啟時直接靜態顯示最後兩句、不跑動畫。
type ChatRow = { id: number; side: "in" | "out"; text: string; typing: boolean; leaving: boolean };

function ChatBubbles({ lines }: { lines: { side: "in" | "out"; text: string }[] }) {
  const [rows, setRows] = useState<ChatRow[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setRows(lines.slice(-2).map((l, i) => ({ id: i, side: l.side, text: l.text, typing: false, leaving: false })));
      return;
    }
    if (lines.length === 0) { setRows([]); return; }

    let cancelled = false;
    const timers: number[] = [];
    const at = (fn: () => void, t: number) => { timers.push(window.setTimeout(fn, t)); };
    let p = 0;
    setRows([]);
    idRef.current = 0;

    function advance() {
      if (cancelled) return;
      const line = lines[p % lines.length];
      // 已有兩句（不含正在離場的）→ 先把最舊那句標成 leaving（觸發 CSS 收合動畫）。
      setRows((prev) => {
        const live = prev.filter((r) => !r.leaving);
        if (live.length >= 2) {
          const oldest = live[0].id;
          return prev.map((r) => (r.id === oldest ? { ...r, leaving: true } : r));
        }
        return prev;
      });
      // 收合動畫跑完 → 移除離場的，並在底部加入「輸入中」泡泡。
      at(() => {
        const id = ++idRef.current;
        setRows((prev) => [...prev.filter((r) => !r.leaving), { id, side: line.side, text: line.text, typing: true, leaving: false }]);
        const typingTime = CHAT_TIMING.typingBase + line.text.length * CHAT_TIMING.typingPerChar;
        at(() => setRows((prev) => prev.map((r) => (r.id === id ? { ...r, typing: false } : r))), typingTime); // 輸入中 → 真正泡泡
        at(() => { p += 1; advance(); }, typingTime + CHAT_TIMING.readGap);                                    // 換下一句
      }, CHAT_TIMING.leaveBeat);
    }
    advance();
    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, [lines]);

  return (
    <div className="flex-1 flex flex-col justify-center">
      <style>{`
        @keyframes chatPop { 0% { opacity: 0; transform: translateY(8px) scale(0.9); } 60% { opacity: 1; transform: translateY(0) scale(1.02); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes chatDot { 0%,60%,100% { opacity: .25; transform: translateY(0); } 30% { opacity: .9; transform: translateY(-2px); } }
        /* 每一列用 grid 的 1fr→0fr 平滑收合高度；離場時同時淡出、消掉上緣間距。 */
        .chat-row { display: grid; grid-template-rows: 1fr; opacity: 1; margin-top: 9px; transition: grid-template-rows .28s ease, opacity .26s ease, margin-top .28s ease; }
        .chat-row:first-child { margin-top: 0; }
        .chat-row.leaving { grid-template-rows: 0fr; opacity: 0; margin-top: 0; }
        .chat-inner { overflow: hidden; min-height: 0; display: flex; }
        .chat-bubble { animation: chatPop .34s cubic-bezier(0.22,1,0.36,1) both; transform-origin: bottom; }
      `}</style>
      {rows.map((r) => {
        const isIn = r.side === "in";
        const bubbleStyle: React.CSSProperties = {
          maxWidth: "82%",
          fontFamily: zhBody, fontWeight: 500, fontSize: "clamp(0.7rem, 0.95vw, 0.95rem)", letterSpacing: "0.02em",
          color: isIn ? "#fff" : "#1a1a1a",
          background: isIn ? "rgba(47,158,189,0.85)" : "rgba(255,255,255,0.9)",
          borderBottomRightRadius: isIn ? "4px" : undefined,
          borderBottomLeftRadius: !isIn ? "4px" : undefined,
        };
        return (
          <div key={r.id} className={`chat-row ${r.leaving ? "leaving" : ""}`}>
            <div className={`chat-inner ${isIn ? "justify-end" : "justify-start"}`}>
              {r.typing ? (
                <span key="typing" className="chat-bubble inline-flex items-center gap-1 rounded-2xl px-3.5 py-2.5" style={bubbleStyle}>
                  {[0, 1, 2].map((d) => (
                    <span key={d} style={{ width: 5, height: 5, borderRadius: 999, background: isIn ? "rgba(255,255,255,0.9)" : "rgba(26,26,26,0.6)", display: "inline-block", animation: `chatDot 1s ease-in-out ${d * 0.15}s infinite` }} />
                  ))}
                </span>
              ) : (
                <span key="text" className="chat-bubble inline-block rounded-2xl px-3 py-2 leading-snug" style={bubbleStyle}>
                  {r.text}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── 倒數圓環 ─────────────────────────────────────────────────────────────
// 角度定義：0° 在正上方（12 點），順時針遞增。
//   圓點段：從頂端順時針畫，佔比 = days / RING_FULL_DAYS（比例自動依天數偵測）。
//   實線段：剩下的部分（紅→藍漸層），順時針接回頂端。
function ringPoint(deg: number, r = 42) {
  const rad = (deg * Math.PI) / 180;
  return { x: 50 + r * Math.sin(rad), y: 50 - r * Math.cos(rad) };
}

function CountdownRing({ days, size = NEXT_RING_SIZE }: { days: number; size?: string }) {
  const R = 42;
  const dottedFrac = Math.max(0, Math.min(1, days / RING_FULL_DAYS));
  const dottedAngle = dottedFrac * 360;

  // 圓點（每 DOT_STEP 度一顆，從頂端順時針排到 dottedAngle）。
  const DOT_STEP = 10;
  const dots: { x: number; y: number }[] = [];
  if (dottedFrac > 0.0001) {
    for (let a = 0; a <= dottedAngle + 0.001; a += DOT_STEP) {
      dots.push(ringPoint(a, R));
    }
  }

  // 實線漸層弧（dottedAngle → 頂端）。
  let solid: React.ReactNode = null;
  if (dottedFrac <= 0.0001) {
    solid = <circle cx="50" cy="50" r={R} fill="none" stroke="url(#ringGrad)" strokeWidth="6" strokeLinecap="round" />;
  } else if (dottedFrac < 0.9999) {
    const p1 = ringPoint(dottedAngle, R);
    const p2 = ringPoint(359.99, R);
    const large = 360 - dottedAngle > 180 ? 1 : 0;
    solid = (
      <path d={`M ${p1.x} ${p1.y} A ${R} ${R} 0 ${large} 1 ${p2.x} ${p2.y}`} fill="none" stroke="url(#ringGrad)" strokeWidth="6" strokeLinecap="round" />
    );
  }

  return (
    // 圓環尺寸由 NEXT_RING_SIZE（或傳入的 size）控制，確保「標籤＋圓環＋標題」整組塞得進卡片、標題不被裁。
    <div className="relative flex items-center justify-center" style={{ width: size, aspectRatio: "1 / 1" }}>
      {/* 圓點循環閃現動畫（每顆錯開，形成繞圈的流動波） */}
      <style>{`@keyframes ringDotWave { 0%,100% { opacity: 0.15; } 50% { opacity: 0.9; } }`}</style>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        <defs>
          {/* 漸層以 userSpaceOnUse 定位，並用 animateTransform 緩慢旋轉 → 紅藍色彩繞著弧線流動、循環播放。 */}
          <linearGradient id="ringGrad" gradientUnits="userSpaceOnUse" x1="50" y1="8" x2="50" y2="92">
            <stop offset="0%" stopColor="#D14B4B" />
            <stop offset="100%" stopColor="#2F9EBD" />
            {/* 漸層旋轉：預設關閉（RING_GRADIENT_SPIN=false）以省效能；開啟才會持續重繪整圈。 */}
            {RING_GRADIENT_SPIN && (
              <animateTransform attributeName="gradientTransform" type="rotate" from="0 50 50" to="360 50 50" dur="9s" repeatCount="indefinite" />
            )}
          </linearGradient>
        </defs>
        {solid}
        {dots.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={1.5}
            fill="#ffffff"
            style={{ animation: "ringDotWave 2.4s ease-in-out infinite", animationDelay: `${i * 0.14}s` }}
          />
        ))}
      </svg>
      <div className="relative flex flex-col items-center leading-none">
        {/* 倒數天數字體：Apple 裝置用系統內建 SF Pro Rounded（ui-rounded，免安裝）；其餘退回相近字型。 */}
        <span className="text-white tabular-nums" style={{ fontFamily: "'SF Pro Rounded', ui-rounded, 'Noto Sans TC', sans-serif", fontWeight: 600, fontSize: "clamp(2rem, 4vw, 3.0rem)", letterSpacing: "0.02em" }}>
          {days}
        </span>
        <span className="text-white/60 mt-1.5" style={{ fontFamily: "'Chiron Hei HK Text'", fontWeight: 700, fontSize: "clamp(0.7rem, 0.95vw, 0.95rem)", letterSpacing: "0.3em" ,color:"#FFFFFF" }}>
          天後
        </span>
      </div>
    </div>
  );
}

// 解壓漸層條（PullBar）尺寸：軌道寬度、白色把手大小。想調就改這裡。
const PULL_TRACK_W = "clamp(9px, 1vw, 13px)";
const PULL_DOT_SIZE = "clamp(24px, 2.2vw, 32px)";

// ── 回彈後的「閃光線條」爆點（放開、圓點彈回頂端瞬間觸發）──────────────────
// SPARK_ANGLES：每條線的方向（deg），0=正上、負=左上、正=右上。想更熱鬧就多加幾個角度。
// SPARK_LEN／SPARK_THICK：線長／線粗（px）。SPARK_DURATION：爆點動畫秒數。
// PULL_SPARK_DELAY：放開後延遲多久觸發（ms），對準圓點回到頂端的瞬間；回彈曲線改了就順手調這個。
// PULL_SPARK_THRESHOLD：至少要拉到軌道的幾成才會噴（避免手滑輕碰也噴）。
const SPARK_ANGLES = [-38, 0, 38];
const SPARK_LEN = 9;
const SPARK_THICK = 2.5;
const SPARK_DURATION = 0.5;
const PULL_SPARK_DELAY = 360;
const PULL_SPARK_THRESHOLD = 0.22;

// ── 可上下拖曳的漸層條（解壓小玩具・放開回彈到頂端）──────────────────────
function PullBar() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [frac, setFrac] = useState(0); // 0=頂端（休息位）、1=底
  const [dragging, setDragging] = useState(false);
  const [burstKey, setBurstKey] = useState(0); // 每次噴發 +1 → 重掛載火花元件 → 動畫重播
  const burstTimer = useRef<number | null>(null);

  // 元件卸載時清掉待觸發的計時器（避免在已卸載元件上 setState）。
  useEffect(() => () => { if (burstTimer.current) window.clearTimeout(burstTimer.current); }, []);

  const onDown = (e: React.PointerEvent) => {
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging || !trackRef.current) return;
    const r = trackRef.current.getBoundingClientRect();
    setFrac(Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)));
  };
  const onUp = () => {
    setDragging(false);
    const pulled = frac > PULL_SPARK_THRESHOLD; // 有拉到一定距離才噴火花
    setFrac(0); // 放開＝回彈到頂端
    if (pulled) {
      if (burstTimer.current) window.clearTimeout(burstTimer.current);
      // 延遲到圓點回彈至頂端的瞬間才噴，讓火花跟「歸位」對齊。
      burstTimer.current = window.setTimeout(() => setBurstKey((k) => k + 1), PULL_SPARK_DELAY);
    }
  };

  return (
    // h-full：整張卡填滿它所在欄位的高度（之前少了這個，卡片才會塌成一顆小藥丸、軌道撐不出來）。
    <div className={`${BENTO_CARD} h-full items-center justify-center py-6`} style={BENTO_BG} aria-hidden>
      {/* 紅→藍漸層流動動畫（軌道用）。想調流速：改 pullFlow 的 3.5s（越大越慢）。 */}
      <style>{`
        @keyframes pullFlow { from { background-position: 50% 0%; } to { background-position: 50% -200%; } }
        /* 回彈後的閃光線條：往上扇形爆開再淡出。角度/線長/粗細/秒數由上方 SPARK_* 常數控制。 */
        .pull-spark {
          position: absolute;
          left: 50%;
          top: 50%;
          border-radius: 999px;
          background: #fff;
          transform-origin: center;
          animation-name: pullSpark;
          animation-timing-function: cubic-bezier(0.2, 0.75, 0.3, 1);
          animation-fill-mode: forwards;
          will-change: transform, opacity;
        }
        @keyframes pullSpark {
          0%   { opacity: 0; transform: rotate(var(--deg)) translateY(-13px) scaleY(0.2); }
          30%  { opacity: 1; transform: rotate(var(--deg)) translateY(-19px) scaleY(1); }
          100% { opacity: 0; transform: rotate(var(--deg)) translateY(-27px) scaleY(0.65); }
        }
        @media (prefers-reduced-motion: reduce) {
          .pull-track { animation: none !important; }
          .pull-spark { animation: none !important; opacity: 0 !important; }
        }
      `}</style>
      {/* 軌道：固定寬度、撐滿卡片高度（maxHeight 留一點上下邊距）。 */}
      <div ref={trackRef} className="relative h-full" style={{ width: PULL_TRACK_W, maxHeight: "86%" }}>
        <div
          className="pull-track absolute inset-0 rounded-full"
          style={{
            // 三段（紅→藍→紅）＋ 200% 高度，配合背景位移動畫做出無縫上下流動。
            background: "linear-gradient(180deg, #D14B4B 0%, #2F9EBD 50%, #D14B4B 100%)",
            backgroundSize: "100% 200%",
            animation: "pullFlow 3.5s linear infinite",
          }}
        />
        {/* 回彈後的閃光線條爆點：放開且有拉動時，延遲到圓點回頂端瞬間觸發（key 改變→重播動畫）。
            定位在軌道頂端中央＝圓點休息位，火花以此為圓心往外放射。 */}
        {burstKey > 0 && (
          <div
            key={burstKey}
            className="pull-burst absolute left-1/2 top-0 pointer-events-none"
            style={{ transform: "translate(-50%, -50%)", width: 0, height: 0 }}
          >
            {SPARK_ANGLES.map((deg, i) => (
              <span
                key={i}
                className="pull-spark"
                style={{
                  width: `${SPARK_THICK}px`,
                  height: `${SPARK_LEN}px`,
                  marginLeft: `${-SPARK_THICK / 2}px`,
                  marginTop: `${-SPARK_LEN / 2}px`,
                  animationDuration: `${SPARK_DURATION}s`,
                  "--deg": `${deg}deg`,
                } as React.CSSProperties}
              />
            ))}
          </div>
        )}

        {/* 拖曳把手：白色圓點。 */}
        <div
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          className="absolute left-1/2 rounded-full bg-white cursor-grab active:cursor-grabbing touch-none"
          style={{
            width: PULL_DOT_SIZE,
            height: PULL_DOT_SIZE,
            top: `${frac * 100}%`,
            transform: "translate(-50%, -50%)",
            transition: dragging ? "none" : "top 0.55s cubic-bezier(0.34,1.56,0.64,1)",
            boxShadow: "0 4px 14px rgba(0,0,0,0.45)",
          }}
        />
      </div>
    </div>
  );
}

// ── 社群卡（暫用現有圖示；SVG 文字 logo 上傳後換這裡）────────────────────
function SocialCard({ label, path, vb, href, delay }: { label: string; path: string; vb: string; href: string; delay: number }) {
  return (
    <Reveal key={label} delay={delay} className="flex-1 flex flex-col">
      <a href={href} target="_blank" rel="noopener noreferrer" className={`${BENTO_CARD} flex-1 p-4 md:p-5 cursor-pointer transition-[filter] duration-300 hover:brightness-110`} style={BENTO_BG}>
        {/* TODO：拿到文字 logo SVG 後，把下面這個 <svg> 換成品牌文字 logo，並置中即可。 */}
        <div className="flex-1 flex items-center justify-center transition-transform duration-500 ease-out [@media(hover:hover)]:group-hover:-translate-y-2">
          <div style={{ width: "clamp(34px, 4.5vw, 60px)", height: "clamp(34px, 4.5vw, 60px)" }}>
            <svg className="block w-full h-full" fill="none" viewBox={vb}>
              <path d={path} fill="white" fillOpacity="0.85" />
            </svg>
          </div>
        </div>
        <CardCaption en={label} zh="" />
      </a>
    </Reveal>
  );
}

// ── SUPPORT US：水龍頭 + 錢幣 + 小豬撲滿（純內嵌 SVG）。平常只有水龍頭＋小豬；
//    hover 卡片時錢幣才從水龍頭口生成、斜落、落到小豬背上，並讓小豬「收錢」輕彈一下，循環播放。
//    小豬沿用 lucide PiggyBank；水龍頭是同款線條風格的內嵌 SVG。
function SupportScene() {
  return (
    <div className="support-scene relative" style={{ width: SUPPORT_SCENE_SIZE, aspectRatio: "1 / 1" }}>
      <style>{`
        .support-coin { opacity: 0; }
        .support-piggy { transform-origin: 50% 100%; }
        @media (hover: hover) {
          .group:hover .support-coin {
            animation: supportCoinDrop ${SUPPORT_COIN_DURATION}s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          }
          .group:hover .support-piggy {
            animation: supportPiggyNudge ${SUPPORT_COIN_DURATION}s ease-in-out infinite;
          }
        }
        /* 錢幣路徑：起點＝水龍頭口(left/top 約 30%/28%)，終點＝小豬背上投幣處(約 66%/46%)。想改落點就調這些百分比。 */
        @keyframes supportCoinDrop {
          0%   { left: 30%; top: 28%; opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          12%  { left: 31%; top: 32%; opacity: 1; transform: translate(-50%, -50%) scale(1); }
          55%  { left: 62%; top: 42%; opacity: 1; transform: translate(-50%, -50%) scale(1); }
          66%  { left: 66%; top: 46%; opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          100% { left: 30%; top: 28%; opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
        }
        /* 小豬收錢：錢幣落下瞬間(約 60%)以底部為基準輕輕壓一下再彈回。 */
        @keyframes supportPiggyNudge {
          0%, 52%  { transform: translateY(0) scale(1, 1); }
          60%      { transform: translateY(2%) scale(1.05, 0.95); }
          70%      { transform: translateY(0) scale(0.98, 1.02); }
          80%, 100%{ transform: translateY(0) scale(1, 1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .support-coin { animation: none !important; opacity: 0 !important; }
          .support-piggy { animation: none !important; }
        }
      `}</style>

      {/* 水龍頭（左上，靜態，實心版） */}
      <svg className="support-faucet absolute text-white/90" viewBox="0 0 100 100" fill="currentColor" style={{ width: "50%", left: "2%", top: "2%" }}>
        <rect x="2" y="24" width="10" height="22" rx="3" />
        <rect x="8" y="29" width="54" height="12" rx="4" />
        <rect x="28" y="16" width="12" height="16" rx="3" />
        <rect x="20" y="8" width="28" height="9" rx="4.5" />
        <rect x="50" y="38" width="12" height="17" rx="4" />
      </svg>

      {/* 錢幣（動畫；left/top 由 keyframes 控制，起始貼在水龍頭口） */}
      <svg className="support-coin absolute" viewBox="0 0 100 100" style={{ width: "20%", left: "30%", top: "28%" }}>
        <circle cx="50" cy="50" r="30" fill="white" />
        <text x="50" y="52" textAnchor="middle" dominantBaseline="central" fontSize="46" fontWeight={800} fill="#151515" fontFamily="'Ubuntu Sans Mono', monospace">$</text>
      </svg>

      {/* 小豬撲滿（右下，靜態；沿用你喜歡的 lucide PiggyBank 線條版） */}
      <div className="support-piggy absolute" style={{ width: "62%", right: "3%", bottom: "8%" }}>
        <PiggyBank className="text-white/85 w-full h-auto" strokeWidth={1.4} />
      </div>
    </div>
  );
}

// standalone=true：獨立分頁（#/overview）。註：兩個版本的版面外框與格子大小現在完全一致；
// standalone 目前只用來決定「是否套用首頁標題開關」（見下方 SHOW_HOME_HEADER），不再影響格子高度。
export default function BentoSection({ standalone = false }: { standalone?: boolean }) {
  const time = useCountdown(COUNTDOWN_TARGET);
  // 圓環顯示「天數」；若當天/已過活動，退回顯示 0，避免負數。
  const days = Math.max(0, time.d);

  return (
    // 版面外框：兩個版本（首頁捲動版 & 獨立頁 #/overview）共用同一套 → 整個 section 佔滿一屏（min-h-[100svh]），
    // 讓下面的格子在兩邊都是「完全相同的高度／大小」。以前首頁版用 py-16 + 固定 min-h[560px]，格子才會比獨立頁矮、看起來不一樣。
    // ※ pt-28 是留給固定 Header 的空間（避免最上排卡片被 Header 蓋住）；pb 是底部留白。
    <section
      id="overview"
      className="bg-black px-4 md:px-6 xl:px-8 pt-24 sm:pt-28 lg:pt-28 pb-6 lg:pb-10 min-h-[100svh] flex flex-col"
    >
      {/* 標題區塊：獨立頁（standalone / #/overview）本來就不顯示；首頁捲動版由上方 SHOW_HOME_HEADER 開關控制（目前關閉＝隱藏，把空間讓給格子）。 */}
      {!standalone && SHOW_HOME_HEADER && (
        <div className="max-w-[1680px] w-full mx-auto mb-6">
          <Reveal>
            <p
              className="tracking-[2.4px] mb-4"
              style={{ fontSize: "14px", fontFamily: "'Ubuntu Sans Mono', monospace", background: "linear-gradient(90deg, #FFF 0%, #595959 34.13%, #FFF 67.79%, #3A3A3A 100%)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundSize: "220% 100%" }}
            >
              －關於我們・資訊總覽
            </p>
            <h2 className="leading-none mb-6" style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 700, letterSpacing: "0.6px", fontSize: "clamp(2.5rem, 3.5vw, 60px)" }}>
              <span className="text-white block">YOUR</span>
              <span className="text-[#2f9ebd] block">CAMPUS PORTAL</span>
            </h2>
          </Reveal>
        </div>
      )}

      {/* 格子容器：flex-1 撐滿 section 剩餘高度（兩個版本一致）。以前首頁版是寫死的 lg:min-h-[560px]，才會比獨立頁矮。 */}
      <div className="max-w-[1680px] w-full mx-auto flex flex-col lg:flex-row gap-3 lg:gap-4 flex-1 min-h-0">
        {/* ══ 左半：UP NEXT + 漸層條 / ABOUT 53 ══ */}
        <div className="flex flex-col gap-3 lg:gap-4 lg:w-[49.8%] shrink-0">
          {/* 上排：倒數卡（寬）＋ 漸層條（窄） */}
          <div className="flex-[1.1] flex gap-3 lg:gap-4 min-h-[240px] lg:min-h-[0]">
            <Reveal className="flex-1 flex flex-col">
              {/* 標籤＋圓環＋標題當成一個整體置中；卡片不論高矮都長一樣（首頁／獨立頁統一格式）。 */}
              <a href={LINKS.calendar} aria-label="下一場活動 — 系學會行事曆" className={`${BENTO_CARD} flex-1 p-5 md:p-6 lg:p-8 cursor-pointer items-center justify-center text-center`} style={BENTO_BG}>
                {/* 圓環＋標題整組垂直置中；「UP NEXT」標籤絕對定位浮在卡片頂部（脫離版面 → 平常圓環＋標題照樣正中央）。
                    ▸ 間距/大小：NEXT_TITLE_GAP、NEXT_RING_SIZE、NEXT_TITLE_SIZE（都在檔案最上方）。標籤與頂部距離＝下面的 top-5/top-7。
                    ▸ 質感：hover 時標籤在頂部淡入，圓環＋標題整組往下滑一點讓位（GPU transform，不重排、不卡）；觸控裝置一律顯示。 */}
                <HoverReveal className="absolute inset-x-0 top-5 md:top-7 flex justify-center px-4 pointer-events-none">
                  <p className="text-white tracking-[0.24em]" style={{ ...monoSemi, fontSize: "clamp(11px, 1.2vw, 19px)" }}>
                    UP NEXT&nbsp;&nbsp;下一場活動
                  </p>
                </HoverReveal>
                <div className="flex flex-col items-center transition-transform duration-500 ease-out [@media(hover:hover)]:group-hover:translate-y-2.5">
                  <CountdownRing days={days} size={NEXT_RING_SIZE} />
                  {/* 標題：維持單行（whitespace-nowrap，比照原型）；已移除 text-ellipsis，改由上方縮小圓環＋間距讓它完整顯示、不再被切。 */}
                  <p className="text-white whitespace-nowrap max-w-full" style={{ fontFamily: "'Chiron Hei HK Text','Noto Sans TC', sans-serif", fontWeight: 900, fontSize: NEXT_TITLE_SIZE, letterSpacing: "0.08em", marginTop: NEXT_TITLE_GAP }}>
                    {NEXT_EVENT.name}
                  </p>
                </div>
              </a>
            </Reveal>
            {/* 漸層條解壓玩具（固定窄寬；PullBar 內部用 h-full 撐滿整欄高度） */}
            <div className="shrink-0" style={{ width: "clamp(48px, 5vw, 72px)" }}>
              <PullBar />
            </div>
          </div>

          {/* 下排：ABOUT 53 卡 —— 中間系學會 Logo（SVG）＋ 左右大數字 5、3（SVG，你的三層堆疊設計）。
              ★ 連結暫時擱置：等「學會發展歷程」公告頁做好後，把下面外層的 <div> 換回
                <a href="#你的公告頁路由" aria-label="…" className={`${BENTO_CARD} flex-1 p-5 md:p-6 lg:p-8 cursor-pointer`} …>
                （記得加回 cursor-pointer），CardCaption 的 hover 展開不受影響。 */}
          <Reveal delay={60} className="flex-[0.9] flex flex-col min-h-[160px] lg:min-h-[0]">
            <div aria-label="關於臺大圖資系學會 — 第 53 屆" className={`${BENTO_CARD} flex-1 p-5 md:p-6 lg:p-8`} style={BENTO_BG}>
              <div className="flex-1 flex items-center justify-center transition-transform duration-500 ease-out [@media(hover:hover)]:group-hover:-translate-y-2">
                {/* 新版系學會 Logo（含 53）SVG，等比例置中。想調大小改 ABOUT_LOGO_MAXH。 */}
                <img src={aboutLogo} alt="臺大圖資系學會 第 53 屆" className="w-auto max-w-[92%] object-contain select-none" style={{ maxHeight: ABOUT_LOGO_MAXH }} />
              </div>
              <CardCaption en="ABOUT US" zh="臺大圖資系學會" />
            </div>
          </Reveal>
        </div>

        {/* ══ 右半 ══ */}
        <div className="flex-1 flex flex-col gap-3 lg:gap-4">
          {/* 右上排：NEWS + RESOURCES */}
          <div className="flex-[1] flex gap-3 lg:gap-4 min-h-[150px] lg:min-h-[0]">
            {/* NEWS：App 圖示 + 紅點 */}
            <Reveal delay={80} className="flex-1 flex flex-col">
              <a href={LINKS.news} aria-label="最新動態" className={`${BENTO_CARD} flex-1 p-5 md:p-6 cursor-pointer`} style={BENTO_BG}>
                <div className="flex-1 flex items-center justify-center transition-transform duration-500 ease-out [@media(hover:hover)]:group-hover:-translate-y-2">
                  <div className="relative">
                    <div className="rounded-[26%] bg-[#1c1c1e] border border-white/10 flex items-center justify-center" style={{ width: "clamp(64px, 8vw, 120px)", height: "clamp(64px, 8vw, 120px)" }}>
                      <img
                        src={newsLogo}
                        alt=""
                        className="object-contain opacity-90"
                        style={{
                          width: `${NEWS_LOGO_SIZE}%`,
                          height: `${NEWS_LOGO_SIZE}%`,
                          transform: `translate(${NEWS_LOGO_OFFSET_X}px, ${NEWS_LOGO_OFFSET_Y}px)`,
                        }}
                      />
                    </div>
                    {/* 紅色未讀紅點：平常隱藏，hover 卡片時像 iOS 通知那樣「從 0 放大、微微過衝再回穩」跳出。
                        觸控裝置（無 hover）一律顯示，避免看不到訊息數。
                        想調彈跳：改 newsBadgePop 的 55% 那格（1.18 越大過衝越明顯）與整體秒數（0.45s，越大越慢）。 */}
                    <style>{`
                      .news-badge {
                        transform: scale(0);
                        opacity: 0;
                        transition: transform 0.22s ease, opacity 0.22s ease;
                        will-change: transform, opacity;
                      }
                      @media (hover: none) {
                        .news-badge { transform: none; opacity: 1; }
                      }
                      @media (hover: hover) {
                        .group:hover .news-badge {
                          animation: newsBadgePop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                        }
                      }
                      @keyframes newsBadgePop {
                        0%   { transform: scale(0);    opacity: 0; }
                        55%  { transform: scale(1.18); opacity: 1; }
                        100% { transform: scale(1);    opacity: 1; }
                      }
                      @media (prefers-reduced-motion: reduce) {
                        .news-badge { transition: none; }
                        .group:hover .news-badge { animation: none; transform: none; opacity: 1; }
                      }
                    `}</style>
                    <span
                      className="news-badge absolute -top-1.5 -right-1.5 rounded-full flex items-center justify-center text-white"
                      style={{ width: "clamp(20px, 2.2vw, 30px)", height: "clamp(20px, 2.2vw, 30px)", background: "#E5484D", ...monoBold, fontSize: "clamp(10px, 1.1vw, 15px)", transformOrigin: "center" }}
                    >
                      5
                    </span>
                  </div>
                </div>
                <CardCaption en="NEWS" zh="最新動態" />
              </a>
            </Reveal>

            {/* RESOURCES：聊天泡泡 */}
            <Reveal delay={100} className="flex-1 flex flex-col">
              <a href={LINKS.resources} aria-label="學術資源" className={`${BENTO_CARD} flex-1 p-5 md:p-6 cursor-pointer`} style={BENTO_BG}>
                <div className="flex-1 flex flex-col transition-transform duration-500 ease-out [@media(hover:hover)]:group-hover:-translate-y-2">
                  {/* 聊天泡泡逐則出現動畫；改對話內容→上方 CHAT_LINES，時間自動調整。 */}
                  <ChatBubbles lines={CHAT_LINES} />
                </div>
                <CardCaption en="RESOURCES" zh="學術資源" />
              </a>
            </Reveal>
          </div>

          {/* 右中排：MEMBERS 圓點牆 + SUPPORT US 小豬 */}
          <div className="flex-[1] flex gap-3 lg:gap-4 min-h-[150px] lg:min-h-[0]">
            {/* MEMBERS：彩色圓點牆 */}
            <Reveal delay={120} className="flex-1 flex flex-col">
              <a href={LINKS.team} aria-label="工作團隊" className={`${BENTO_CARD} flex-1 p-5 md:p-6 cursor-pointer`} style={BENTO_BG}>
                <div className="flex-1 flex items-center justify-center transition-transform duration-500 ease-out [@media(hover:hover)]:group-hover:-translate-y-2">
                  {/* 10×4 圓點牆：每顆固定大小（TEAM_DOT_SIZE）、間距 TEAM_DOT_GAP，整體置中。 */}
                  <div className="grid" style={{ gridTemplateColumns: `repeat(${TEAM_COLS}, ${TEAM_DOT_SIZE})`, gap: TEAM_DOT_GAP, justifyContent: "center" }}>
                    {MEMBER_DOTS.map((c, i) => (
                      <span key={i} className="rounded-full" style={{ width: TEAM_DOT_SIZE, height: TEAM_DOT_SIZE, background: c }} />
                    ))}
                  </div>
                </div>
                <CardCaption en="MEMBERS" zh="工作團隊" />
              </a>
            </Reveal>

            {/* SUPPORT US：水龍頭滴錢幣進撲滿（暫不連結 → 用 div，無 hover 箭頭） */}
            <Reveal delay={140} className="flex-1 flex flex-col">
              <div className={`${BENTO_CARD} flex-1 p-5 md:p-6`} style={BENTO_BG}>
                <div className="flex-1 flex items-center justify-center transition-transform duration-500 ease-out [@media(hover:hover)]:group-hover:-translate-y-2">
                  <SupportScene />
                </div>
                <CardCaption en="SUPPORT US" zh="贊助我們" />
              </div>
            </Reveal>
          </div>

          {/* 右下排：社群 */}
          <div className="flex-[0.85] flex gap-3 lg:gap-4 min-h-[90px] lg:min-h-[0]">
            <SocialCard label="INSTAGRAM" path={svgPaths.p372aef00} vb="0 0 64 64" href="https://www.instagram.com/ntu_lis_sa?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" delay={160} />
            <SocialCard label="FACEBOOK" path={svgPaths.p1c5aa00} vb="0 0 64 64" href="https://www.facebook.com/ntulislis" delay={180} />
            <SocialCard label="THREADS" path={svgPaths.p3455000} vb="0 0 55 64" href="https://www.threads.com/@ntu_lis_sa" delay={200} />
          </div>
        </div>
      </div>
    </section>
  );
}