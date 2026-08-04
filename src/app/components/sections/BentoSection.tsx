import { ArrowRight } from "lucide-react";
import imgLissaLogo from "@/imports/LISSA_Logo.png";
import svgPaths from "@/imports/BentoGrid-1/svg-lp3prmbugu";
import { Reveal, cardBase, monoBold, monoMed, monoSemi, pad, pad2, useCountdown } from "./shared";

const NEXT_EVENT = {
  name: "B14~15 系學會發表會",
  time: new Date("2026-09-07T14:30:00+08:00"),
};
const COUNTDOWN_TARGET = NEXT_EVENT.time;

// ── 各卡片點擊跳轉目標 ──────────────────────────────────────────────
// 集中管理，之後要改連結只需改這裡。
// calendar：行事曆區塊尚未建立，先用 #calendar 佔位，建好對應 id 後即自動生效。
// support：會費專區尚未決定目標，暫時維持不跳轉（見下方 SUPPORT US 卡片）。
const LINKS = {
  calendar: "#calendar",
  about: "#about",
  news: "#news",
  resources: "#resources",
  team: "#team",
};

// Bento 卡片共用樣式：控制每個格子的外觀、圓角與互動效果。
// 加上 group 讓內部的 hover 版面能透過 group-hover 切換。
// 若要手動調整卡片大小或間距，可修改 rounded-[14px]、p-5 / p-6 / lg:p-8、gap-3 / lg:gap-4 等 class。
const BENTO_CARD = "group relative overflow-hidden rounded-[14px] flex flex-col cursor-pointer";
const BENTO_BG: React.CSSProperties = {
  // 背景漸層，等於這個區塊的主要視覺底色。
  // 若要改顏色，可直接修改這裡的 linear-gradient 參數。
  background: "linear-gradient(to bottom, rgba(47,158,189,0.44), rgba(209,75,75,0.44))",
};

// Hover 版面底色：滑鼠懸浮時切換成的簡潔深色版本。
// 若要調整懸浮時的深淺，改這裡的 linear-gradient 即可。
const HOVER_BG: React.CSSProperties = {
  background: "linear-gradient(to bottom, #191919 0%, #050505 100%)",
};

// 預設內容外層：正常顯示，滑鼠懸浮時淡出。
// 每張卡片把原本的內容包在這一層即可。
const FACE_DEFAULT =
  "flex flex-col h-full w-full transition-opacity duration-300 ease-out group-hover:opacity-0";

// 圓形箭頭按鈕：hover 版面右下角的指示按鈕。
function ArrowCircle() {
  return (
    <span
      className="shrink-0 flex items-center justify-center rounded-full bg-white transition-transform duration-300 group-hover:translate-x-0.5"
      style={{ width: "clamp(34px,3vw,48px)", height: "clamp(34px,3vw,48px)" }}
    >
      <ArrowRight className="text-black" style={{ width: "clamp(15px,1.4vw,20px)", height: "auto" }} />
    </span>
  );
}

// 通用 hover 版面：左上小標籤 + 左下大標題 + 右下箭頭。
// label = 英文小標；title = 中文大標；titleSize 可個別調整字級。
function HoverFace({
  label,
  title,
  titleSize = "clamp(1.3rem,2.4vw,2.4rem)",
  padding = "p-5 md:p-6 lg:p-8",
}: {
  label: string;
  title: string;
  titleSize?: string;
  padding?: string;
}) {
  return (
    <div
      className={`absolute inset-0 ${padding} flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out`}
      style={HOVER_BG}
    >
      <p
        className="text-white/85 tracking-[3.04px] whitespace-nowrap"
        style={{ ...monoSemi, fontSize: "clamp(11px, 1.2vw, 19px)" }}
      >
        {label}
      </p>
      <div className="mt-auto flex items-end justify-between gap-3">
        <p
          className="text-white leading-tight"
          style={{
            fontFamily: "'Noto Sans TC', sans-serif",
            fontWeight: 900,
            fontSize: titleSize,
            letterSpacing: "0.06em",
          }}
        >
          {title}
        </p>
        <ArrowCircle />
      </div>
    </div>
  );
}

// 社群卡片專用 hover 版面：左上標籤 + 右下實心圖示。
function SocialHoverFace({ label, path, vb }: { label: string; path: string; vb: string }) {
  return (
    <div
      className="absolute inset-0 p-4 md:p-5 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"
      style={HOVER_BG}
    >
      <p
        className="text-white/85 tracking-[3.04px] whitespace-nowrap"
        style={{ ...monoSemi, fontSize: "clamp(9px, 0.9vw, 15px)" }}
      >
        {label}
      </p>
      <div className="self-end mt-auto" style={{ width: "clamp(28px, 3.8vw, 48px)", height: "clamp(28px, 3.8vw, 48px)" }}>
        <svg className="block w-full h-full" fill="none" viewBox={vb}>
          <path d={path} fill="white" />
        </svg>
      </div>
    </div>
  );
}

