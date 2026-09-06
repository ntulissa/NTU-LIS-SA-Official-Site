import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Reveal } from "./shared";
import { PRESIDENTS, type Dept, type Election } from "./presidents";

/**
 * 歷任會長頁（PAST PRESIDENTS）── 版型／呈現邏輯
 * ─────────────────────────────────────────────────────────────
 * ● 版面：左半可捲動（標題 → 第X屆 → 任期 → 簡介 → 團隊成員名單），
 *          右半 sticky 固定（會長照片、姓名、系級、英文名、屆數切換器）。
 * ● 切換器：中間是紅→藍漸層的屆數數字；左邊紅點、右邊藍點。
 *          滑鼠移到左紅點 → 放大成紅色「<」＝上一屆（較早）；
 *          滑鼠移到右藍點 → 放大成藍色「>」＝下一屆（較新）。端點自動停用。
 *
 * ★ 要新增／修改某一屆的「內容」（姓名、簡介、團隊名單、選舉結果…），
 *   請改隔壁的 presidents.ts，這支檔案（版型）通常不用動。
 */

// ── 字型（與全站一致；Chiron Hei HK 為商用字體，退回 Noto Sans TC）──
const zhDisplay = "'Chiron Hei HK Text', 'Noto Sans TC', sans-serif"; // 姓名（中文）
const zhFont = "'Noto Sans TC', sans-serif"; // 內文
const monoFont = "'Ubuntu Sans Mono', monospace"; // 英文名 / 標籤 / 屆數
const enDisplay = "'Josefin Sans', sans-serif"; // 英文大標

// 現任屆＝陣列第一個（最新）。任期由屆數推算（第52屆＝2025.07~2026.07；每屆一年）；
// 現任這屆結束改顯示「至今」，讓使用者一眼看出是新上任、任期進行中的會長。
const CURRENT_GEN = PRESIDENTS[0]?.gen;
function termOf(gen: number) {
  const start = gen + 1973; // 52 -> 2025
  if (gen === CURRENT_GEN) return `${start}.07 ～ 至今`;
  return `${start}.07 ～ ${start + 1}.07`;
}

// ── 「現任團隊」按鈕：只在「現任這屆」且尚未填團隊名單（depts 為空）時，於簡介下方出現。──
// 之後若把現任屆的 depts 補上，按鈕會自動消失、改顯示團隊名單。連結／文字要改就改這兩個。
const CURRENT_TEAM_HREF = "#/current-team";
const CURRENT_TEAM_LABEL = "現任團隊";

/* ── 會長照片：自動對應 ──────────────────────────────────────
   把照片放到  imports/Presidents/  資料夾，檔名＝屆數（如 52.jpg、51.png）。
   之後只要「丟檔案進資料夾」就會自動顯示，程式不用再改；presidents.ts 每屆的 img 可留空字串。
   （若某屆想手動指定別的圖，仍可在該屆物件的 img 直接填路徑，會優先採用。）
   註：import.meta.glob 為 Vite 功能；若 @/ 別名在此不生效，
       把路徑改成相對路徑 "../../../imports/Presidents/*.{png,jpg,jpeg,webp}" 即可。 */
const PHOTOS = import.meta.glob(
  "@/imports/Presidents/*.{png,jpg,jpeg,webp}",
  { eager: true, import: "default" }
) as Record<string, string>;

function photoOf(gen: number): string {
  const hit = Object.entries(PHOTOS).find(([path]) => path.includes(`/${gen}.`));
  return hit ? hit[1] : "";
}

// ── 屆數切換器上的「點 → 箭頭」按鈕 ─────────────────────────
function NavArrow({
  dir,
  color,
  disabled,
  onClick,
}: {
  dir: "prev" | "next";
  color: string;
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "上一屆（較早）" : "下一屆（較新）"}
      className="group relative flex items-center justify-center disabled:cursor-default"
      style={{ width: "46px", height: "46px" }}
    >
      {disabled ? (
        // 已達最舊/最新：靜態暗點，不脈動、不出現箭頭
        <span className="absolute rounded-full" style={{ width: "11px", height: "11px", background: color, opacity: 0.18 }} />
      ) : (
        <>
          {/* 平常：持續脈動的同色光暈 + 核心圓點（提示「可點擊」）；hover 時整組淡出 */}
          <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-out group-hover:opacity-0">
            <span className="nav-pulse-halo absolute rounded-full" style={{ width: "22px", height: "22px", background: color, filter: "blur(5px)" }} />
            <span className="nav-pulse-dot absolute rounded-full" style={{ width: "11px", height: "11px", background: color }} />
          </span>
          {/* hover：放大成圓形箭頭按鈕 */}
          <span
            className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 scale-75 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-100"
            style={{ background: color, boxShadow: `0 8px 20px -8px ${color}` }}
          >
            <Icon size={22} strokeWidth={2.6} className="text-white" />
          </span>
        </>
      )}
    </button>
  );
}

