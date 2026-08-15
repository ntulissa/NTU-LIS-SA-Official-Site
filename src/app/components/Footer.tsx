import { Mail } from "lucide-react";
import imgLissaLogo from "@/imports/LISSA_Logo.png";
import svgPaths from "@/imports/BentoGrid-1/svg-lp3prmbugu";

// 每個連結改成 { label, href }，讓 Footer 也能連到對應頁面／錨點（與 Header 一致）。
// 「現任團隊」連到獨立頁 #/current-team；「歷任會長」連到 #/presidents。
const NAV_COLS = [
  {
    en: "ABOUT",
    zh: "關於我們",
    links: [
      { label: "現任團隊", href: "#/current-team" },
      { label: "學會發展歷程", href: "#about" },
      { label: "歷任會長", href: "#/presidents" },
    ],
  },
  {
    en: "NEWS",
    zh: "最新動態",
    links: [
      { label: "近期公告", href: "#news" },
      { label: "活動紀錄", href: "#news" },
      { label: "系學會行事曆", href: "#" },
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
        <div className="grid grid-cols-1 md:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-8 md:gap-10 lg:gap-20 mb-10">
          {/* 右側選單區塊可手動調整：lg:gap-14 / md:gap-10 這兩個數字；數字越大，三排之間距離越寬 */}
          {/* Brand */}
          <div className="md:max-w-[220px] md:mr-6 lg:mr-30">
            {/* 左側 Logo 區塊向右推的距離：md:mr-8 / lg:mr-12；數字越大，Logo 會離右邊選單更遠 */}
            {/* Logo — matches Header exactly */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className="relative overflow-hidden shrink-0"
                style={{ width: "48px", height: "68px", borderRadius: "24px", border: "1.5px solid rgba(255,255,255,0.4)" }}
              >
                <img src={imgLissaLogo} alt="LISSA Logo" className="w-full h-full object-cover" />
              </div>
              <div className="leading-none">
                <p
                  className="text-white"
                  style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 700, fontSize: "1.05rem", letterSpacing: "0.13em", lineHeight: 1.2 }}
                >
                  NTU<br />LIS SA
                </p>
                <p
                  className="text-white mt-1"
                  style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 900, fontSize: "0.55rem", letterSpacing: "0.52em" }}
                >
                  臺大圖資系學會
                </p>
              </div>
            </div>

            <p
              className="text-white/35 leading-relaxed mb-6"
              style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 500, fontSize: "0.8rem" }}
            >
              國立臺灣大學圖書資訊學系學生自治組織，致力於促進學術交流與同學福祉。
            </p>

            <div className="flex gap-2">
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
          {NAV_COLS.map((col, index) => (
            <div key={col.en} className={index === NAV_COLS.length - 1 ? "md:pl-10 lg:pl-14" : "md:pl-6 lg:pl-8"}>
              {/* 右側選單欄位的內距：最右欄用 md:pl-10 / lg:pl-14，其他欄用 md:pl-6 / lg:pl-8；數字越大，欄位會更往右偏 */}
              <p
                className="footer-flow-text text-sm font-bold mb-6"
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
            style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 500 }}
          >
            © 2026 臺大圖資系學會 NTU LIS Student Association. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-white/60">
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