export default function BentoSection() {
  const time = useCountdown(COUNTDOWN_TARGET);

  return (
    <section className="bg-black px-4 md:px-6 xl:px-8 py-10 md:py-16">
      <div className="max-w-[1680px] mx-auto mb-6">
        <Reveal>
          <p
            className="text-[13px] md:text-[15px] tracking-[2.4px] mb-4"
            style={{
              ...monoMed,
              background: "linear-gradient(to right, #ffffff, #999999)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            －OVERVIEW 資訊總覽
          </p>
          {/* 標題改為與其他頁面（OUR HISTORY / CURRENT TEAM）一致的寫法： */}
          {/* 同樣的字級 clamp(2.5rem,3.5vw,60px)、leading-none 緊貼兩行，避免整塊過高。 */}
          <h2
            className="leading-none mb-6"
            style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 700, letterSpacing: "0.6px", fontSize: "clamp(2.5rem, 3.5vw, 60px)" }}
          >
            <span className="text-white block">YOUR</span>
            <span className="text-[#2f9ebd] block">CAMPUS PORTAL</span>
          </h2>
        </Reveal>
      </div>

      <div className="max-w-[1680px] mx-auto flex flex-col lg:flex-row gap-3 lg:gap-4 lg:min-h-[560px] xl:min-h-[620px]">
        <div className="flex flex-col gap-3 lg:gap-4 lg:w-[49.8%] shrink-0">
          {/* UP NEXT 倒數區塊：這是一個主要 CTA 卡片，顯示下一場活動倒數。 */}
          {/* Hover 時切換成「下一場活動」簡潔版；點擊跳往系學會行事曆（#calendar，區塊建立後生效）。 */}
          <Reveal className="flex-[1] flex flex-col min-h-[240px] lg:min-h-[0]">
            <a href={LINKS.calendar} aria-label="下一場活動 — 系學會行事曆" className={`${BENTO_CARD} flex-1 p-5 md:p-6 lg:p-8`} style={BENTO_BG}>
              <div className={FACE_DEFAULT}>
                <p className="text-white tracking-[3.04px] whitespace-nowrap" style={{ ...monoSemi, fontSize: "clamp(11px, 1.2vw, 19px)" }}>
                  UP NEXT
                </p>
                {/* 倒數數字區塊：每個單位都是一個小格子，包含數字與 label。 */}
                {/* 手動調整方法：修改 gap-1 / lg:gap-2 控制欄位間距，py-4 / md:py-5 調整上下留白，字體大小用 clamp(...) 來微調。 */}
                <div className="flex items-end gap-1 lg:gap-9 my-auto py-4 md:py-2">
                  {([
                    { label: "D", value: pad(time.d) },
                    { label: "H", value: pad2(time.h) },
                    { label: "M", value: pad2(time.m) },
                    { label: "S", value: pad2(time.s) },
                  ] as const).map(({ label, value }, i, arr) => (
                    <div key={label} className="contents">
                      <div className="flex flex-col items-center gap-2 flex-1">
                        {/* 每個倒數單位的數字方塊：可手動調整 rounded-[14px]、py-1.5 / lg:py-2.5、字體大小與寬高。 */}
                        <div className="bg-[rgba(0,0,0,0.47)] rounded-[14px] w-full flex items-center justify-center py-1.5 lg:py-2.5">
                          <span className="text-white tabular-nums" style={{ ...monoSemi, fontWeight: 500, fontSize: "clamp(0.95rem, 2.4vw, 3.2rem)", letterSpacing: "0.16em" }}>
                            {value}
                          </span>
                        </div>
                        <span className="text-[rgba(255,255,255,0.4)] tracking-[3.04px]" style={{ ...monoSemi, fontSize: "clamp(9px, 0.9vw, 13px)" }}>
                          {label}
                        </span>
                      </div>
                      {i < arr.length - 1 && (
                        <span className="text-white mb-[24px] shrink-0" style={{ ...monoMed, fontSize: "clamp(0.95rem, 2.4vw, 3.2rem)" }}>
                          :
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[rgba(255,255,255,0.62)] tracking-[3.04px] mb-1 whitespace-nowrap" style={{ ...monoMed, fontSize: "clamp(11px, 1.2vw, 19px)" }}>
                    下一場活動
                  </p>
                  <p className="text-white whitespace-nowrap overflow-hidden text-ellipsis" style={{ ...monoSemi, fontSize: "clamp(0.85rem, 2.4vw, 2.5rem)", letterSpacing: "6.56px" }}>
                    {NEXT_EVENT.name}
                  </p>
                </div>
              </div>
              <HoverFace label="UP NEXT" title="下一場活動" titleSize="clamp(1.9rem, 3.4vw, 3.4rem)" />
            </a>
          </Reveal>

          {/* ABOUT US 介紹卡片：右側放置系學會 Logo，左側顯示簡介文字。 */}
          {/* Hover 時切換成「關於臺大圖資系學會」簡潔版；點擊跳往關於/歷史區（#about）。 */}
          <Reveal delay={60} className="flex-[0.9] flex flex-col min-h-[140px] lg:min-h-[0]">
            <a href={LINKS.about} aria-label="關於臺大圖資系學會" className={`${BENTO_CARD} flex-1 p-5 md:p-6 lg:p-8`} style={BENTO_BG}>
              <div className={FACE_DEFAULT}>
                <p className="text-white tracking-[3.04px] whitespace-nowrap" style={{ ...monoSemi, fontSize: "clamp(11px, 1.2vw, 19px)" }}>
                  ABOUT US
                </p>
                {/* Logo 容器：這裡是放置系學會 Logo 的區域。 */}
                {/* 手動調整方法：改 width 的 clamp()、top/bottom/right 的數值，或直接替換 imgLissaLogo。 */}
                <div className="absolute top-4 bottom-4 right-4" style={{ width: "clamp(60px, 11%, 110px)" }}>
                  <div className="relative w-full h-full overflow-hidden rounded-[57px]">
                    <img src={imgLissaLogo} alt="LISSA Logo" className="absolute inset-0 w-full h-full object-contain" />
                  </div>
                </div>
                <div className="mt-auto" style={{ paddingRight: "clamp(70px, 14%, 130px)" }}>
                  <p className="text-[rgba(255,255,255,0.62)] tracking-[3.04px] mb-1 whitespace-nowrap overflow-hidden text-ellipsis" style={{ ...monoMed, fontSize: "clamp(10px, 0.85vw, 15px)" }}>
                    探索臺大圖資系學會的歷史脈絡、組織架構與現任幹部陣容
                  </p>
                  <p className="text-white whitespace-nowrap overflow-hidden text-ellipsis" style={{ ...monoSemi, fontSize: "clamp(0.8rem, 2vw, 2rem)", letterSpacing: "6.56px" }}>
                    B14~15 臺大圖資系學會
                  </p>
                </div>
              </div>
              <HoverFace label="ABOUT US" title="關於臺大圖資系學會" titleSize="clamp(1.4rem, 2.6vw, 2.6rem)" />
            </a>
          </Reveal>
        </div>

        {/* 右側欄位：這一欄由多個小卡片組成，包含最新動態、學習資源、成員數量與支持我們。 */}
        {/* 若要調整右欄整體間距，修改 gap-3 / lg:gap-4。 */}
        <div className="flex-1 flex flex-col gap-3 lg:gap-4">
          <div className="flex-[1] flex gap-3 lg:gap-4 min-h-[120px] lg:min-h-[0]">
            {/* NEWS：點擊跳往最新動態區（#news）。 */}
            <Reveal delay={80} className="flex-1 flex flex-col">
              <a href={LINKS.news} aria-label="最新動態" className={`${BENTO_CARD} flex-1 p-5 md:p-6`} style={BENTO_BG}>
                <div className={`${FACE_DEFAULT} justify-between`}>
                  <p className="text-white tracking-[3.04px]" style={{ ...monoSemi, fontSize: "clamp(11px, 1.2vw, 19px)" }}>
                    NEWS
                  </p>
                  <p className="text-white" style={{ ...monoBold, fontSize: "clamp(1rem, 2vw, 2.1rem)", letterSpacing: "5.6px" }}>
                    最新動態
                  </p>
                </div>
                <HoverFace label="NEWS" title="最新動態" padding="p-5 md:p-6" />
              </a>
            </Reveal>
            {/* RESOURCES：點擊跳往學術資源區（#resources）。 */}
            <Reveal delay={100} className="flex-1 flex flex-col">
              <a href={LINKS.resources} aria-label="學習資源" className={`${BENTO_CARD} flex-1 p-5 md:p-6`} style={BENTO_BG}>
                <div className={`${FACE_DEFAULT} justify-between`}>
                  <p className="text-white tracking-[3.04px]" style={{ ...monoSemi, fontSize: "clamp(11px, 1.2vw, 19px)" }}>
                    RESOURCES
                  </p>
                  <p className="text-white" style={{ ...monoBold, fontSize: "clamp(1rem, 2vw, 2.1rem)", letterSpacing: "5.6px" }}>
                    學習資源
                  </p>
                </div>
                <HoverFace label="RESOURCES" title="學習資源" padding="p-5 md:p-6" />
              </a>
            </Reveal>
          </div>

          <div className="flex-[1] flex gap-3 lg:gap-4 min-h-[120px] lg:min-h-[0]">
            {/* MEMBERS：點擊跳往現任團隊 / 組織架構區（#team）。 */}
            <Reveal delay={120} className="flex-1 flex flex-col">
              <a href={LINKS.team} aria-label="組織架構" className={`${BENTO_CARD} flex-1 p-5 md:p-6`} style={BENTO_BG}>
                <div className={`${FACE_DEFAULT} justify-between`}>
                  <p className="text-white tracking-[3.04px]" style={{ ...monoSemi, fontSize: "clamp(11px, 1.2vw, 19px)" }}>
                    MEMBERS
                  </p>
                  <div className="flex items-end justify-between">
                    <p className="text-[rgba(255,255,255,0.82)] leading-none" style={{ ...monoBold, fontSize: "clamp(2.5rem, 7.5vw, 6.5rem)", letterSpacing: "0.16em", textShadow: "4px 6px 7.7px black" }}>
                      40
                    </p>
                    <p className="text-[rgba(255,255,255,0.62)] tracking-[3.04px] text-right" style={{ ...monoMed, fontSize: "clamp(10px, 0.85vw, 15px)" }}>
                      工作<br />團隊人數
                    </p>
                  </div>
                </div>
                <HoverFace label="MEMBERS" title="組織架構" padding="p-5 md:p-6" />
              </a>
            </Reveal>
            {/* SUPPORT US：會費專區。點擊目標尚未決定，暫時維持不跳轉。 */}
            {/* 之後想好後：把外層 <div> 換成 <a href="你的目標">（站內區塊或外部網址皆可）。 */}
            <Reveal delay={140} className="flex-1 flex flex-col">
              <div className={`${BENTO_CARD} flex-1 p-5 md:p-6`} style={BENTO_BG}>
                <div className={`${FACE_DEFAULT} justify-between`}>
                  <p className="text-white tracking-[3.04px]" style={{ ...monoSemi, fontSize: "clamp(11px, 1.2vw, 19px)" }}>
                    SUPPORT US
                  </p>
                  <div className="absolute inset-[8%_2%_38%_50%]">
                    <svg className="w-full h-full" fill="none" viewBox="0 0 105.001 102.962" style={{ transform: "rotate(22deg)" }}>
                      <path d={svgPaths.p23be10c0} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.59" strokeWidth="4" />
                      <path d={svgPaths.p2b207700} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.59" strokeWidth="4" />
                      <path d={svgPaths.p208a4580} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.59" strokeWidth="4" />
                    </svg>
                  </div>
                  <p className="text-white" style={{ ...monoBold, fontSize: "clamp(0.8rem, 1.7vw, 1.8rem)", letterSpacing: "5.6px" }}>
                    系學會費專區
                  </p>
                </div>
                <HoverFace label="SUPPORT US" title="會費專區" padding="p-5 md:p-6" />
              </div>
            </Reveal>
          </div>

          {/* 下排社群連結卡片：INSTAGRAM / FACEBOOK / THREADS。 */}
          {/* Hover 時切換成實心圖示的簡潔版；點擊開啟對應社群（外部連結）。 */}
          <div className="flex-[0.8] flex gap-3 lg:gap-4 min-h-[90px] lg:min-h-[0]">
            {(
              [
                { label: "INSTAGRAM", path: svgPaths.p372aef00, vb: "0 0 64 64", delay: 160, href: "https://www.instagram.com/ntu_lis_sa?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" },
                { label: "FACEBOOK", path: svgPaths.p1c5aa00, vb: "0 0 64 64", delay: 180, href: "https://www.facebook.com/ntulislis" },
                { label: "THREADS", path: svgPaths.p3455000, vb: "0 0 55 64", delay: 200, href: "https://www.threads.com/@ntu_lis_sa" },
              ] as const
            ).map(({ label, path, vb, delay, href }) => (
              <Reveal key={label} delay={delay} className="flex-1 flex flex-col">
                <a href={href} target="_blank" rel="noopener noreferrer" className={`${BENTO_CARD} flex-1 p-4 md:p-5`} style={BENTO_BG}>
                  <div className={`${FACE_DEFAULT} justify-between`}>
                    <p className="text-white tracking-[3.04px] whitespace-nowrap" style={{ ...monoSemi, fontSize: "clamp(9px, 0.9vw, 15px)" }}>
                      {label}
                    </p>
                    <div className="self-end" style={{ width: "clamp(26px, 3.5vw, 44px)", height: "clamp(26px, 3.5vw, 44px)" }}>
                      <svg className="block w-full h-full" fill="none" viewBox={vb}>
                        <path d={path} fill="white" fillOpacity="0.59" />
                      </svg>
                    </div>
                  </div>
                  <SocialHoverFace label={label} path={path} vb={vb} />
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}