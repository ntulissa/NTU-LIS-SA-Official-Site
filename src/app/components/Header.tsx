import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import imgLissaLogo from "@/imports/Header/NTULISSAlogo.svg";

// 導覽列中文字體（維持原設計：Noto Sans TC）。
// 若想讓 Header 也吃 Chiron Hei HK Text，改成：
//   "'Chiron Hei HK Text', 'Noto Sans TC', sans-serif"
const zhFont = "'Noto Sans TC', sans-serif";

// ── Logo 調整區（可手動修改）─────────────────────────────────
// LOGO_SIZE：logo 顯示寬度（px），高度會等比例縮放
// LOGO_OFFSET_X：水平位移，正值往右、負值往左（px）
// LOGO_OFFSET_Y：垂直位移，正值往下、負值往上（px）
const LOGO_SIZE = 150;
const LOGO_OFFSET_X = -30;
const LOGO_OFFSET_Y = 7;

// 選單子項目改為 { label, href } 物件，讓每一項都能連到對應區塊或分頁。
// 「歷任會長」連到 #/presidents（App.tsx 的 hash 分頁）；其餘先指向主頁對應錨點。
const NAV_ITEMS = [
  {
    label: "關於我們",
    labelEn: "ABOUT",
    sub: [
      { label: "資訊總覽", href: "#/overview" },
      { label: "現任團隊", href: "#/current-team" },
      { label: "學會發展歷程", href: "#about" },
      { label: "歷任會長", href: "#/presidents" },
    ],
  },
  {
    label: "最新動態",
    labelEn: "NEWS",
    sub: [
      { label: "近期公告", href: "#/news" },
      { label: "系學會行事曆", href: "#/calendar" },
    ],
  },
  {
    label: "各種服務",
    labelEn: "SERVICES",
    sub: [
      { label: "學術資源", href: "#resources" },
      { label: "系學會費", href: "#/fees" },
      { label: "贊助我們", href: "#/sponsor" },
      { label: "聯絡我們", href: "#/contact" },
    ],
  },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#090909]/90 backdrop-blur-xl border-b border-white/8"
          : "bg-transparent"
      }`}
    >
      {/* 加入我們按鈕的旋轉描邊動畫（自成一格，不依賴全域 CSS） */}
      <style>{`
        @keyframes buttonRotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-6 min-h-[80px] flex items-center justify-between">

        {/* ── Logo（只保留上傳的 SVG；大小與位移用上方常數調整）───────── */}
        <a href="#" className="flex items-center shrink-0">
          <img
            src={imgLissaLogo}
            alt="臺大圖資系學會 Logo"
            className="object-contain"
            style={{
              width: `${LOGO_SIZE}px`,
              height: "auto",
              transform: `translate(${LOGO_OFFSET_X}px, ${LOGO_OFFSET_Y}px)`,
            }}
          />
        </a>

        {/* ── Desktop Nav ───────────────────────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-3 ml-auto mr-0 md:mr-0">
          {NAV_ITEMS.map((item, i) => (
            <div
              key={i}
              className="relative"
              onMouseEnter={() => setOpenDropdown(i)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                className="flex items-center gap-1 px-4 py-2.5 text-white/80 hover:text-white transition-colors duration-200 rounded-md hover:bg-white/5"
                style={{ fontFamily: zhFont, fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.32em" }}
              >
                {item.label}
                <ChevronDown
                  size={11}
                  className={`opacity-50 transition-transform duration-200 ${openDropdown === i ? "rotate-180 opacity-80" : ""}`}
                />
              </button>

              {openDropdown === i && (
                // 外層絕對定位容器：緊貼按鈕底部（top-full，無縫），
                // 用 pt-2 當作「透明橋接區」取代原本的 mt-1 空隙，
                // 讓可 hover 的範圍從按鈕一路連到整個面板，滑過去不會斷掉。
                <div className="absolute top-full left-0 pt-2 w-40">
                  <div className="bg-[#111]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/60">
                    {item.sub.map((s, j) => (
                      <a
                        key={j}
                        href={s.href}
                        className="block px-4 py-2.5 text-white/55 hover:text-white hover:bg-white/5 transition-colors duration-150"
                        style={{ fontFamily: zhFont, fontWeight: 500, fontSize: "0.85rem", letterSpacing: "0.12em" }}
                      >
                        {s.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* 加入我們 — red→teal gradient pill */}
          <a
            href="#/join"
            className="ml-1 shrink-0 relative inline-flex items-center justify-center px-6 py-2.5 rounded-full overflow-hidden"
            style={{
              fontFamily: zhFont,
              fontWeight: 900,
              fontSize: "0.9rem",
              letterSpacing: "0.32em",
              color: "white",
              background: "#000",
              border: "1.5px solid transparent",
              backgroundClip: "padding-box",
              boxShadow: "inset 0 0 0 1.5px transparent",
              position: "relative",
            }}
          >
            <span
              className="absolute inset-0 rounded-full"
              style={{
                padding: "1.5px",
                border: "1.5px solid transparent",
                background: "linear-gradient(#000, #000) padding-box, linear-gradient(90deg, #D14B4B 0%, #2F9EBD 100%) border-box",
              }}
            />
            <span
              className="absolute inset-0 rounded-full"
              style={{
                background: "conic-gradient(from 0deg, #D14B4B 0deg, #2F9EBD 180deg, #D14B4B 360deg)",
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
                animation: "buttonRotate 8s linear infinite",
                transformOrigin: "center",
                opacity: 0.95,
              }}
            />
            <span className="relative z-10">加入我們</span>
          </a>
        </nav>

        {/* ── Mobile toggle ─────────────────────────────────────────────── */}
        <button
          className="md:hidden text-white/70 hover:text-white p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ── Mobile menu ───────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden bg-[#090909]/98 backdrop-blur-xl border-t border-white/8 px-4 sm:px-6 py-4 sm:py-5 space-y-4 max-h-[calc(100vh-80px)] overflow-y-auto">
          {NAV_ITEMS.map((item, i) => (
            <div key={i}>
              <p
                className="text-[10px] tracking-[0.3em] mb-2"
                style={{
                  fontFamily: "'Ubuntu Sans Mono', monospace",
                  background: "linear-gradient(to right, #D14B4B, #2F9EBD)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {item.labelEn}
              </p>
              {item.sub.map((s, j) => (
                <a
                  key={j}
                  href={s.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-1.5 text-white/65 hover:text-white transition-colors"
                  style={{ fontFamily: zhFont, fontWeight: 500, fontSize: "0.9rem", letterSpacing: "0.12em" }}
                >
                  {s.label}
                </a>
              ))}
            </div>
          ))}
          <a
            href="#/join"
            onClick={() => setMobileOpen(false)}
            className="relative inline-flex items-center justify-center px-6 py-2.5 rounded-full overflow-hidden text-white text-sm"
            style={{
              fontFamily: zhFont,
              fontWeight: 900,
              letterSpacing: "0.3em",
              background: "#000",
              border: "1.5px solid transparent",
              backgroundClip: "padding-box",
            }}
          >
            <span
              className="absolute inset-0 rounded-full"
              style={{
                padding: "1.5px",
                border: "1.5px solid transparent",
                background: "linear-gradient(#000, #000) padding-box, linear-gradient(90deg, #D14B4B 0%, #2F9EBD 100%) border-box",
              }}
            />
            <span
              className="absolute inset-0 rounded-full"
              style={{
                background: "conic-gradient(from 0deg, #D14B4B 0deg, #2F9EBD 180deg, #D14B4B 360deg)",
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
                animation: "buttonRotate 8s linear infinite",
                transformOrigin: "center",
                opacity: 0.95,
              }}
            />
            <span className="relative z-10">加入我們</span>
          </a>
        </div>
      )}
    </header>
  );
}