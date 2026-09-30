import { ArrowRight } from "lucide-react";
import imgBuildingResources from "@/imports/AcademicResources/de7749452570d864c1f5c584765f093ab16a6d89.png";
import imgRect7 from "@/imports/AcademicResources/aeb41d7034b1b48d5fc9df0a580281ac376ad0f1.png";
import imgRect8 from "@/imports/AcademicResources/1f59199eb1196007561b8c8c386714d53fbb3e21.png";
import { PageEyebrow, Reveal } from "./shared";

const EXTERNAL_LINKS = [
  { title: "臺大圖資系官網", sub: "國立臺灣大學圖書資訊學系", img: null, href: "https://www.lis.ntu.edu.tw" },
  { title: "臺大圖資課程地圖", sub: "國立臺灣大學大學部課程地圖查詢", img: null, href: "https://coursemap.aca.ntu.edu.tw/course_map_all/class.php?code=1060" },
  { title: "臺大學士班修課檢視表", sub: "國立臺灣大學教務處", img: null, href: "https://reg.aca.ntu.edu.tw/GradeCheck/MessageForm?code=1" },
];

const DOWNLOAD_LINKS = [
  { title: "新生選課指南", sub: "系學會學術部製作", img: imgRect8, href: "https://reurl.cc/lnQG49" },
];

function ResourceRow({ title, sub, img, href }: { title: string; sub: string; img: string | null; href: string }) {
  return (
    <a href={href} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 border border-white/10 rounded-xl p-4 hover:border-white/25 hover:bg-white/3 transition-all duration-200 group">
      <div className="flex items-center gap-4 min-w-0">
        {img && (
          <div className="w-14 h-10 rounded-lg overflow-hidden shrink-0 opacity-60">
            <img src={img} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-white truncate" style={{ fontFamily: "'Chiron Hei HK Text', 'Noto Sans TC', sans-serif", fontWeight: 700, letterSpacing: "0.04em", fontSize: "20px" }}>
            {title}
          </p>
          {sub && <p className="text-white/35 text-xs truncate" style={{ fontFamily: "'Chiron Hei HK Text', 'Noto Sans TC', sans-serif", fontWeight: 500 }}>{sub}</p>}
        </div>
      </div>
      <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center shrink-0 group-hover:border-white/50 transition-colors self-end sm:self-auto">
        <ArrowRight size={13} className="text-white/60" />
      </div>
    </a>
  );
}

export default function AcademicResourcesSection() {
  return (
    // 上內距＝--page-content-top（globals.css），內容一律從標題下方開始、不會重疊。
    <section id="resources" className="relative bg-black px-5 sm:px-8 md:px-14 pt-[var(--page-content-top)] pb-16 sm:pb-20 md:pb-24">
      {/* 標題不可包在 <Reveal> 裡（Reveal 的 transform 會讓標題跑位） */}
      <PageEyebrow text="各種服務・學習資源" />
      <div className="max-w-[1400px] mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10">
          <div>
            <Reveal>
              <p className="mb-5 text-xs tracking-widest font-bold" style={{ fontFamily: "'Ubuntu Sans Mono', monospace", fontSize: "16px", background: "linear-gradient(to right, #2F9EBD, #ffffff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                各式網址 EXTERNAL LINKS
              </p>
            </Reveal>
            <div className="flex flex-col gap-3">
              {EXTERNAL_LINKS.map((link, i) => (
                <Reveal key={link.title} delay={i * 50}>
                  <ResourceRow {...link} />
                </Reveal>
              ))}
            </div>
          </div>

          <div>
            <Reveal delay={60}>
              <p className="mb-5 text-xs tracking-widest font-bold" style={{ fontFamily: "'Ubuntu Sans Mono', monospace", fontSize: "16px", background: "linear-gradient(to right, #D14B4B, #ffffff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                檔案下載 DOWNLOADS
              </p>
            </Reveal>
            <div className="flex flex-col gap-3">
              {DOWNLOAD_LINKS.map((link, i) => (
                <Reveal key={link.title} delay={i * 50 + 60}>
                  <ResourceRow {...link} />
                </Reveal>
              ))}

              <Reveal delay={160}>
                <div className="border border-white/10 rounded-xl p-5 bg-white/[0.03]">
                  <p className="text-white mb-2" style={{ fontFamily: "'Chiron Hei HK Text', 'Noto Sans TC', sans-serif", fontWeight: 700, fontSize: "24px" }}>
                    找不到你需要的資源？
                  </p>
                  <p className="text-white/50 text-sm mb-5 leading-relaxed" style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 500 }}>
                    歡迎聯絡系學會，我們將協助提供相關資料。
                  </p>
                  <a href="#/contact" className="inline-flex items-center gap-2 bg-white text-black px-5 py-2 rounded-full text-sm hover:bg-white/90 transition-all group" style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 900, letterSpacing: "0.08em" }}>
                    聯絡我們
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}