// ── 單一部門卡片 ───────────────────────────────────────────
function DeptCard({ dept }: { dept: Dept }) {
  return (
    <div
      className="rounded-2xl border p-4 sm:p-5"
      style={{ borderColor: dept.color, background: "rgba(255,255,255,0.02)" }}
    >
      <p className="mb-4 whitespace-nowrap" style={{ fontFamily: monoFont, fontWeight: 700, fontSize: "clamp(0.68rem,0.9vw,0.85rem)", letterSpacing: "0.12em" }}>
        <span style={{ color: dept.color }}>{dept.en}.</span>{" "}
        <span className="text-white/85">{dept.zh}</span>
      </p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
        {dept.members.map((m, i) => (
          <div key={`${m.n}-${i}`} className="flex items-center gap-2 min-w-0">
            <span
              className="shrink-0 text-white/70 rounded-[4px] px-1.5 py-0.5"
              style={{ fontFamily: monoFont, fontWeight: 500, fontSize: "0.6rem", background: "rgba(255,255,255,0.12)", letterSpacing: "0.04em" }}
            >
              {m.c}
            </span>
            <span className="text-white truncate" style={{ fontFamily: zhFont, fontWeight: 700, fontSize: "clamp(0.8rem,1vw,0.95rem)", letterSpacing: "0.08em" }}>
              {m.n}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 把部門依「估算高度」分成左右兩欄（保留原順序）。左欄先填、且高度 ≥ 右欄，
// 讓兩欄各自向下緊貼堆疊、不會因整列對齊而在中間留空；剩餘空白只落在右下角。
function splitTwoColumns(depts: Dept[]): [Dept[], Dept[]] {
  const weight = (d: Dept) => 1 + Math.ceil(d.members.length / 2); // 標題列 + 名單列數
  const half = depts.reduce((s, d) => s + weight(d), 0) / 2;
  const left: Dept[] = [];
  const right: Dept[] = [];
  let acc = 0;
  for (const d of depts) {
    if (acc < half) {
      left.push(d);
      acc += weight(d);
    } else {
      right.push(d);
    }
  }
  return [left, right];
}

// ── 會長照片：交叉淡入舞台 ─────────────────────────────────
// 切換屆時，新照片淡入、舊照片淡出（cross-dissolve），而非硬切；配合下方預先載入避免卡頓。
const PHOTO_H = "clamp(280px, 50vh, 560px)"; // 照片區高度（與姓名/屆數的固定位置對齊）

// 照片底部漸層遮罩：讓每張會長照片的下緣淡出、像漂浮融進黑背景，而非硬切一條黑邊。
// 想讓淡出範圍更多→把 72% 調小（例如 60%，淡出下方 40%）；想更少→調大（例如 82%）。
const PHOTO_FADE = "linear-gradient(to bottom, #000 72%, transparent 100%)";

function renderPhoto(src: string, name: string) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="absolute inset-0 w-full h-full object-contain object-top select-none pointer-events-none"
        style={{ WebkitMaskImage: PHOTO_FADE, maskImage: PHOTO_FADE }}
      />
    );
  }
  // 沒有照片：置中「照片待補」佔位框
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="flex flex-col items-center justify-center gap-3 text-white/25 rounded-2xl border border-white/10"
        style={{ height: "100%", width: "clamp(220px, 26vw, 380px)", fontFamily: monoFont, letterSpacing: "0.2em" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-16 h-16">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
        </svg>
        <span className="text-xs">照片待補</span>
      </div>
    </div>
  );
}

function PhotoStage({ src, name }: { src: string; name: string }) {
  const keyRef = useRef(0);
  const [layers, setLayers] = useState<{ k: number; src: string }[]>([{ k: 0, src }]);
  const removeTimer = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    // 真正把新照片疊上來、開始交叉溶解（舊層在 650ms 後移除）
    const commit = () => {
      if (cancelled) return;
      setLayers((cur) => {
        const top = cur[cur.length - 1];
        if (top && top.src === src) return cur; // 沒變就不動作
        keyRef.current += 1;
        return [...cur, { k: keyRef.current, src }].slice(-2); // 僅保留「舊 + 新」兩層
      });
      if (removeTimer.current) window.clearTimeout(removeTimer.current);
      removeTimer.current = window.setTimeout(() => setLayers((cur) => cur.slice(-1)), 650);
    };

    // 先「等新照片解碼完成」再開始動畫：舊照片撐著不移除，避免出現全黑空檔，
    // 讓每一屆的切換都跟已快取的近幾屆一樣是平順的交叉溶解（而非黑→淡入）。
    if (!src) {
      commit(); // 佔位框沒有圖片，直接切
    } else if (typeof window !== "undefined") {
      const img = new window.Image();
      img.src = src;
      if (img.decode) {
        img.decode().then(commit).catch(commit); // 解碼好或失敗都照常切
      } else if (img.complete) {
        commit();
      } else {
        img.onload = commit;
        img.onerror = commit;
      }
    } else {
      commit();
    }

    return () => { cancelled = true; };
  }, [src]);

  return (
    <div className="relative w-full" style={{ height: PHOTO_H }}>
      {layers.map((layer, i) => (
        <div key={layer.k} className={i === layers.length - 1 ? "pp-photo-in" : "pp-photo-out"} style={{ position: "absolute", inset: 0 }}>
          {renderPhoto(layer.src, name)}
        </div>
      ))}
    </div>
  );
}

// ── 右半：會長個人資訊面板（照片 → 姓名/系級 → 英文名 → 屆數切換器，全部置中）──
// 桌機以 fixed 釘在右半、永遠顯示；手機則靜態顯示於頁面上方。
function ProfilePanel({
  name,
  cls,
  roman,
  gen,
  photo,
  canOlder,
  canNewer,
  onOlder,
  onNewer,
}: {
  name: string;
  cls: string;
  roman: string;
  gen: number;
  photo: string;
  canOlder: boolean;
  canNewer: boolean;
  onOlder: () => void;
  onNewer: () => void;
}) {
  return (
    // 固定頂端對齊（justify-start + 固定 pt）：照片、姓名、屆數在每一屆都落在同一垂直位置，換屆不位移。
    <div className="w-full h-full flex flex-col items-center justify-start text-center px-6 sm:px-10 pt-24 lg:pt-[112px] pb-16">
      {/* 會長照片（交叉淡入；縮小、完整顯示人物；頭頂大致與左側 ABOUT US 齊高）*/}
      <PhotoStage src={photo} name={name} />

      {/* 姓名 + 系級徽章（置中） */}
      <div className="flex items-end justify-center gap-3 mt-7">
        <p className="text-white leading-none" style={{ fontFamily: zhDisplay, fontWeight: 900, fontSize: "clamp(2.2rem,4vw,3.6rem)", letterSpacing: "0.08em" }}>
          {name}
        </p>
        {cls && (
          <span
            className="mb-1.5 rounded-[6px] px-3 py-1"
            style={{ background: "linear-gradient(90deg,#FFF 0%,#B3B3B3 100%)", color: "#000", fontFamily: monoFont, fontWeight: 700, fontSize: "clamp(0.85rem,1.2vw,1.15rem)", letterSpacing: "0.06em" }}
          >
            {cls}
          </span>
        )}
      </div>

      {/* 英文名（置中，兩側細線） */}
      {roman && (
        <div className="flex items-center justify-center gap-3 mt-3">
          <span className="h-px w-8 sm:w-12" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5))" }} />
          <span style={{ fontFamily: monoFont, fontWeight: 400, fontSize: "clamp(0.72rem,1vw,0.95rem)", letterSpacing: "0.22em", background: "linear-gradient(90deg,#FFF 0%,#8f8f8f 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent" }}>
            {roman}
          </span>
          <span className="h-px w-8 sm:w-12" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.5), transparent)" }} />
        </div>
      )}

      {/* 屆數切換器：•  52  •（置中） */}
      <div className="flex items-center justify-center gap-5 sm:gap-7 mt-8">
        <NavArrow dir="prev" color="#D14B4B" disabled={!canOlder} onClick={onOlder} />
        <span
          className="tabular-nums leading-none select-none"
          style={{
            fontFamily: monoFont,
            fontWeight: 700,
            fontSize: "clamp(2.4rem,4.5vw,4rem)",
            letterSpacing: "0.06em",
            background: "linear-gradient(90deg, #D14B4B 0%, #2F9EBD 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
          }}
        >
          {gen}
        </span>
        <NavArrow dir="next" color="#2F9EBD" disabled={!canNewer} onClick={onNewer} />
      </div>
    </div>
  );
}

