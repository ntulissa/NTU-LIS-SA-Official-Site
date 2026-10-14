import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import imgLissaLogo from "@/imports/Header/NTULISSAlogo.svg";
import { useIsDesktop } from "./shared";
import { useI18n, type Lang } from "../i18n";
import LanguageSwitcher from "../i18n/LanguageSwitcher";
import type { Messages } from "../i18n/locales/zh-TW";

// 導覽列字體（維持原設計：Noto Sans TC；它也內含英文字形，所以英文版直接沿用）。
// 若想讓 Header 也吃 Chiron Hei HK Text，改成：
//   "'Chiron Hei HK Text', 'Noto Sans TC', sans-serif"
const zhFont = "'Noto Sans TC', sans-serif";

// 字距：中文字要拉開才好看，英文拉太開會很難讀，所以分開設定。
const TRACKING: Record<Lang, { top: string; sub: string; join: string }> = {
  "zh-TW": { top: "0.32em", sub: "0.12em", join: "0.32em" },
  en: { top: "0.06em", sub: "0.02em", join: "0.08em" },
};

// ── Logo 調整區（可手動修改）─────────────────────────────────
// LOGO_SIZE：logo 顯示寬度（px），高度會等比例縮放
// LOGO_OFFSET_X：水平位移，正值往右、負值往左（px）
// LOGO_OFFSET_Y：垂直位移，正值往下、負值往上（px）
const LOGO_SIZE = 150;
const LOGO_OFFSET_X = -30;
const LOGO_OFFSET_Y = 7;
// 手機／平板（< 1024px）用的 Logo 大小與位移（電腦版仍用上面三個值，不受影響）
const LOGO_SIZE_MOBILE = 120;
const LOGO_OFFSET_X_MOBILE = 0;
const LOGO_OFFSET_Y_MOBILE = 4;

// 選單內容：文字來自翻譯檔（i18n/locales/），連結維持 App.tsx 的 hash 分頁。
// labelEn 是手機選單分類上方的小字（中英文版都顯示英文大寫，當作裝飾標籤）。
function getNavItems(t: Messages) {
  return [
    {
      label: t.nav.about,
      labelEn: "ABOUT",
      sub: [
        { label: t.nav.overview, href: "#/overview" },
        { label: t.nav.intro, href: "#/about" },
        { label: t.nav.team, href: "#/current-team" },
        { label: t.nav.presidents, href: "#/presidents" },
      ],
    },
    {
      label: t.nav.news,
      labelEn: "NEWS",
      sub: [
        { label: t.nav.announcements, href: "#/news" },
        { label: t.nav.calendar, href: "#/calendar" },
      ],
    },
    {
      label: t.nav.services,
      labelEn: "SERVICES",
      sub: [
        { label: t.nav.departments, href: "#/services" },
        { label: t.nav.resources, href: "#/resources" },
        { label: t.nav.contact, href: "#/contact" },
      ],
    },
    {
      label: t.nav.support,
      labelEn: "SUPPORT",
      sub: [
        { label: t.nav.fees, href: "#/fees" },
        { label: t.nav.sponsor, href: "#/sponsor" },
      ],
    },
  ];
}

export default function Header() {
  const { t, lang } = useI18n();
  const NAV_ITEMS = getNavItems(t);
  const track = TRACKING[lang];

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const isDesktop = useIsDesktop();
  const logoW = isDesktop ? LOGO_SIZE : LOGO_SIZE_MOBILE;
  const logoX = isDesktop ? LOGO_OFFSET_X : LOGO_OFFSET_X_MOBILE;
  const logoY = isDesktop ? LOGO_OFFSET_Y : LOGO_OFFSET_Y_MOBILE;

  // 視窗放大回電腦版時，自動收起手機選單
  useEffect(() => { if (isDesktop) setMobileOpen(false); }, [isDesktop]);

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
            alt={t.footer.logoAlt}
            className="object-contain"
            style={{
              width: `${logoW}px`,
              height: "auto",
              transform: `translate(${logoX}px, ${logoY}px)`,
            }}
          />
        </a>

        {/* ── Desktop Nav ───────────────────────────────────────────────── */}
        {/* 平板（768–1023px）四個選單塞不下會擠爆，所以 1024px 以上才顯示桌機選單 */}
        <nav className="hidden lg:flex items-center gap-3 ml-auto mr-0 md:mr-0">
          {NAV_ITEMS.map((item, i) => (
            <div
              key={i}
              className="relative"
              onMouseEnter={() => setOpenDropdown(i)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                className="flex items-center gap-1 px-4 py-2.5 text-white/80 hover:text-white transition-colors duration-200 rounded-md hover:bg-white/5 whitespace-nowrap"
                style={{ fontFamily: zhFont, fontWeight: 700, fontSize: "0.9rem", letterSpacing: track.top }}
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
                // min-w-40 + w-max：英文選項比較長時，面板會自動變寬，不會換行。
                <div className="absolute top-full left-0 pt-2 min-w-40 w-max">
                  <div className="bg-[#111]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/60">
                    {item.sub.map((s, j) => (
                      <a
                        key={j}
                        href={s.href}
                        className="block px-4 py-2.5 text-white/55 hover:text-white hover:bg-white/5 transition-colors duration-150 whitespace-nowrap"
                        style={{ fontFamily: zhFont, fontWeight: 500, fontSize: "0.85rem", letterSpacing: track.sub }}
                      >
                        {s.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* 語言切換 */}
          <LanguageSwitcher className="ml-1" />

          {/* 加入我們 — red→teal gradient pill */}
          <a
            href="#/join"
            className="ml-1 shrink-0 relative inline-flex items-center justify-center px-6 py-2.5 rounded-full overflow-hidden whitespace-nowrap"
            style={{
              fontFamily: zhFont,
              fontWeight: 900,
              fontSize: "0.9rem",
              letterSpacing: track.join,
              color: "white",
              background: "#000",
              border: "1.5px solid transparent",
              backgroundClip: "padding-box",
              boxShadow: "inset 0 0 0 1.5px transparent",
              position: "relative",
            }}
          >
            <JoinButtonBorder />
            <span className="relative z-10">{t.nav.join}</span>
          </a>
        </nav>

        {/* ── Mobile：語言切換 + 選單按鈕 ─────────────────────────────── */}
        {/* 語言按鈕直接放在 Header 上，不用打開選單就能切換 */}
        <div className="lg:hidden flex items-center gap-2">
          <LanguageSwitcher size="sm" />
          <button
            className="text-white/70 hover:text-white p-2 -mr-2"
            aria-label={mobileOpen ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ───────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#090909]/98 backdrop-blur-xl border-t border-white/8 px-4 sm:px-6 py-4 sm:py-5 space-y-4 max-h-[calc(100vh-80px)] overflow-y-auto">
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
                  style={{ fontFamily: zhFont, fontWeight: 500, fontSize: "0.9rem", letterSpacing: track.sub }}
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
              letterSpacing: track.join,
              background: "#000",
              border: "1.5px solid transparent",
              backgroundClip: "padding-box",
            }}
          >
            <JoinButtonBorder />
            <span className="relative z-10">{t.nav.join}</span>
          </a>
        </div>
      )}
    </header>
  );
}

// 「加入我們」按鈕的漸層描邊＋旋轉光暈（電腦版、手機版共用）
function JoinButtonBorder() {
  return (
    <>
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
    </>
  );
}