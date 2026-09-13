import { Mail } from "lucide-react";
import imgLissaLogo from "@/imports/Footer/NTULISSAlogo.svg";
import svgPaths from "@/imports/BentoGrid-1/svg-lp3prmbugu";

// ── Logo 調整區（可手動修改）─────────────────────────────────
// LOGO_SIZE：logo 顯示寬度（px），高度會等比例縮放
// LOGO_OFFSET_X：水平位移，正值往右、負值往左（px）
// LOGO_OFFSET_Y：垂直位移，正值往下、負值往上（px）
const LOGO_SIZE = 180;
const LOGO_OFFSET_X = -55;
const LOGO_OFFSET_Y = 0;

// ── 右側四個選單欄微調（新增類別後標題被擠到換行時調這裡）──────────────
// NAV_COL_GAP：四欄之間的水平間距（px），調小 → 每欄更寬、標題更不會換行
// NAV_SHIFT_X：四欄「整體」水平位移（px，負=往左、正=往右）
const NAV_COL_GAP = 20;
const NAV_SHIFT_X = 100;

// ── 其他元素的 XY 位移（px；正 x=往右、正 y=往下）──────────────────────
const DESC_X = -50;        // 左側敘述文字
const DESC_Y = 0;
const SOCIAL_X = -55;      // 三個社群圖示（整排）
const SOCIAL_Y = 0;
const COPYRIGHT_X = -55;   // 底部版權宣告
const COPYRIGHT_Y = 0;
const EMAIL_X = 30;       // 底部 Email
const EMAIL_Y = 0;

// 每個連結改成 { label, href }，讓 Footer 也能連到對應頁面／錨點（與 Header 一致）。
// 「現任團隊」連到獨立頁 #/current-team；「歷任會長」連到 #/presidents。
const NAV_COLS = [
  {
    en: "ABOUT",
    zh: "關於我們",
    links: [
      { label: "資訊總覽", href: "#/overview" },
      { label: "現任團隊", href: "#/current-team" },
      { label: "學會發展歷程", href: "#about" },
      { label: "歷任會長", href: "#/presidents" },
    ],
  },
  {
    en: "NEWS",
    zh: "最新動態",
    links: [
      { label: "近期公告", href: "#/news" },
      { label: "系學會行事曆", href: "#/calendar" },
    ],
  },
  {
    en: "SERVICES",
    zh: "各種服務",
    links: [
      { label: "學術資源", href: "#resources" },
      { label: "聯絡我們", href: "#/contact" },
    ],
  },
  {
    en: "SUPPORT US",
    zh: "支持我們",
    links: [
      { label: "系學會費", href: "#/fees" },
      { label: "贊助我們", href: "#/sponsor" },
    ],
  },
];

function ThreadsIcon() {
  return (
    <svg viewBox="0 0 55 64" fill="currentColor" className="w-4 h-4">
      <path d={svgPaths.p3455000} />
    </svg>
  );
}

const SOCIAL_ICONS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/ntu_lis_sa?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/ntulislis",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Threads",
    href: "https://www.threads.com/@ntu_lis_sa",
    icon: <ThreadsIcon />,
  },
];

export default function Footer() {
  return (
    <footer className="relative z-30 bg-[#060606] border-t border-white/8 pt-14 pb-8">
      <style>{`
        @keyframes footerFlow {
          0% {
            background-position: 300% 50%;
          }
          100% {
            background-position: -100% 50%;
          }
        }
        .footer-flow-text {
          background: linear-gradient(90deg, #ff6b6b 0%, #ff8a8a 18%, #2f9ebd 45%, #7dd3fc 72%, #ff6b6b 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
          animation: footerFlow 6s linear infinite;
        }
      `}</style>
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-14">
        <div
          className="grid grid-cols-1 md:grid-cols-[auto_repeat(4,minmax(0,1fr))] gap-y-8 mb-10"
          style={{ columnGap: `${NAV_COL_GAP}px` }}
        >
          {/* 欄距改上方常數 NAV_COL_GAP；選單整體左右位移改 NAV_SHIFT_X */}
          {/* Brand */}
          <div className="md:max-w-[200px] md:mr-2 lg:mr-6">
            {/* 左側 Logo 區塊向右推的距離：md:mr-8 / lg:mr-12；數字越大，Logo 會離右邊選單更遠 */}
            {/* Logo — matches Header exactly */}
            {/* Logo（只保留上傳的 SVG；大小與位移用上方常數調整）*/}
            <div className="mb-5">
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
            </div>

            <p
              className="text-white/35 leading-relaxed mb-6"
              style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 500, fontSize: "0.8rem", transform: `translate(${DESC_X}px, ${DESC_Y}px)` }}
            >
              國立臺灣大學圖書資訊學系學生自治組織，致力於促進學術交流與同學福祉。
            </p>

            <div className="flex gap-2" style={{ transform: `translate(${SOCIAL_X}px, ${SOCIAL_Y}px)` }}>
              {SOCIAL_ICONS.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/6 text-white/45 hover:text-white hover:bg-white/12 transition-all duration-200"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {NAV_COLS.map((col) => (
            <div key={col.en} style={{ transform: `translateX(${NAV_SHIFT_X}px)` }}>
              <p
                className="footer-flow-text text-sm font-bold mb-6 whitespace-nowrap"
                style={{
                  fontFamily: "'Ubuntu Sans Mono', monospace",
                  letterSpacing: "0.07em",
                }}
              >
                {col.en}&nbsp;&nbsp;{col.zh}
              </p>
              <ul className="space-y-4">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-white hover:text-white/50 transition-colors duration-200"
                      style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.15em" }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-white/8 gap-3">
          <p
            className="text-white/25 text-xs"
            style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 500, transform: `translate(${COPYRIGHT_X}px, ${COPYRIGHT_Y}px)` }}
          >
            © 2026 臺大圖資系學會 NTU LIS Student Association. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-white/60" style={{ transform: `translate(${EMAIL_X}px, ${EMAIL_Y}px)` }}>
            <Mail size={13} />
            <span
              className="text-xs"
              style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 500 }}
            >
              ntulissa1060@gmail.com
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}