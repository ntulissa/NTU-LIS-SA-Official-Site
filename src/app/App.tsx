import { useEffect, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollIndicator from "./components/ScrollIndicator";
import HeroSection from "./components/sections/HeroSection";
import BentoSection from "./components/sections/BentoSection";
import SloganSection from "./components/sections/SloganSection";
import HistorySection from "./components/sections/HistorySection";
import TeamSection from "./components/sections/TeamSection";
import SloganPage2Section from "./components/sections/SloganPage2Section";
import LatestUpdatesSection from "./components/sections/LatestUpdatesSection";
import NewsArticlePage from "./components/sections/NewsArticlePage";
import AcademicResourcesSection from "./components/sections/AcademicResourcesSection";
import JoinUsSection from "./components/sections/JoinUsSection";
import ContactSection from "./components/sections/ContactSection";
import PastPresidentsSection from "./components/sections/PastPresidentsSection";
import FeesSection from "./components/sections/FeesSection";
import SponsorSection from "./components/sections/SponsorSection";
import DepartmentPage from "./components/department-pages/DepartmentPage";

// 極輕量的 hash 分頁（不需安裝 react-router；同時保留原本 #team / #news 等錨點捲動）：
//   #/current-team    → 現任團隊獨立頁（只有 Header + TeamSection + Footer）
//   #/presidents      → 歷任會長頁
//   #/join            → 加入我們獨立頁（只有 Header + JoinUsSection + Footer）
//   #/contact         → 聯絡我們獨立頁（只有 Header + ContactSection + Footer）
//   #/overview        → 資訊總覽獨立頁（只有 Header + BentoSection + Footer）
//   #/news            → 公告列表頁（只有 Header + 公告列表 + Footer）
//   #/news/<slug>     → 單篇公告文章頁（只有 Header + 文章 + Footer；slug 同 announcements.ts）
//   #/fees            → 系學會費專區（捲動式 · Apple 風動畫）
//   #/sponsor         → 贊助頁（對外招募贊助 · 捲動式）
//   #/dept/<slug>     → 部門獨立頁（例：#/dept/gen ＝行政部；slug 同 department-pages/ 檔名）
//   其餘              → 捲動式主頁
type Route = { name: "home" } | { name: "current-team" } | { name: "presidents" } | { name: "join" } | { name: "contact" } | { name: "overview" } | { name: "news" } | { name: "article"; slug: string } | { name: "fees" } | { name: "sponsor" } | { name: "dept"; slug: string };

function getRoute(): Route {
  const h = window.location.hash;
  if (h.startsWith("#/current-team")) return { name: "current-team" };
  if (h.startsWith("#/presidents")) return { name: "presidents" };
  if (h.startsWith("#/join")) return { name: "join" };
  if (h.startsWith("#/contact")) return { name: "contact" };
  if (h.startsWith("#/overview")) return { name: "overview" };
  // 注意：文章頁（#/news/<slug>）要在列表頁（#/news）之前比對，否則會被列表頁吃掉。
  const ma = h.match(/^#\/news\/([\w-]+)/);
  if (ma) return { name: "article", slug: ma[1] };
  if (h.startsWith("#/news")) return { name: "news" };
  if (h.startsWith("#/fees")) return { name: "fees" };
  if (h.startsWith("#/sponsor")) return { name: "sponsor" };
  const m = h.match(/^#\/dept\/([\w-]+)/);
  if (m) return { name: "dept", slug: m[1] };
  return { name: "home" };
}

export default function App() {
  const [route, setRoute] = useState<Route>(getRoute());

  useEffect(() => {
    const onHash = () => {
      const r = getRoute();
      setRoute(r);
      if (r.name !== "home") {
        window.scrollTo({ top: 0 });
        return;
      }
      // 從獨立頁點主頁錨點（#team 等）時，等主頁重繪後再捲動。
      const id = window.location.hash.slice(1);
      if (id && !id.startsWith("/")) {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
          })
        );
      }
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <div className="bg-black text-white overflow-x-hidden">
      <Header />

      {route.name === "current-team" ? (
        // 獨立頁：只顯示 TeamSection（Header/Footer 在最外層一定會出現）。
        // 頂部間距由 TeamSection 的 standalone 模式自己處理（剛好清掉固定 Header）。
        <TeamSection standalone />
      ) : route.name === "presidents" ? (
        <PastPresidentsSection />
      ) : route.name === "join" ? (
        // 獨立頁：只顯示 JoinUsSection（Header/Footer 在最外層一定會出現）。
        <JoinUsSection />
      ) : route.name === "contact" ? (
        // 獨立頁：只顯示 ContactSection（Header/Footer 在最外層一定會出現）。
        <ContactSection />
      ) : route.name === "overview" ? (
        // 獨立頁：只顯示 BentoSection（standalone＝填滿一屏、底部不被切）。
        <BentoSection standalone />
      ) : route.name === "news" ? (
        // 獨立頁：公告列表（standalone＝多留頂部空間清掉固定 Header）。
        <LatestUpdatesSection standalone />
      ) : route.name === "article" ? (
        // 獨立頁：單篇公告文章。
        <NewsArticlePage slug={route.slug} />
      ) : route.name === "fees" ? (
        // 系學會費專區（捲動式；Header 於最上方為透明疊在 Hero 上）。
        <FeesSection />
      ) : route.name === "sponsor" ? (
        // 贊助頁（捲動式）。
        <SponsorSection />
      ) : route.name === "dept" ? (
        <DepartmentPage slug={route.slug} />
      ) : (
        <>
          <HeroSection />
          <BentoSection />
          <SloganSection />
          <HistorySection />
          <TeamSection />
          <SloganPage2Section />
          <LatestUpdatesSection />
          <AcademicResourcesSection />
        </>
      )}

      <Footer />
      {/* 固定於畫面下方的捲動提示；滑到 Footer 會自動淡出 */}
      <ScrollIndicator />
    </div>
  );
}