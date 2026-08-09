import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal } from "./shared";

/**
 * 歷任會長頁（PAST PRESIDENTS）
 * ─────────────────────────────────────────────────────────────
 * ● 版面：左半可捲動（標題 → 第X屆 → 任期 → 簡介 → 團隊成員名單），
 *          右半 sticky 固定（會長照片、姓名、系級、英文名、屆數切換器）。
 * ● 切換器：中間是紅→藍漸層的屆數數字；左邊紅點、右邊藍點。
 *          滑鼠移到左紅點 → 放大成紅色「<」＝上一屆（較早）；
 *          滑鼠移到右藍點 → 放大成藍色「>」＝下一屆（較新）。端點自動停用。
 *
 * ★ 要新增／修改某一屆的資料，只要編輯下方的 PRESIDENTS 陣列即可，
 *   前後屆切換會自動生效（陣列請由「新 → 舊」排序）。
 */

// ── 字型（與全站一致；Chiron Hei HK 為商用字體，退回 Noto Sans TC）──
const zhDisplay = "'Chiron Hei HK Text', 'Noto Sans TC', sans-serif"; // 姓名（中文）
const zhFont = "'Noto Sans TC', sans-serif"; // 內文
const monoFont = "'Ubuntu Sans Mono', monospace"; // 英文名 / 標籤 / 屆數
const enDisplay = "'Josefin Sans', sans-serif"; // 英文大標

// ── 資料型別 ────────────────────────────────────────────────
type Member = { n: string; c: string }; // n=姓名, c=系級（如 B13）
type Dept = {
  en: string; // 英文縮寫，如 GEN
  zh: string; // 中文部門名，如 行政部
  color: string; // 部門色（卡片外框）
  members: Member[];
};
type President = {
  gen: number; // 第幾屆，如 52
  name: string; // 會長中文姓名（留空字串＝資料待補）
  roman: string; // 英文名，如 PO-HAN, TSENG
  cls: string; // 會長系級，如 B12
  img: string; // 會長照片（見下方「照片怎麼放」；留空字串會顯示佔位框）
  intro: string; // 該屆簡介（留空字串會顯示「資料整理中」）
  depts: Dept[]; // 團隊成員（依 [GEN,SP,ACA,EVE,IMA,VP] 順序＝畫面左右兩欄排列）
};

/* ── 照片怎麼放（兩種做法擇一）────────────────────────────────
   (A) 沿用你現有的 @/imports 方式：在檔案最上方 import，再把變數指給 img。
       例：  import imgPohan from "@/imports/PastPresidents/pohan.png";
             ...在該屆物件裡：  img: imgPohan as string,
   (B) 直接放到 public/ 資料夾，用字串路徑：
             img: "/presidents/pohan.png",
   目前 img 先留空字串，畫面會顯示「照片待補」佔位框，不會壞掉。 */

// ── 部門色（比照 TeamSection，略提高彩度貼近設計稿；可自由調整）──
const C = {
  GEN: "#B07C43", // 行政部（橘棕）
  SP: "#8C7B6B", // 體育部（灰棕）
  ACA: "#5E8C3C", // 學術部（綠）
  EVE: "#C24A4F", // 活動部（紅）
  IMA: "#9C4A6E", // 形象宣傳部（洋紅）
  VP: "#C2A23A", // 副會長（金）
};