// ── 選舉結果面板（左半；接在「團隊成員」下方）─────────────────
// ● 標題徽章：與「團隊成員」完全同款（同字型 zhFont、同尺寸、同內距）。
// ● 長條：滿格基準＝有效票（同意＋不同意）；所以同意 68/68＝填滿，不同意 0＝只剩紅藍漸層外框。
// ● 投票率 Donut：大而細的紅藍漸層整圈；中央百分比＝有效票÷選舉人數（自動計算）。
// 數字（票數、屆數、百分比）用 Josefin Sans（enDisplay）；中文標題用 Chiron Hei（zhDisplay/zhFont）。
const ELECTION_GRAD = "linear-gradient(90deg, #D14B4B 0%, #2F9EBD 100%)"; // 全站紅→藍

function ElectionResult({ e }: { e: Election }) {
  const valid = e.agree + e.disagree; // 有效票
  const invalid = e.invalid ?? 0; // 廢票（預設 0）
  const turnout = e.electorate > 0 ? Math.round(((valid + invalid) / e.electorate) * 100) : 0; // 投票率 %＝(有效票＋無效票)÷選舉人數（四捨五入）
  const base = Math.max(valid, 1); // 長條滿格＝有效票總數（同意＋不同意）
  const bars = [
    { label: "同意票", value: e.agree, pct: Math.min(100, (e.agree / base) * 100) },
    { label: "不同意票", value: e.disagree, pct: Math.min(100, (e.disagree / base) * 100) },
  ];

  // ── 投票率環的漸層字串 ───────────────────────────────────────
  // 紅＝有效票（＝投票率）、淺灰＝廢票、藍＝其餘（未投票）；三段皆以選舉人數為基準，交界用漸層柔化。
  // 廢票通常極少（如 1 票），為了看得見給一個最小顯示寬度 GREY_MIN%；實際占比仍是 invalid/選舉人數。
  const GREY = "#C9C9C9"; // 廢票的淺灰色（想更淺/更深改這裡）
  const GREY_MIN = 3.5; // 廢票在環上的最小顯示寬度（%）；設 0 則完全照實際比例（1 票會非常細）
  const D = 1.2; // 交界柔化寬度（%）
  const validPct = e.electorate > 0 ? (valid / e.electorate) * 100 : 0;
  const invalidPct = e.electorate > 0 ? (invalid / e.electorate) * 100 : 0;
  const greyPct = invalid > 0 ? Math.max(invalidPct, GREY_MIN) : 0;
  const ringBg =
    greyPct === 0
      ? // 無廢票：紅（投票率）→ 藍，維持原本柔和漸層
        `conic-gradient(from 0deg, #D14B4B 0%, #D14B4B ${Math.max(0, turnout - 6)}%, #2F9EBD ${Math.min(100, turnout + 6)}%, #2F9EBD 94%, #D14B4B 100%)`
      : // 有廢票：紅（有效票）→ 淺灰（廢票）→ 藍（未投票）
        `conic-gradient(from 0deg, #D14B4B 0%, #D14B4B ${Math.max(0, validPct - D)}%, ${GREY} ${validPct + D}%, ${GREY} ${Math.max(validPct + D, validPct + greyPct - D)}%, #2F9EBD ${validPct + greyPct + D}%, #2F9EBD 94%, #D14B4B 100%)`;

  return (
    <div className="w-full">
      {/* 標題列：選舉結果徽章（＝團隊成員同款）＋ 投票日期 */}
      <div className="flex items-center gap-4 mb-10 flex-wrap">
        <div className="inline-flex rounded-full" style={{ padding: "1.5px", background: ELECTION_GRAD }}>
          <div className="rounded-full bg-black px-6 py-2">
            <span className="text-white" style={{ fontFamily: zhFont, fontWeight: 700, fontSize: "clamp(0.9rem,1.1vw,1.05rem)", letterSpacing: "0.24em", paddingLeft: "0.24em" }}>
              選舉結果
            </span>
          </div>
        </div>
        <span className="text-white/40" style={{ fontFamily: monoFont, fontWeight: 500, fontSize: "0.8rem", letterSpacing: "0.12em", color: "#ffffff", opacity: 0.8 }}>
          投票日期：{e.date}
        </span>
      </div>

      {/* 同意 / 不同意 長條：外框紅藍漸層（1.5px）；填滿部分為紅藍漸層 */}
      <div className="space-y-7 mb-14">
        {bars.map((row) => (
          <div key={row.label}>
            <p className="text-white mb-3" style={{ fontFamily: zhDisplay, fontWeight: 900, fontSize: "clamp(1.05rem,1.5vw,1.35rem)", letterSpacing: "0.16em" }}>
              {row.label}
            </p>
            <div className="flex items-center gap-5">
              {/* 外框（漸層 1.5px）→ 內部黑底 → 漸層填滿（寬度＝該票數佔有效票比例） */}
              <div className="flex-1 rounded-full" style={{ padding: "1.5px", background: ELECTION_GRAD }}>
                <div className="rounded-full overflow-hidden" style={{ background: "#0a0a0a", height: "16px" }}>
                  <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${row.pct}%`, background: ELECTION_GRAD }} />
                </div>
              </div>
              <span className="text-white shrink-0 text-right tabular-nums" style={{ fontFamily: enDisplay, fontWeight: 600, fontSize: "clamp(1.3rem,1.8vw,1.7rem)", letterSpacing: "0.08em", minWidth: "2.4ch" }}>
                {row.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 投票率標題 */}
      <p className="text-white mb-6" style={{ fontFamily: zhDisplay, fontWeight: 900, fontSize: "clamp(1.05rem,1.5vw,1.35rem)", letterSpacing: "0.16em" }}>
        投票率
      </p>

      {/* Donut（左，資料來源接在其下）＋ 中：有效票／選舉人數 ＋ 右下：參選人 */}
      <div className="flex flex-wrap items-start gap-x-10 sm:gap-x-12 gap-y-8">
        {/* 左：Donut ＋ 資料來源（緊貼 Donut 下方，版面不再拉長）*/}
        <div className="flex flex-col shrink-0" style={{ width: "clamp(180px,15vw,220px)" }}>
          <div className="relative" style={{ width: "100%", aspectRatio: "1" }}>
            {/* 投票率環：紅＝有效票（投票率）、淺灰＝廢票、藍＝其餘；比例自動跟著資料走。
                環的漸層字串在上方 ringBg 組好；想調環粗細改兩處的 9px。 */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: ringBg,
                WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 9px), #000 calc(100% - 9px))",
                mask: "radial-gradient(farthest-side, transparent calc(100% - 9px), #000 calc(100% - 9px))",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white leading-none" style={{ fontFamily: enDisplay, fontWeight: 700, fontSize: "clamp(2.6rem,4vw,3.4rem)" }}>
                {turnout}
                <span style={{ fontSize: "0.42em", fontWeight: 500 }}>%</span>
              </span>
            </div>
          </div>
          <p className="text-white/30 mt-4 text-center" style={{ fontFamily: zhFont, fontWeight: 500, fontSize: "0.72rem", letterSpacing: "0.08em", color: "#ffffff", opacity: 0.6 }}>
            資料來源：{e.source ?? "臺大圖資系學會選委會"}
          </p>
        </div>

        {/* 中：有效票（紅）／無效票（淺灰，有廢票才顯示）／選舉人數（藍），上下分開貼齊環的上下緣 */}
        <div className="flex flex-col justify-between self-start py-3" style={{ minHeight: "clamp(180px,15vw,220px)" }}>
          <div>
            <p style={{ fontFamily: enDisplay, fontWeight: 700, fontSize: "clamp(1.6rem,2.4vw,2.1rem)", color: "#D14B4B", lineHeight: 1, letterSpacing: "0.06em" }}>{valid}</p>
            <p className="text-white/45 mt-1" style={{ fontFamily: zhFont, fontWeight: 500, fontSize: "0.85rem", letterSpacing: "0.1em" }}>有效票</p>
          </div>
          {invalid > 0 && (
            <div>
              <p style={{ fontFamily: enDisplay, fontWeight: 700, fontSize: "clamp(1.6rem,2.4vw,2.1rem)", color: GREY, lineHeight: 1, letterSpacing: "0.06em" }}>{invalid}</p>
              <p className="text-white/45 mt-1" style={{ fontFamily: zhFont, fontWeight: 500, fontSize: "0.85rem", letterSpacing: "0.1em" }}>無效票</p>
            </div>
          )}
          <div>
            <p style={{ fontFamily: enDisplay, fontWeight: 700, fontSize: "clamp(1.6rem,2.4vw,2.1rem)", color: "#2F9EBD", lineHeight: 1, letterSpacing: "0.06em" }}>{e.electorate}</p>
            <p className="text-white/45 mt-1" style={{ fontFamily: zhFont, fontWeight: 500, fontSize: "0.85rem", letterSpacing: "0.1em" }}>選舉人數</p>
          </div>
        </div>

        {/* 右下：參選人（紅藍漸層外框）；ml-auto 把方塊推到最右，右緣對齊上方票數的個位數 */}
        <div className="rounded-2xl self-end ml-auto" style={{ padding: "1.5px", background: ELECTION_GRAD }}>
          <div className="rounded-2xl px-6 py-5" style={{ background: "#0a0a0a" }}>
            <p className="text-white/60 text-center mb-4" style={{ fontFamily: zhFont, fontWeight: 500, fontSize: "0.85rem", letterSpacing: "0.24em", paddingLeft: "0.24em" }}>
              參選人 ①
            </p>
            <div className="space-y-3">
              {e.candidates.map((cd, i) => (
                <div key={`${cd.n}-${i}`} className="flex items-center gap-2.5">
                  <span
                    className="shrink-0 text-white/70 rounded-[4px] px-1.5 py-0.5"
                    style={{ fontFamily: monoFont, fontWeight: 500, fontSize: "0.62rem", background: "rgba(255,255,255,0.12)", letterSpacing: "0.04em" }}
                  >
                    {cd.c}
                  </span>
                  <span className="text-white" style={{ fontFamily: zhDisplay, fontWeight: 900, fontSize: "clamp(1rem,1.3vw,1.2rem)", letterSpacing: "0.14em" }}>
                    {cd.n}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PastPresidentsSection() {
  const [idx, setIdx] = useState(0); // 0 = 最新一屆（陣列第一個）
  const p = PRESIDENTS[idx] ?? PRESIDENTS[0];
  const hasData = p.name.trim() !== "";
  const photo = p.img || photoOf(p.gen); // 先看該屆有沒有手動指定，沒有就依屆數自動找

  // 右半固定面板的「快到頁尾時往上帶」位移：平常 0（照舊釘住）；當本區塊底部升進畫面
  // （＝ Footer 開始探進來）時，用同樣的量把面板往上推，讓它停在頁尾之上、不被 Footer 蓋住。
  const sectionRef = useRef<HTMLElement>(null);
  const [endShift, setEndShift] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => {
      const el = sectionRef.current;
      if (!el) return;
      setEndShift(Math.min(0, el.getBoundingClientRect().bottom - window.innerHeight));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [idx]); // 切換屆時內容高度會變，一併重算

  // 陣列是「新→舊」：往前一屆（較早）＝ index+1；往後一屆（較新）＝ index-1。
  const canOlder = idx < PRESIDENTS.length - 1;
  const canNewer = idx > 0;

  // 切換屆時「不」捲回頂端：讓使用者停在同一位置，例如正在看團隊名單時可直接比較另一屆的名單。
  const goOlder = () => { if (canOlder) setIdx((v) => v + 1); };
  const goNewer = () => { if (canNewer) setIdx((v) => v - 1); };

  // 預先載入所有會長照片，切換時就不會有載入卡頓（配合照片的淡入動畫）。
  useEffect(() => {
    if (typeof window === "undefined") return;
    PRESIDENTS.forEach((pp) => {
      const s = pp.img || photoOf(pp.gen);
      if (s) {
        const im = new window.Image();
        im.src = s;
      }
    });
  }, []);

  const [deptLeft, deptRight] = splitTwoColumns(p.depts); // 團隊名單分成左右兩欄（避免整列對齊留空）

  const panel = (
    <ProfilePanel
      name={hasData ? p.name : "—"}
      cls={hasData ? p.cls : ""}
      roman={hasData ? p.roman : ""}
      gen={p.gen}
      photo={photo}
      canOlder={canOlder}
      canNewer={canNewer}
      onOlder={goOlder}
      onNewer={goNewer}
    />
  );

  return (
    <section ref={sectionRef} id="presidents" className="relative bg-black">
      {/* 屆數切換按鈕的「呼吸式」脈動動畫（提示可點擊）；尊重使用者的「減少動態」設定 */}
      <style>{`
        @keyframes navPulseHalo {
          0%, 100% { transform: scale(0.65); opacity: 0.55; }
          50%      { transform: scale(1.6);  opacity: 0.06; }
        }
        @keyframes navPulseDot {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.22); }
        }
        .nav-pulse-halo { transform-origin: center; animation: navPulseHalo 1.8s ease-in-out infinite; }
        .nav-pulse-dot  { transform-origin: center; animation: navPulseDot 1.8s ease-in-out infinite; }

        /* 會長照片切換：新照片淡入（略微上浮），舊照片淡出 */
        @keyframes ppPhotoIn  { from { opacity: 0; transform: translateY(10px) scale(0.985); } to { opacity: 1; transform: none; } }
        @keyframes ppPhotoOut { from { opacity: 1; } to { opacity: 0; } }
        .pp-photo-in  { animation: ppPhotoIn 600ms cubic-bezier(0.22,1,0.36,1) both; }
        .pp-photo-out { animation: ppPhotoOut 600ms ease both; }

        @media (prefers-reduced-motion: reduce) {
          .nav-pulse-halo, .nav-pulse-dot { animation: none; }
          .pp-photo-in, .pp-photo-out { animation-duration: 1ms; }
        }
      `}</style>
      {/* ══════════ 右半：桌機用 fixed 釘在原地（不受左半捲動影響）══════════
          用 fixed 而非 sticky，是因為 App 根層有 overflow-x-hidden 會讓 sticky 失效。
          z-10：讓固定的 Header(z-50) 疊在照片上方。
          endShift：快到頁尾時把面板往上帶，讓它停在 Footer 之上、不被蓋住（連續位移、不跳）。 */}
      <div
        className="hidden lg:block fixed top-0 right-0 w-1/2 h-screen z-10"
        style={{ transform: `translateY(${endShift}px)` }}
      >
        {panel}
      </div>

      {/* ══════════ 手機：會長資訊顯示在最上方（靜態）══════════ */}
      <div className="lg:hidden min-h-[82vh] border-b border-white/5">{panel}</div>

      {/* ══════════ 左半：可捲動（右半空間由上面的 fixed 面板佔用）══════════ */}
      <div className="w-full lg:w-1/2 px-5 sm:px-8 md:px-12 lg:px-16">
        {/* 第一屏：標題 + 第X屆 + 任期 + 簡介
            用「固定頂端對齊」而非置中：標題/任期永遠釘在同一位置，換屆時不會因簡介長短而位移。
            lg:min-h-screen 仍讓「團隊成員」落到第二屏，需下滑才看到。 */}
        <div className="lg:min-h-screen pt-24 sm:pt-28 lg:pt-[128px] pb-16 lg:pb-24">
          <div className="max-w-[640px]">
            <Reveal>
              <p className="text-white/30 text-xs tracking-widest mb-5" style={{ fontSize: "14px",fontFamily: "'Ubuntu Sans Mono', monospace" ,background: "linear-gradient(90deg, #FFF 0%, #595959 34.13%, #FFF 67.79%, #3A3A3A 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundSize: "220% 100%",}}>
                — 關於我們・歷任會長
              </p>
            </Reveal>
            <Reveal delay={40}>
              <h2 className="font-bold leading-none mb-8 lg:mb-10" style={{ fontFamily: enDisplay, fontSize: "clamp(2.6rem,5vw,5rem)" }}>
                <span className="text-white block">PAST</span>
                <span className="block" style={{ color: "#D14B4B" }}>PRESIDENTS</span>
              </h2>
            </Reveal>

            <Reveal delay={80}>
              <h3
                className="leading-tight mb-3"
                style={{
                  fontFamily: zhDisplay,
                  fontWeight: 900,
                  fontSize: "clamp(1.8rem,3.4vw,3rem)",
                  letterSpacing: "0.06em",
                  background: "linear-gradient(90deg, #D14B4B 0%, #2F9EBD 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                }}
              >
                第 {p.gen} 屆系學會
              </h3>
              <p className="text-white/50 mb-8 lg:mb-10" style={{ fontFamily: monoFont, fontWeight: 500, fontSize: "clamp(0.8rem,1vw,1rem)", letterSpacing: "0.14em" }}>
                任期：{termOf(p.gen)}
              </p>
            </Reveal>

            <Reveal delay={120}>
              <p
                style={{
                  fontFamily: zhFont,
                  fontWeight: 500,
                  fontSize: "clamp(0.85rem,1vw,1rem)",
                  lineHeight: 2.1,
                  letterSpacing: "0.06em",
                  color: p.intro ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.4)",
                }}
              >
                {p.intro ? p.intro : "本屆簡介整理中，敬請期待。"}
              </p>
            </Reveal>

            {/* 現任這屆、且尚未填團隊名單時：簡介下方放「現任團隊」按鈕，直接連到現任團隊頁。 */}
            {p.gen === CURRENT_GEN && p.depts.length === 0 && (
              <Reveal delay={160}>
                <a
                  href={CURRENT_TEAM_HREF}
                  className="group inline-flex items-center gap-2 rounded-full bg-white text-black px-6 py-2.5 mt-8 lg:mt-10 hover:bg-white/90 transition-colors"
                  style={{ fontFamily: zhFont, fontWeight: 700, fontSize: "clamp(0.9rem,1.1vw,1.05rem)", letterSpacing: "0.14em" }}
                >
                  {CURRENT_TEAM_LABEL}
                  <ArrowRight size={17} strokeWidth={2.4} className="transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </Reveal>
            )}
          </div>
        </div>

        {/* 第二屏起：團隊成員（lg:min-h-screen 讓成員自成一屏，右側面板在瀏覽名單時保持完整顯示）*/}
        {p.depts.length > 0 && (
          <div className="max-w-[720px] pb-20 lg:pb-28 lg:min-h-screen lg:flex lg:flex-col lg:justify-center">
            {/* key 帶上屆數：切屆時整個團隊區重新掛載，讓進場動畫每次都重播（比照第一次看 52 屆） */}
            <Reveal key={`pill-${p.gen}`}>
              <div
                className="inline-flex rounded-full mb-8 lg:mb-10"
                style={{ padding: "1.5px", background: "linear-gradient(90deg, #D14B4B 0%, #2F9EBD 100%)" }}
              >
                <div className="rounded-full bg-black px-6 py-2">
                  <span className="text-white" style={{ fontFamily: zhFont, fontWeight: 700, fontSize: "clamp(0.9rem,1.1vw,1.05rem)", letterSpacing: "0.24em", paddingLeft: "0.24em" }}>
                    團隊成員
                  </span>
                </div>
              </div>
            </Reveal>

            {/* 兩欄各自向下緊貼堆疊（masonry 式）：卡片不會因整列對齊而在中間留空，
                剩餘空白只會落在較短那欄（右欄）的最底＝右下角。 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-start">
              <div className="flex flex-col gap-3 sm:gap-4">
                {deptLeft.map((d, i) => (
                  <Reveal key={`${p.gen}-${d.en}`} delay={i * 50}>
                    <DeptCard dept={d} />
                  </Reveal>
                ))}
              </div>
              <div className="flex flex-col gap-3 sm:gap-4">
                {deptRight.map((d, i) => (
                  <Reveal key={`${p.gen}-${d.en}`} delay={(deptLeft.length + i) * 50}>
                    <DeptCard dept={d} />
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 選舉結果：該屆有填 election 才顯示，接在「團隊成員」下方；右側會長面板維持不變 */}
        {p.election && (
          <div className="max-w-[720px] pb-20 lg:pb-28 lg:min-h-screen lg:flex lg:flex-col lg:justify-center">
            {/* key 帶屆數：切屆時重新掛載，讓進場動畫每次重播 */}
            <Reveal key={`election-${p.gen}`}>
              <ElectionResult e={p.election} />
            </Reveal>
          </div>
        )}
      </div>
    </section>
  );
}