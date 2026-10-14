import { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import ScrollIndicator from "./ScrollIndicator";
import Hero from "../home-page/Hero";
import Upcoming from "../home-page/Upcoming";
import Lounge from "../home-page/Lounge";
import SportsTeam from "../home-page/SportsTeam";
import Dashboard from "../about-us/Dashboard";
import AboutUs from "../about-us/AboutUs";
import Team from "../about-us/Team";
import News from "../latest/News.tsx";
import Article from "../latest/Article";
import Sources from "../services/Sources";
import Recruit from "../join-us/Recruit";
import Survey from "../join-us/Survey";
import Contact from "../services/Contact";
import Presidents from "../about-us/Presidents.tsx";
import Calendar from "../latest/Calendar";
import Fee from "../support-us/Fee";
import Sponsor from "../support-us/Sponsor";
import Department from "../about-us/Department";
import Services from "../services/Services";
import { LanguageProvider } from "../i18n";

// 極輕量的 hash 分頁（不需安裝 react-router；同時保留原本 #team / #news 等錨點捲動）：
//   #/current-team    → 現任團隊獨立頁（只有 Header + Team + Footer）
//   #/presidents      → 歷任會長頁（Presidents）
//   #/about           → 學會簡介獨立頁（只有 Header + AboutUs + Footer）
//   #/resources       → 學術資源獨立頁（只有 Header + Sources + Footer）
//   #/join            → 加入我們獨立頁（只有 Header + Recruit + Footer）
//   #/dept-quiz       → 部門適性測驗頁（從加入我們的「點擊按鈕」進入）
//   #/contact         → 聯絡我們獨立頁（只有 Header + Contact + Footer）
//   #/overview        → 資訊總覽獨立頁（只有 Header + Dashboard + Footer）
//   #/news            → 公告列表頁（只有 Header + 公告列表 + Footer）
//   #/news/<slug>     → 單篇公告文章頁（只有 Header + 文章 + Footer；slug 同 news.ts）
//   #/calendar        → 系學會行事曆頁（只有 Header + 行事曆 + Footer）
//   #/fees            → 系學會費專區（捲動式 · Apple 風動畫）
//   #/sponsor         → 贊助頁（對外招募贊助 · 捲動式）
//   #/dept/<slug>     → 部門獨立頁（例：#/dept/gen ＝行政部；slug 同 department-pages/ 檔名）
//   #/services        → 各種服務 Bento 總覽頁
//   #/service/<slug>  → 單一服務詳情頁（slug 同 servicesData.ts）
//   其餘              → 捲動式主頁
//
// 語言：放在網址的 ?lang=en（例：https://網址/?lang=en#/news），由 ../i18n 管理，跟上面的分頁互不影響。
type Route = { name: "home" } | { name: "about" } | { name: "resources" } | { name: "current-team" } | { name: "presidents" } | { name: "join" } | { name: "dept-quiz" } | { name: "contact" } | { name: "overview" } | { name: "news" } | { name: "article"; slug: string } | { name: "calendar" } | { name: "fees" } | { name: "sponsor" } | { name: "dept"; slug: string } | { name: "services" } | { name: "service"; slug: string };

function getRoute(): Route {
  const h = window.location.hash;
  if (h.startsWith("#/about")) return { name: "about" };
  if (h.startsWith("#/resources")) return { name: "resources" };
  if (h.startsWith("#/current-team")) return { name: "current-team" };
  if (h.startsWith("#/presidents")) return { name: "presidents" };
  if (h.startsWith("#/join")) return { name: "join" };
  if (h.startsWith("#/dept-quiz")) return { name: "dept-quiz" };
  if (h.startsWith("#/contact")) return { name: "contact" };
  if (h.startsWith("#/overview")) return { name: "overview" };
  // 注意：文章頁（#/news/<slug>）要在列表頁（#/news）之前比對，否則會被列表頁吃掉。
  const ma = h.match(/^#\/news\/([\w-]+)/);
  if (ma) return { name: "article", slug: ma[1] };
  if (h.startsWith("#/news")) return { name: "news" };
  if (h.startsWith("#/calendar")) return { name: "calendar" };
  if (h.startsWith("#/fees")) return { name: "fees" };
  if (h.startsWith("#/sponsor")) return { name: "sponsor" };
  // 注意：單一服務頁（#/service/<slug>）要在總覽頁（#/services）之前比對。
  const msvc = h.match(/^#\/service\/([\w-]+)/);
  if (msvc) return { name: "service", slug: msvc[1] };
  if (h.startsWith("#/services")) return { name: "services" };
  const m = h.match(/^#\/dept\/([\w-]+)/);
  if (m) return { name: "dept", slug: m[1] };
  return { name: "home" };
}

// 最外層：包上 LanguageProvider，裡面所有元件才能用 useI18n() 拿到目前語言。
export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

function AppContent() {
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

  useEffect(() => {
    const openLinksInNewWindow = () => {
      document.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
        const href = link.getAttribute("href");
        if (!href) return;

        const url = new URL(href, window.location.href);
        const isExternal = ["mailto:", "tel:"].includes(url.protocol)
          || ((url.protocol === "http:" || url.protocol === "https:")
            && url.origin !== window.location.origin);
        const openInNewWindow = isExternal || link.dataset.openNewTab === "true";

        if (openInNewWindow) {
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        } else {
          link.removeAttribute("target");
          link.removeAttribute("rel");
        }
      });
    };

    openLinksInNewWindow();
    const observer = new MutationObserver(openLinksInNewWindow);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [route]);

  return (
    <div className="bg-black text-white overflow-x-hidden">
      <Header />

      {route.name === "current-team" ? (
        // 獨立頁：只顯示 Team（Header/Footer 在最外層一定會出現）。
        // 頂部間距由 Team 的 standalone 模式自己處理（剛好清掉固定 Header）。
        <Team standalone />
      ) : route.name === "about" ? (
        // 獨立頁：只顯示 AboutUs（Header/Footer 在最外層一定會出現）。
        <AboutUs />
      ) : route.name === "resources" ? (
        // 獨立頁：只顯示 Sources（Header/Footer 在最外層一定會出現）。
        <Sources />
      ) : route.name === "presidents" ? (
        <Presidents />
      ) : route.name === "join" ? (
        // 獨立頁：只顯示 Recruit（Header/Footer 在最外層一定會出現）。
        <Recruit />
      ) : route.name === "dept-quiz" ? (
        // 獨立頁：部門適性測驗。
        <Survey />
      ) : route.name === "contact" ? (
        // 獨立頁：只顯示 Contact（Header/Footer 在最外層一定會出現）。
        <Contact />
      ) : route.name === "overview" ? (
        // 獨立頁：只顯示 Dashboard（standalone＝填滿一屏、底部不被切）。
        <Dashboard standalone />
      ) : route.name === "news" ? (
        // 獨立頁：公告列表（standalone＝多留頂部空間清掉固定 Header）。
        <News standalone />
      ) : route.name === "article" ? (
        // 獨立頁：單篇公告文章。
        <Article slug={route.slug} />
      ) : route.name === "calendar" ? (
        // 獨立頁：系學會行事曆（Header/Footer 在最外層一定會出現）。
        <Calendar />
      ) : route.name === "fees" ? (
        // 系學會費專區（捲動式；Header 於最上方為透明疊在 Hero 上）。
        <Fee />
      ) : route.name === "sponsor" ? (
        // 贊助頁（捲動式）。
        <Sponsor />
      ) : route.name === "dept" ? (
        <Department slug={route.slug} />
      ) : route.name === "services" ? (
        // 各種服務 Bento 總覽頁。
        <Services />
      ) : route.name === "service" ? (
        // 單一服務詳情頁。
        <Services slug={route.slug} />
      ) : (
        <>
          <Hero />
          <AboutUs />
          <Upcoming />
          <Lounge />
          <SportsTeam />
          <Dashboard />
        </>
      )}

      <Footer />
      <ScrollIndicator />
    </div>
  );
}