// ── 第 52 屆：完整資料（範例＋目前上任屆）─────────────────────
const P52: President = {
  gen: 52,
  name: "曾柏翰",
  roman: "PO-HAN, TSENG",
  cls: "B12",
  img: "", // ← 放入 曾柏翰 的照片路徑（見上方說明）
  intro:
    "第 52 屆系學會由會長曾柏翰領軍，以打造「不一樣的系學會」為核心願景，帶領系學會重新回歸由大三學生擔任會長領導的傳統。任內積極推動多項實質「惠民措施」，包含爭取並開放學輔室冷氣使用權限、推動系學會費制度改革，並為回應系上同學的熱烈期待，成功復辦了睽違四年的重頭戲「圖資之夜」，顯著提升系上凝聚力。在組織維新方面，本屆整併公關、行宣、美宣為「形象宣傳部」，並獨立出專責行政協調的「行政部」，同時廣招大一新血使團隊擴充至 40 人規模，期望讓每位圖資人無論能力或天賦為何，都能在系學會找到屬於自己的一席之地；此外，團隊亦致力於築起學生與教職員之間的橋樑，加強系學會與教授群的緊密連結，鼓勵並爭取教授們給予系上各項活動更多支持與指導。",
  depts: [
    {
      en: "GEN",
      zh: "行政部",
      color: C.GEN,
      members: [
        { n: "謝君兒", c: "B13" }, { n: "林榮恩", c: "B14" },
        { n: "羅良鎮", c: "B13" }, { n: "劉以寬", c: "B14" },
        { n: "廖誼晴", c: "B13" }, { n: "賴思瑜", c: "B14" },
      ],
    },
    {
      en: "SP",
      zh: "體育部",
      color: C.SP,
      members: [
        { n: "林洋儀", c: "B13" }, { n: "張毓琳", c: "B14" },
        { n: "陳品元", c: "B13" }, { n: "林聿平", c: "B13" },
        { n: "黃宥甯", c: "B14" },
      ],
    },
    {
      en: "ACA",
      zh: "學術部",
      color: C.ACA,
      members: [
        { n: "黃筱彤", c: "B13" }, { n: "周家禾", c: "B14" },
        { n: "王云佳", c: "B13" }, { n: "許瑞米", c: "B14" },
        { n: "陳姲諭", c: "B13" }, { n: "郭庭妤", c: "B14" },
        { n: "王羽昕", c: "B13" }, { n: "黃詩涵", c: "B14" },
        { n: "蔡依玲", c: "B13" },
      ],
    },
    {
      en: "EVE",
      zh: "活動部",
      color: C.EVE,
      members: [
        { n: "黃子芸", c: "B13" }, { n: "莊雅雯", c: "B14" },
        { n: "王海茵", c: "B13" }, { n: "蕭忻緹", c: "B14" },
        { n: "陳亮昕", c: "B13" }, { n: "呂程琳", c: "B14" },
        { n: "林明霖", c: "B13" }, { n: "彭梓欣", c: "B14" },
        { n: "張瑄予", c: "B14" },
      ],
    },
    {
      en: "IMA",
      zh: "形象宣傳部",
      color: C.IMA,
      members: [
        { n: "王意伶", c: "B13" }, { n: "侯欣妍", c: "B14" },
        { n: "洪聆雅", c: "B13" }, { n: "鄭淳語", c: "B14" },
        { n: "許采芝", c: "B13" }, { n: "葉家米", c: "B14" },
        { n: "林庭妤", c: "B13" }, { n: "張文馨", c: "B14" },
        { n: "張瑋庭", c: "B13" },
      ],
    },
    {
      en: "VP",
      zh: "副會長",
      color: C.VP,
      members: [{ n: "詹凱昕", c: "B12" }],
    },
  ],
};

// 建立一屆的空白骨架（名單待填）；任期會由屆數自動推算。
function stub(gen: number): President {
  return { gen, name: "", roman: "", cls: "", img: "", intro: "", depts: [] };
}

// ── 全部屆數（新 → 舊）。你手上有 32~52 屆的資料，之後把 stub 換成完整資料即可。──
// 第 52 屆＝民國114~115（2025.07~2026.07）；每往前一屆減一年，第 32 屆＝民國94~95（2005.07~2006.07）。
export const PRESIDENTS: President[] = [
  P52,
  stub(51), // 民國113~114（2024.07~2025.07）
  stub(50), // 民國112~113（2023.07~2024.07）
  stub(49), // 民國111~112（2022.07~2023.07）
  stub(48), // 民國110~111（2021.07~2022.07）
  stub(47), // 民國109~110（2020.07~2021.07）
  stub(46), // 民國108~109（2019.07~2020.07）
  stub(45), // 民國107~108（2018.07~2019.07）
  stub(44), // 民國106~107（2017.07~2018.07）
  stub(43), // 民國105~106（2016.07~2017.07）
  stub(42), // 民國104~105（2015.07~2016.07）
  stub(41), // 民國103~104（2014.07~2015.07）
  stub(40), // 民國102~103（2013.07~2014.07）
  stub(39), // 民國101~102（2012.07~2013.07）
  stub(38), // 民國100~101（2011.07~2012.07）
  stub(37), // 民國99~100（2010.07~2011.07）
  stub(36), // 民國98~99（2009.07~2010.07）
  stub(35), // 民國97~98（2008.07~2009.07）
  stub(34), // 民國96~97（2007.07~2008.07）
  stub(33), // 民國95~96（2006.07~2007.07）
  stub(32), // 民國94~95（2005.07~2006.07）
];

// 由屆數推算任期（第52屆＝2025.07~2026.07；每屆一年）。
function termOf(gen: number) {
  const start = gen + 1973; // 52 -> 2025
  return `${start}.07 ～ ${start + 1}.07`;
}

