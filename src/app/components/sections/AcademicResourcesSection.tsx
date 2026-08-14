import { ArrowRight } from "lucide-react";
import imgBuildingResources from "@/imports/AcademicResources/de7749452570d864c1f5c584765f093ab16a6d89.png";
import imgRect7 from "@/imports/AcademicResources/aeb41d7034b1b48d5fc9df0a580281ac376ad0f1.png";
import imgRect8 from "@/imports/AcademicResources/1f59199eb1196007561b8c8c386714d53fbb3e21.png";
import { Reveal } from "./shared";

const EXTERNAL_LINKS = [
  { title: "臺大圖資系官網", sub: "國立臺灣大學圖書資訊學系", img: imgBuildingResources, href: "https://lis.ntu.edu.tw" },
  { title: "臺大圖資課程地圖", sub: "國立臺灣大學大學部課程地圖查詢", img: imgBuildingResources, href: "#" },
  { title: "課程筆記資料庫", sub: "系學會整理之課程筆記共享資源", img: null, href: "#" },
  { title: "必修科目及應修學分資料查詢網站", sub: "國立臺灣大學學務處", img: null, href: "#" },
];

const DOWNLOAD_LINKS = [
  { title: "書府 2023", sub: "系學會學術部製作", img: imgRect7, href: "#" },
  { title: "新生選課指南", sub: "系學會學術部製作", img: imgRect8, href: "#" },
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
          <p className="text-white truncate" style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 900, fontSize: "clamp(0.85rem, 1.5vw, 1.05rem)" }}>
            {title}
          </p>
          {sub && <p className="text-white/35 text-xs truncate" style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 500 }}>{sub}</p>}
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
    <section id="resources" className="bg-black px-5 sm:px-8 md:px-14 py-16 sm:py-20 md:py-24">
      <div className="max-w-[1400px] mx-auto">
        <Reveal>
          <p className="text-white/30 text-xs tracking-widest mb-4" style={{ fontSize: "14px",fontFamily: "'Ubuntu Sans Mono', monospace" ,background: "linear-gradient(90deg, #FFF 0%, #595959 34.13%, #FFF 67.79%, #3A3A3A 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundSize: "220% 100%",}}>
            — 各種服務・學術資源
          </p>
          <h2 className="font-bold leading-none mb-12" style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>
            <span className="text-white block">ACADEMIC</span>
            <span style={{ color: "#D14B4B" }} className="block">RESOURCES</span>
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10">
          <div>
            <Reveal>
              <p className="mb-5 text-xs tracking-widest font-bold" style={{ fontFamily: "'Ubuntu Sans Mono', monospace", background: "linear-gradient(to right, #2F9EBD, #ffffff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
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
              <p className="mb-5 text-xs tracking-widest font-bold" style={{ fontFamily: "'Ubuntu Sans Mono', monospace", background: "linear-gradient(to right, #D14B4B, #ffffff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
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
                  <p className="text-white mb-2" style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 900, fontSize: "1rem" }}>
                    找不到你需要的資源？
                  </p>
                  <p className="text-white/50 text-sm mb-5 leading-relaxed" style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 500 }}>
                    歡迎聯絡系學會學術部，我們將協助提供相關資料。
                  </p>
                  <a href="mailto:ntulissa1060@gmail.com" className="inline-flex items-center gap-2 bg-white text-black px-5 py-2 rounded-full text-sm hover:bg-white/90 transition-all group" style={{ fontFamily: "'Noto Sans TC', sans-serif", fontWeight: 900, letterSpacing: "0.08em" }}>
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