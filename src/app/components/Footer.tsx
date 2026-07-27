import { Mail } from "lucide-react";
import imgLissaLogo from "@/imports/LISSA_Logo.png";
import svgPaths from "@/imports/BentoGrid-1/svg-lp3prmbugu";

const NAV_COLS = [
  {
    en: "ABOUT",
    zh: "關於我們",
    links: ["現任團隊", "學會發展歷程", "歷任會長", "正副會長選舉專區"],
  },
  {
    en: "NEWS",
    zh: "最新動態",
    links: ["近期活動公告", "活動紀錄", "系學會行事曆"],
  },
  {
    en: "RESOURCES",
    zh: "各種資源",
    links: ["學術連結", "資料下載區"],
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
    <footer className="bg-[#060606] border-t border-white/8 pt-14 pb-8">
      <div className="max-w-[1400px] mx-auto px-6 md:px-14">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr_1fr] gap-10 md:gap-16 mb-10">
          {/* Brand */}
          <div className="md:max-w-[220px]">
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
          {NAV_COLS.map((col) => (
            <div key={col.en}>
              <p
                className="text-sm font-bold mb-6"
                style={{
                  fontFamily: "'Ubuntu Sans Mono', monospace",
                  background: "linear-gradient(to right, #D14B4B, #2F9EBD)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  letterSpacing: "0.07em",
                }}
              >
                {col.en}&nbsp;&nbsp;{col.zh}
              </p>
              <ul className="space-y-4">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-white hover:text-white/50 transition-colors duration-200"
                      style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.15em" }}
                    >
                      {link}
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