/* ── 會長照片：自動對應 ──────────────────────────────────────
   把照片放到  imports/Presidents/  資料夾，檔名＝屆數（如 52.jpg、51.png）。
   之後只要「丟檔案進資料夾」就會自動顯示，程式不用再改；上方每屆的 img 可留空字串。
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
      {/* 平常：小圓點 */}
      <span
        className="absolute rounded-full transition-all duration-300 ease-out group-hover:opacity-0 group-hover:scale-50"
        style={{
          width: "11px",
          height: "11px",
          background: color,
          opacity: disabled ? 0.18 : 1,
        }}
      />
      {/* hover：放大成圓形箭頭按鈕（停用時不出現） */}
      {!disabled && (
        <span
          className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 scale-75 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-100"
          style={{ background: color, boxShadow: `0 8px 20px -8px ${color}` }}
        >
          <Icon size={22} strokeWidth={2.6} className="text-white" />
        </span>
      )}
    </button>
  );
}

// ── 單一部門卡片 ───────────────────────────────────────────
function DeptCard({ dept }: { dept: Dept }) {
  return (
    <div
      className="rounded-2xl border p-4 sm:p-5 h-full"
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
    <div className="w-full h-full flex flex-col items-center justify-center text-center px-6 sm:px-10 py-16 lg:py-20">
      {/* 會長照片（縮小、完整顯示人物；頭頂大致與左側 ABOUT US 齊高）*/}
      {photo ? (
        <img
          src={photo}
          alt={name}
          className="w-auto max-w-full object-contain object-top select-none pointer-events-none"
          style={{ height: "clamp(280px, 50vh, 560px)" }}
        />
      ) : (
        <div
          className="flex flex-col items-center justify-center gap-3 text-white/25 rounded-2xl border border-white/10"
          style={{ height: "clamp(280px, 50vh, 560px)", width: "clamp(220px, 26vw, 380px)", fontFamily: monoFont, letterSpacing: "0.2em" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-16 h-16">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
          </svg>
          <span className="text-xs">照片待補</span>
        </div>
      )}

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

export default function PastPresidentsSection() {
  const [idx, setIdx] = useState(0); // 0 = 最新一屆（陣列第一個）
  const p = PRESIDENTS[idx] ?? PRESIDENTS[0];
  const hasData = p.name.trim() !== "";
  const photo = p.img || photoOf(p.gen); // 先看該屆有沒有手動指定，沒有就依屆數自動找

  // 陣列是「新→舊」：往前一屆（較早）＝ index+1；往後一屆（較新）＝ index-1。
  const canOlder = idx < PRESIDENTS.length - 1;
  const canNewer = idx > 0;

  const goOlder = () => {
    if (canOlder) {
      setIdx((v) => v + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const goNewer = () => {
    if (canNewer) {
      setIdx((v) => v - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

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
    <section id="presidents" className="relative bg-black">
      {/* ══════════ 右半：桌機用 fixed 永遠釘在原地（不受左半捲動影響）══════════
          用 fixed 而非 sticky，是因為 App 根層有 overflow-x-hidden 會讓 sticky 失效。
          z-10：讓固定的 Header(z-50) 疊在照片上方；捲到底時 Footer 會蓋過它（Footer 已設 relative z-30）。 */}
      <div className="hidden lg:block fixed top-0 right-0 w-1/2 h-screen z-10">
        {panel}
      </div>

      {/* ══════════ 手機：會長資訊顯示在最上方（靜態）══════════ */}
      <div className="lg:hidden min-h-[82vh] border-b border-white/5">{panel}</div>

      {/* ══════════ 左半：可捲動（右半空間由上面的 fixed 面板佔用）══════════ */}
      <div className="w-full lg:w-1/2 px-5 sm:px-8 md:px-12 lg:px-16">
        {/* 第一屏：標題 + 第X屆 + 任期 + 簡介（lg:min-h-screen 讓「團隊成員」落到第二屏，需下滑才看到）*/}
        <div className="lg:min-h-screen flex flex-col justify-center pt-16 sm:pt-20 lg:pt-[120px] pb-16 lg:pb-24">
          <div className="max-w-[640px]">
            <Reveal>
              <p className="text-white/30 text-xs tracking-widest mb-5" style={{ fontFamily: monoFont }}>
                — ABOUT US 關於我們
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
                  color: hasData ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.35)",
                }}
              >
                {hasData ? p.intro : "本屆資料整理中，敬請期待。"}
              </p>
            </Reveal>
          </div>
        </div>

        {/* 第二屏起：團隊成員（lg:min-h-screen 讓成員自成一屏，右側面板在瀏覽名單時保持完整顯示）*/}
        {p.depts.length > 0 && (
          <div className="max-w-[720px] pb-20 lg:pb-28 lg:min-h-screen lg:flex lg:flex-col lg:justify-center">
            <Reveal>
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

            {/* 兩欄排列：依 [GEN,SP,ACA,EVE,IMA,VP] 順序自動落成左右兩欄 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-start">
              {p.depts.map((d, i) => (
                <Reveal key={d.en} delay={i * 50}>
                  <DeptCard dept={d} />
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}